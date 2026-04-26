import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const serverDir = join(process.cwd(), 'build', 'server');
const candidates = existsSync(serverDir)
  ? readdirSync(serverDir)
      .map((entry) => join(serverDir, entry, 'index.js'))
      .filter((entry) => existsSync(entry))
  : [];

if (candidates.length === 0) {
  console.error('Could not find a production server entry under build/server/*/index.js');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';

const child = spawn(npxCommand, ['react-router-serve', candidates[0]], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '3000',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
