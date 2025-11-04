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
from psycopg2.extras import RealDictCursor

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
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Получение учеников
        cursor.execute('SELECT * FROM students ORDER BY full_name')
        students = [dict(row) for row in cursor.fetchall()]
        
        # Получение педагогов
        cursor.execute('SELECT * FROM teachers ORDER BY full_name')
        teachers = [dict(row) for row in cursor.fetchall()]
        
        # Получение назначений
        cursor.execute('SELECT * FROM assignments ORDER BY assigned_at DESC')
        assignments = [dict(row) for row in cursor.fetchall()]
        
        # Конвертация datetime в строки
        for student in students:
            if 'created_at' in student and student['created_at']:
                student['created_at'] = student['created_at'].isoformat()
            if 'updated_at' in student and student['updated_at']:
                student['updated_at'] = student['updated_at'].isoformat()
            if 'balance' in student and student['balance']:
                student['balance'] = float(student['balance'])
        
        for teacher in teachers:
            if 'created_at' in teacher and teacher['created_at']:
                teacher['created_at'] = teacher['created_at'].isoformat()
            if 'updated_at' in teacher and teacher['updated_at']:
                teacher['updated_at'] = teacher['updated_at'].isoformat()
        
        for assignment in assignments:
            if 'assigned_at' in assignment and assignment['assigned_at']:
                assignment['assigned_at'] = assignment['assigned_at'].isoformat()
        
        cursor.close()
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