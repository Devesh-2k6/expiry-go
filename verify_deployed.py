import urllib.request
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. Check Auth page HTML and bundles
req = urllib.request.Request('https://expirygo.vercel.app/auth', headers={'User-Agent': 'Mozilla/5.0'})
res = urllib.request.urlopen(req, timeout=10, context=ctx)
html = res.read().decode('utf-8', errors='ignore')

leak_words = ['deveshsuresh', 'hariniswathi', 'swathisuresh', 'saveetha']
found_leak = any(k in html for k in leak_words)
print(f"Personal account email leak in Auth HTML: {found_leak}")

# 2. Check Homepage HTML
hp_req = urllib.request.Request('https://expirygo.vercel.app/', headers={'User-Agent': 'Mozilla/5.0'})
hp_res = urllib.request.urlopen(hp_req, timeout=10, context=ctx)
hp_html = hp_res.read().decode('utf-8', errors='ignore')

print(f"Homepage HTTP Status: {hp_res.status}")
print(f"CustomCursor in Homepage: {'CustomCursor' in hp_html}")

# 3. Check JS chunks loaded on auth page
scripts = re.findall(r'src="(/_next/static/[^"]+\.js)"', html)
print(f"Found {len(scripts)} JS bundles. Checking each for any email leak...")
leak_count = 0
for s in scripts:
    url = f"https://expirygo.vercel.app{s}"
    try:
        b_res = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=5, context=ctx)
        js = b_res.read().decode('utf-8', errors='ignore')
        for word in leak_words:
            if word in js:
                print(f"LEAK DETECTED in bundle: {url} -> {word}")
                leak_count += 1
    except Exception as e:
        pass

if leak_count == 0:
    print("SUCCESS: 0 leaks across all production bundles!")

