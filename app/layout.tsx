import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스트림컨텐츠 서버",
  description: "크로스플랫폼 스트리머 SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
