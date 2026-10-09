-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor.
-- Mỗi BGK chỉ được chấm mỗi đội một lần.

create extension if not exists pgcrypto;

create table if not exists public.cham_diem_submissions (
  id uuid primary key default gen_random_uuid(),
  contest_date date not null,
  judge_id text not null check (judge_id in (
    'mai-duc-lam',
    'nguyen-thi-suong',
    'ngo-thi-quynh-nhu',
    'phan-hoang-trung-hieu'
  )),
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

-- Migration cho bảng đã tạo ở phiên bản trước chưa có judge_id.
alter table public.cham_diem_submissions
  add column if not exists judge_id text;

update public.cham_diem_submissions
set judge_id = case judge_name
  when 'Ông Mai Đức Lâm' then 'mai-duc-lam'
  when 'Bà Nguyễn Thị Sương' then 'nguyen-thi-suong'
  when 'Bà Ngô Thị Quỳnh Như' then 'ngo-thi-quynh-nhu'
  when 'Ông Phan Hoàng Trung Hiếu' then 'phan-hoang-trung-hieu'
  else judge_id
end
where judge_id is null;

do $$
begin
  if exists (
    select 1 from public.cham_diem_submissions where judge_id is null
  ) then
    raise exception 'Có phiếu cũ không xác định được judge_id. Hãy cập nhật judge_id trước khi chạy lại.';
  end if;
end $$;

alter table public.cham_diem_submissions
  alter column judge_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'cham_diem_submissions_judge_id_allowed'
  ) then
    alter table public.cham_diem_submissions
      add constraint cham_diem_submissions_judge_id_allowed
      check (judge_id in (
        'mai-duc-lam',
        'nguyen-thi-suong',
        'ngo-thi-quynh-nhu',
        'phan-hoang-trung-hieu'
      ));
  end if;
end $$;

-- Ràng buộc quan trọng: một BGK không thể chấm cùng một đội trong cùng một ngày.
drop index if exists public.one_team_one_judge;
create unique index if not exists one_team_one_judge
  on public.cham_diem_submissions (contest_date, team_id, judge_id);

create index if not exists cham_diem_submissions_team_idx
  on public.cham_diem_submissions (team_id);
create index if not exists cham_diem_submissions_created_idx
  on public.cham_diem_submissions (created_at desc);

alter table public.cham_diem_submissions enable row level security;

drop policy if exists "Public can read submissions" on public.cham_diem_submissions;
create policy "Public can read submissions"
on public.cham_diem_submissions
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert submissions" on public.cham_diem_submissions;
create policy "Public can insert submissions"
on public.cham_diem_submissions
for insert
to anon, authenticated
with check (true);

-- Không mở quyền sửa/xóa công khai để tránh mất dữ liệu cuộc thi.
-- Nếu cần xóa phiếu, thực hiện trong Supabase Dashboard > Table Editor.

-- Bắt PostgREST tải lại schema ngay sau khi thêm judge_id.
select pg_notify('pgrst', 'reload schema');
