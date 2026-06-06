export type GameCategory = "참여" | "채팅" | "후원" | "AI";

export type Game = {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  cats: GameCategory[];
  badge: string;
  badgeCls: string;
};

export const GAMES: Game[] = [
  {
    id: "ladder",
    name: "사다리 타기",
    tagline: "동물 캐릭터와 함께하는 진짜 사다리타기",
    desc: "네이버 사다리처럼 — 동물 캐릭터 + 번호로 즐기는 사다리타기.",
    cats: ["참여"],
    badge: "2가지 버전",
    badgeCls: "badge-G",
  },
  {
    id: "food",
    name: "음식 먹기 게임",
    tagline: "입을 벌려 음식을 먹어라!",
    desc: "얼굴 인식으로 음식을 입으로 먹는 모션을 감지!",
    cats: ["참여"],
    badge: "얼굴 인식",
    badgeCls: "badge-Y",
  },
  {
    id: "marble",
    name: "구슬 게임",
    tagline: "채팅으로 함께하는 구슬 레이스",
    desc: "채팅으로 구슬 굴리기. 다양한 맵 제공.",
    cats: ["채팅", "참여"],
    badge: "채팅 연동",
    badgeCls: "badge-B",
  },
  {
    id: "bomb",
    name: "폭탄 룰렛",
    tagline: "누가 폭탄을 맞을까?",
    desc: "실시간 순위 변동. 지정 순위 걸리면 도네이션 미션.",
    cats: ["참여", "후원"],
    badge: "수금 특화",
    badgeCls: "badge-R",
  },
  {
    id: "369",
    name: "369 게임",
    tagline: "채팅으로 함께하는 369 클래식",
    desc: "틀리면 후원 미션 발동. 스트리머도 참여!",
    cats: ["채팅", "후원"],
    badge: "후원 연동",
    badgeCls: "badge-G",
  },
  {
    id: "checkin",
    name: "출석체크 랭킹",
    tagline: "매일 출석하는 충성 팬을 한눈에",
    desc: "매방 출석 누적 랭킹. 연속 출석 뱃지.",
    cats: ["참여"],
    badge: "충성 팬 관리",
    badgeCls: "badge-B",
  },
  {
    id: "ai-balance",
    name: "AI 밸런스 게임",
    tagline: "AI가 즉석에서 밸런스 질문 생성",
    desc: "키워드 입력 → AI 선택지 → 시청자 실시간 투표.",
    cats: ["AI", "참여"],
    badge: "AI 자동 생성",
    badgeCls: "badge-G",
  },
  {
    id: "noodle",
    name: "면 빨리 먹기",
    tagline: "한 호흡으로 면을 끝까지!",
    desc: "얼굴 인식으로 면 먹기 속도 측정.",
    cats: ["참여"],
    badge: "얼굴 인식",
    badgeCls: "badge-Y",
  },
];

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 19000,
    features: ["기본 게임 3종", "최대 50명 동시 참여", "단일 플랫폼", "기본 출석체크"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49000,
    popular: true,
    features: [
      "전체 게임 12종+",
      "무제한 동시 참여",
      "멀티 플랫폼 동시 송출",
      "AI 밸런스 게임",
      "고급 통계 대시보드",
      "커스텀 게임 설정",
      "우선 고객 지원",
    ],
  },
] as const;

export const PLATFORMS = [
  { name: "치지직", color: "#03C75A" },
  { name: "SOOP", color: "#0064FF" },
  { name: "틱톡 라이브", color: "#FE2C55" },
  { name: "트위치", color: "#9146FF" },
  { name: "유튜브 라이브", color: "#FF0000" },
  { name: "팝콘TV", color: "#FF6B00" },
] as const;
