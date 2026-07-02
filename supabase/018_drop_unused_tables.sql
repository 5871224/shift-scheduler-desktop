begin;

drop table if exists public.manager_departments;
drop table if exists public.schedule_documents;
drop table if exists public.schedule_months cascade;
drop type if exists public.request_type;

commit;
