import urllib.request
import urllib.parse
import json
import ssl
import sqlite3
import time

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

results = []

def test(name, fn):
    try:
        fn()
        results.append((name, 'PASS', 'OK'))
        print(f"[PASS] {name}")
    except Exception as e:
        results.append((name, 'FAIL', str(e)))
        print(f"[FAIL] {name}: {e}")

# 1. Web Frontend (Vercel Production)
def check_web_root():
    req = urllib.request.Request('https://expirygo.vercel.app/', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    html = res.read().decode('utf-8', errors='ignore')
    assert res.status == 200, f'Status {res.status}'
    assert 'manifest.json' in html or 'Rescue' in html or 'ExpiryGo' in html, 'Content verification failed'
test('Vercel Web - Homepage & SEO Meta', check_web_root)

def check_web_manifest():
    req = urllib.request.Request('https://expirygo.vercel.app/manifest.json', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    data = json.loads(res.read().decode('utf-8'))
    assert 'name' in data and 'icons' in data, 'Invalid manifest format'
test('Vercel Web - PWA Manifest.json', check_web_manifest)

def check_web_deals():
    req = urllib.request.Request('https://expirygo.vercel.app/deals', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    assert res.status == 200
test('Vercel Web - Deals Page', check_web_deals)

def check_web_shop():
    req = urllib.request.Request('https://expirygo.vercel.app/shop', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    assert res.status == 200
test('Vercel Web - Shop Page', check_web_shop)

def check_web_auth():
    req = urllib.request.Request('https://expirygo.vercel.app/auth', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    assert res.status == 200
test('Vercel Web - Auth Page', check_web_auth)

def check_web_cart():
    req = urllib.request.Request('https://expirygo.vercel.app/cart', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    assert res.status == 200
test('Vercel Web - Cart Page', check_web_cart)

def check_web_admin():
    req = urllib.request.Request('https://expirygo.vercel.app/admin', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    assert res.status == 200
test('Vercel Web - Admin Dashboard Page', check_web_admin)

def check_web_mobile_hub():
    req = urllib.request.Request('https://expirygo.vercel.app/mobile', headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    assert res.status == 200
test('Vercel Web - Mobile App Hub Page', check_web_mobile_hub)

# 2. Public Backend (Cloudflare Tunnel)
api_url = 'https://protocol-some-rail-basis.trycloudflare.com'

def check_api_health():
    res = urllib.request.urlopen(f'{api_url}/health', timeout=10, context=ctx)
    data = json.loads(res.read().decode('utf-8'))
    assert data.get('status') == 'ok', f'Unexpected health response: {data}'
test('Cloudflare Backend - /health Check', check_api_health)

def check_api_platform_impact():
    res = urllib.request.urlopen(f'{api_url}/health/platform-impact', timeout=10, context=ctx)
    assert res.status == 200
    data = json.loads(res.read().decode('utf-8'))
    assert 'total_co2_kg' in data and 'total_items_rescued' in data, 'Missing impact stats'
test('Cloudflare Backend - /health/platform-impact', check_api_platform_impact)

def check_api_products():
    res = urllib.request.urlopen(f'{api_url}/products/?limit=10', timeout=10, context=ctx)
    assert res.status == 200
    data = json.loads(res.read().decode('utf-8'))
    assert isinstance(data, (list, dict)), 'Products response not JSON list/dict'
test('Cloudflare Backend - /products/ API', check_api_products)

def check_api_shops():
    res = urllib.request.urlopen(f'{api_url}/shops/', timeout=10, context=ctx)
    assert res.status == 200
    data = json.loads(res.read().decode('utf-8'))
    assert isinstance(data, list), 'Shops response not JSON list'
test('Cloudflare Backend - /shops/ API', check_api_shops)

def check_api_docs():
    res = urllib.request.urlopen(f'{api_url}/docs', timeout=10, context=ctx)
    assert res.status == 200
test('Cloudflare Backend - Interactive OpenAPI /docs', check_api_docs)

# 3. Auth Flow (Admin Login and Profile verification via JSON)
token = None
def check_auth_login():
    global token
    url = f'{api_url}/auth/login'
    payload = json.dumps({'email': 'devpant2006@gmail.com', 'password': 'Sureshkumar12345@'}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    data = json.loads(res.read().decode('utf-8'))
    token = data.get('access_token')
    assert token, f'No access_token in response: {data}'
test('Cloudflare Backend - Admin Login (/auth/login)', check_auth_login)

def check_auth_me():
    global token
    assert token, 'Token missing from login step'
    req = urllib.request.Request(f'{api_url}/users/me', headers={'Authorization': f'Bearer {token}', 'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=10, context=ctx)
    data = json.loads(res.read().decode('utf-8'))
    assert data.get('email') == 'devpant2006@gmail.com', f'Incorrect user email: {data}'
    assert data.get('role') == 'ADMIN', f'Expected ADMIN role, got: {data.get("role")}'
test('Cloudflare Backend - Authenticated Profile (/users/me)', check_auth_me)

# 4. Database Schema and Health
def check_sqlite():
    conn = sqlite3.connect('backend/expirygo_local_dev.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    assert 'users' in tables, 'Missing users table'
    assert 'products' in tables, 'Missing products table'
    assert 'shops' in tables, 'Missing shops table'
    cursor.execute('SELECT COUNT(*) FROM users;')
    user_count = cursor.fetchone()[0]
    assert user_count >= 1, 'No users in database'
    conn.close()
test('SQLite Database - Table Schemas & Integrity', check_sqlite)

# 5. Mobile App Metro Bundles
def check_metro_android():
    req = urllib.request.Request('http://localhost:8081/index.bundle?platform=android&dev=true')
    res = urllib.request.urlopen(req, timeout=25)
    body = res.read(1024)
    assert res.status == 200, f'Status {res.status}'
    assert len(body) > 0, 'Android bundle is empty'
test('Mobile App (Expo SDK 57) - Android Bundle Compilation', check_metro_android)

def check_metro_web():
    req = urllib.request.Request('http://localhost:8081/index.bundle?platform=web&dev=true')
    res = urllib.request.urlopen(req, timeout=25)
    body = res.read(1024)
    assert res.status == 200, f'Status {res.status}'
    assert len(body) > 0, 'Web bundle is empty'
test('Mobile App (Expo SDK 57) - Web Bundle Compilation', check_metro_web)

# 6. Local Frontend Mirror
def check_local_frontend():
    req = urllib.request.Request('http://localhost:3000/')
    res = urllib.request.urlopen(req, timeout=10)
    assert res.status == 200
test('Local Web Server - Port 3000 Mirror', check_local_frontend)

print('\n' + '=' * 60)
print('                   AUDIT SUMMARY')
print('=' * 60)
passed = sum(1 for _, s, _ in results if s == 'PASS')
total = len(results)
for name, status, detail in results:
    print(f"[{status:4s}] {name}")
print('-' * 60)
print(f"Total Tests    : {total}")
print(f"Passed         : {passed}")
print(f"Failed         : {total - passed}")
print(f"Success Rate   : {passed/total*100:.1f}%")
print('=' * 60)
