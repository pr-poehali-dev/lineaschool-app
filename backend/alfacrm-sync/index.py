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
    
    if method in ['POST', 'GET']:
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
            'payments_added': 0,
            'lessons_added': 0,
            'lessons_updated': 0
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
                        "SELECT id FROM t_p720035_lineaschool_app.users WHERE login = %s AND role = 'student'",
                        (f"alfacrm_{customer_id}",)
                    )
                    existing = cursor.fetchone()
                    
                    lessons_attended = int(customer.get('lesson_count', 0) or 0)
                    lessons_missed = int(customer.get('lesson_not_count', 0) or 0)
                    lessons_paid = int(customer.get('paid_count', 0) or 0)
                    
                    if existing:
                        cursor.execute(
                            '''UPDATE t_p720035_lineaschool_app.users 
                               SET full_name = %s, lessons_attended = %s, lessons_missed = %s, lessons_paid = %s 
                               WHERE id = (SELECT id FROM t_p720035_lineaschool_app.users 
                                          WHERE login = %s AND role = 'student' LIMIT 1)''',
                            (full_name, lessons_attended, lessons_missed, lessons_paid, f"alfacrm_{customer_id}")
                        )
                        stats['students_updated'] += 1
                    else:
                        cursor.execute(
                            '''INSERT INTO t_p720035_lineaschool_app.users 
                               (login, password, full_name, role, lessons_attended, lessons_missed, lessons_paid) 
                               VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                            (f"alfacrm_{customer_id}", 'temp', full_name, 'student', lessons_attended, lessons_missed, lessons_paid)
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
                        "SELECT id FROM t_p720035_lineaschool_app.users WHERE login = %s AND role = 'teacher'",
                        (f"alfacrm_{teacher_id}",)
                    )
                    existing = cursor.fetchone()
                    
                    if existing:
                        cursor.execute(
                            '''UPDATE t_p720035_lineaschool_app.users 
                               SET full_name = %s 
                               WHERE login = %s AND role = 'teacher' ''',
                            (full_name, f"alfacrm_{teacher_id}")
                        )
                        stats['teachers_updated'] += 1
                    else:
                        cursor.execute(
                            '''INSERT INTO t_p720035_lineaschool_app.users 
                               (login, password, full_name, role) 
                               VALUES (%s, %s, %s, %s)''',
                            (f"alfacrm_{teacher_id}", 'temp', full_name, 'teacher')
                        )
                        stats['teachers_added'] += 1
        
        # Синхронизация занятий (lessons)
        lessons_url = f'https://{domain}/v2api/1/lesson/index'
        lessons_data = urllib.parse.urlencode({
            'email': email,
            'api_key': api_key,
            'branch_id': branch_id,
            'page': 1,
            'per_page': 1000
        }).encode()
        
        req = urllib.request.Request(lessons_url, data=lessons_data)
        with urllib.request.urlopen(req) as response:
            lessons = json.loads(response.read().decode())
            
            if lessons.get('total', 0) > 0:
                for lesson in lessons.get('items', []):
                    lesson_id = str(lesson['id'])
                    customer_id = str(lesson.get('customer_id', ''))
                    teacher_id_alfa = str(lesson.get('teacher_id', ''))
                    subject_id = lesson.get('subject_id', '')
                    
                    cursor.execute(
                        "SELECT id FROM t_p720035_lineaschool_app.users WHERE login = %s AND role = 'student'",
                        (f"alfacrm_{customer_id}",)
                    )
                    student_row = cursor.fetchone()
                    if not student_row:
                        continue
                    student_db_id = student_row[0]
                    
                    cursor.execute(
                        "SELECT id FROM t_p720035_lineaschool_app.users WHERE login = %s AND role = 'teacher'",
                        (f"alfacrm_{teacher_id_alfa}",)
                    )
                    teacher_row = cursor.fetchone()
                    teacher_db_id = teacher_row[0] if teacher_row else None
                    
                    lesson_date = lesson.get('lesson_date', datetime.now().strftime('%Y-%m-%d'))
                    lesson_time = lesson.get('time_from', '00:00')
                    lesson_status_id = lesson.get('status_id', 1)
                    
                    status_map = {
                        1: 'scheduled',
                        2: 'attended',
                        3: 'missed'
                    }
                    status = status_map.get(lesson_status_id, 'scheduled')
                    
                    lesson_type_id = lesson.get('lesson_type_id', 1)
                    lesson_type_map = {
                        1: 'group',
                        2: 'individual_speech',
                        3: 'individual_neuro'
                    }
                    lesson_type = lesson_type_map.get(lesson_type_id, 'group')
                    
                    subject_name = f"Предмет {subject_id}" if subject_id else "Урок"
                    
                    cursor.execute(
                        "SELECT id FROM t_p720035_lineaschool_app.assignments WHERE alfacrm_id = %s",
                        (lesson_id,)
                    )
                    existing_lesson = cursor.fetchone()
                    
                    if existing_lesson:
                        cursor.execute(
                            '''UPDATE t_p720035_lineaschool_app.assignments 
                               SET status = %s, lesson_type = %s, subject = %s, due_date = %s, due_time = %s
                               WHERE alfacrm_id = %s''',
                            (status, lesson_type, subject_name, lesson_date, lesson_time, lesson_id)
                        )
                        stats['lessons_updated'] += 1
                    else:
                        cursor.execute(
                            '''INSERT INTO t_p720035_lineaschool_app.assignments 
                               (student_id, teacher_id, title, subject, due_date, due_time, type, status, lesson_type, alfacrm_id) 
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''',
                            (student_db_id, teacher_db_id, f"Занятие {lesson_id}", subject_name, lesson_date, lesson_time, 'lesson', status, lesson_type, lesson_id)
                        )
                        stats['lessons_added'] += 1
        
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