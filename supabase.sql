-- 필요한 확장 (uuid_generate_v4)
create extension if not exists "uuid-ossp";

-- 좌석 테이블
create table if not exists public.seats (
  id uuid primary key default uuid_generate_v4(),
  row int not null,
  col int not null,
  label text not null unique,
  reserved boolean not null default false
);

-- 예약자 테이블
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  created_at timestamp with time zone default now()
);

-- 예약-좌석 연결 테이블
create table if not exists public.booking_seats (
  booking_id uuid references public.bookings(id) on delete cascade,
  seat_id uuid references public.seats(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (booking_id, seat_id)
);

-- RLS 활성화
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_seats enable row level security;

-- 데모용 공개 정책 (운영에서는 강화 권장)
drop policy if exists "seats_select" on public.seats;
create policy "seats_select" on public.seats for select using (true);

drop policy if exists "seats_update" on public.seats;
create policy "seats_update" on public.seats for update using (true) with check (true);

-- 상단 좌석 자동 보정 등을 위해 insert 허용 (데모용)
drop policy if exists "seats_insert" on public.seats;
create policy "seats_insert" on public.seats for insert with check (true);

drop policy if exists "bookings_crud" on public.bookings;
create policy "bookings_crud" on public.bookings for all using (true) with check (true);

drop policy if exists "booking_seats_crud" on public.booking_seats;
create policy "booking_seats_crud" on public.booking_seats for all using (true) with check (true);

-- 좌석 데이터 (사진 기반: 6행 x 17열, 가운데 통로 col=9은 비움)
-- 기존 좌석 모두 삭제 후 재시드
delete from public.seats;

-- 본 그리드 6행 (row=1..6), 17열 중 col=9은 통로로 제외
insert into public.seats (row, col, label)
select r, c, concat(r::text, '-', c::text)
from generate_series(1, 6) r, generate_series(1, 17) c
where c <> 9
on conflict (label) do nothing;

-- 상단 연속 줄 18칸 (row=0, col=1..18) — 통로 없이 전부 좌석
insert into public.seats (row, col, label)
select 0 as row, c, concat('0-', c::text)
from generate_series(1, 18) c
on conflict (label) do nothing;

-- 표시 라벨을 요구사항에 맞게 재지정: 가/나/다 체계
-- 상단: 다-1..18 (좌->우 1..18이 아니라, 현재 UI는 우->좌 1..18이므로 표시는 UI에서 처리)
update public.seats s
set label = concat('다-', (19 - s.col))
where s.row = 0;

-- 본 그리드 왼쪽(1..8열): 나-1..48 (아래에서 위로 8씩 증가, 열은 오->왼 1..8)
update public.seats s
set label = concat('나-', ((7 - s.row) * 8 + (9 - s.col)))
where s.row between 1 and 6 and s.col between 1 and 8;

-- 본 그리드 오른쪽(10..17열): 가-1..48 (아래에서 위로 8씩 증가, 열은 왼->오 1..8)
update public.seats s
set label = concat('가-', ((7 - s.row) * 8 + (s.col - 9)))
where s.row between 1 and 6 and s.col between 10 and 17;

-- 상단 연속 줄(1..18)은 row=0, col=1..18로 이미 포함됩니다.
