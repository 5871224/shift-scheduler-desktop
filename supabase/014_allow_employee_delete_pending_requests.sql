create policy "employees_can_delete_own_pending_leave_requests"
on public.leave_requests
for delete
to authenticated
using (
  member_id = auth.uid()
  and status = 'pending'
);

create policy "employees_can_delete_own_pending_overtime_requests"
on public.overtime_requests
for delete
to authenticated
using (
  member_id = auth.uid()
  and status = 'pending'
);
