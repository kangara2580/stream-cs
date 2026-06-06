const features = [
  {
    title: "컨텐츠 고갈? 이제 없습니다",
    desc: "사다리타기, 폭탄 룰렛, 구슬 게임, 면 먹기, 파리잡기 등 12가지 이상 미니게임이 대기 중입니다. 버튼 하나로 즉시 방송 화면에 올릴 수 있습니다.",
    badge: "12+ 게임",
    color: "bg-brand-light text-ink",
  },
  {
    title: "시청자가 직접 뛰어듭니다",
    desc: "참여 링크 하나로 시청자가 게임에 참여합니다. 채팅 명령어 연동, 실시간 순위, 도네이션 미션까지 — 보는 방송이 아닌 함께 만드는 방송이 됩니다.",
    badge: "실시간 참여",
    color: "bg-[#E8F5E9] text-[#2E7D32]",
  },
  {
    title: "자연스럽게 후원이 터집니다",
    desc: "게임 벌칙 = 후원 미션. 폭탄 당첨, 꼴찌 벌칙, 369 틀리기 등 게임 결과와 후원이 자연스럽게 연결됩니다. 시청자와 자연스러운 방송 흐름을 만들 수 있습니다.",
    badge: "자연스러운 후원 유도",
    color: "bg-[#E3F2FD] text-[#1565C0]",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-20 md:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-dark">왜 StreamCS인가</p>
        <h2 className="font-jua mb-4 text-3xl leading-snug md:text-4xl">
          스트리머의 3가지 진짜 문제
          <br />
          한 번에 해결합니다
        </h2>
        <p className="mb-12 text-muted">컨텐츠 걱정 없이, 시청자와 함께 만들어 가는 살아 있는 방송입니다.</p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="rounded-[var(--radius-card)] border-2 border-transparent bg-surface p-7 transition hover:border-brand hover:shadow-[var(--shadow-brand)]"
          >
            <h3 className="font-jua mb-3 text-xl">{f.title}</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">{f.desc}</p>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${f.color}`}>
              {f.badge}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
