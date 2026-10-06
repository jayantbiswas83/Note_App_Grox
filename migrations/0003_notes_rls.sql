-- Folio notes RLS: replace auth.uid()-based policies with request.jwt.claims.sub.
--
-- Better Auth user.id is TEXT, but Supabase auth.uid() expects UUID, so
-- auth.uid()::text fails with ERROR 22P02 on text user ids. Instead we read
-- the subject directly from the transaction-local request.jwt.claims setting,
-- which withUserTransaction() sets via parameterized set_config() before
-- SET LOCAL ROLE authenticated.
--
-- This migration drops the four existing policies and recreates them with the
-- claims-based predicate. It does NOT:
--   - grant anything to anon
--   - use service_role
--   - enable FORCE RLS
--   - change table structure or column types

-- Drop the old auth.uid()-based policies if they exist.
drop policy if exists "notes_select_own" on public.notes;
drop policy if exists "notes_insert_own" on public.notes;
drop policy if exists "notes_update_own" on public.notes;
drop policy if exists "notes_delete_own" on public.notes;

-- Recreate with request.jwt.claims.sub as the identity source.
-- The predicate reads the transaction-local GUC set by withUserTransaction.
do $$
begin
  if to_regrole('authenticated') is not null then
    execute 'create policy "notes_select_own" on public.notes for select to authenticated using ((select current_setting(''request.jwt.claims'', true)::jsonb ->> ''sub'') = user_id)';
    execute 'create policy "notes_insert_own" on public.notes for insert to authenticated with check ((select current_setting(''request.jwt.claims'', true)::jsonb ->> ''sub'') = user_id)';
    execute 'create policy "notes_update_own" on public.notes for update to authenticated using ((select current_setting(''request.jwt.claims'', true)::jsonb ->> ''sub'') = user_id) with check ((select current_setting(''request.jwt.claims'', true)::jsonb ->> ''sub'') = user_id)';
    execute 'create policy "notes_delete_own" on public.notes for delete to authenticated using ((select current_setting(''request.jwt.claims'', true)::jsonb ->> ''sub'') = user_id)';
  end if;
end
$$;
