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

def get_auth_token(domain: str, email: str, api_key: str) -> str:
    '''
    Authenticate with AlfaCRM and get session token
    '''
    url = f'https://{domain}/v2api/auth/login'
    headers = {'Content-Type': 'application/json'}
    
    auth_data = json.dumps({
        'email': email,
        'api_key': api_key
    }).encode('utf-8')
    
    req = Request(url, data=auth_data, headers=headers, method='POST')
    with urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode('utf-8'))
    
    return data.get('token', '')

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
    domain: Optional[str] = os.environ.get('ALFACRM_DOMAIN')
    email: Optional[str] = os.environ.get('ALFACRM_EMAIL')
    
    if not api_key or not branch_id or not domain or not email:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Missing AlfaCRM credentials',
                'details': 'ALFACRM_API_KEY, ALFACRM_BRANCH_ID, ALFACRM_DOMAIN or ALFACRM_EMAIL not configured'
            })
        }
    
    params = event.get('queryStringParameters') or {}
    entity_type: str = params.get('type', 'test')
    
    # AlfaCRM API base URL (v2 API) with custom domain
    base_url = f'https://{domain}/v2api'
    
    try:
        # Get authentication token first
        auth_token = get_auth_token(domain, email, api_key)
        
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Authentication failed',
                    'details': 'Could not obtain auth token from AlfaCRM'
                })
            }
        
        if entity_type == 'test':
            # Test connection with simple customer list request
            url = f'{base_url}/customer/index'
            headers = {
                'X-ALFACRM-TOKEN': auth_token,
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
                'X-ALFACRM-TOKEN': auth_token,
                'Content-Type': 'application/json'
            }
            
            request_data = json.dumps({
                'branch_id': int(branch_id),
                'page': 1,
                'count': 50
            }).encode('utf-8')
            
            print(f'Requesting students from: {url}')
            print(f'Request data: {request_data.decode("utf-8")}')
            
            req = Request(url, data=request_data, headers=headers, method='POST')
            with urlopen(req, timeout=15) as response:
                response_text = response.read().decode('utf-8')
                print(f'Raw response: {response_text[:500]}...')
                data = json.loads(response_text)
            
            print(f'Parsed data keys: {list(data.keys())}')
            print(f'Items count: {len(data.get("items", []))}')
            print(f'Total: {data.get("total", 0)}')
            if data.get('items'):
                print(f'First item sample: {json.dumps(data["items"][0], ensure_ascii=False)[:200]}')
            
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
                'X-ALFACRM-TOKEN': auth_token,
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
                'X-ALFACRM-TOKEN': auth_token,
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