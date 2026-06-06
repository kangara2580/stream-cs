#!/usr/bin/env node
/**
 * 로컬 개발 서버 (Next.js)
 * - 항상 http://localhost:3000
 * - 준비되면 macOS에서 브라우저 자동 오픈
 * - DEV_FRESH=1 또는 npm run dev:fresh → 3000 포트 정리 후 시작
 */
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = 3000;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function killPort(port) {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`, { stdio: 'ignore', shell: true });
    console.log(`[stream-cs] 포트 ${port} 정리 완료`);
  } catch {
    /* 사용 중인 프로세스 없음 */
  }
}

if (process.env.DEV_FRESH === '1') {
  killPort(PORT);
}

console.log(`\n[stream-cs] 대시보드 → http://localhost:${PORT}`);
console.log('[stream-cs] WebSocket 서버는 별도 터미널: npm run ws:dev\n');

const nextBin = path.join(root, 'node_modules', '.bin', 'next');
const child = spawn(nextBin, ['dev', '-p', String(PORT)], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

setTimeout(() => {
  try {
    execSync(`open "http://localhost:${PORT}"`, { stdio: 'ignore' });
  } catch {
    console.log(`[stream-cs] 브라우저에서 http://localhost:${PORT} 를 열어주세요.`);
  }
}, 3500);

child.on('exit', (code) => process.exit(code ?? 0));
