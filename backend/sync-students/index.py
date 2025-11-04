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
    request_data = json.dumps({
        'branch_id': branch_id, 
        'page': 0, 
        'count': 1000,
        'is_study': 1
    }).encode('utf-8')
    req = Request(url, data=request_data, headers=headers, method='POST')
    with urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(f'📄 Ответ API: total={data.get("total", 0)}, items={len(data.get("items", []))}')
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
        print(f'🔑 Авторизация в AlfaCRM: {domain}, email: {email}')
        auth_token = get_auth_token(domain, email, api_key)
        print(f'✅ Получен токен: {auth_token[:20]}...')
        
        print(f'📥 Запрос учеников для филиала {branch_id}')
        students = fetch_students(domain, int(branch_id), auth_token)
        print(f'📊 Получено учеников из AlfaCRM: {len(students)}')
        
        # Connect to database (use simple query protocol only)
        conn = psycopg2.connect(db_dsn)
        cur = conn.cursor()
        
        synced = 0
        skipped = 0
        errors = []
        
        for student in students:
            phone_data = student.get('phone', [])
            phone_list = phone_data if isinstance(phone_data, list) else [phone_data]
            phone = normalize_phone(phone_list[0] if phone_list else '')
            name = student.get('name', '').replace("'", "''")
            student_id = str(student.get('id', '')).replace("'", "''")
            
            if not phone or not name:
                skipped += 1
                continue
            
            try:
                # Check if student exists (simple query)
                query = f"SELECT id FROM t_p720035_lineaschool_app.users WHERE phone = '{phone}'"
                cur.execute(query)
                existing = cur.fetchone()
                
                if existing:
                    # Update existing student
                    query = f"""UPDATE t_p720035_lineaschool_app.users 
                               SET full_name = '{name}', login = 'student_{student_id}' 
                               WHERE phone = '{phone}'"""
                    cur.execute(query)
                else:
                    # Insert new student
                    query = f"""INSERT INTO t_p720035_lineaschool_app.users 
                               (login, password, full_name, role, phone) 
                               VALUES ('student_{student_id}', '{phone}', '{name}', 'student', '{phone}')"""
                    cur.execute(query)
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
        error_msg = str(e)
        print(f'❌ Ошибка синхронизации: {error_msg}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': False,
                'error': error_msg,
                'synced': 0,
                'skipped': 0,
                'total_students': 0
            })
        }
    finally:
        if conn:
            conn.close()