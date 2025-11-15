"""
Business: Save student game result to database
Args: event with httpMethod, body (game_id, student_id, score, max_score, time_spent, details)
Returns: HTTP response with result_id
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import Json

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        game_id = body_data.get('game_id')
        student_id = body_data.get('student_id')
        score = body_data.get('score')
        max_score = body_data.get('max_score')
        time_spent = body_data.get('time_spent', 0)
        details = body_data.get('details', {})
        
        if game_id is None or student_id is None or score is None or max_score is None:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'game_id, student_id, score, and max_score are required'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database connection not configured'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        insert_query = """
            INSERT INTO t_p720035_lineaschool_app.game_results 
            (game_id, student_id, score, max_score, time_spent, details)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        cur.execute(insert_query, (
            game_id,
            student_id,
            score,
            max_score,
            time_spent,
            Json(details)
        ))
        
        result_id = cur.fetchone()[0]
        
        update_query = """
            UPDATE t_p720035_lineaschool_app.games
            SET plays_count = plays_count + 1,
                average_score = (
                    SELECT AVG(CAST(score AS DECIMAL) / max_score * 100)
                    FROM t_p720035_lineaschool_app.game_results
                    WHERE game_id = %s
                )
            WHERE id = %s
        """
        
        cur.execute(update_query, (game_id, game_id))
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'result_id': result_id,
                'message': 'Result saved successfully'
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
