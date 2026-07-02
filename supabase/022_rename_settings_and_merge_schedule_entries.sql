begin;

drop function if exists public.get_public_schedule_requests();

do $$
declare
  pair text[];
  old_name text;
  new_name text;
  pairs text[][] := array[
    array['departments', 'set_departments'],
    array['profiles', 'set_employee'],
    array['member_departments', 'set_employee_departments'],
    array['shift_types', 'set_shift'],
    array['leave_types', 'set_leave'],
    array['overtime_types', 'set_overtime']
  ];
begin
  foreach pair slice 1 in array pairs loop
    old_name := pair[1];
    new_name := pair[2];

    if to_regclass(format('public.%I', old_name)) is not null
       and to_regclass(format('public.%I', new_name)) is not null then
      raise exception 'Both public.% and public.% exist. Merge or drop one before running this migration.', old_name, new_name;
    end if;

    if to_regclass(format('public.%I', old_name)) is not null then
      execute format('alter table public.%I rename to %I', old_name, new_name);
    end if;
  end loop;
end $$;

create or replace function public.is_manager(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.set_employee
    where id = p_user_id
      and role = 'manager'
      and is_active = true
  );
$$;

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
  updated_at timestamptz not null default now()
);

alter table public.schedule_entries
  drop column if exists schedule_month_id,
  add column if not exists support_department_id uuid references public.set_departments (id) on delete set null,
  add column if not exists shift_type_id uuid references public.set_shift (id) on delete set null,
  add column if not exists leave_type_id uuid references public.set_leave (id) on delete set null,
  add column if not exists leave_all_day boolean not null default true,
  add column if not exists leave_start_time time,
  add column if not exists leave_end_time time,
  add column if not exists leave_reason text,
  add column if not exists overtime_type_id uuid references public.set_overtime (id) on delete set null,
  add column if not exists overtime_start_time time,
  add column if not exists overtime_end_time time,
  add column if not exists overtime_use_rest_1 boolean not null default false,
  add column if not exists overtime_rest_1_start_time time,
  add column if not exists overtime_rest_1_end_time time,
  add column if not exists overtime_use_rest_2 boolean not null default false,
  add column if not exists overtime_rest_2_start_time time,
  add column if not exists overtime_rest_2_end_time time,
  add column if not exists overtime_reason text,
  add column if not exists note text;

alter table public.schedule_entries
  drop constraint if exists schedule_entries_schedule_month_id_member_id_work_date_key,
  drop constraint if exists schedule_entries_member_id_work_date_key;

with merged as (
  select
    member_id,
    work_date,
    (array_agg(id order by updated_at desc nulls last, created_at desc nulls last, id))[1] as keep_id,
    (array_agg(support_department_id order by updated_at desc nulls last, created_at desc nulls last, id) filter (where support_department_id is not null))[1] as support_department_id,
    (array_agg(shift_type_id order by updated_at desc nulls last, created_at desc nulls last, id) filter (where shift_type_id is not null))[1] as shift_type_id,
    (array_agg(leave_type_id order by updated_at desc nulls last, created_at desc nulls last, id) filter (where leave_type_id is not null))[1] as leave_type_id,
    coalesce((array_agg(leave_all_day order by updated_at desc nulls last, created_at desc nulls last, id) filter (where leave_type_id is not null))[1], true) as leave_all_day,
    (array_agg(leave_start_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where leave_start_time is not null))[1] as leave_start_time,
    (array_agg(leave_end_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where leave_end_time is not null))[1] as leave_end_time,
    (array_agg(leave_reason order by updated_at desc nulls last, created_at desc nulls last, id) filter (where nullif(leave_reason, '') is not null))[1] as leave_reason,
    (array_agg(overtime_type_id order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_type_id is not null))[1] as overtime_type_id,
    (array_agg(overtime_start_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_start_time is not null))[1] as overtime_start_time,
    (array_agg(overtime_end_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_end_time is not null))[1] as overtime_end_time,
    coalesce((array_agg(overtime_use_rest_1 order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_type_id is not null))[1], false) as overtime_use_rest_1,
    (array_agg(overtime_rest_1_start_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_rest_1_start_time is not null))[1] as overtime_rest_1_start_time,
    (array_agg(overtime_rest_1_end_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_rest_1_end_time is not null))[1] as overtime_rest_1_end_time,
    coalesce((array_agg(overtime_use_rest_2 order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_type_id is not null))[1], false) as overtime_use_rest_2,
    (array_agg(overtime_rest_2_start_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_rest_2_start_time is not null))[1] as overtime_rest_2_start_time,
    (array_agg(overtime_rest_2_end_time order by updated_at desc nulls last, created_at desc nulls last, id) filter (where overtime_rest_2_end_time is not null))[1] as overtime_rest_2_end_time,
    (array_agg(overtime_reason order by updated_at desc nulls last, created_at desc nulls last, id) filter (where nullif(overtime_reason, '') is not null))[1] as overtime_reason,
    (array_agg(note order by updated_at desc nulls last, created_at desc nulls last, id) filter (where nullif(note, '') is not null))[1] as note
  from public.schedule_entries
  group by member_id, work_date
  having count(*) > 1
)
update public.schedule_entries se
set
  support_department_id = coalesce(se.support_department_id, merged.support_department_id),
  shift_type_id = coalesce(se.shift_type_id, merged.shift_type_id),
  leave_type_id = coalesce(se.leave_type_id, merged.leave_type_id),
  leave_all_day = coalesce(merged.leave_all_day, se.leave_all_day, true),
  leave_start_time = coalesce(se.leave_start_time, merged.leave_start_time),
  leave_end_time = coalesce(se.leave_end_time, merged.leave_end_time),
  leave_reason = coalesce(nullif(se.leave_reason, ''), merged.leave_reason),
  overtime_type_id = coalesce(se.overtime_type_id, merged.overtime_type_id),
  overtime_start_time = coalesce(se.overtime_start_time, merged.overtime_start_time),
  overtime_end_time = coalesce(se.overtime_end_time, merged.overtime_end_time),
  overtime_use_rest_1 = coalesce(merged.overtime_use_rest_1, se.overtime_use_rest_1, false),
  overtime_rest_1_start_time = coalesce(se.overtime_rest_1_start_time, merged.overtime_rest_1_start_time),
  overtime_rest_1_end_time = coalesce(se.overtime_rest_1_end_time, merged.overtime_rest_1_end_time),
  overtime_use_rest_2 = coalesce(merged.overtime_use_rest_2, se.overtime_use_rest_2, false),
  overtime_rest_2_start_time = coalesce(se.overtime_rest_2_start_time, merged.overtime_rest_2_start_time),
  overtime_rest_2_end_time = coalesce(se.overtime_rest_2_end_time, merged.overtime_rest_2_end_time),
  overtime_reason = coalesce(nullif(se.overtime_reason, ''), merged.overtime_reason),
  note = coalesce(nullif(se.note, ''), merged.note),
  updated_at = now()
from merged
where se.id = merged.keep_id;

with ranked as (
  select
    id,
    row_number() over (
      partition by member_id, work_date
      order by updated_at desc nulls last, created_at desc nulls last, id
    ) as row_number
  from public.schedule_entries
)
delete from public.schedule_entries se
using ranked
where se.id = ranked.id
  and ranked.row_number > 1;

alter table public.schedule_entries
  add constraint schedule_entries_member_id_work_date_key unique (member_id, work_date);

do $$
begin
  if to_regclass('public.leave_requests') is not null then
    execute $sql$
      insert into public.schedule_entries (
        member_id,
        work_date,
        leave_type_id,
        leave_all_day,
        leave_start_time,
        leave_end_time,
        leave_reason,
        created_at,
        updated_at
      )
      select
        r.member_id,
        day_value::date as work_date,
        r.leave_type_id,
        coalesce(r.is_all_day, true) as leave_all_day,
        case when coalesce(r.is_all_day, true) then null else r.start_time end as leave_start_time,
        case when coalesce(r.is_all_day, true) then null else r.end_time end as leave_end_time,
        r.reason as leave_reason,
        coalesce(r.created_at, now()) as created_at,
        coalesce(r.updated_at, now()) as updated_at
      from public.leave_requests r
      cross join lateral generate_series(r.start_date, r.end_date, interval '1 day') as day_value
      where r.member_id is not null
        and r.leave_type_id is not null
        and r.start_date is not null
        and r.end_date is not null
      on conflict (member_id, work_date) do update
      set
        leave_type_id = excluded.leave_type_id,
        leave_all_day = excluded.leave_all_day,
        leave_start_time = excluded.leave_start_time,
        leave_end_time = excluded.leave_end_time,
        leave_reason = excluded.leave_reason,
        updated_at = now()
    $sql$;
  end if;

  if to_regclass('public.overtime_requests') is not null then
    execute $sql$
      insert into public.schedule_entries (
        member_id,
        work_date,
        overtime_type_id,
        overtime_start_time,
        overtime_end_time,
        overtime_use_rest_1,
        overtime_rest_1_start_time,
        overtime_rest_1_end_time,
        overtime_use_rest_2,
        overtime_rest_2_start_time,
        overtime_rest_2_end_time,
        overtime_reason,
        created_at,
        updated_at
      )
      select
        r.member_id,
        r.work_date,
        r.overtime_type_id,
        r.start_time,
        r.end_time,
        coalesce(r.use_rest_1, false),
        r.rest_1_start_time,
        r.rest_1_end_time,
        coalesce(r.use_rest_2, false),
        r.rest_2_start_time,
        r.rest_2_end_time,
        r.reason,
        coalesce(r.created_at, now()),
        coalesce(r.updated_at, now())
      from public.overtime_requests r
      where r.member_id is not null
        and r.overtime_type_id is not null
        and r.work_date is not null
      on conflict (member_id, work_date) do update
      set
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
        updated_at = now()
    $sql$;
  end if;
end $$;

drop table if exists public.leave_requests cascade;
drop table if exists public.overtime_requests cascade;
drop table if exists public.schedule_months cascade;
drop table if exists public.schedule_documents cascade;
drop table if exists public.manager_departments cascade;
drop table if exists public.manager_set_departments cascade;

drop function if exists public.enforce_single_effective_leave_request();
drop function if exists public.enforce_single_effective_overtime_request();
drop type if exists public.request_status cascade;
drop type if exists public.request_type cascade;

create index if not exists idx_set_employee_home_department_id
on public.set_employee (home_department_id);

create index if not exists idx_set_employee_departments_member_id
on public.set_employee_departments (member_id);

create index if not exists idx_set_shift_applicable_department_id
on public.set_shift (applicable_department_id);

create index if not exists idx_schedule_entries_member_date
on public.schedule_entries (member_id, work_date);

create index if not exists idx_schedule_entries_leave_type_id
on public.schedule_entries (leave_type_id);

create index if not exists idx_schedule_entries_overtime_type_id
on public.schedule_entries (overtime_type_id);

alter table public.set_departments enable row level security;
alter table public.set_employee enable row level security;
alter table public.set_employee_departments enable row level security;
alter table public.set_shift enable row level security;
alter table public.set_leave enable row level security;
alter table public.set_overtime enable row level security;
alter table public.schedule_entries enable row level security;

drop policy if exists "anon_can_read_set_departments" on public.set_departments;
drop policy if exists "authenticated_can_read_set_departments" on public.set_departments;
drop policy if exists "managers_can_manage_set_departments" on public.set_departments;
drop policy if exists "anon_can_read_set_employee" on public.set_employee;
drop policy if exists "users_can_read_set_employee" on public.set_employee;
drop policy if exists "managers_can_manage_set_employee" on public.set_employee;
drop policy if exists "anon_can_read_set_employee_departments" on public.set_employee_departments;
drop policy if exists "authenticated_can_read_set_employee_departments" on public.set_employee_departments;
drop policy if exists "managers_can_manage_set_employee_departments" on public.set_employee_departments;
drop policy if exists "anon_can_read_set_shift" on public.set_shift;
drop policy if exists "authenticated_can_read_set_shift" on public.set_shift;
drop policy if exists "managers_can_manage_set_shift" on public.set_shift;
drop policy if exists "anon_can_read_set_leave" on public.set_leave;
drop policy if exists "authenticated_can_read_set_leave" on public.set_leave;
drop policy if exists "managers_can_manage_set_leave" on public.set_leave;
drop policy if exists "anon_can_read_set_overtime" on public.set_overtime;
drop policy if exists "authenticated_can_read_set_overtime" on public.set_overtime;
drop policy if exists "managers_can_manage_set_overtime" on public.set_overtime;
drop policy if exists "anon_can_read_schedule_entries" on public.schedule_entries;
drop policy if exists "authenticated_can_read_schedule_entries" on public.schedule_entries;
drop policy if exists "managers_can_manage_schedule_entries" on public.schedule_entries;

create policy "anon_can_read_set_departments"
on public.set_departments
for select
to anon
using (true);

create policy "authenticated_can_read_set_departments"
on public.set_departments
for select
to authenticated
using (true);

create policy "managers_can_manage_set_departments"
on public.set_departments
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "anon_can_read_set_employee"
on public.set_employee
for select
to anon
using (true);

create policy "users_can_read_set_employee"
on public.set_employee
for select
to authenticated
using (true);

create policy "managers_can_manage_set_employee"
on public.set_employee
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

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

create policy "anon_can_read_set_leave"
on public.set_leave
for select
to anon
using (true);

create policy "authenticated_can_read_set_leave"
on public.set_leave
for select
to authenticated
using (true);

create policy "managers_can_manage_set_leave"
on public.set_leave
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "anon_can_read_set_overtime"
on public.set_overtime
for select
to anon
using (true);

create policy "authenticated_can_read_set_overtime"
on public.set_overtime
for select
to authenticated
using (true);

create policy "managers_can_manage_set_overtime"
on public.set_overtime
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

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

grant select on
  public.set_departments,
  public.set_employee,
  public.set_employee_departments,
  public.set_shift,
  public.set_leave,
  public.set_overtime,
  public.schedule_entries
to anon, authenticated;

grant insert, update, delete on
  public.set_departments,
  public.set_employee,
  public.set_employee_departments,
  public.set_shift,
  public.set_leave,
  public.set_overtime,
  public.schedule_entries
to authenticated;

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
  overtime_item_id text,
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
    se.id as request_id,
    p.employee_code as member_code,
    p.full_name as member_name,
    t.scheduler_item_id as leave_item_id,
    t.code as leave_code,
    t.name as leave_name,
    null::text as overtime_name,
    null::text as overtime_item_id,
    se.work_date as start_date,
    se.work_date as end_date,
    null::date as work_date,
    se.leave_all_day as is_all_day,
    se.leave_start_time as start_time,
    se.leave_end_time as end_time,
    false as use_rest_1,
    null::time as rest_1_start_time,
    null::time as rest_1_end_time,
    false as use_rest_2,
    null::time as rest_2_start_time,
    null::time as rest_2_end_time,
    se.created_at
  from public.schedule_entries se
  join public.set_employee p on p.id = se.member_id
  join public.set_leave t on t.id = se.leave_type_id
  where se.leave_type_id is not null

  union all

  select
    'overtime'::text as kind,
    se.id as request_id,
    p.employee_code as member_code,
    p.full_name as member_name,
    null::text as leave_item_id,
    null::text as leave_code,
    null::text as leave_name,
    t.name as overtime_name,
    t.scheduler_item_id as overtime_item_id,
    null::date as start_date,
    null::date as end_date,
    se.work_date,
    false as is_all_day,
    coalesce(se.overtime_start_time, t.start_time) as start_time,
    coalesce(se.overtime_end_time, t.end_time) as end_time,
    coalesce(se.overtime_use_rest_1, t.use_rest_1, false) as use_rest_1,
    coalesce(se.overtime_rest_1_start_time, t.rest_1_start_time) as rest_1_start_time,
    coalesce(se.overtime_rest_1_end_time, t.rest_1_end_time) as rest_1_end_time,
    coalesce(se.overtime_use_rest_2, t.use_rest_2, false) as use_rest_2,
    coalesce(se.overtime_rest_2_start_time, t.rest_2_start_time) as rest_2_start_time,
    coalesce(se.overtime_rest_2_end_time, t.rest_2_end_time) as rest_2_end_time,
    se.created_at
  from public.schedule_entries se
  join public.set_employee p on p.id = se.member_id
  join public.set_overtime t on t.id = se.overtime_type_id
  where se.overtime_type_id is not null
  order by created_at desc;
$$;

grant execute on function public.get_public_schedule_requests() to anon, authenticated;

commit;
