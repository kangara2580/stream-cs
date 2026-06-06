import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "brand" | "dark" | "outline";

const variants: Record<Variant, string> = {
  brand:
    "bg-brand text-ink hover:bg-brand-dark hover:-translate-y-0.5 hover:shadow-[var(--shadow-brand)]",
  dark: "bg-ink text-brand hover:bg-[#333] hover:-translate-y-px",
  outline:
    "border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-brand",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  href?: string;
  className?: string;
};

export function Button({
  children,
  variant = "brand",
  size = "md",
  href,
  className = "",
}: Props) {
  const base =
    "font-jua inline-flex items-center justify-center gap-2 rounded-[20px] border-none cursor-pointer transition no-underline";
  const sizeCls = size === "lg" ? "px-9 py-[18px] text-[17px]" : "px-7 py-3.5 text-[15px]";
  const cls = `${base} ${variants[variant]} ${sizeCls} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return <button type="button" className={cls}>{children}</button>;
}
