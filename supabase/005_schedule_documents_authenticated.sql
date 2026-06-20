revoke all privileges on table public.schedule_documents from anon;

alter table public.schedule_documents enable row level security;

drop policy if exists "anon_can_read_schedule_documents" on public.schedule_documents;
drop policy if exists "anon_can_insert_schedule_documents" on public.schedule_documents;
drop policy if exists "anon_can_update_schedule_documents" on public.schedule_documents;
drop policy if exists "authenticated_can_read_schedule_documents" on public.schedule_documents;
drop policy if exists "managers_can_insert_schedule_documents" on public.schedule_documents;
drop policy if exists "managers_can_update_schedule_documents" on public.schedule_documents;

create policy "authenticated_can_read_schedule_documents"
on public.schedule_documents
for select
to authenticated
using (id = 'default');

create policy "managers_can_insert_schedule_documents"
on public.schedule_documents
for insert
to authenticated
with check (
  id = 'default'
  and public.is_manager(auth.uid())
);

create policy "managers_can_update_schedule_documents"
on public.schedule_documents
for update
to authenticated
using (
  id = 'default'
  and public.is_manager(auth.uid())
)
with check (
  id = 'default'
  and public.is_manager(auth.uid())
);
