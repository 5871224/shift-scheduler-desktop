create table if not exists public.schedule_documents (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_schedule_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_schedule_documents on public.schedule_documents;

create trigger set_updated_at_schedule_documents
before update on public.schedule_documents
for each row execute function public.set_schedule_documents_updated_at();

grant all privileges on table public.schedule_documents to service_role;
grant select, insert, update on table public.schedule_documents to authenticated;
