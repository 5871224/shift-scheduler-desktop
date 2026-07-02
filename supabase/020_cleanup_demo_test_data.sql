begin;

delete from public.departments
where scheduler_item_id like 'TEMP_TEST_%'
   or code like 'TEMP_TEST_%'
   or name = 'Temp Test Dept';

commit;
