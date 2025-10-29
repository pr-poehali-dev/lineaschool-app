'''
Business: Connect to AlfaCRM API and fetch students, teachers, and lessons data
Args: event - dict with httpMethod, queryStringParameters
      context - object with request_id attribute
Returns: HTTP response with AlfaCRM data or error
'''
import json
import os
from typing import Dict, Any, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Get AlfaCRM credentials from environment
    api_key: Optional[str] = os.environ.get('ALFACRM_API_KEY')
    branch_id: Optional[str] = os.environ.get('ALFACRM_BRANCH_ID')
    
    if not api_key or not branch_id:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Missing AlfaCRM credentials',
                'details': 'ALFACRM_API_KEY or ALFACRM_BRANCH_ID not configured'
            })
        }
    
    params = event.get('queryStringParameters') or {}
    entity_type: str = params.get('type', 'test')
    
    # AlfaCRM API base URL (v2 API)
    base_url = f'https://alfacrm.pro/api/v2'
    
    try:
        if entity_type == 'test':
            # Test connection with simple customer list request
            url = f'{base_url}/customer/index'
            headers = {
                'X-ALFACRM-TOKEN': api_key,
                'Content-Type': 'application/json'
            }
            
            # Add branch_id as query parameter
            request_data = json.dumps({
                'branch_id': int(branch_id),
                'page': 1,
                'count': 1
            }).encode('utf-8')
            
            req = Request(url, data=request_data, headers=headers, method='POST')
            with urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'AlfaCRM connection successful',
                    'response': data
                })
            }
        
        elif entity_type == 'students':
            # Fetch students list
            url = f'{base_url}/customer/index'
            headers = {
                'X-ALFACRM-TOKEN': api_key,
                'Content-Type': 'application/json'
            }
            
            request_data = json.dumps({
                'branch_id': int(branch_id),
                'page': 1,
                'count': 50
            }).encode('utf-8')
            
            req = Request(url, data=request_data, headers=headers, method='POST')
            with urlopen(req, timeout=15) as response:
                data = json.loads(response.read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'students': data.get('items', []),
                    'total': data.get('total', 0)
                })
            }
        
        elif entity_type == 'teachers':
            # Fetch teachers list
            url = f'{base_url}/teacher/index'
            headers = {
                'X-ALFACRM-TOKEN': api_key,
                'Content-Type': 'application/json'
            }
            
            request_data = json.dumps({
                'branch_id': int(branch_id)
            }).encode('utf-8')
            
            req = Request(url, data=request_data, headers=headers, method='POST')
            with urlopen(req, timeout=15) as response:
                data = json.loads(response.read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'teachers': data.get('items', []),
                    'total': data.get('total', 0)
                })
            }
        
        elif entity_type == 'lessons':
            # Fetch lessons list
            url = f'{base_url}/lesson/index'
            headers = {
                'X-ALFACRM-TOKEN': api_key,
                'Content-Type': 'application/json'
            }
            
            request_data = json.dumps({
                'branch_id': int(branch_id),
                'page': 1,
                'count': 50
            }).encode('utf-8')
            
            req = Request(url, data=request_data, headers=headers, method='POST')
            with urlopen(req, timeout=15) as response:
                data = json.loads(response.read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'lessons': data.get('items', []),
                    'total': data.get('total', 0)
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Invalid entity type',
                    'details': 'Use type=test, students, teachers, or lessons'
                })
            }
    
    except HTTPError as e:
        error_body = e.read().decode('utf-8') if e.fp else 'No error details'
        return {
            'statusCode': e.code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'AlfaCRM API error',
                'status': e.code,
                'details': error_body
            })
        }
    
    except URLError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Connection error',
                'details': str(e.reason)
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            })
        }