# Supabase Schema

目前排班系統主要資料已改用正規化資料表，不再用 `schedule_documents.payload` JSON 作為正式儲存來源。

## 主要資料表

- `scheduler_settings`：目前年月、畫面篩選與排班規則。
- `departments`：單位資料。
- `profiles`：人員主檔。
- `member_departments`：人員可排單位與優先順序。
- `shift_types`：班別設定。
- `leave_types`：假別設定。
- `overtime_types`：加班設定。
- `holidays`：假日設定。
- `schedule_months` / `schedule_entries`：班表資料。
- `leave_requests`：主管設定請假資料。
- `overtime_requests`：主管設定加班資料。
- `clock_locations` / `attendance_logs`：保留給下一階段打卡功能。

## 已移除或可清理

- `manager_departments`：舊版主管多單位關聯，目前不用。
- `schedule_documents`：舊 JSON 回填來源，完成 `017_normalized_scheduler_storage.sql` 後可刪。
- `request_status` / `request_type`：舊請假/加班申請流程用型別，目前不用。

## Migration 順序

1. `001_initial_schema.sql`：初始 schema。
2. `002_data_api_grants.sql`：API 權限。
3. `006_login_by_employee_code.sql`：工號登入輔助欄位與 RPC。
4. `008_overtime_request_details.sql`：加班時間與休息時間欄位。
5. `015_auto_schedule_settings.sql`：自動排班基礎欄位。
6. `016_manager_schedule_entries_cleanup.sql`：移除員工申請/核准流程，保留主管設定請假與主管設定加班。
7. `017_normalized_scheduler_storage.sql`：從舊 JSON 回填到正規化資料表。
8. `018_drop_unused_tables.sql`：刪除目前不用的舊表與舊型別；不刪打卡相關表。
