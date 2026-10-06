-- Folio notes table for the future authenticated app layer.
--
-- The browser app still persists notes in localStorage, but this schema preserves
-- the current Note shape while adding the ownership column required by a future
-- authenticated data model. The local PGLite fallback does not provide
-- Supabase-managed auth objects, so the future Supabase RLS block below is
-- applied only when the target database already exposes the authenticated role
-- and the auth.uid() helper.

create table if not exists public.notes (
  id text primary key,
  user_id text not null,
  body text not null default '',
  favorite boolean not null default false,
  archived boolean not null default false,
  trashed boolean not null default false,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_updated_at_idx
  on public.notes (user_id, updated_at desc);

create index if not exists notes_user_id_archived_trashed_updated_at_idx
  on public.notes (user_id, archived, trashed, updated_at desc);

alter table public.notes enable row level security;

do $$
begin
  if to_regrole('authenticated') is not null and to_regprocedure('auth.uid()') is not null then
    execute 'revoke all on table public.notes from public';
    execute 'grant select, insert, update, delete on table public.notes to authenticated';

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_select_own'
    ) then
      execute 'create policy "notes_select_own" on public.notes for select to authenticated using ((select auth.uid())::text = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_insert_own'
    ) then
      execute 'create policy "notes_insert_own" on public.notes for insert to authenticated with check ((select auth.uid())::text = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_update_own'
    ) then
      execute 'create policy "notes_update_own" on public.notes for update to authenticated using ((select auth.uid())::text = user_id) with check ((select auth.uid())::text = user_id)';
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'notes' and policyname = 'notes_delete_own'
    ) then
      execute 'create policy "notes_delete_own" on public.notes for delete to authenticated using ((select auth.uid())::text = user_id)';
    end if;
  end if;
end
$$;
