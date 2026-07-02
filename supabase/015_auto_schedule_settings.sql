alter table public.set_employee
  add column if not exists schedule_department_ids text[] not null default '{}',
  add column if not exists monthly_rest_days integer not null default 0;

alter table public.set_employee
  drop constraint if exists set_employee_monthly_rest_days_check;

alter table public.set_employee
  add constraint set_employee_monthly_rest_days_check
  check (monthly_rest_days >= 0 and monthly_rest_days <= 31);

alter table public.set_employee_departments
  add column if not exists sort_order integer not null default 0;

alter table public.set_shift
  add column if not exists required_staff_count integer not null default 0;

alter table public.set_shift
  drop constraint if exists set_shift_required_staff_count_check;

alter table public.set_shift
  add constraint set_shift_required_staff_count_check
  check (required_staff_count >= 0);

alter table public.schedule_months
  add column if not exists month_start_day integer not null default 1;

alter table public.schedule_months
  drop constraint if exists schedule_months_month_start_day_check;

alter table public.schedule_months
  add constraint schedule_months_month_start_day_check
  check (month_start_day between 1 and 31);
