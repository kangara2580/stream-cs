import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "public", "supabase-config.js");

function normalizeSupabaseUrl(raw) {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

const url = normalizeSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
);
const anonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""
).trim();

if (url && anonKey) {
  const body = `window.STREAMCS_SUPABASE = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;
  writeFileSync(outPath, body, "utf8");
  console.log("[stream-cs] supabase-config.js 생성됨 (환경 변수)");
} else if (process.env.VERCEL) {
  const body = `window.STREAMCS_SUPABASE = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-PUBLIC-KEY",
};
`;
  writeFileSync(outPath, body, "utf8");
  console.warn("[stream-cs] Vercel: Supabase env 없음 → 데모 config 생성");
} else if (existsSync(outPath)) {
  console.log("[stream-cs] supabase-config.js 유지 (로컬 파일)");
} else {
  console.log("[stream-cs] supabase-config.example.js 를 복사해 키를 입력하세요");
}
