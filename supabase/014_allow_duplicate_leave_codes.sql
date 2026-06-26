alter table public.leave_types
  add column if not exists scheduler_item_id text;

update public.leave_types
set scheduler_item_id = concat('legacy:', id::text)
where scheduler_item_id is null;

alter table public.leave_types
  drop constraint if exists leave_types_code_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.leave_types'::regclass
      and conname = 'leave_types_scheduler_item_id_key'
  ) then
    alter table public.leave_types
      add constraint leave_types_scheduler_item_id_key unique (scheduler_item_id);
  end if;
end $$;

drop function if exists public.get_public_schedule_requests();

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
  source text,
  status public.request_status,
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
    r.source,
    r.status,
    r.created_at
  from public.leave_requests r
  join public.profiles p on p.id = r.member_id
  join public.leave_types t on t.id = r.leave_type_id
  where r.status in ('pending', 'approved')

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
    r.source,
    r.status,
    r.created_at
  from public.overtime_requests r
  join public.profiles p on p.id = r.member_id
  join public.overtime_types t on t.id = r.overtime_type_id
  where r.status in ('pending', 'approved')
  order by created_at desc;
$$;

grant execute on function public.get_public_schedule_requests() to anon, authenticated;
