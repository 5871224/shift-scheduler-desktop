# 排班工具

目前這個專案只保留網頁版。

## 內容

- GitHub Pages 靜態前端
- Supabase Auth + 資料庫
- 班表瀏覽
- 請假申請 / 審核
- 加班申請 / 審核
- 匯出休例假 / 請假 / 加班

## 本機預覽

```powershell
npm run web
```

開啟：

```text
http://127.0.0.1:3010
```

## 發佈靜態網站

```powershell
npm run web:publish
```

輸出在 `docs/`。

## 檢查 Supabase 設定

```powershell
npm run web:check
```

## Supabase SQL

至少需要先執行：

```text
supabase/001_initial_schema.sql
supabase/002_data_api_grants.sql
supabase/003_schedule_documents.sql
supabase/005_schedule_documents_authenticated.sql
supabase/006_login_by_employee_code.sql
supabase/007_schedule_documents_public_read.sql
supabase/008_overtime_request_details.sql
```

其中：

- `007_schedule_documents_public_read.sql`：讓未登入也能讀班表
- `008_overtime_request_details.sql`：補上加班申請的開始/結束與休息欄位
