-- ShipCheck schema: issues per user, plan per user, Stripe event log for idempotency.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  updated_at timestamptz not null default now()
);

create table public.issues (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 3 and 140),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);
create index issues_owner_created_idx on public.issues (owner_id, created_at desc);

-- Processed Stripe events: primary key makes webhook handling idempotent.
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.stripe_events enable row level security; -- no policies: service role only

create policy "own profile: read" on public.profiles
  for select using (id = auth.uid());

create policy "own issues: read" on public.issues
  for select using (owner_id = auth.uid());
create policy "own issues: insert" on public.issues
  for insert with check (owner_id = auth.uid());
create policy "own issues: update" on public.issues
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own issues: delete" on public.issues
  for delete using (owner_id = auth.uid());

-- Free plan: at most 20 issues. Enforced in the database, not only in the UI.
create function public.enforce_issue_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select plan from public.profiles where id = new.owner_id) is distinct from 'pro'
     and (select count(*) from public.issues where owner_id = new.owner_id) >= 20 then
    raise exception 'free plan limit reached' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger issues_limit before insert on public.issues
  for each row execute function public.enforce_issue_limit();

-- Create a profile row for every new user.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
