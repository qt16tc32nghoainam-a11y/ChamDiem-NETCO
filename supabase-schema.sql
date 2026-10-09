-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor
-- Bảng lưu phiếu chấm điểm chung cho tất cả Ban Giám Khảo.

create extension if not exists pgcrypto;

create table if not exists public.cham_diem_submissions (
  id uuid primary key default gen_random_uuid(),
  contest_date date not null,
  judge_name text not null check (char_length(trim(judge_name)) between 1 and 120),
  team_id text not null check (team_id in ('vp', 'bg', 'tr', 'kv')),
  team_name text not null,
  score_flavor smallint not null check (score_flavor between 0 and 40),
  score_nutrition smallint not null check (score_nutrition between 0 and 20),
  score_presentation smallint not null check (score_presentation between 0 and 20),
  score_presentation_talk smallint not null check (score_presentation_talk between 0 and 10),
  score_hygiene smallint not null check (score_hygiene between 0 and 10),
  total_score smallint generated always as (
    score_flavor + score_nutrition + score_presentation
    + score_presentation_talk + score_hygiene
  ) stored,
  comment text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists cham_diem_submissions_team_idx
  on public.cham_diem_submissions (team_id);
create index if not exists cham_diem_submissions_created_idx
  on public.cham_diem_submissions (created_at desc);

alter table public.cham_diem_submissions enable row level security;

-- Cho phép các BGK xem tất cả phiếu đã chấm.
drop policy if exists "Public can read submissions" on public.cham_diem_submissions;
create policy "Public can read submissions"
on public.cham_diem_submissions
for select
to anon, authenticated
using (true);

-- Cho phép các BGK gửi phiếu mới.
drop policy if exists "Public can insert submissions" on public.cham_diem_submissions;
create policy "Public can insert submissions"
on public.cham_diem_submissions
for insert
to anon, authenticated
with check (true);

-- Không mở quyền sửa/xóa công khai để tránh mất dữ liệu cuộc thi.
-- Nếu cần xóa phiếu, thực hiện trong Supabase Dashboard > Table Editor.
