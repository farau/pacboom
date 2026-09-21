import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const children = [
  spawn(process.execPath, ['arena/server.mjs'], { stdio: 'inherit', env: { ...process.env, PORT: process.env.ARENA_PORT || '3101' } }),
  spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev'], { stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(child => child.kill('SIGTERM'));
  process.exitCode = code;
}
children.forEach(child => {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code ?? 1); });
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
