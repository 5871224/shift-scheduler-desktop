# Supabase Schema

排班系統目前以 Supabase 資料表作為唯一正式資料來源，不再使用 `schedule_documents.payload` JSON 作為正式讀寫來源。

## 單一資料來源原則

- 前端不得讀寫 `schedule_documents.payload`。
- 班表格子以 `schedule_entries` 為唯一來源。
- `schedule_entries` 以 `member_id + work_date` 作為唯一格子。
- 班別、假別、加班分別存在 `schedule_entries` 的不同欄位。
- `scheduler_settings` 目前仍有使用，用來保存目前年月、畫面篩選、檢視模式、週起算、月起算、8 週起點等設定。

## 主要資料表

- `scheduler_settings`：畫面狀態與排班規則設定。
- `set_departments`：設定單位。
- `set_employee`：設定人員。
- `set_employee_departments`：設定人員可排單位與優先順序。
- `set_shift`：設定班別。
- `set_leave`：設定假別。
- `set_overtime`：設定加班。
- `holidays`：設定假日。
- `schedule_entries`：班表資料，以人員 + 日期作為唯一格子。
- `clock_locations` / `attendance_logs`：保留給下一階段打卡功能。

## 已淘汰或待清理資料表

- `manager_departments`：舊版主管多單位關聯，目前不用。
- `schedule_documents`：舊 JSON 回填來源，完成正規化 migration 後可刪。
- `schedule_months`：已移除，班表不再以月份主檔作為依賴。
- `leave_requests` / `overtime_requests`：已合併到 `schedule_entries`，主管設定請假與加班不再獨立成申請表。
- `request_status` / `request_type`：舊請假/加班申請流程使用，目前不用。

## Migration 順序

1. `001_initial_schema.sql`：初始 schema。
2. `002_data_api_grants.sql`：API 權限。
3. `006_login_by_employee_code.sql`：以員工編號登入的 RPC。
4. `008_overtime_request_details.sql`：舊加班明細相容處理。
5. `015_auto_schedule_settings.sql`：自動排班基礎設定欄位。
6. `016_manager_schedule_entries_cleanup.sql`：移除員工申請/核准流程，保留主管設定請假與主管設定加班。
7. `017_normalized_scheduler_storage.sql`：將舊 JSON 回填到正規化資料表。
8. `018_drop_unused_tables.sql`：刪除已不用資料表，保留打卡相關資料表。
9. `019_public_overtime_item_id.sql`：公開班表同步加班項目 ID。
10. `020_cleanup_demo_test_data.sql`：清除明確測試單位資料。
11. `021_remove_schedule_months.sql`：移除 `schedule_months`，改以 `schedule_entries(member_id, work_date)` 作為班表唯一格子。
12. `022_rename_settings_and_merge_schedule_entries.sql`：基本設定表改名為 `set_*`，並將主管設定請假/加班合併進 `schedule_entries`。
