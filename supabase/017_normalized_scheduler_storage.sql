begin;

create table if not exists public.schedule_documents (
  id text primary key default 'default',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.scheduler_settings (
  id text primary key default 'default',
  current_year integer not null default extract(year from now())::integer,
  current_month integer not null default 0 check (current_month between 0 and 11),
  dept_filter text not null default 'all',
  table_view text not null default 'member' check (table_view in ('member', 'shift')),
  table_dept_scope_filter text not null default 'all',
  table_stats_visible boolean not null default true,
  schedule_start_date date,
  max_consecutive_work_days integer not null default 6 check (max_consecutive_work_days > 0),
  week_start integer not null default 0 check (week_start between 0 and 6),
  month_start_day integer not null default 1 check (month_start_day between 1 and 31),
  eight_week_start_date date,
  forbid_proxy_leave_conflict boolean not null default true,
  require_employment_window boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.scheduler_settings enable row level security;

drop policy if exists "anon_can_read_scheduler_settings" on public.scheduler_settings;
drop policy if exists "authenticated_can_read_scheduler_settings" on public.scheduler_settings;
drop policy if exists "managers_can_manage_scheduler_settings" on public.scheduler_settings;

create policy "anon_can_read_scheduler_settings"
on public.scheduler_settings
for select
to anon
using (true);

create policy "authenticated_can_read_scheduler_settings"
on public.scheduler_settings
for select
to authenticated
using (true);

create policy "managers_can_manage_scheduler_settings"
on public.scheduler_settings
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

drop policy if exists "anon_can_read_set_departments" on public.set_departments;
drop policy if exists "anon_can_read_set_employee" on public.set_employee;
drop policy if exists "anon_can_read_set_leave" on public.set_leave;
drop policy if exists "anon_can_read_set_overtime" on public.set_overtime;

create policy "anon_can_read_set_departments"
on public.set_departments
for select
to anon
using (true);

create policy "anon_can_read_set_employee"
on public.set_employee
for select
to anon
using (true);

create policy "anon_can_read_set_leave"
on public.set_leave
for select
to anon
using (true);

create policy "anon_can_read_set_overtime"
on public.set_overtime
for select
to anon
using (true);

alter table public.set_departments
  add column if not exists scheduler_item_id text,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists hidden_from_leave boolean not null default false,
  add column if not exists sort_order integer not null default 0;

update public.set_departments
set scheduler_item_id = code
where scheduler_item_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.set_departments'::regclass
      and conname = 'set_departments_scheduler_item_id_key'
  ) then
    alter table public.set_departments
      add constraint set_departments_scheduler_item_id_key unique (scheduler_item_id);
  end if;
end $$;

alter table public.set_employee
  add column if not exists fixed_rest_weekday integer not null default 0;

-- ponytail: ?­è¡¨äººå“¡ä¸»æ?ä¸ç??¼ç™»?¥å¸³?Ÿï?æ²’æ? auth user ?„å“¡å·¥ä?è¦èƒ½è¢«æ??­ã€?alter table public.set_employee
  drop constraint if exists set_employee_id_fkey;

alter table public.set_employee
  add column if not exists login_email text;

alter table public.set_employee
  drop constraint if exists set_employee_fixed_rest_weekday_check;

alter table public.set_employee
  add constraint set_employee_fixed_rest_weekday_check
  check (fixed_rest_weekday between 0 and 6);

create table if not exists public.set_employee_departments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.set_employee (id) on delete cascade,
  department_id uuid not null references public.set_departments (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (member_id, department_id)
);

create index if not exists idx_set_employee_departments_member_id
on public.set_employee_departments (member_id);

alter table public.set_employee_departments enable row level security;

drop policy if exists "anon_can_read_set_employee_departments" on public.set_employee_departments;
drop policy if exists "authenticated_can_read_set_employee_departments" on public.set_employee_departments;
drop policy if exists "managers_can_manage_set_employee_departments" on public.set_employee_departments;

create policy "anon_can_read_set_employee_departments"
on public.set_employee_departments
for select
to anon
using (true);

create policy "authenticated_can_read_set_employee_departments"
on public.set_employee_departments
for select
to authenticated
using (true);

create policy "managers_can_manage_set_employee_departments"
on public.set_employee_departments
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create table if not exists public.set_shift (
  id uuid primary key default gen_random_uuid(),
  scheduler_item_id text,
  name text not null,
  applicable_department_id uuid references public.set_departments (id) on delete set null,
  color text,
  text_color text,
  auto_text_color boolean not null default true,
  hidden_from_toolbar boolean not null default false,
  start_time time,
  end_time time,
  required_staff_count integer not null default 0 check (required_staff_count >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.set_shift
  add column if not exists scheduler_item_id text,
  add column if not exists text_color text,
  add column if not exists auto_text_color boolean not null default true,
  add column if not exists hidden_from_toolbar boolean not null default false,
  add column if not exists sort_order integer not null default 0;

alter table public.set_shift
  alter column start_time drop not null,
  alter column end_time drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.set_shift'::regclass
      and conname = 'set_shift_scheduler_item_id_key'
  ) then
    alter table public.set_shift
      add constraint set_shift_scheduler_item_id_key unique (scheduler_item_id);
  end if;
end $$;

create index if not exists idx_set_shift_applicable_department_id
on public.set_shift (applicable_department_id);

alter table public.set_shift enable row level security;

drop policy if exists "anon_can_read_set_shift" on public.set_shift;
drop policy if exists "authenticated_can_read_set_shift" on public.set_shift;
drop policy if exists "managers_can_manage_set_shift" on public.set_shift;

create policy "anon_can_read_set_shift"
on public.set_shift
for select
to anon
using (true);

create policy "authenticated_can_read_set_shift"
on public.set_shift
for select
to authenticated
using (true);

create policy "managers_can_manage_set_shift"
on public.set_shift
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

alter table public.set_leave
  add column if not exists scheduler_item_id text,
  add column if not exists text_color text,
  add column if not exists auto_text_color boolean not null default true,
  add column if not exists hidden_from_toolbar boolean not null default false,
  add column if not exists sort_order integer not null default 0;

update public.set_leave
set scheduler_item_id = concat('legacy:', id::text)
where scheduler_item_id is null;

alter table public.set_leave
  drop constraint if exists set_leave_code_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.set_leave'::regclass
      and conname = 'set_leave_scheduler_item_id_key'
  ) then
    alter table public.set_leave
      add constraint set_leave_scheduler_item_id_key unique (scheduler_item_id);
  end if;
end $$;

alter table public.leave_requests
  drop constraint if exists leave_requests_leave_type_id_fkey;

alter table public.leave_requests
  add constraint leave_requests_leave_type_id_fkey
  foreign key (leave_type_id)
  references public.set_leave (id)
  on delete cascade;

alter table public.set_overtime
  add column if not exists scheduler_item_id text,
  add column if not exists text_color text,
  add column if not exists auto_text_color boolean not null default true,
  add column if not exists hidden_from_toolbar boolean not null default false,
  add column if not exists sort_order integer not null default 0;

alter table public.set_overtime
  alter column start_time drop not null,
  alter column end_time drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.set_overtime'::regclass
      and conname = 'set_overtime_scheduler_item_id_key'
  ) then
    alter table public.set_overtime
      add constraint set_overtime_scheduler_item_id_key unique (scheduler_item_id);
  end if;
end $$;

alter table public.overtime_requests
  drop constraint if exists overtime_requests_overtime_type_id_fkey;

alter table public.overtime_requests
  add constraint overtime_requests_overtime_type_id_fkey
  foreign key (overtime_type_id)
  references public.set_overtime (id)
  on delete cascade;

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.set_employee (id) on delete cascade,
  work_date date not null,
  support_department_id uuid references public.set_departments (id) on delete set null,
  shift_type_id uuid references public.set_shift (id) on delete set null,
  leave_type_id uuid references public.set_leave (id) on delete set null,
  leave_all_day boolean not null default true,
  leave_start_time time,
  leave_end_time time,
  leave_reason text,
  overtime_type_id uuid references public.set_overtime (id) on delete set null,
  overtime_start_time time,
  overtime_end_time time,
  overtime_use_rest_1 boolean not null default false,
  overtime_rest_1_start_time time,
  overtime_rest_1_end_time time,
  overtime_use_rest_2 boolean not null default false,
  overtime_rest_2_start_time time,
  overtime_rest_2_end_time time,
  overtime_reason text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, work_date)
);

alter table public.schedule_entries
  drop constraint if exists schedule_entries_schedule_month_id_member_id_work_date_key,
  drop column if exists schedule_month_id;

drop table if exists public.schedule_months cascade;

delete from public.schedule_entries se
using (
  select
    id,
    row_number() over (
      partition by member_id, work_date
      order by updated_at desc nulls last, created_at desc nulls last, id
    ) as row_number
  from public.schedule_entries
) ranked
where se.id = ranked.id
  and ranked.row_number > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.schedule_entries'::regclass
      and conname = 'schedule_entries_member_id_work_date_key'
  ) then
    alter table public.schedule_entries
      add constraint schedule_entries_member_id_work_date_key unique (member_id, work_date);
  end if;
end $$;

alter table public.schedule_entries
  add column if not exists overtime_start_time time,
  add column if not exists overtime_end_time time,
  add column if not exists overtime_use_rest_1 boolean not null default false,
  add column if not exists overtime_rest_1_start_time time,
  add column if not exists overtime_rest_1_end_time time,
  add column if not exists overtime_use_rest_2 boolean not null default false,
  add column if not exists overtime_rest_2_start_time time,
  add column if not exists overtime_rest_2_end_time time,
  add column if not exists overtime_reason text;

create index if not exists idx_schedule_entries_member_date
on public.schedule_entries (member_id, work_date);

alter table public.schedule_entries enable row level security;

drop policy if exists "anon_can_read_schedule_entries" on public.schedule_entries;
drop policy if exists "authenticated_can_read_schedule_entries" on public.schedule_entries;
drop policy if exists "managers_can_manage_schedule_entries" on public.schedule_entries;

create policy "anon_can_read_schedule_entries"
on public.schedule_entries
for select
to anon
using (true);

create policy "authenticated_can_read_schedule_entries"
on public.schedule_entries
for select
to authenticated
using (true);

create policy "managers_can_manage_schedule_entries"
on public.schedule_entries
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  scheduler_item_id text,
  holiday_date date not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.holidays'::regclass
      and conname = 'holidays_scheduler_item_id_key'
  ) then
    alter table public.holidays
      add constraint holidays_scheduler_item_id_key unique (scheduler_item_id);
  end if;
end $$;

alter table public.holidays enable row level security;

drop policy if exists "anon_can_read_holidays" on public.holidays;
drop policy if exists "authenticated_can_read_holidays" on public.holidays;
drop policy if exists "managers_can_manage_holidays" on public.holidays;

create policy "anon_can_read_holidays"
on public.holidays
for select
to anon
using (true);

create policy "authenticated_can_read_holidays"
on public.holidays
for select
to authenticated
using (true);

create policy "managers_can_manage_holidays"
on public.holidays
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

grant select on table
  public.scheduler_settings,
  public.set_departments,
  public.set_employee,
  public.set_employee_departments,
  public.set_shift,
  public.set_leave,
  public.set_overtime,
  public.schedule_entries,
  public.holidays
to anon;

grant select, insert, update, delete on table
  public.scheduler_settings,
  public.set_departments,
  public.set_employee,
  public.set_employee_departments,
  public.set_shift,
  public.set_leave,
  public.set_overtime,
  public.schedule_entries,
  public.holidays
to authenticated;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_set_departments as (
  select
    item.value as data,
    item.ordinality::integer as sort_order
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'set_departments', '[]'::jsonb)) with ordinality as item(value, ordinality)
)
insert into public.set_departments (
  scheduler_item_id,
  code,
  name,
  start_date,
  end_date,
  hidden_from_leave,
  sort_order
)
select
  data ->> 'id',
  left(coalesce(nullif(data ->> 'id', ''), 'dept-' || sort_order::text), 64),
  coalesce(nullif(data ->> 'name', ''), '?®ä? ' || sort_order::text),
  nullif(data ->> 'startDate', '')::date,
  nullif(data ->> 'endDate', '')::date,
  coalesce((data ->> 'hiddenFromLeave')::boolean, false),
  sort_order
from source_set_departments
where nullif(data ->> 'id', '') is not null
on conflict (scheduler_item_id) do update
set
  code = excluded.code,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  hidden_from_leave = excluded.hidden_from_leave,
  sort_order = excluded.sort_order;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
)
insert into public.scheduler_settings (
  id,
  current_year,
  current_month,
  dept_filter,
  table_view,
  table_dept_scope_filter,
  table_stats_visible,
  schedule_start_date,
  max_consecutive_work_days,
  week_start,
  month_start_day,
  eight_week_start_date,
  forbid_proxy_leave_conflict,
  require_employment_window
)
select
  'default',
  coalesce((payload ->> 'year')::integer, extract(year from now())::integer),
  greatest(0, least(11, coalesce((payload ->> 'month')::integer, 0))),
  coalesce(nullif(payload ->> 'deptFilter', ''), 'all'),
  case when payload ->> 'tableView' = 'shift' then 'shift' else 'member' end,
  coalesce(nullif(payload ->> 'tableDeptScopeFilter', ''), 'all'),
  coalesce((payload ->> 'tableStatsVisible')::boolean, true),
  nullif(payload ->> 'scheduleStartDate', '')::date,
  greatest(1, coalesce((payload #>> '{rules,maxConsecutiveWorkDays}')::integer, 6)),
  greatest(0, least(6, coalesce((payload #>> '{rules,weekStart}')::integer, 0))),
  greatest(1, least(31, coalesce((payload #>> '{rules,monthStartDay}')::integer, 1))),
  nullif(payload #>> '{rules,eightWeekStartDate}', '')::date,
  coalesce((payload #>> '{rules,forbidProxyLeaveConflict}')::boolean, true),
  coalesce((payload #>> '{rules,requireEmploymentWindow}')::boolean, true)
from legacy
on conflict (id) do update
set
  current_year = excluded.current_year,
  current_month = excluded.current_month,
  dept_filter = excluded.dept_filter,
  table_view = excluded.table_view,
  table_dept_scope_filter = excluded.table_dept_scope_filter,
  table_stats_visible = excluded.table_stats_visible,
  schedule_start_date = excluded.schedule_start_date,
  max_consecutive_work_days = excluded.max_consecutive_work_days,
  week_start = excluded.week_start,
  month_start_day = excluded.month_start_day,
  eight_week_start_date = excluded.eight_week_start_date,
  forbid_proxy_leave_conflict = excluded.forbid_proxy_leave_conflict,
  require_employment_window = excluded.require_employment_window,
  updated_at = now();

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_leaves as (
  select item.value as data, item.ordinality::integer as sort_order
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'leaves', '[]'::jsonb)) with ordinality as item(value, ordinality)
)
insert into public.set_leave (
  scheduler_item_id,
  code,
  name,
  color,
  text_color,
  auto_text_color,
  hidden_from_toolbar,
  requires_time,
  requires_reason,
  sort_order
)
select
  data ->> 'id',
  coalesce(nullif(data ->> 'code', ''), data ->> 'id'),
  coalesce(nullif(data ->> 'name', ''), '?‡åˆ¥ ' || sort_order::text),
  data ->> 'color',
  data ->> 'textColor',
  coalesce((data ->> 'autoTextColor')::boolean, true),
  coalesce((data ->> 'hiddenFromToolbar')::boolean, false),
  coalesce((data ->> 'defaultAllDay')::boolean, false),
  coalesce((data ->> 'requireReason')::boolean, false),
  sort_order
from source_leaves
where nullif(data ->> 'id', '') is not null
on conflict (scheduler_item_id) do update
set
  code = excluded.code,
  name = excluded.name,
  color = excluded.color,
  text_color = excluded.text_color,
  auto_text_color = excluded.auto_text_color,
  hidden_from_toolbar = excluded.hidden_from_toolbar,
  requires_time = excluded.requires_time,
  requires_reason = excluded.requires_reason,
  sort_order = excluded.sort_order;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_overtime as (
  select item.value as data, item.ordinality::integer as sort_order
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'overtime', '[]'::jsonb)) with ordinality as item(value, ordinality)
)
insert into public.set_overtime (
  scheduler_item_id,
  name,
  color,
  text_color,
  auto_text_color,
  hidden_from_toolbar,
  start_time,
  end_time,
  use_rest_1,
  rest_1_start_time,
  rest_1_end_time,
  use_rest_2,
  rest_2_start_time,
  rest_2_end_time,
  sort_order
)
select
  data ->> 'id',
  coalesce(nullif(data ->> 'name', ''), '? ç­'),
  data ->> 'color',
  data ->> 'textColor',
  coalesce((data ->> 'autoTextColor')::boolean, true),
  coalesce((data ->> 'hiddenFromToolbar')::boolean, false),
  nullif(data ->> 'startTime', '')::time,
  nullif(data ->> 'endTime', '')::time,
  coalesce((data ->> 'useRest1')::boolean, false),
  nullif(data ->> 'rest1StartTime', '')::time,
  nullif(data ->> 'rest1EndTime', '')::time,
  coalesce((data ->> 'useRest2')::boolean, false),
  nullif(data ->> 'rest2StartTime', '')::time,
  nullif(data ->> 'rest2EndTime', '')::time,
  sort_order
from source_overtime
where nullif(data ->> 'id', '') is not null
on conflict (scheduler_item_id) do update
set
  name = excluded.name,
  color = excluded.color,
  text_color = excluded.text_color,
  auto_text_color = excluded.auto_text_color,
  hidden_from_toolbar = excluded.hidden_from_toolbar,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  use_rest_1 = excluded.use_rest_1,
  rest_1_start_time = excluded.rest_1_start_time,
  rest_1_end_time = excluded.rest_1_end_time,
  use_rest_2 = excluded.use_rest_2,
  rest_2_start_time = excluded.rest_2_start_time,
  rest_2_end_time = excluded.rest_2_end_time,
  sort_order = excluded.sort_order;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_shifts as (
  select item.value as data, item.ordinality::integer as sort_order
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'shifts', '[]'::jsonb)) with ordinality as item(value, ordinality)
),
first_department as (
  select
    source_shifts.data,
    source_shifts.sort_order,
    coalesce(source_shifts.data #>> '{applicableDeptIds,0}', source_shifts.data ->> 'applicableDeptId') as scheduler_department_id
  from source_shifts
)
insert into public.set_shift (
  scheduler_item_id,
  name,
  applicable_department_id,
  color,
  text_color,
  auto_text_color,
  hidden_from_toolbar,
  start_time,
  end_time,
  required_staff_count,
  sort_order
)
select
  data ->> 'id',
  coalesce(nullif(data ->> 'name', ''), '?­åˆ¥ ' || first_department.sort_order::text),
  d.id,
  data ->> 'color',
  data ->> 'textColor',
  coalesce((data ->> 'autoTextColor')::boolean, true),
  coalesce((data ->> 'hiddenFromToolbar')::boolean, false),
  nullif(data ->> 'startTime', '')::time,
  nullif(data ->> 'endTime', '')::time,
  greatest(0, coalesce((data ->> 'requiredStaffCount')::integer, 0)),
  first_department.sort_order
from first_department
left join public.set_departments d on d.scheduler_item_id = first_department.scheduler_department_id
where nullif(data ->> 'id', '') is not null
on conflict (scheduler_item_id) do update
set
  name = excluded.name,
  applicable_department_id = excluded.applicable_department_id,
  color = excluded.color,
  text_color = excluded.text_color,
  auto_text_color = excluded.auto_text_color,
  hidden_from_toolbar = excluded.hidden_from_toolbar,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  required_staff_count = excluded.required_staff_count,
  sort_order = excluded.sort_order;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_holidays as (
  select item.value as data, item.ordinality::integer as sort_order
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'holidays', '[]'::jsonb)) with ordinality as item(value, ordinality)
)
insert into public.holidays (
  scheduler_item_id,
  holiday_date,
  name,
  sort_order
)
select
  data ->> 'id',
  nullif(data ->> 'date', '')::date,
  coalesce(nullif(data ->> 'name', ''), '?‹å??‡æ—¥'),
  sort_order
from source_holidays
where nullif(data ->> 'id', '') is not null
  and nullif(data ->> 'date', '') is not null
on conflict (holiday_date) do update
set
  scheduler_item_id = excluded.scheduler_item_id,
  name = excluded.name,
  sort_order = excluded.sort_order;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_members as (
  select distinct on (item.value ->> 'code')
    item.value as data
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'members', '[]'::jsonb)) as item(value)
  where nullif(item.value ->> 'code', '') is not null
  order by item.value ->> 'code'
)
insert into public.set_employee (
  id,
  employee_code,
  full_name,
  role,
  home_department_id,
  hire_date,
  leave_date,
  pay_by_day,
  fixed_rest_weekday,
  monthly_rest_days,
  schedule_department_ids,
  is_active
)
select
  gen_random_uuid(),
  source_members.data ->> 'code',
  coalesce(nullif(source_members.data ->> 'name', ''), source_members.data ->> 'code'),
  case when source_members.data ->> 'role' = 'manager' then 'manager'::public.app_role else 'employee'::public.app_role end,
  d.id,
  nullif(source_members.data ->> 'hireDate', '')::date,
  nullif(source_members.data ->> 'leaveDate', '')::date,
  coalesce((source_members.data ->> 'payByDay')::boolean, false),
  greatest(0, least(6, coalesce((source_members.data ->> 'fixedRestWeekday')::integer, 0))),
  greatest(0, least(31, coalesce((source_members.data ->> 'monthlyRestDays')::integer, 0))),
  array(
    select value
    from jsonb_array_elements_text(coalesce(source_members.data -> 'scheduleDeptIds', '[]'::jsonb)) as dept(value)
    where value is not null and value <> ''
  ),
  true
from source_members
left join public.set_departments d on d.scheduler_item_id = coalesce(
  source_members.data #>> '{scheduleDeptIds,0}',
  source_members.data ->> 'deptId'
)
where not exists (
  select 1
  from public.set_employee p
  where p.employee_code = source_members.data ->> 'code'
);

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_members as (
  select distinct on (item.value ->> 'code')
    item.value as data
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'members', '[]'::jsonb)) as item(value)
  where nullif(item.value ->> 'code', '') is not null
  order by item.value ->> 'code'
)
update public.set_employee p
set
  full_name = coalesce(nullif(source_members.data ->> 'name', ''), p.full_name),
  role = case when source_members.data ->> 'role' = 'manager' then 'manager'::public.app_role else 'employee'::public.app_role end,
  home_department_id = d.id,
  hire_date = nullif(source_members.data ->> 'hireDate', '')::date,
  leave_date = nullif(source_members.data ->> 'leaveDate', '')::date,
  pay_by_day = coalesce((source_members.data ->> 'payByDay')::boolean, false),
  fixed_rest_weekday = greatest(0, least(6, coalesce((source_members.data ->> 'fixedRestWeekday')::integer, 0))),
  monthly_rest_days = greatest(0, least(31, coalesce((source_members.data ->> 'monthlyRestDays')::integer, 0))),
  schedule_department_ids = coalesce(
    array(
      select value
      from jsonb_array_elements_text(coalesce(source_members.data -> 'scheduleDeptIds', '[]'::jsonb)) as dept(value)
      where value is not null and value <> ''
    ),
    '{}'
  )
from source_members
left join public.set_departments d on d.scheduler_item_id = coalesce(
  source_members.data #>> '{scheduleDeptIds,0}',
  source_members.data ->> 'deptId'
)
where p.employee_code = source_members.data ->> 'code';

delete from public.set_employee_departments;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
source_members as (
  select item.value as data
  from legacy
  cross join lateral jsonb_array_elements(coalesce(legacy.payload -> 'members', '[]'::jsonb)) as item(value)
),
member_department_ids as (
  select
    p.id as member_id,
    d.id as department_id,
    dept.ordinality::integer as sort_order
  from source_members
  join public.set_employee p on p.employee_code = source_members.data ->> 'code'
  cross join lateral jsonb_array_elements_text(
    case
      when jsonb_array_length(coalesce(source_members.data -> 'scheduleDeptIds', '[]'::jsonb)) > 0
        then source_members.data -> 'scheduleDeptIds'
      else jsonb_build_array(source_members.data ->> 'deptId')
    end
  ) with ordinality as dept(value, ordinality)
  join public.set_departments d on d.scheduler_item_id = dept.value
)
insert into public.set_employee_departments (member_id, department_id, sort_order)
select member_id, department_id, sort_order
from member_department_ids
on conflict (member_id, department_id) do update
set sort_order = excluded.sort_order;

with legacy as (
  select payload
  from public.schedule_documents
  where id = 'default'
    and payload is not null
  limit 1
),
schedule_source as (
  select
    entry.key,
    entry.value as data,
    split.key_parts,
    array_length(split.key_parts, 1) as part_count
  from legacy
  cross join lateral jsonb_each(coalesce(legacy.payload -> 'schedule', '{}'::jsonb)) as entry(key, value)
  cross join lateral (
    select string_to_array(entry.key, '_') as key_parts
  ) split
),
parsed as (
  select
    key,
    data,
    array_to_string(key_parts[1:part_count - 3], '_') as scheduler_member_id,
    make_date(key_parts[part_count - 2]::integer, key_parts[part_count - 1]::integer + 1, key_parts[part_count]::integer) as work_date
  from schedule_source
  where part_count >= 4
    and key_parts[part_count - 2] ~ '^[0-9]+$'
    and key_parts[part_count - 1] ~ '^[0-9]+$'
    and key_parts[part_count] ~ '^[0-9]+$'
)
insert into public.schedule_entries (
  member_id,
  work_date,
  shift_type_id,
  leave_type_id,
  leave_all_day,
  leave_start_time,
  leave_end_time,
  leave_reason,
  overtime_type_id,
  overtime_start_time,
  overtime_end_time,
  overtime_use_rest_1,
  overtime_rest_1_start_time,
  overtime_rest_1_end_time,
  overtime_use_rest_2,
  overtime_rest_2_start_time,
  overtime_rest_2_end_time,
  overtime_reason
)
select
  p.id,
  parsed.work_date,
  st.id,
  lt.id,
  coalesce((parsed.data #>> '{leaveMeta,allDay}')::boolean, true),
  nullif(parsed.data #>> '{leaveMeta,startTime}', '')::time,
  nullif(parsed.data #>> '{leaveMeta,endTime}', '')::time,
  nullif(parsed.data #>> '{leaveMeta,reason}', ''),
  ot.id,
  nullif(parsed.data #>> '{overtimeMeta,startTime}', '')::time,
  nullif(parsed.data #>> '{overtimeMeta,endTime}', '')::time,
  coalesce((parsed.data #>> '{overtimeMeta,useRest1}')::boolean, false),
  nullif(parsed.data #>> '{overtimeMeta,rest1StartTime}', '')::time,
  nullif(parsed.data #>> '{overtimeMeta,rest1EndTime}', '')::time,
  coalesce((parsed.data #>> '{overtimeMeta,useRest2}')::boolean, false),
  nullif(parsed.data #>> '{overtimeMeta,rest2StartTime}', '')::time,
  nullif(parsed.data #>> '{overtimeMeta,rest2EndTime}', '')::time,
  nullif(parsed.data #>> '{overtimeMeta,reason}', '')
from parsed
join legacy
  on true
join lateral (
  select member.value ->> 'code' as employee_code
  from jsonb_array_elements(coalesce(legacy.payload -> 'members', '[]'::jsonb)) as member(value)
  where member.value ->> 'id' = parsed.scheduler_member_id
  limit 1
) member_code on true
join public.set_employee p on p.employee_code = member_code.employee_code
left join public.set_shift st on st.scheduler_item_id = parsed.data ->> 'shift'
left join public.set_leave lt on lt.scheduler_item_id = parsed.data ->> 'leave'
left join public.set_overtime ot on ot.scheduler_item_id = parsed.data ->> 'overtime'
where st.id is not null
   or lt.id is not null
   or ot.id is not null
on conflict (member_id, work_date) do update
set
  shift_type_id = excluded.shift_type_id,
  leave_type_id = excluded.leave_type_id,
  leave_all_day = excluded.leave_all_day,
  leave_start_time = excluded.leave_start_time,
  leave_end_time = excluded.leave_end_time,
  leave_reason = excluded.leave_reason,
  overtime_type_id = excluded.overtime_type_id,
  overtime_start_time = excluded.overtime_start_time,
  overtime_end_time = excluded.overtime_end_time,
  overtime_use_rest_1 = excluded.overtime_use_rest_1,
  overtime_rest_1_start_time = excluded.overtime_rest_1_start_time,
  overtime_rest_1_end_time = excluded.overtime_rest_1_end_time,
  overtime_use_rest_2 = excluded.overtime_use_rest_2,
  overtime_rest_2_start_time = excluded.overtime_rest_2_start_time,
  overtime_rest_2_end_time = excluded.overtime_rest_2_end_time,
  overtime_reason = excluded.overtime_reason,
  updated_at = now();

commit;
