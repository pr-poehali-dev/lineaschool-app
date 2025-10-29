'''
Business: Sync students from AlfaCRM to database
Args: event - dict with httpMethod
      context - object with request_id attribute
Returns: HTTP response with sync results
'''
import json
import os
from typing import Dict, Any, Optional, List
from urllib.request import Request, urlopen
import psycopg2

def get_auth_token(domain: str, email: str, api_key: str) -> str:
    '''Get AlfaCRM auth token'''
    url = f'https://{domain}/v2api/auth/login'
    headers = {'Content-Type': 'application/json'}
    auth_data = json.dumps({'email': email, 'api_key': api_key}).encode('utf-8')
    req = Request(url, data=auth_data, headers=headers, method='POST')
    with urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
    return data.get('token', '')

def fetch_students(domain: str, branch_id: int, auth_token: str) -> List[Dict[str, Any]]:
    '''Fetch all students from AlfaCRM'''
    url = f'https://{domain}/v2api/customer/index'
    headers = {'X-ALFACRM-TOKEN': auth_token, 'Content-Type': 'application/json'}
    request_data = json.dumps({'branch_id': branch_id, 'page': 1, 'count': 1000}).encode('utf-8')
    req = Request(url, data=request_data, headers=headers, method='POST')
    with urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))
    return data.get('items', [])

def normalize_phone(phone: str) -> str:
    '''Normalize phone number to digits only'''
    if not phone:
        return ''
    return ''.join(filter(str.isdigit, phone))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Get credentials
    api_key = os.environ.get('ALFACRM_API_KEY')
    branch_id = os.environ.get('ALFACRM_BRANCH_ID')
    domain = os.environ.get('ALFACRM_DOMAIN')
    email = os.environ.get('ALFACRM_EMAIL')
    db_dsn = os.environ.get('DATABASE_URL')
    
    if not all([api_key, branch_id, domain, email, db_dsn]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing configuration'})
        }
    
    conn = None
    try:
        # Get auth token and fetch students
        auth_token = get_auth_token(domain, email, api_key)
        students = fetch_students(domain, int(branch_id), auth_token)
        
        # Connect to database
        conn = psycopg2.connect(db_dsn)
        cur = conn.cursor()
        
        synced = 0
        skipped = 0
        errors = []
        
        for student in students:
            phone = normalize_phone(student.get('phone', ''))
            name = student.get('name', '')
            student_id = student.get('id', '')
            
            if not phone or not name:
                skipped += 1
                continue
            
            try:
                # Check if student exists
                cur.execute(
                    "SELECT id FROM t_p720035_lineaschool_app.users WHERE phone = %s",
                    (phone,)
                )
                existing = cur.fetchone()
                
                if existing:
                    # Update existing student
                    cur.execute(
                        """UPDATE t_p720035_lineaschool_app.users 
                           SET full_name = %s, login = %s 
                           WHERE phone = %s""",
                        (name, f'student_{student_id}', phone)
                    )
                else:
                    # Insert new student
                    cur.execute(
                        """INSERT INTO t_p720035_lineaschool_app.users 
                           (login, password, full_name, role, phone) 
                           VALUES (%s, %s, %s, %s, %s)""",
                        (f'student_{student_id}', phone, name, 'student', phone)
                    )
                synced += 1
            except Exception as e:
                errors.append(f"Student {name}: {str(e)}")
                skipped += 1
        
        conn.commit()
        cur.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'synced': synced,
                'skipped': skipped,
                'errors': errors[:10],
                'total_students': len(students)
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()
