-- ============================================================
-- StreamCS Supabase 데이터베이스 스키마
-- supabase.com → 프로젝트 → SQL Editor 에 붙여넣고 [Run] 실행
-- ============================================================

-- ─────────────────────────────────────────────
-- 1) profiles : 회원 정보 (auth.users 와 1:1 연결)
--    구독 플랜, 채널명 등 기본 정보 저장
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  channel_name text,                       -- 채널명(닉네임)
  email        text,
  plan         text default null,          -- null(미구독) | 'starter' | 'pro'
  platform     text,                       -- 주 방송 플랫폼 (치지직/SOOP 등)
  channel_url  text,                       -- 방송 채널 URL
  overlay_key  text default gen_random_uuid(), -- OBS 오버레이 고유 키
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 2) game_records : 게임 진행 기록
-- ─────────────────────────────────────────────
create table if not exists public.game_records (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  game_id    text not null,                -- 'bomb', '369', 'ladder' 등
  data       jsonb,                        -- 게임별 상세 데이터(참여자 수, 결과 등)
  played_at  timestamptz default now()
);
create index if not exists idx_game_records_user on public.game_records(user_id);
create index if not exists idx_game_records_game on public.game_records(game_id);

-- ─────────────────────────────────────────────
-- 3) subscriptions : 구독/결제 내역
-- ─────────────────────────────────────────────
create table if not exists public.subscriptions (
  id           bigint generated always as identity primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  plan         text not null,              -- 'starter' | 'pro'
  amount       int  not null,              -- 결제 금액(원)
  status       text default 'active',      -- 'active' | 'canceled'
  started_at   timestamptz default now(),
  next_bill_at timestamptz
);
create index if not exists idx_sub_user on public.subscriptions(user_id);

-- ─────────────────────────────────────────────
-- 4) overlay_settings : 방송 연동 / 게임 기본 설정
-- ─────────────────────────────────────────────
create table if not exists public.overlay_settings (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  settings     jsonb default '{}',         -- 타이머, 폭탄위치, 화면모드 등
  platforms    jsonb default '[]',         -- 멀티 플랫폼 목록
  updated_at   timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security) : 본인 데이터만 접근 가능하게 보호
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.game_records      enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.overlay_settings  enable row level security;

-- profiles 정책
create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);
create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);
create policy "본인 프로필 생성" on public.profiles
  for insert with check (auth.uid() = id);

-- game_records 정책
create policy "본인 게임기록 조회" on public.game_records
  for select using (auth.uid() = user_id);
create policy "본인 게임기록 생성" on public.game_records
  for insert with check (auth.uid() = user_id);

-- subscriptions 정책
create policy "본인 구독내역 조회" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "본인 구독내역 생성" on public.subscriptions
  for insert with check (auth.uid() = user_id);

-- overlay_settings 정책
create policy "본인 설정 조회" on public.overlay_settings
  for select using (auth.uid() = user_id);
create policy "본인 설정 변경" on public.overlay_settings
  for all using (auth.uid() = user_id);

-- ============================================================
-- (선택) 회원가입 시 profiles 자동 생성 트리거
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, channel_name, email)
  values (new.id, new.raw_user_meta_data->>'channel_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
