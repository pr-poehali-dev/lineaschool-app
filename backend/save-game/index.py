"""
Business: Save game configuration to database
Args: event with httpMethod, body (game_type, title, description, difficulty, config, created_by)
Returns: HTTP response with created game_id
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
        
        game_type = body_data.get('game_type')
        title = body_data.get('title')
        description = body_data.get('description', '')
        difficulty = body_data.get('difficulty', 'medium')
        config = body_data.get('config', {})
        created_by = body_data.get('created_by')
        image_url = body_data.get('image_url')
        target_age_min = body_data.get('target_age_min')
        target_age_max = body_data.get('target_age_max')
        
        if not game_type or not title:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'game_type and title are required'})
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
        
        query = """
            INSERT INTO t_p720035_lineaschool_app.games 
            (title, description, game_type, difficulty, target_age_min, target_age_max, image_url, config, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        cur.execute(query, (
            title,
            description,
            game_type,
            difficulty,
            target_age_min,
            target_age_max,
            image_url,
            Json(config),
            created_by
        ))
        
        game_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'game_id': game_id,
                'message': 'Game saved successfully'
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
