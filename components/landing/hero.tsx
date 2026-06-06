import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-20 pt-16 text-center text-white md:px-10 md:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute left-[8%] top-[18%] h-16 w-16 animate-pulse rounded-full bg-brand/20 blur-xl" />
        <div className="absolute right-[12%] top-[30%] h-20 w-20 animate-pulse rounded-full bg-brand/15 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm text-brand">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
          베타 오픈 · 스트리머 한정 모집 중
        </div>

        <h1 className="font-jua mb-6 text-4xl leading-tight md:text-6xl">
          방송 컨텐츠 걱정
          <br />
          <span className="text-brand">이제는 없다 !</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          <strong className="text-white">URL 하나</strong>로 치지직, SOOP, 틱톡, 트위치 어디서든
          <br />
          시청자 참여형 미니게임이 방송 화면에 바로 올라온다.
        </p>

        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="dark" size="lg" href="/app#auth">
            시작하기
          </Button>
          <Button variant="outline" size="lg" href="/app#games" className="border-white text-white hover:bg-white hover:text-ink">
            게임 전체 보기
          </Button>
        </div>

        <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-5 py-3 text-sm">
          <span className="text-white/50">OBS 브라우저 소스</span>
          <code className="font-mono text-brand">streamcs.io/overlay/your-key</code>
        </div>
      </div>
    </section>
  );
}
