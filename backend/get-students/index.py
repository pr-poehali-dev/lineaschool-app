"""
Business: Получение списка учеников, педагогов и назначений из базы данных
Args: event - dict с httpMethod
      context - объект с request_id
Returns: JSON со списками students, teachers, assignments
"""

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database URL not configured'})
            }
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Получение учеников
        query = "SELECT id, login, full_name, role, phone, lessons_attended, lessons_missed, lessons_paid FROM t_p720035_lineaschool_app.users WHERE role = 'student' ORDER BY full_name"
        cur.execute(query)
        students_raw = cur.fetchall()
        students = []
        for row in students_raw:
            students.append({
                'id': str(row[0]),
                'login': row[1],
                'fullName': row[2],
                'role': row[3],
                'phone': row[4] or '',
                'teacherId': '',
                'balance': 0,
                'lessonsAttended': row[5] or 0,
                'lessonsMissed': row[6] or 0,
                'lessonsPaid': row[7] or 0
            })
        
        # Получение педагогов
        query = "SELECT id, login, full_name, role, phone FROM t_p720035_lineaschool_app.users WHERE role = 'teacher' ORDER BY full_name"
        cur.execute(query)
        teachers_raw = cur.fetchall()
        teachers = []
        for row in teachers_raw:
            teachers.append({
                'id': str(row[0]),
                'login': row[1],
                'fullName': row[2],
                'role': row[3],
                'phone': row[4] or ''
            })
        
        # Пока возвращаем пустой массив для назначений
        assignments = []
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'students': students,
                'teachers': teachers,
                'assignments': assignments
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }