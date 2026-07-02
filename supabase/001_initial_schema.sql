create extension if not exists pgcrypto;

create type public.app_role as enum ('employee', 'manager');
create type public.attendance_type as enum ('clock_in', 'clock_out');
create type public.attendance_result as enum ('normal', 'late', 'early_leave', 'out_of_range', 'no_shift', 'invalid');

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  employee_code text not null unique,
  full_name text not null,
  role public.app_role not null default 'employee',
  home_department_id uuid references public.departments (id) on delete set null,
  position_name text,
  hire_date date,
  leave_date date,
  pay_by_day boolean not null default false,
  schedule_department_ids text[] not null default '{}',
  monthly_rest_days integer not null default 0 check (monthly_rest_days >= 0 and monthly_rest_days <= 31),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_departments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  department_id uuid not null references public.departments (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (member_id, department_id)
);

create table public.shift_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  applicable_department_id uuid references public.departments (id) on delete set null,
  color text,
  start_time time not null,
  end_time time not null,
  required_staff_count integer not null default 0 check (required_staff_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leave_types (
  id uuid primary key default gen_random_uuid(),
  scheduler_item_id text,
  code text not null,
  name text not null,
  color text,
  text_color text,
  auto_text_color boolean not null default true,
  hidden_from_toolbar boolean not null default false,
  requires_time boolean not null default false,
  requires_reason boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scheduler_item_id)
);

create table public.overtime_types (
  id uuid primary key default gen_random_uuid(),
  scheduler_item_id text,
  code text unique,
  name text not null,
  color text,
  text_color text,
  auto_text_color boolean not null default true,
  hidden_from_toolbar boolean not null default false,
  start_time time,
  end_time time,
  use_rest_1 boolean not null default false,
  rest_1_start_time time,
  rest_1_end_time time,
  use_rest_2 boolean not null default false,
  rest_2_start_time time,
  rest_2_end_time time,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scheduler_item_id)
);

create table public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  work_date date not null,
  support_department_id uuid references public.departments (id) on delete set null,
  shift_type_id uuid references public.shift_types (id) on delete set null,
  leave_type_id uuid references public.leave_types (id) on delete set null,
  leave_all_day boolean not null default true,
  leave_start_time time,
  leave_end_time time,
  leave_reason text,
  overtime_type_id uuid references public.overtime_types (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, work_date)
);

create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  leave_type_id uuid not null references public.leave_types (id) on delete restrict,
  start_date date not null,
  end_date date not null,
  is_all_day boolean not null default true,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.overtime_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  overtime_type_id uuid not null references public.overtime_types (id) on delete restrict,
  work_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clock_locations (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments (id) on delete cascade,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  allowed_radius_m integer not null default 100 check (allowed_radius_m > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  attendance_type public.attendance_type not null,
  work_date date not null,
  punched_at timestamptz not null,
  latitude double precision,
  longitude double precision,
  clock_location_id uuid references public.clock_locations (id) on delete set null,
  distance_m double precision,
  result public.attendance_result not null default 'invalid',
  linked_schedule_entry_id uuid references public.schedule_entries (id) on delete set null,
  remark text,
  created_at timestamptz not null default now()
);

create index idx_profiles_home_department_id on public.profiles (home_department_id);
create index idx_member_departments_member_id on public.member_departments (member_id);
create index idx_shift_types_applicable_department_id on public.shift_types (applicable_department_id);
create index idx_schedule_entries_member_date on public.schedule_entries (member_id, work_date);
create index idx_leave_requests_member_id on public.leave_requests (member_id);
create index idx_overtime_requests_member_id on public.overtime_requests (member_id);
create index idx_attendance_logs_member_date on public.attendance_logs (member_id, work_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_departments
before update on public.departments
for each row execute function public.set_updated_at();

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_shift_types
before update on public.shift_types
for each row execute function public.set_updated_at();

create trigger set_updated_at_leave_types
before update on public.leave_types
for each row execute function public.set_updated_at();

create trigger set_updated_at_overtime_types
before update on public.overtime_types
for each row execute function public.set_updated_at();

create trigger set_updated_at_schedule_entries
before update on public.schedule_entries
for each row execute function public.set_updated_at();

create trigger set_updated_at_leave_requests
before update on public.leave_requests
for each row execute function public.set_updated_at();

create trigger set_updated_at_overtime_requests
before update on public.overtime_requests
for each row execute function public.set_updated_at();

create trigger set_updated_at_clock_locations
before update on public.clock_locations
for each row execute function public.set_updated_at();

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.member_departments enable row level security;
alter table public.shift_types enable row level security;
alter table public.leave_types enable row level security;
alter table public.overtime_types enable row level security;
alter table public.schedule_entries enable row level security;
alter table public.leave_requests enable row level security;
alter table public.overtime_requests enable row level security;
alter table public.clock_locations enable row level security;
alter table public.attendance_logs enable row level security;

create or replace function public.is_manager(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role = 'manager'
      and is_active = true
  );
$$;

create policy "authenticated_can_read_departments"
on public.departments
for select
to authenticated
using (true);

create policy "managers_can_manage_departments"
on public.departments
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "users_can_read_profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "users_can_update_own_profile_basic_fields"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "managers_can_manage_profiles"
on public.profiles
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_member_departments"
on public.member_departments
for select
to authenticated
using (true);

create policy "managers_can_manage_member_departments"
on public.member_departments
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_shift_types"
on public.shift_types
for select
to authenticated
using (true);

create policy "managers_can_manage_shift_types"
on public.shift_types
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_leave_types"
on public.leave_types
for select
to authenticated
using (true);

create policy "managers_can_manage_leave_types"
on public.leave_types
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_overtime_types"
on public.overtime_types
for select
to authenticated
using (true);

create policy "managers_can_manage_overtime_types"
on public.overtime_types
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

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

create policy "authenticated_can_read_leave_requests"
on public.leave_requests
for select
to authenticated
using (true);

create policy "managers_can_manage_leave_requests"
on public.leave_requests
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_overtime_requests"
on public.overtime_requests
for select
to authenticated
using (true);

create policy "managers_can_manage_overtime_requests"
on public.overtime_requests
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_clock_locations"
on public.clock_locations
for select
to authenticated
using (true);

create policy "managers_can_manage_clock_locations"
on public.clock_locations
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));

create policy "authenticated_can_read_attendance_logs"
on public.attendance_logs
for select
to authenticated
using (true);

create policy "employees_can_insert_own_attendance_logs"
on public.attendance_logs
for insert
to authenticated
with check (member_id = auth.uid());

create policy "employees_can_update_own_attendance_logs"
on public.attendance_logs
for update
to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

create policy "managers_can_manage_attendance_logs"
on public.attendance_logs
for all
to authenticated
using (public.is_manager(auth.uid()))
with check (public.is_manager(auth.uid()));
