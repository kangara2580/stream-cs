/**
 * StreamCS 실시간 서버
 * - WebSocket: 오버레이 ↔ 대시보드 실시간 통신
 * - Twitch IRC: 채팅 명령어 수신 및 파싱
 * - 게임 상태 관리: 모든 게임의 state machine
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const TwitchManager = require('./modules/twitch');
const GameManager = require('./modules/game-manager');

// ── Express 앱 ──────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
// 로컬 테스트용: Next public/overlay 와 동일한 OBS 오버레이 정적 서빙
app.use(express.static(path.join(__dirname, '../public/overlay')));

// ── Supabase ─────────────────────────────────────────────
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

// ── HTTP 서버 + WebSocket ────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// overlayKey → Set<WebSocket> 맵핑
// 같은 overlayKey를 가진 대시보드 + 오버레이가 같은 방 공유
const rooms = new Map();
// overlayKey → GameManager
const gameManagers = new Map();

function getRoom(overlayKey) {
  if (!rooms.has(overlayKey)) rooms.set(overlayKey, new Set());
  return rooms.get(overlayKey);
}

function getGameManager(overlayKey) {
  if (!gameManagers.has(overlayKey)) {
    const gm = new GameManager(overlayKey, (msg) => broadcast(overlayKey, msg));
    gameManagers.set(overlayKey, gm);
  }
  return gameManagers.get(overlayKey);
}

// 특정 방 전체에 메시지 브로드캐스트
function broadcast(overlayKey, data, excludeWs = null) {
  const room = getRoom(overlayKey);
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  room.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// ── WebSocket 연결 처리 ──────────────────────────────────
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const overlayKey = url.searchParams.get('key') || 'demo-key';
  const clientType = url.searchParams.get('type') || 'overlay'; // 'dashboard' | 'overlay'

  ws.overlayKey = overlayKey;
  ws.clientType = clientType;

  // 방 입장
  getRoom(overlayKey).add(ws);
  const gm = getGameManager(overlayKey);

  console.log(`[WS] 연결: ${clientType} / key=${overlayKey} / 총 ${getRoom(overlayKey).size}명`);

  // 연결 즉시 현재 게임 상태 전송
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'INIT', state: gm.getState() }));
  }

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    handleMessage(ws, overlayKey, msg, gm);
  });

  ws.on('close', () => {
    getRoom(overlayKey).delete(ws);
    console.log(`[WS] 연결 해제: ${clientType} / key=${overlayKey}`);
    // 방이 비면 게임 매니저 정리
    if (getRoom(overlayKey).size === 0) {
      const gm = gameManagers.get(overlayKey);
      if (gm) { gm.cleanup(); gameManagers.delete(overlayKey); }
    }
  });

  ws.on('error', (err) => console.error('[WS] 오류:', err.message));
});

// ── 메시지 라우터 ─────────────────────────────────────────
function handleMessage(ws, overlayKey, msg, gm) {
  const { type, payload } = msg;

  switch (type) {
    // ── 게임 제어 (대시보드 → 서버) ──
    case 'GAME_START':
      gm.start(payload);
      broadcast(overlayKey, { type: 'GAME_START', payload });
      break;

    case 'GAME_STOP':
      gm.stop();
      broadcast(overlayKey, { type: 'GAME_STOP' });
      break;

    case 'GAME_PAUSE':
      gm.pause();
      broadcast(overlayKey, { type: 'GAME_PAUSE' });
      break;

    case 'GAME_RESUME':
      gm.resume();
      broadcast(overlayKey, { type: 'GAME_RESUME' });
      break;

    case 'GAME_RESET':
      gm.reset();
      broadcast(overlayKey, { type: 'GAME_RESET' });
      break;

    // ── 게임 이벤트 (오버레이 → 서버 → 대시보드) ──
    case 'FACE_EVENT':
      // 얼굴 인식 이벤트 (음식 먹기, 면 먹기)
      gm.handleFaceEvent(payload);
      broadcast(overlayKey, { type: 'FACE_EVENT', payload }, ws);
      break;

    case 'GAME_EVENT':
      // 범용 게임 이벤트
      gm.handleEvent(payload);
      broadcast(overlayKey, { type: 'GAME_EVENT', payload }, ws);
      break;

    // ── 채팅 연동 (대시보드 → 서버: 트위치 채널 등록) ──
    case 'CHAT_JOIN':
      joinChat(overlayKey, payload);
      break;

    case 'CHAT_LEAVE':
      leaveChat(overlayKey);
      break;

    // ── 오버레이 씬 전환 ──
    case 'SCENE_CHANGE':
      broadcast(overlayKey, { type: 'SCENE_CHANGE', payload });
      break;

    // ── ping/pong ──
    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG', ts: Date.now() }));
      break;

    default:
      // 그 외 메시지는 방 전체에 릴레이
      broadcast(overlayKey, msg, ws);
  }
}

// ── 트위치 채팅 관리 ─────────────────────────────────────
const twitchManagers = new Map(); // overlayKey → TwitchManager

async function joinChat(overlayKey, { channel, platform }) {
  if (platform !== 'twitch') return; // 현재 트위치만 지원

  // 기존 연결 정리
  if (twitchManagers.has(overlayKey)) {
    twitchManagers.get(overlayKey).disconnect();
  }

  const tm = new TwitchManager(channel, (chatMsg) => {
    const gm = gameManagers.get(overlayKey);
    if (gm) gm.handleChat(chatMsg);
    // 대시보드와 오버레이에 채팅 전달
    broadcast(overlayKey, { type: 'CHAT_MESSAGE', payload: chatMsg });
  });

  await tm.connect();
  twitchManagers.set(overlayKey, tm);
  broadcast(overlayKey, { type: 'CHAT_JOINED', payload: { channel, platform } });
}

function leaveChat(overlayKey) {
  if (twitchManagers.has(overlayKey)) {
    twitchManagers.get(overlayKey).disconnect();
    twitchManagers.delete(overlayKey);
  }
  broadcast(overlayKey, { type: 'CHAT_LEFT' });
}

// ── REST API ──────────────────────────────────────────────
// 오버레이 상태 확인 (OBS 브라우저 소스용)
app.get('/api/state/:key', (req, res) => {
  const gm = gameManagers.get(req.params.key);
  res.json(gm ? gm.getState() : { active: false });
});

// 헬스 체크 (Railway/Render 모니터링용)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: [...rooms.entries()].map(([k, v]) => ({ key: k, count: v.size })),
    uptime: process.uptime()
  });
});

// 서버 정보
app.get('/', (req, res) => {
  res.json({ name: 'StreamCS Server', version: '1.0.0', status: 'running' });
});

// ── 서버 시작 ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 StreamCS 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🔑 Supabase: ${supabase ? '연결됨' : '미설정 (데모 모드)'}\n`);
});

module.exports = { app, broadcast };
