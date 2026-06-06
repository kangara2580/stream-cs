import Link from "next/link";

const links = [
  { href: "#features", label: "서비스" },
  { href: "#games", label: "게임" },
  { href: "#pricing", label: "요금제" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b-2 border-brand bg-[rgba(15,15,15,0.97)] px-6 backdrop-blur-md md:px-9">
      <Link
        href="/"
        className="font-jua flex items-center gap-2.5 text-[22px] text-white no-underline"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand text-ink">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="6" width="16" height="9" rx="4.5" fill="#1A1A1A" />
            <circle cx="7" cy="10.5" r="1.5" fill="#FFD600" />
            <rect x="12" y="9.5" width="3" height="1.5" rx="0.75" fill="#FFD600" />
          </svg>
        </span>
        StreamCS
      </Link>

      <nav className="hidden items-center gap-1.5 sm:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-[14px] px-4 py-2 text-sm font-medium text-white/70 no-underline transition hover:bg-brand/15 hover:text-brand"
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/app#auth"
          className="font-jua ml-2 rounded-[20px] bg-brand px-5 py-2.5 text-sm text-ink no-underline transition hover:-translate-y-px hover:bg-[#ffe033] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
        >
          시작하기
        </Link>
      </nav>
    </header>
  );
}
