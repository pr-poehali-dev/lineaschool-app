"""
Business: Get list of games with optional filters
Args: event with httpMethod, queryStringParameters (game_type, difficulty, is_active)
Returns: HTTP response with games list
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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        params = event.get('queryStringParameters') or {}
        game_type = params.get('game_type')
        difficulty = params.get('difficulty')
        is_active = params.get('is_active', 'true')
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database connection not configured'})
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT id, title, description, game_type, difficulty, 
                   target_age_min, target_age_max, image_url, config,
                   created_by, created_at, plays_count, average_score, is_active
            FROM t_p720035_lineaschool_app.games
            WHERE 1=1
        """
        
        query_params = []
        
        if game_type:
            query += " AND game_type = %s"
            query_params.append(game_type)
        
        if difficulty:
            query += " AND difficulty = %s"
            query_params.append(difficulty)
        
        if is_active.lower() == 'true':
            query += " AND is_active = true"
        
        query += " ORDER BY created_at DESC"
        
        cur.execute(query, query_params)
        games = cur.fetchall()
        
        games_list = []
        for game in games:
            game_dict = dict(game)
            if game_dict.get('created_at'):
                game_dict['created_at'] = game_dict['created_at'].isoformat()
            if game_dict.get('average_score') is not None:
                game_dict['average_score'] = float(game_dict['average_score'])
            games_list.append(game_dict)
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'games': games_list,
                'count': len(games_list)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }