alter table public.profiles
add column if not exists login_email text;

create unique index if not exists idx_profiles_login_email_unique
on public.profiles (login_email)
where login_email is not null;

create or replace function public.login_email_by_employee_code(p_employee_code text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select login_email
  from public.profiles
  where employee_code = p_employee_code
    and is_active = true
    and login_email is not null
  limit 1
$$;

revoke all on function public.login_email_by_employee_code(text) from public;
grant execute on function public.login_email_by_employee_code(text) to anon;
grant execute on function public.login_email_by_employee_code(text) to authenticated;
