-- Profiles
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text default 'ja-JP',
  created_at timestamptz default now()
);

-- Cards
create table if not exists public.cards(
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users(id) on delete cascade,
  front text not null,
  back text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews(
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  rating int check (rating between 0 and 5),
  reviewed_at timestamptz default now()
);

-- Schedules
create table if not exists public.schedules(
  user_id uuid references auth.users(id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  interval_days int not null default 1,
  ef numeric not null default 2.5,
  reps int not null default 0,
  lapses int not null default 0,
  due_date date not null default current_date,
  primary key(user_id, card_id)
);

-- RLS
alter table public.cards enable row level security;
alter table public.reviews enable row level security;
alter table public.schedules enable row level security;
alter table public.profiles enable row level security;

create policy if not exists "cards_owner" on public.cards
  for all using (owner = auth.uid()) with check (owner = auth.uid());

create policy if not exists "reviews_owner" on public.reviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists "sched_owner" on public.schedules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy if not exists "profile_self" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- RPC: assign a new card without schedule
create or replace function public.assign_new_card()
returns table(id uuid, front text, back text)
language plpgsql security definer as $$
declare uid uuid := auth.uid();
begin
  return query
  with unassigned as (
    select c.id, c.front, c.back
    from public.cards c
    left join public.schedules s on s.card_id = c.id and s.user_id = uid
    where c.owner = uid and s.card_id is null
    order by c.created_at asc
    limit 1
  )
  select * from unassigned;
end; $$;
