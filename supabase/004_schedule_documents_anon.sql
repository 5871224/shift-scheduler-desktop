grant usage on schema public to anon;
grant select, insert, update on table public.schedule_documents to anon;

alter table public.schedule_documents enable row level security;

drop policy if exists "anon_can_read_schedule_documents" on public.schedule_documents;
drop policy if exists "anon_can_insert_schedule_documents" on public.schedule_documents;
drop policy if exists "anon_can_update_schedule_documents" on public.schedule_documents;

create policy "anon_can_read_schedule_documents"
on public.schedule_documents
for select
to anon
using (id = 'default');

create policy "anon_can_insert_schedule_documents"
on public.schedule_documents
for insert
to anon
with check (id = 'default');

create policy "anon_can_update_schedule_documents"
on public.schedule_documents
for update
to anon
using (id = 'default')
with check (id = 'default');
