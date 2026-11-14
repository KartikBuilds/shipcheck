-- Explicit table privileges for Supabase API roles (RLS still decides which rows).
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.issues to authenticated;
revoke all on public.stripe_events from anon, authenticated;
