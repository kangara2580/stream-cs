const stats = [
  { num: "10+", label: "지원 플랫폼" },
  { num: "98%", label: "서버 마진율" },
  { num: "3초", label: "방송 연동 시간" },
  { num: "12+", label: "미니게임 종류" },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 border-b border-black/5 bg-brand-light md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="border-r border-black/5 px-6 py-8 text-center last:border-r-0">
          <div className="font-jua text-3xl text-ink md:text-4xl">{s.num}</div>
          <div className="mt-1 text-sm text-muted">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
