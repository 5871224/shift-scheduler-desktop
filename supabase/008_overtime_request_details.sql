alter table public.overtime_requests
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists use_rest_1 boolean not null default false,
  add column if not exists rest_1_start_time time,
  add column if not exists rest_1_end_time time,
  add column if not exists use_rest_2 boolean not null default false,
  add column if not exists rest_2_start_time time,
  add column if not exists rest_2_end_time time;

update public.overtime_requests as r
set
  start_time = coalesce(r.start_time, t.start_time),
  end_time = coalesce(r.end_time, t.end_time),
  use_rest_1 = coalesce(r.use_rest_1, t.use_rest_1, false),
  rest_1_start_time = coalesce(r.rest_1_start_time, t.rest_1_start_time),
  rest_1_end_time = coalesce(r.rest_1_end_time, t.rest_1_end_time),
  use_rest_2 = coalesce(r.use_rest_2, t.use_rest_2, false),
  rest_2_start_time = coalesce(r.rest_2_start_time, t.rest_2_start_time),
  rest_2_end_time = coalesce(r.rest_2_end_time, t.rest_2_end_time)
from public.set_overtime as t
where r.overtime_type_id = t.id;
