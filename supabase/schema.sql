-- 사연 테이블
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  my_story text not null,
  other_story text,
  category text not null default 'etc',
  nickname text not null default '익명',
  status text not null default 'pending' check (status in ('pending', 'judged')),
  ai_verdict text,
  ai_my_fault integer,
  ai_other_fault integer,
  vote_my_side integer not null default 0,
  vote_other_side integer not null default 0,
  created_at timestamptz not null default now()
);

-- 투표 테이블 (중복 투표 방지용)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  vote_type text not null check (vote_type in ('my_side', 'other_side')),
  voter_token text not null,
  created_at timestamptz not null default now(),
  unique(case_id, voter_token)
);

-- 실시간 업데이트용 RLS 활성화
alter table cases enable row level security;
alter table votes enable row level security;

-- 모든 사용자 읽기 허용
create policy "cases_read" on cases for select using (true);
create policy "cases_insert" on cases for insert with check (true);
create policy "cases_update" on cases for update using (true);

create policy "votes_read" on votes for select using (true);
create policy "votes_insert" on votes for insert with check (true);

-- Realtime 활성화
alter publication supabase_realtime add table cases;
alter publication supabase_realtime add table votes;
