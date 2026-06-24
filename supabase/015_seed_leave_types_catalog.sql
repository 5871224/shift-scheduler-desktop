begin;

insert into public.leave_types (
  code,
  name,
  color,
  requires_time,
  requires_reason
)
values
  ('0010', '事假', '#378ADD', false, false),
  ('0011', '病假', '#185FA5', false, false),
  ('0012', '婚假', '#23395B', false, false),
  ('0013', '喪假', '#355070', false, false),
  ('0014', '公假', '#1D9E75', false, false),
  ('0015', '公傷假', '#2F6F4F', false, false),
  ('0016', '產假', '#2A9D8F', false, false),
  ('0017', '特休假', '#3A5A40', false, false),
  ('0018', '陪產(檢)假', '#E24B4A', false, false),
  ('0019', '補休假', '#9C2F2F', false, false),
  ('0020', '產檢假', '#A44A3F', false, false),
  ('0022', '無薪病假(時)', '#D85A30', false, false),
  ('0023', '彈性假', '#EF9F27', false, false),
  ('0024', '特准半薪病假', '#C46B2D', false, false),
  ('0026', '家庭照顧假', '#BA7517', false, false),
  ('0027', '半薪生理假', '#639922', false, false),
  ('0028', '全薪流產假', '#7F77DD', false, false),
  ('0029', '半薪流產假', '#5B4B8A', false, false),
  ('0031', '無薪病假(天)', '#8F3B76', false, false),
  ('0033', '特准事假', '#6D597A', false, false),
  ('0034', '刷卡遲到', '#D4537E', false, false),
  ('0035', '刷卡早退', '#5DCAA5', false, false),
  ('0036', '例假', '#888780', false, false),
  ('0038', '公傷假(天)', '#378ADD', false, false),
  ('0039', '曠職', '#185FA5', false, false),
  ('0040', '教育訓練假', '#23395B', false, false),
  ('0041', '颱風豪雨假', '#355070', false, false),
  ('0042', '選舉假', '#1D9E75', false, false),
  ('0043', '國定假日假', '#2F6F4F', false, false),
  ('0044', '颱風豪雨假(不扣薪)', '#2A9D8F', false, false),
  ('0045', '內部會議假', '#3A5A40', false, false),
  ('0046', '原住民祭儀假', '#E24B4A', false, false),
  ('0047', '休息日', '#9C2F2F', false, false),
  ('0048', '無薪生理假', '#A44A3F', false, false),
  ('0049', '防疫假(有薪)', '#D85A30', false, false),
  ('0050', '防疫假(無薪)', '#EF9F27', false, false),
  ('0051', '特別補休假', '#C46B2D', false, false),
  ('0052', '遲到/早退(SK)', '#BA7517', false, false),
  ('0053', '婚假(天)(SK)', '#639922', false, false),
  ('0054', '公傷假(半薪)(時)(SK)', '#7F77DD', false, false),
  ('0090', '系統使用的假', '#5B4B8A', false, false),
  ('0091', '家庭照顧假(扣事假用)', '#8F3B76', false, false),
  ('0092', '半薪生理假(扣病假用)', '#6D597A', false, false)
on conflict (code) do update
set
  name = excluded.name,
  color = coalesce(public.leave_types.color, excluded.color),
  requires_time = public.leave_types.requires_time,
  requires_reason = public.leave_types.requires_reason;

commit;
