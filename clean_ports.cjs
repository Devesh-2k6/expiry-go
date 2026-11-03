const { execSync } = require('child_process');

function freePorts(ports = [8000, 3000, 8081]) {
  if (process.platform !== 'win32') return;
  const myPid = process.pid.toString();
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    for (const port of ports) {
      const regex = new RegExp(`:${port}\\s+.*?\\s+(\\d+)\\r?$`, 'gm');
      let match;
      const pids = new Set();
      while ((match = regex.exec(out)) !== null) {
        if (match[1] && match[1] !== '0' && match[1] !== myPid) {
          pids.add(match[1]);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`  [Cleaned] Terminated process on port ${port} (PID ${pid})`);
        } catch (e) {}
      }
    }
  } catch (err) {}
}

if (require.main === module) {
  freePorts();
}
module.exports = { freePorts };

