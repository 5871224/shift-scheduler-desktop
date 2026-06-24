create or replace function public.enforce_single_effective_leave_request()
returns trigger
language plpgsql
as $$
declare
  conflict_id uuid;
begin
  if new.status not in ('pending', 'approved') then
    return new;
  end if;

  select r.id
  into conflict_id
  from public.leave_requests r
  where r.member_id = new.member_id
    and r.id <> new.id
    and r.status in ('pending', 'approved')
    and r.start_date <= new.end_date
    and r.end_date >= new.start_date
  limit 1;

  if conflict_id is not null then
    raise exception '同一員工同一天只能有一筆待審核或已核準的請假申請';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_single_effective_leave_request on public.leave_requests;

create trigger enforce_single_effective_leave_request
before insert or update of member_id, start_date, end_date, status
on public.leave_requests
for each row execute function public.enforce_single_effective_leave_request();

create or replace function public.enforce_single_effective_overtime_request()
returns trigger
language plpgsql
as $$
declare
  conflict_id uuid;
begin
  if new.status not in ('pending', 'approved') then
    return new;
  end if;

  select r.id
  into conflict_id
  from public.overtime_requests r
  where r.member_id = new.member_id
    and r.id <> new.id
    and r.status in ('pending', 'approved')
    and r.work_date = new.work_date
  limit 1;

  if conflict_id is not null then
    raise exception '同一員工同一天只能有一筆待審核或已核準的加班申請';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_single_effective_overtime_request on public.overtime_requests;

create trigger enforce_single_effective_overtime_request
before insert or update of member_id, work_date, status
on public.overtime_requests
for each row execute function public.enforce_single_effective_overtime_request();
