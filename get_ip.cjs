const os = require('os');
const fs = require('fs');
const path = require('path');

function getLanIp() {
  const ifaces = os.networkInterfaces();
  let candidate = null;
  for (const [name, list] of Object.entries(ifaces)) {
    if (/vmware|virtual|loopback|vethernet/i.test(name)) continue;
    for (const n of list || []) {
      if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('169.254.')) {
        if (/wi-fi|wifi|wireless|ethernet|eth|en/i.test(name)) {
          return n.address;
        }
        if (!candidate) candidate = n.address;
      }
    }
  }
  return candidate || '127.0.0.1';
}

function syncMobileEnv(ip) {
  const envPath = path.join(__dirname, 'mobile', 'src', 'config', 'env.ts');
  if (fs.existsSync(envPath)) {
    try {
      let content = fs.readFileSync(envPath, 'utf8');
      const updated = content.replace(
        /export const CURRENT_LAN_IP = "[^"]*";/,
        `export const CURRENT_LAN_IP = "${ip}";`
      );
      if (updated !== content) {
        fs.writeFileSync(envPath, updated, 'utf8');
      }
    } catch (e) {}
  }
}

const lanIp = getLanIp();
syncMobileEnv(lanIp);
if (require.main === module) {
  process.stdout.write(lanIp);
}
module.exports = { getLanIp, syncMobileEnv };

