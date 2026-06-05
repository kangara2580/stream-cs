/**
 * StreamCS Twitch IRC 모듈
 * tmi.js 기반 트위치 채팅 연결
 * 채팅 명령어 파싱 → 게임 이벤트로 변환
 */

const tmi = require('tmi.js');

class TwitchManager {
  constructor(channel, onMessage) {
    this.channel = channel.toLowerCase().replace('#', '');
    this.onMessage = onMessage;
    this.client = null;
    this.connected = false;
  }

  async connect() {
    const opts = {
      identity: process.env.TWITCH_BOT_USERNAME ? {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_BOT_TOKEN,
      } : undefined, // 익명 읽기 전용 모드
      channels: [`#${this.channel}`],
      options: { debug: false },
      connection: { reconnect: true, secure: true },
    };

    this.client = new tmi.Client(opts);

    this.client.on('message', (channel, tags, message, self) => {
      if (self) return;
      this.onMessage({
        platform: 'twitch',
        channel: channel.replace('#', ''),
        user: tags['display-name'] || tags.username,
        userId: tags['user-id'],
        message: message.trim(),
        color: tags.color || '#FFFFFF',
        badges: tags.badges || {},
        timestamp: Date.now(),
        // 명령어 파싱
        command: this._parseCommand(message),
      });
    });

    this.client.on('connected', () => {
      this.connected = true;
      console.log(`[Twitch] 연결됨: #${this.channel}`);
    });

    this.client.on('disconnected', (reason) => {
      this.connected = false;
      console.log(`[Twitch] 연결 해제: ${reason}`);
    });

    try {
      await this.client.connect();
    } catch (err) {
      console.error('[Twitch] 연결 실패:', err.message);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
      this.connected = false;
    }
  }

  // 채팅 명령어 파싱
  // "!참여 닉네임" / "!369 박수" / "1" / "O" / "X" 등
  _parseCommand(message) {
    const msg = message.trim();

    // !참여 [이름]
    if (/^!참여/.test(msg)) {
      const name = msg.replace('!참여', '').trim();
      return { type: 'JOIN', name };
    }
    // !시작
    if (msg === '!시작') return { type: 'START' };
    // !나가기
    if (msg === '!나가기') return { type: 'LEAVE' };
    // 숫자 입력 (369 게임)
    if (/^\d+$/.test(msg)) return { type: 'NUMBER', value: parseInt(msg) };
    // 박수/클랩 (369)
    if (/^(박수|👏|clap)$/i.test(msg)) return { type: 'CLAP' };
    // OX 퀴즈
    if (/^[oO오ㅇ]$/.test(msg)) return { type: 'OX', value: 'O' };
    if (/^[xX엑스ㅌ]$/.test(msg)) return { type: 'OX', value: 'X' };
    // 끝말잇기
    if (/^[가-힣]{1,10}$/.test(msg) && msg.length >= 1) return { type: 'WORD', value: msg };
    // A/B 선택 (밸런스 게임)
    if (/^[aA]$/.test(msg)) return { type: 'VOTE', value: 'A' };
    if (/^[bB]$/.test(msg)) return { type: 'VOTE', value: 'B' };
    // 출석 체크
    if (/^(출석|출첵|!출석|!출첵)/.test(msg)) return { type: 'CHECKIN' };

    return null;
  }
}

module.exports = TwitchManager;
