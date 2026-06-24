begin;

with schedule_docs as (
  select
    id,
    payload,
    updated_at
  from public.schedule_documents
  where jsonb_typeof(payload) = 'object'
),
leave_config as (
  select
    d.id as document_id,
    item->>'id' as leave_id,
    item->>'code' as leave_code
  from schedule_docs d
  cross join lateral jsonb_array_elements(coalesce(d.payload->'leaves', '[]'::jsonb)) as item
),
overtime_config as (
  select
    d.id as document_id,
    item->>'id' as overtime_id,
    item->>'name' as overtime_name,
    nullif(item->>'startTime', '')::time as start_time,
    nullif(item->>'endTime', '')::time as end_time,
    coalesce((item->>'useRest1')::boolean, false) as use_rest_1,
    nullif(item->>'rest1StartTime', '')::time as rest_1_start_time,
    nullif(item->>'rest1EndTime', '')::time as rest_1_end_time,
    coalesce((item->>'useRest2')::boolean, false) as use_rest_2,
    nullif(item->>'rest2StartTime', '')::time as rest_2_start_time,
    nullif(item->>'rest2EndTime', '')::time as rest_2_end_time
  from schedule_docs d
  cross join lateral jsonb_array_elements(coalesce(d.payload->'overtime', '[]'::jsonb)) as item
),
schedule_items as (
  select
    d.id as document_id,
    d.updated_at,
    entry.key as slot_key,
    entry.value as slot,
    split_part(entry.key, '_', 1)::uuid as member_id,
    split_part(entry.key, '_', 2)::integer as year_value,
    split_part(entry.key, '_', 3)::integer as month_zero_based,
    split_part(entry.key, '_', 4)::integer as day_value
  from schedule_docs d
  cross join lateral jsonb_each(coalesce(d.payload->'schedule', '{}'::jsonb)) as entry
  where entry.key ~ '^[0-9a-fA-F-]{36}_[0-9]{4}_[0-9]{1,2}_[0-9]{1,2}$'
    and jsonb_typeof(entry.value) = 'object'
),
legacy_leave_rows as (
  select
    s.member_id,
    make_date(s.year_value, s.month_zero_based + 1, s.day_value) as work_date,
    c.leave_code,
    coalesce((s.slot->'leaveMeta'->>'allDay')::boolean, true) as is_all_day,
    case
      when coalesce((s.slot->'leaveMeta'->>'allDay')::boolean, true) then null
      else nullif(s.slot->'leaveMeta'->>'startTime', '')::time
    end as start_time,
    case
      when coalesce((s.slot->'leaveMeta'->>'allDay')::boolean, true) then null
      else nullif(s.slot->'leaveMeta'->>'endTime', '')::time
    end as end_time,
    nullif(s.slot->'leaveMeta'->>'reason', '') as reason,
    s.updated_at,
    row_number() over (
      partition by s.member_id, make_date(s.year_value, s.month_zero_based + 1, s.day_value)
      order by s.updated_at desc, s.slot_key desc
    ) as row_no
  from schedule_items s
  join leave_config c
    on c.document_id = s.document_id
   and c.leave_id = s.slot->>'leave'
  where coalesce(nullif(s.slot->>'leaveRequestId', ''), '') = ''
    and coalesce(nullif(s.slot->>'leave', ''), '') <> ''
),
insert_leave as (
  insert into public.leave_requests (
    member_id,
    leave_type_id,
    start_date,
    end_date,
    is_all_day,
    start_time,
    end_time,
    reason,
    source,
    status,
    approved_at
  )
  select
    l.member_id,
    t.id as leave_type_id,
    l.work_date as start_date,
    l.work_date as end_date,
    l.is_all_day,
    l.start_time,
    l.end_time,
    l.reason,
    'manager' as source,
    'approved'::public.request_status as status,
    l.updated_at as approved_at
  from legacy_leave_rows l
  join public.profiles p
    on p.id = l.member_id
  join public.leave_types t
    on t.code = l.leave_code
  where l.row_no = 1
    and not exists (
      select 1
      from public.leave_requests r
      where r.member_id = l.member_id
        and r.status in ('pending', 'approved')
        and r.start_date <= l.work_date
        and r.end_date >= l.work_date
    )
  returning id
),
legacy_overtime_rows as (
  select
    s.member_id,
    make_date(s.year_value, s.month_zero_based + 1, s.day_value) as work_date,
    c.overtime_name,
    coalesce(nullif(s.slot->'overtimeMeta'->>'startTime', '')::time, c.start_time) as start_time,
    coalesce(nullif(s.slot->'overtimeMeta'->>'endTime', '')::time, c.end_time) as end_time,
    coalesce((s.slot->'overtimeMeta'->>'useRest1')::boolean, c.use_rest_1, false) as use_rest_1,
    coalesce(nullif(s.slot->'overtimeMeta'->>'rest1StartTime', '')::time, c.rest_1_start_time) as rest_1_start_time,
    coalesce(nullif(s.slot->'overtimeMeta'->>'rest1EndTime', '')::time, c.rest_1_end_time) as rest_1_end_time,
    coalesce((s.slot->'overtimeMeta'->>'useRest2')::boolean, c.use_rest_2, false) as use_rest_2,
    coalesce(nullif(s.slot->'overtimeMeta'->>'rest2StartTime', '')::time, c.rest_2_start_time) as rest_2_start_time,
    coalesce(nullif(s.slot->'overtimeMeta'->>'rest2EndTime', '')::time, c.rest_2_end_time) as rest_2_end_time,
    nullif(s.slot->'overtimeMeta'->>'reason', '') as reason,
    s.updated_at,
    row_number() over (
      partition by s.member_id, make_date(s.year_value, s.month_zero_based + 1, s.day_value)
      order by s.updated_at desc, s.slot_key desc
    ) as row_no
  from schedule_items s
  join overtime_config c
    on c.document_id = s.document_id
   and c.overtime_id = s.slot->>'overtime'
  where coalesce(nullif(s.slot->>'overtimeRequestId', ''), '') = ''
    and coalesce(nullif(s.slot->>'overtime', ''), '') <> ''
),
insert_overtime as (
  insert into public.overtime_requests (
    member_id,
    overtime_type_id,
    work_date,
    start_time,
    end_time,
    use_rest_1,
    rest_1_start_time,
    rest_1_end_time,
    use_rest_2,
    rest_2_start_time,
    rest_2_end_time,
    reason,
    source,
    status,
    approved_at
  )
  select
    o.member_id,
    t.id as overtime_type_id,
    o.work_date,
    o.start_time,
    o.end_time,
    o.use_rest_1,
    o.rest_1_start_time,
    o.rest_1_end_time,
    o.use_rest_2,
    o.rest_2_start_time,
    o.rest_2_end_time,
    o.reason,
    'manager' as source,
    'approved'::public.request_status as status,
    o.updated_at as approved_at
  from legacy_overtime_rows o
  join public.profiles p
    on p.id = o.member_id
  join public.overtime_types t
    on t.name = o.overtime_name
  where o.row_no = 1
    and not exists (
      select 1
      from public.overtime_requests r
      where r.member_id = o.member_id
        and r.status in ('pending', 'approved')
        and r.work_date = o.work_date
    )
  returning id
)
select
  (select count(*) from insert_leave) as migrated_leave_rows,
  (select count(*) from insert_overtime) as migrated_overtime_rows;

commit;
