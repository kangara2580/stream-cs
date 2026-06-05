/**
 * StreamCS GameManager
 * 모든 게임의 상태 머신을 관리
 * 타이머, 점수, 참여자, 게임별 로직 처리
 */

class GameManager {
  constructor(overlayKey, broadcast) {
    this.overlayKey = overlayKey;
    this.broadcast = broadcast;

    // 기본 상태
    this.state = {
      active: false,
      gameId: null,
      gameName: null,
      status: 'idle', // idle | running | paused | finished
      timer: 0,
      score: 0,
      participants: [], // [{ user, userId, score, data }]
      result: null,
      settings: {},
      ts: Date.now(),
    };

    this._timerInterval = null;
    this._gameData = {}; // 게임별 임시 데이터
  }

  // ── 상태 조회 ──────────────────────────────────────────
  getState() {
    return { ...this.state, _gameData: this._gameData };
  }

  // ── 게임 시작 ──────────────────────────────────────────
  start(payload) {
    const { gameId, gameName, settings = {} } = payload;

    // 기존 타이머 정리
    this._clearTimer();

    this.state = {
      active: true,
      gameId,
      gameName,
      status: 'running',
      timer: settings.timer || 0,
      score: 0,
      participants: [],
      result: null,
      settings,
      ts: Date.now(),
    };
    this._gameData = {};

    // 게임별 초기화
    this._initGame(gameId, settings);
    this._broadcastState();

    console.log(`[Game] 시작: ${gameId} / key=${this.overlayKey}`);
  }

  // ── 게임 중지 ──────────────────────────────────────────
  stop() {
    this._clearTimer();
    this.state.active = false;
    this.state.status = 'finished';
    this.state.ts = Date.now();
    this._broadcastState();
    console.log(`[Game] 중지: ${this.state.gameId}`);
  }

  // ── 일시정지 / 재개 ────────────────────────────────────
  pause() {
    if (this.state.status !== 'running') return;
    this._clearTimer();
    this.state.status = 'paused';
  }

  resume() {
    if (this.state.status !== 'paused') return;
    this.state.status = 'running';
    this._restartTimer();
  }

  // ── 리셋 ──────────────────────────────────────────────
  reset() {
    this._clearTimer();
    this.state = {
      ...this.state,
      active: false,
      status: 'idle',
      timer: 0,
      score: 0,
      participants: [],
      result: null,
      ts: Date.now(),
    };
    this._gameData = {};
  }

  // ── 채팅 이벤트 처리 ────────────────────────────────────
  handleChat(chatMsg) {
    if (!this.state.active) return;
    const { command, user, userId, message, color } = chatMsg;
    if (!command) return;

    switch (this.state.gameId) {
      case '369':       this._handle369Chat(command, user, userId, color); break;
      case 'quiz':      this._handleQuizChat(command, user, userId); break;
      case 'wordchain': this._handleWordchainChat(command, user, userId, message); break;
      case 'initial':   this._handleInitialChat(command, user, userId, message); break;
      case 'ai-balance':this._handleBalanceChat(command, user, userId); break;
      case 'bingo':     this._handleBingoChat(command, user, userId); break;
      case 'checkin':   this._handleCheckinChat(command, user, userId, color); break;
      case 'marble':
      case 'bomb':
      case 'spin':
      case 'fortune':   this._handleJoinChat(command, user, userId, color); break;
    }
  }

  // ── 얼굴 인식 이벤트 ────────────────────────────────────
  handleFaceEvent(payload) {
    if (!this.state.active) return;
    const { event, data } = payload;

    switch (this.state.gameId) {
      case 'food':   this._handleFoodFace(event, data); break;
      case 'noodle': this._handleNoodleFace(event, data); break;
    }
  }

  // ── 범용 이벤트 ────────────────────────────────────────
  handleEvent(payload) {
    if (!this.state.active) return;
    const { event, data } = payload;

    // 사다리 게임 결과 처리
    if (this.state.gameId === 'ladder' && event === 'RESULT') {
      this.state.result = data;
      this.broadcast({ type: 'GAME_RESULT', payload: data });
    }

    // 파리잡기 점수 처리
    if (this.state.gameId === 'flyswat' && event === 'HIT') {
      this.state.score = (this.state.score || 0) + (data.score || 1);
      this.broadcast({ type: 'SCORE_UPDATE', payload: { score: this.state.score } });
    }
  }

  // ── 게임별 초기화 ────────────────────────────────────────
  _initGame(gameId, settings) {
    switch (gameId) {
      case '369':
        this._gameData = { count: 0, current: 1, lastUser: null };
        this._broadcastState();
        break;

      case 'wordchain':
        this._gameData = {
          currentWord: settings.startWord || null,
          lastChar: settings.startWord ? settings.startWord.slice(-1) : null,
          usedWords: new Set(),
          turnUser: null,
          turnTimer: settings.turnTimer || 10,
        };
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
        break;

      case 'quiz':
        this._gameData = {
          question: settings.question || '',
          answer: settings.answer || null,
          phase: 'waiting', // waiting | answering | result
          votes: { O: [], X: [] },
        };
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
        break;

      case 'ai-balance':
        this._gameData = {
          question: settings.question || '',
          optionA: settings.optionA || 'A',
          optionB: settings.optionB || 'B',
          votes: { A: [], B: [] },
        };
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
        break;

      case 'bingo':
        this._gameData = {
          board: settings.board || this._generateBingoBoard(),
          called: [],
          players: {},
        };
        this._broadcastState();
        break;

      case 'food':
        this._gameData = {
          score: 0,
          combo: 0,
          items: [],
          mouthOpen: false,
        };
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
        break;

      case 'noodle':
        this._gameData = {
          chewCount: 0,
          speed: 0,
          startTime: null,
          mouthOpen: false,
        };
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
        break;

      case 'flyswat':
        this._gameData = { score: 0, combo: 0, missed: 0 };
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
        break;

      default:
        if (settings.timer > 0) this._startCountdown(settings.timer);
        this._broadcastState();
    }
  }

  // ── 369 게임 ──────────────────────────────────────────
  _handle369Chat(command, user, userId, color) {
    if (command.type !== 'NUMBER' && command.type !== 'CLAP') return;

    const gd = this._gameData;
    const expected = gd.current;
    const is369 = expected % 3 === 0;
    const hasDigit369 = String(expected).split('').some(d => ['3','6','9'].includes(d));
    const needsClap = is369 || hasDigit369;

    let correct = false;
    if (needsClap) {
      correct = command.type === 'CLAP';
    } else {
      correct = command.type === 'NUMBER' && command.value === expected;
    }

    if (correct) {
      gd.count++;
      gd.current++;
      gd.lastUser = user;
      this.broadcast({
        type: 'GAME_EVENT',
        payload: {
          event: '369_CORRECT',
          user, userId, color,
          current: gd.current,
          count: gd.count,
          wasClap: needsClap,
        }
      });
    } else {
      // 틀림 → 해당 유저 벌칙, 게임 리셋
      gd.count = 0;
      gd.current = 1;
      this.broadcast({
        type: 'GAME_EVENT',
        payload: {
          event: '369_WRONG',
          user, userId, color,
          expected, needsClap,
          got: command.type === 'CLAP' ? 'CLAP' : command.value,
        }
      });
    }
    this._broadcastState();
  }

  // ── OX 퀴즈 ──────────────────────────────────────────
  _handleQuizChat(command, user, userId) {
    if (command.type !== 'OX') return;
    const gd = this._gameData;
    if (gd.phase !== 'answering') return;

    // 이미 투표한 유저 제외
    const alreadyVoted = [...gd.votes.O, ...gd.votes.X].some(v => v.userId === userId);
    if (alreadyVoted) return;

    gd.votes[command.value].push({ user, userId });
    this.broadcast({
      type: 'GAME_EVENT',
      payload: {
        event: 'QUIZ_VOTE',
        user, userId, value: command.value,
        counts: { O: gd.votes.O.length, X: gd.votes.X.length },
      }
    });
    this._broadcastState();
  }

  // ── 끝말잇기 ──────────────────────────────────────────
  _handleWordchainChat(command, user, userId, message) {
    if (command.type !== 'WORD') return;
    const gd = this._gameData;
    const word = message.trim();

    // 첫 글자가 이전 단어 마지막 글자와 일치하는지
    if (gd.lastChar && word[0] !== gd.lastChar) return;
    // 이미 사용된 단어
    if (gd.usedWords.has(word)) {
      this.broadcast({
        type: 'GAME_EVENT',
        payload: { event: 'WORD_USED', user, word }
      });
      return;
    }

    gd.usedWords.add(word);
    gd.lastChar = word.slice(-1);
    gd.turnUser = user;

    // 점수 추가
    const p = this._getOrAddParticipant(user, userId);
    p.score = (p.score || 0) + word.length;

    this.broadcast({
      type: 'GAME_EVENT',
      payload: {
        event: 'WORD_OK',
        user, userId, word,
        nextChar: gd.lastChar,
        score: p.score,
      }
    });
    this._broadcastState();
  }

  // ── 초성 퀴즈 ──────────────────────────────────────────
  _handleInitialChat(command, user, userId, message) {
    const gd = this._gameData;
    if (!gd.answer || !gd.active) return;

    const ans = message.trim().toLowerCase();
    if (ans === gd.answer.toLowerCase()) {
      gd.active = false;
      const p = this._getOrAddParticipant(user, userId);
      p.score = (p.score || 0) + 1;
      this.broadcast({
        type: 'GAME_EVENT',
        payload: { event: 'INITIAL_CORRECT', user, userId, answer: gd.answer }
      });
      this._broadcastState();
    }
  }

  // ── 밸런스 게임 ──────────────────────────────────────
  _handleBalanceChat(command, user, userId) {
    if (command.type !== 'VOTE') return;
    const gd = this._gameData;

    const alreadyVoted = [...gd.votes.A, ...gd.votes.B].some(v => v.userId === userId);
    if (alreadyVoted) return;

    gd.votes[command.value].push({ user, userId });
    this.broadcast({
      type: 'GAME_EVENT',
      payload: {
        event: 'BALANCE_VOTE',
        user, userId, value: command.value,
        counts: { A: gd.votes.A.length, B: gd.votes.B.length },
        total: gd.votes.A.length + gd.votes.B.length,
      }
    });
    this._broadcastState();
  }

  // ── 빙고 ──────────────────────────────────────────────
  _handleBingoChat(command, user, userId) {
    if (command.type !== 'NUMBER') return;
    const gd = this._gameData;
    const num = command.value;

    if (gd.called.includes(num)) return;
    if (!gd.board.flat().includes(num)) return;

    gd.called.push(num);
    this.broadcast({
      type: 'GAME_EVENT',
      payload: { event: 'BINGO_CALL', number: num, called: gd.called }
    });
    this._broadcastState();
  }

  // ── 출석 체크 ──────────────────────────────────────────
  _handleCheckinChat(command, user, userId, color) {
    if (command.type !== 'CHECKIN') return;
    const already = this.state.participants.find(p => p.userId === userId);
    if (already) return;

    const p = this._getOrAddParticipant(user, userId);
    p.color = color;
    p.checkinTime = Date.now();

    this.broadcast({
      type: 'GAME_EVENT',
      payload: {
        event: 'CHECKIN',
        user, userId, color,
        rank: this.state.participants.length,
      }
    });
    this._broadcastState();
  }

  // ── 참여 게임 (폭탄, 구슬, 룰렛 등) ────────────────────
  _handleJoinChat(command, user, userId, color) {
    if (command.type !== 'JOIN') return;
    const already = this.state.participants.find(p => p.userId === userId);
    if (already) return;

    const p = this._getOrAddParticipant(user, userId);
    p.color = color;
    p.name = command.name || user;

    this.broadcast({
      type: 'GAME_EVENT',
      payload: {
        event: 'PLAYER_JOIN',
        user, userId, color,
        name: p.name,
        count: this.state.participants.length,
      }
    });
    this._broadcastState();
  }

  // ── 얼굴 인식: 음식 먹기 ────────────────────────────────
  _handleFoodFace(event, data) {
    const gd = this._gameData;

    if (event === 'MOUTH_OPEN') {
      gd.mouthOpen = true;
    } else if (event === 'MOUTH_CLOSE' && gd.mouthOpen) {
      gd.mouthOpen = false;
      // 입 닫을 때 음식이 입 근처에 있으면 먹음
      if (data.foodNear) {
        gd.combo = (gd.combo || 0) + 1;
        const points = data.foodScore * (1 + Math.floor(gd.combo / 5) * 0.5);
        gd.score = (gd.score || 0) + Math.round(points);
        this.state.score = gd.score;

        this.broadcast({
          type: 'GAME_EVENT',
          payload: {
            event: 'FOOD_EAT',
            score: gd.score,
            combo: gd.combo,
            points: Math.round(points),
            foodType: data.foodType,
          }
        });
        this._broadcastState();
      }
    } else if (event === 'MISS') {
      gd.combo = 0;
      this.broadcast({ type: 'GAME_EVENT', payload: { event: 'FOOD_MISS' } });
    }
  }

  // ── 얼굴 인식: 면 빨리 먹기 ─────────────────────────────
  _handleNoodleFace(event, data) {
    const gd = this._gameData;

    if (event === 'CHEW') {
      gd.chewCount++;
      if (!gd.startTime) gd.startTime = Date.now();
      const elapsed = (Date.now() - gd.startTime) / 1000;
      gd.speed = elapsed > 0 ? Math.round(gd.chewCount / elapsed * 60) : 0; // 분당 씹기 횟수

      this.state.score = gd.chewCount;
      this.broadcast({
        type: 'GAME_EVENT',
        payload: {
          event: 'NOODLE_CHEW',
          chewCount: gd.chewCount,
          speed: gd.speed,
          elapsed: Math.round(elapsed),
        }
      });
    } else if (event === 'FINISH') {
      const elapsed = (Date.now() - (gd.startTime || Date.now())) / 1000;
      this.state.result = {
        chewCount: gd.chewCount,
        time: elapsed.toFixed(1),
        speed: gd.speed,
      };
      this.broadcast({
        type: 'GAME_RESULT',
        payload: this.state.result,
      });
      this.stop();
    }
  }

  // ── 타이머 유틸 ──────────────────────────────────────────
  _startCountdown(seconds) {
    this.state.timer = seconds;
    this._clearTimer();
    this._timerInterval = setInterval(() => {
      if (this.state.status !== 'running') return;
      this.state.timer = Math.max(0, this.state.timer - 1);
      this.broadcast({ type: 'TIMER_UPDATE', payload: { timer: this.state.timer } });
      if (this.state.timer <= 0) {
        this._clearTimer();
        this.broadcast({ type: 'TIMER_END' });
        this.state.status = 'finished';
        this._broadcastState();
      }
    }, 1000);
  }

  _startCountup() {
    this._clearTimer();
    this.state.timer = 0;
    this._timerInterval = setInterval(() => {
      if (this.state.status !== 'running') return;
      this.state.timer++;
      this.broadcast({ type: 'TIMER_UPDATE', payload: { timer: this.state.timer } });
    }, 1000);
  }

  _restartTimer() {
    if (this.state.settings?.timer > 0 && this.state.timer > 0) {
      this._startCountdown(this.state.timer);
    }
  }

  _clearTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  // ── 유틸 ──────────────────────────────────────────────
  _getOrAddParticipant(user, userId) {
    let p = this.state.participants.find(p => p.userId === userId);
    if (!p) {
      p = { user, userId, score: 0, data: {} };
      this.state.participants.push(p);
    }
    return p;
  }

  _broadcastState() {
    this.broadcast({ type: 'STATE_UPDATE', state: this.getState() });
  }

  _generateBingoBoard() {
    const nums = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    // 5x5 2차원 배열
    return Array.from({ length: 5 }, (_, i) => nums.slice(i * 5, i * 5 + 5));
  }

  cleanup() {
    this._clearTimer();
  }
}

module.exports = GameManager;
