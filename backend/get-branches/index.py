'''
Business: Get list of branches from AlfaCRM to find correct branch_id
Args: event - dict with httpMethod
      context - object with request_id attribute
Returns: HTTP response with branches list
'''
import json
import os
from typing import Dict, Any
from urllib.request import Request, urlopen

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
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    api_key = os.environ.get('ALFACRM_API_KEY')
    domain = os.environ.get('ALFACRM_DOMAIN')
    email = os.environ.get('ALFACRM_EMAIL')
    
    if not all([api_key, domain, email]):
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing AlfaCRM credentials'}),
            'isBase64Encoded': False
        }
    
    try:
        # Get auth token
        auth_url = f'https://{domain}/v2api/auth/login'
        auth_headers = {'Content-Type': 'application/json'}
        auth_data = json.dumps({'email': email, 'api_key': api_key}).encode('utf-8')
        auth_req = Request(auth_url, data=auth_data, headers=auth_headers, method='POST')
        
        with urlopen(auth_req, timeout=10) as response:
            auth_result = json.loads(response.read().decode('utf-8'))
        
        token = auth_result.get('token', '')
        if not token:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Failed to get auth token'}),
                'isBase64Encoded': False
            }
        
        # Get branches list
        branches_url = f'https://{domain}/v2api/branch/index'
        branches_headers = {'X-ALFACRM-TOKEN': token, 'Content-Type': 'application/json'}
        branches_req = Request(branches_url, headers=branches_headers, method='POST')
        
        with urlopen(branches_req, timeout=10) as response:
            branches_data = json.loads(response.read().decode('utf-8'))
        
        branches = branches_data.get('items', [])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'branches': branches,
                'total': len(branches)
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
