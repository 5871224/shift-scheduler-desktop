alter table public.leave_requests
  add column if not exists source text not null default 'employee';

alter table public.overtime_requests
  add column if not exists source text not null default 'employee';

update public.leave_requests
set source = 'employee'
where source is null or btrim(source) = '';

update public.overtime_requests
set source = 'employee'
where source is null or btrim(source) = '';

alter table public.leave_requests
  drop constraint if exists leave_requests_source_check;

alter table public.leave_requests
  add constraint leave_requests_source_check
  check (source in ('employee', 'manager'));

alter table public.overtime_requests
  drop constraint if exists overtime_requests_source_check;

alter table public.overtime_requests
  add constraint overtime_requests_source_check
  check (source in ('employee', 'manager'));
