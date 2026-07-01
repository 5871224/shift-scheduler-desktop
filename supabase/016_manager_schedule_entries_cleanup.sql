begin;

drop function if exists public.get_public_schedule_requests();

drop policy if exists "employees_can_insert_own_leave_requests" on public.leave_requests;
drop policy if exists "employees_can_update_own_leave_requests" on public.leave_requests;
drop policy if exists "employees_can_delete_own_pending_leave_requests" on public.leave_requests;
drop policy if exists "employees_can_insert_own_overtime_requests" on public.overtime_requests;
drop policy if exists "employees_can_update_own_overtime_requests" on public.overtime_requests;
drop policy if exists "employees_can_delete_own_pending_overtime_requests" on public.overtime_requests;

drop trigger if exists enforce_single_effective_leave_request on public.leave_requests;
drop trigger if exists enforce_single_effective_overtime_request on public.overtime_requests;
drop function if exists public.enforce_single_effective_leave_request();
drop function if exists public.enforce_single_effective_overtime_request();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'leave_requests'
      and column_name = 'source'
  ) then
    delete from public.leave_requests
    where coalesce(source, 'employee') <> 'manager';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'overtime_requests'
      and column_name = 'source'
  ) then
    delete from public.overtime_requests
    where coalesce(source, 'employee') <> 'manager';
  end if;
end $$;

drop index if exists public.idx_leave_requests_status;
drop index if exists public.idx_overtime_requests_status;

drop table if exists public.manager_departments;

alter table public.leave_requests
  drop column if exists source cascade,
  drop column if exists status cascade,
  drop column if exists approved_by cascade,
  drop column if exists approved_at cascade,
  drop column if exists manager_note cascade;

alter table public.overtime_requests
  drop column if exists source cascade,
  drop column if exists status cascade,
  drop column if exists approved_by cascade,
  drop column if exists approved_at cascade,
  drop column if exists manager_note cascade;

create or replace function public.enforce_single_effective_leave_request()
returns trigger
language plpgsql
as $$
declare
  conflict_id uuid;
begin
  select r.id
  into conflict_id
  from public.leave_requests r
  where r.member_id = new.member_id
    and r.id <> new.id
    and r.start_date <= new.end_date
    and r.end_date >= new.start_date
  limit 1;

  if conflict_id is not null then
    raise exception '同一天只能有一筆主管設定請假';
  end if;

  return new;
end;
$$;

create trigger enforce_single_effective_leave_request
before insert or update of member_id, start_date, end_date
on public.leave_requests
for each row execute function public.enforce_single_effective_leave_request();

create or replace function public.enforce_single_effective_overtime_request()
returns trigger
language plpgsql
as $$
declare
  conflict_id uuid;
begin
  select r.id
  into conflict_id
  from public.overtime_requests r
  where r.member_id = new.member_id
    and r.id <> new.id
    and r.work_date = new.work_date
  limit 1;

  if conflict_id is not null then
    raise exception '同一天只能有一筆主管設定加班';
  end if;

  return new;
end;
$$;

create trigger enforce_single_effective_overtime_request
before insert or update of member_id, work_date
on public.overtime_requests
for each row execute function public.enforce_single_effective_overtime_request();

create or replace function public.get_public_schedule_requests()
returns table (
  kind text,
  request_id uuid,
  member_code text,
  member_name text,
  leave_item_id text,
  leave_code text,
  leave_name text,
  overtime_name text,
  start_date date,
  end_date date,
  work_date date,
  is_all_day boolean,
  start_time time,
  end_time time,
  use_rest_1 boolean,
  rest_1_start_time time,
  rest_1_end_time time,
  use_rest_2 boolean,
  rest_2_start_time time,
  rest_2_end_time time,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    'leave'::text as kind,
    r.id as request_id,
    p.employee_code as member_code,
    p.full_name as member_name,
    t.scheduler_item_id as leave_item_id,
    t.code as leave_code,
    t.name as leave_name,
    null::text as overtime_name,
    r.start_date,
    r.end_date,
    null::date as work_date,
    r.is_all_day,
    r.start_time,
    r.end_time,
    false as use_rest_1,
    null::time as rest_1_start_time,
    null::time as rest_1_end_time,
    false as use_rest_2,
    null::time as rest_2_start_time,
    null::time as rest_2_end_time,
    r.created_at
  from public.leave_requests r
  join public.profiles p on p.id = r.member_id
  join public.leave_types t on t.id = r.leave_type_id

  union all

  select
    'overtime'::text as kind,
    r.id as request_id,
    p.employee_code as member_code,
    p.full_name as member_name,
    null::text as leave_item_id,
    null::text as leave_code,
    null::text as leave_name,
    t.name as overtime_name,
    null::date as start_date,
    null::date as end_date,
    r.work_date,
    false as is_all_day,
    r.start_time,
    r.end_time,
    r.use_rest_1,
    r.rest_1_start_time,
    r.rest_1_end_time,
    r.use_rest_2,
    r.rest_2_start_time,
    r.rest_2_end_time,
    r.created_at
  from public.overtime_requests r
  join public.profiles p on p.id = r.member_id
  join public.overtime_types t on t.id = r.overtime_type_id
  order by created_at desc;
$$;

grant execute on function public.get_public_schedule_requests() to anon, authenticated;

drop type if exists public.request_status;
drop type if exists public.request_type;

commit;
