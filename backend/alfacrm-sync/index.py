"""
Business: Синхронизация данных из AlfaCRM (клиенты, педагоги, оплаты)
Args: event - dict с httpMethod, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: JSON с результатами синхронизации
"""

import json
import os
from typing import Dict, Any, List
import urllib.request
import urllib.parse
from datetime import datetime
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        api_key = os.environ.get('ALFACRM_API_KEY')
        domain = os.environ.get('ALFACRM_DOMAIN')
        email = os.environ.get('ALFACRM_EMAIL')
        branch_id = os.environ.get('ALFACRM_BRANCH_ID')
        database_url = os.environ.get('DATABASE_URL')
        
        if not all([api_key, domain, email, branch_id, database_url]):
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing AlfaCRM credentials'})
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        stats = {
            'students_added': 0,
            'students_updated': 0,
            'teachers_added': 0,
            'teachers_updated': 0,
            'payments_added': 0
        }
        
        # Синхронизация клиентов (учеников)
        customers_url = f'https://{domain}/v2api/1/customer/index'
        customers_data = urllib.parse.urlencode({
            'email': email,
            'api_key': api_key,
            'branch_id': branch_id,
            'page': 1,
            'per_page': 1000
        }).encode()
        
        req = urllib.request.Request(customers_url, data=customers_data)
        with urllib.request.urlopen(req) as response:
            customers = json.loads(response.read().decode())
            
            if customers.get('total', 0) > 0:
                for customer in customers.get('items', []):
                    customer_id = str(customer['id'])
                    full_name = f"{customer.get('name', '')} {customer.get('last_name', '')}".strip()
                    email_customer = customer.get('email', f"student_{customer_id}@temp.com")
                    balance = float(customer.get('paid_count', 0) or 0)
                    
                    cursor.execute(
                        'SELECT id FROM students WHERE alfacrm_id = %s',
                        (customer_id,)
                    )
                    existing = cursor.fetchone()
                    
                    if existing:
                        cursor.execute(
                            'UPDATE students SET full_name = %s, email = %s, balance = %s WHERE alfacrm_id = %s',
                            (full_name, email_customer, balance, customer_id)
                        )
                        stats['students_updated'] += 1
                    else:
                        cursor.execute(
                            'INSERT INTO students (alfacrm_id, full_name, email, balance, created_at) VALUES (%s, %s, %s, %s, %s)',
                            (customer_id, full_name, email_customer, balance, datetime.now())
                        )
                        stats['students_added'] += 1
        
        # Синхронизация педагогов
        teachers_url = f'https://{domain}/v2api/1/teacher/index'
        teachers_data = urllib.parse.urlencode({
            'email': email,
            'api_key': api_key,
            'branch_id': branch_id,
            'page': 1,
            'per_page': 1000
        }).encode()
        
        req = urllib.request.Request(teachers_url, data=teachers_data)
        with urllib.request.urlopen(req) as response:
            teachers = json.loads(response.read().decode())
            
            if teachers.get('total', 0) > 0:
                for teacher in teachers.get('items', []):
                    teacher_id = str(teacher['id'])
                    full_name = f"{teacher.get('name', '')} {teacher.get('last_name', '')}".strip()
                    email_teacher = teacher.get('email', f"teacher_{teacher_id}@temp.com")
                    
                    cursor.execute(
                        'SELECT id FROM teachers WHERE alfacrm_id = %s',
                        (teacher_id,)
                    )
                    existing = cursor.fetchone()
                    
                    if existing:
                        cursor.execute(
                            'UPDATE teachers SET full_name = %s, email = %s WHERE alfacrm_id = %s',
                            (full_name, email_teacher, teacher_id)
                        )
                        stats['teachers_updated'] += 1
                    else:
                        cursor.execute(
                            'INSERT INTO teachers (alfacrm_id, full_name, email, created_at) VALUES (%s, %s, %s, %s)',
                            (teacher_id, full_name, email_teacher, datetime.now())
                        )
                        stats['teachers_added'] += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'stats': stats,
                'timestamp': datetime.now().isoformat()
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }