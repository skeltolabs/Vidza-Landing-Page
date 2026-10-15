import urllib.request
import json

key = 'e5a9f24b17c84918a38b55d6108f9104'
payload = {
    'host': 'vidza.skeltolabs.com',
    'key': key,
    'keyLocation': f'https://vidza.skeltolabs.com/{key}.txt',
    'urlList': [
        'https://vidza.skeltolabs.com/',
        'https://vidza.skeltolabs.com/about.html',
        'https://vidza.skeltolabs.com/contact.html',
        'https://vidza.skeltolabs.com/privacy-policy.html',
        'https://vidza.skeltolabs.com/terms-of-service.html',
        'https://vidza.skeltolabs.com/usage-disclaimer.html',
        'https://vidza.skeltolabs.com/open-source-licenses.html'
    ]
}

data = json.dumps(payload).encode('utf-8')
headers = {'Content-Type': 'application/json; charset=utf-8'}

for endpoint in ['https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow']:
    try:
        req = urllib.request.Request(endpoint, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f'{endpoint}: Status {resp.status} ({resp.reason})')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        print(f'{endpoint}: HTTPError {e.code} - {body}')
    except Exception as e:
        print(f'{endpoint}: Error - {e}')
