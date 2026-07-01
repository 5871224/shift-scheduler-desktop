# Supabase 資料表說明

目前排班系統不再把主要資料存在 `schedule_documents.payload` JSON 裡。

主要資料改由各自資料表保存：

- 單位：`departments`
- 人員：`profiles` / `member_departments`
- 班別：`shift_types`
- 假別：`leave_types`
- 加班：`overtime_types`
- 班表：`schedule_months` / `schedule_entries`
- 主管設定請假：`leave_requests`
- 主管設定加班：`overtime_requests`

## 檔案

新環境依序執行目前保留的 SQL：

1. `001_initial_schema.sql`：基礎 schema。
2. `002_data_api_grants.sql`：API 權限。
3. `006_login_by_employee_code.sql`：工號登入用 email 對應。
4. `008_overtime_request_details.sql`：主管設定加班的時間與休息段欄位。
5. `015_auto_schedule_settings.sql`：自動排班基礎欄位。
6. `016_manager_schedule_entries_cleanup.sql`：移除員工申請/核准流程，保留主管設定請假與主管設定加班。
7. `017_normalized_scheduler_storage.sql`：把主要班表資料改為正規化資料表，並從舊 `schedule_documents` JSON 回填一次。

已移除的舊 SQL 類型：

- 舊 `schedule_documents` 讀寫權限設定。
- 舊員工請假/加班申請、核准狀態、核准 RPC。
- 舊 JSON 班表轉申請資料的 migration。
- 舊版會刪掉現行班表正規化資料表的清理 SQL。

## 表的白話用途

### `departments`

單位主檔。

### `profiles`

人員主檔。  
一個登入帳號對應一個人員資料。

### `manager_departments`

舊版多單位主管關聯，目前 web 版沒有使用，會由 `016_manager_schedule_entries_cleanup.sql` 移除。

### `member_departments`

員工可支援哪些單位。  
因為你有「員工會跨單位支援」。

### `shift_types`

班別設定。  
這裡直接包含班別適用的單位，因為目前規則是一個班別只會有一個適用單位。

### `leave_types`

假別設定。

### `overtime_types`

加班別設定。

### `schedule_months`

某一個月份的班表主檔，例如 `2026-06`。

### `schedule_entries`

實際每天每個人的班表內容。  
這張是核心表。

### `leave_requests`

主管設定的請假紀錄。

### `overtime_requests`

主管設定的加班紀錄。

### `clock_locations`

舊版打卡地點，目前 web 版沒有使用，會由 `016_manager_schedule_entries_cleanup.sql` 移除。

### `attendance_logs`

舊版打卡紀錄，目前 web 版沒有使用，會由 `016_manager_schedule_entries_cleanup.sql` 移除。

### `scheduler_settings`

目前班表檢視月份、週起算、月起算、表格檢視等設定。

### `holidays`

國定假日設定。

## 權限目前設計

目前 RLS：

- 未登入可讀班表顯示需要的資料
- 登入者可讀主要資料
- 主管可管理設定、人員、班表、請假與加班資料

## 這份 SQL 的定位

目前的資料表是正式儲存來源。`schedule_documents` 只保留為舊 JSON 資料回填來源，不再是前端主要儲存目標。

舊資料回填在 `017_normalized_scheduler_storage.sql` 內處理。
