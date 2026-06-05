# StreamCS 실시간 서버

OBS 오버레이 ↔ 대시보드 WebSocket 실시간 연동 서버

---

## 📁 파일 구조

```
streamcs-server/
├── server.js              # 메인 서버 (WebSocket + Express)
├── modules/
│   ├── game-manager.js    # 게임 상태 머신 (모든 게임)
│   └── twitch.js          # 트위치 IRC 채팅 연동
├── overlay/
│   ├── overlay.html       # OBS 메인 오버레이 (모든 게임 통합)
│   └── face-overlay.html  # 얼굴 인식 오버레이 (음식/면 게임)
├── package.json
├── railway.toml           # Railway 배포 설정
└── .env.example           # 환경변수 예시
```

---

## 🚀 로컬 실행

### 1. 의존성 설치
```bash
cd streamcs-server
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env
# .env 파일을 열고 값 입력
```

### 3. 서버 실행
```bash
npm start
# 또는 개발 모드 (파일 변경 시 자동 재시작)
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

---

## 📡 Railway 배포 (추천)

### 1. Railway 가입 및 설치
```bash
npm install -g @railway/cli
railway login
```

### 2. 프로젝트 배포
```bash
cd streamcs-server
railway init
railway up
```

### 3. 환경변수 설정 (Railway 대시보드)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...
TWITCH_BOT_USERNAME=your_bot
TWITCH_BOT_TOKEN=oauth:xxxx
```

Railway에서 자동으로 URL이 발급됩니다.  
예: `https://streamcs-server.up.railway.app`

---

## 🎯 OBS 브라우저 소스 설정

### 메인 오버레이 (모든 게임)
```
URL: overlay.html?key=YOUR_OVERLAY_KEY&server=wss://your-server.railway.app
Width: 1920
Height: 1080
FPS: 60
```

### 얼굴 인식 오버레이 (음식/면 게임)
```
URL: face-overlay.html?key=YOUR_OVERLAY_KEY&server=wss://your-server.railway.app&game=food
Width: 1920
Height: 1080
FPS: 60
```

> ⚠️ 얼굴 인식 오버레이는 웹캠 접근 권한이 필요합니다.  
> OBS 설정 → 브라우저 소스 → "OBS WebBrowser가 카메라 접근 허용" 체크

### 디버그 모드 (개발 시)
```
URL에 &debug=1 추가 → 얼굴 랜드마크 시각화
```

---

## 🔌 WebSocket 메시지 프로토콜

### 대시보드 → 서버

| type | payload | 설명 |
|------|---------|------|
| `GAME_START` | `{gameId, gameName, settings}` | 게임 시작 |
| `GAME_STOP` | - | 게임 종료 |
| `GAME_PAUSE` | - | 일시정지 |
| `GAME_RESUME` | - | 재개 |
| `CHAT_JOIN` | `{platform, channel}` | 채팅 연결 |
| `CHAT_LEAVE` | - | 채팅 해제 |
| `SCENE_CHANGE` | `{scene}` | 씬 전환 |

### 서버 → 모든 클라이언트

| type | payload | 설명 |
|------|---------|------|
| `INIT` | `{state}` | 초기 상태 전송 |
| `STATE_UPDATE` | `{state}` | 상태 변경 |
| `GAME_START` | `{gameId, gameName, settings}` | 게임 시작 브로드캐스트 |
| `GAME_STOP` | - | 게임 종료 |
| `TIMER_UPDATE` | `{timer}` | 타이머 (매초) |
| `TIMER_END` | - | 타이머 종료 |
| `GAME_EVENT` | `{event, ...data}` | 게임 이벤트 |
| `GAME_RESULT` | `{...data}` | 게임 결과 |
| `CHAT_MESSAGE` | `{user, message, color, platform}` | 채팅 메시지 |
| `CHAT_JOINED` | `{platform, channel}` | 채팅 연결 완료 |

---

## 🎮 게임별 채팅 명령어

| 게임 | 명령어 | 설명 |
|------|--------|------|
| 369 | `숫자` / `박수` / `👏` | 369 차례에 박수 |
| 끝말잇기 | `단어` | 이전 단어 끝 글자로 시작하는 단어 |
| 초성 퀴즈 | `정답` | 채팅으로 정답 입력 |
| OX 퀴즈 | `O` / `X` | 투표 |
| 밸런스 게임 | `A` / `B` | 투표 |
| 빙고 | `숫자` | 빙고 숫자 호출 |
| 출석 체크 | `출석` / `출첵` / `!출석` | 출석 |
| 폭탄/구슬/룰렛 | `!참여 [이름]` | 게임 참여 |

---

## ✅ 헬스 체크

서버 실행 확인:
```
GET http://localhost:3001/health
```

응답:
```json
{
  "status": "ok",
  "connections": [...],
  "uptime": 123.45
}
```
