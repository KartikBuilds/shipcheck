-- Run after auth-shim.sql and the migrations. Each check raises an exception on failure.
grant select, insert, update, delete on public.issues to authenticated;
grant select on public.profiles to authenticated;
grant usage on all sequences in schema public to authenticated;

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

-- Act as Alice
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
insert into public.issues (title) values ('Alice issue one'), ('Alice issue two');

-- 1. Alice cannot create an issue owned by Bob
do $$ begin
  insert into public.issues (owner_id, title) values ('22222222-2222-2222-2222-222222222222', 'forged');
  raise exception 'FAIL: inserted an issue for another user';
exception when insufficient_privilege then raise notice 'PASS 1: cannot insert for another user';
end $$;

-- Act as Bob
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
-- 2. Bob sees none of Alice's issues
do $$ begin
  if (select count(*) from public.issues) <> 0 then raise exception 'FAIL: Bob can read Alice''s issues'; end if;
  raise notice 'PASS 2: rows are invisible to other users';
end $$;
-- 3. Bob cannot update or delete Alice's issues
update public.issues set title = 'hacked' where title like 'Alice%';
delete from public.issues where title like 'Alice%';
reset role;
do $$ begin
  if (select count(*) from public.issues where title like 'Alice issue%') <> 2 then raise exception 'FAIL: Bob modified Alice''s rows'; end if;
  raise notice 'PASS 3: other users cannot update or delete';
end $$;

-- 4. Free plan limit of 20 issues is enforced in the database
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
insert into public.issues (title) select 'Bob issue ' || g from generate_series(1, 20) g;
do $$ begin
  insert into public.issues (title) values ('one too many');
  raise exception 'FAIL: free plan limit not enforced';
exception when raise_exception then raise notice 'PASS 4: free plan limited to 20 issues';
end $$;

-- 5. Pro plan lifts the limit
reset role;
update public.profiles set plan = 'pro' where id = '22222222-2222-2222-2222-222222222222';
set role authenticated;
insert into public.issues (title) values ('pro user issue 21');
reset role;
do $$ begin raise notice 'PASS 5: pro plan can exceed 20 issues'; end $$;

-- 6. Users cannot read the Stripe event log
set role authenticated;
do $$ begin
  perform 1 from public.stripe_events;
  raise exception 'FAIL: stripe_events readable';
exception when insufficient_privilege then raise notice 'PASS 6: stripe_events hidden from users';
end $$;
reset role;
