begin;

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

alter table public.schedule_entries
  drop constraint if exists schedule_entries_schedule_month_id_member_id_work_date_key,
  drop constraint if exists schedule_entries_member_id_work_date_key,
  drop column if exists schedule_month_id;

alter table public.schedule_entries
  add constraint schedule_entries_member_id_work_date_key unique (member_id, work_date);

drop table if exists public.schedule_months cascade;

commit;
