begin;

-- ponytail: 只刪目前 web 版沒有使用、且已被 schedule_documents / request tables 取代的舊正規化表，先保留 departments 以免連動 profiles.home_department_id。

drop table if exists public.attendance_logs;
drop table if exists public.clock_locations;
drop table if exists public.schedule_entries;
drop table if exists public.schedule_months;
drop table if exists public.shift_types;
drop table if exists public.member_departments;
drop table if exists public.manager_departments;

commit;
