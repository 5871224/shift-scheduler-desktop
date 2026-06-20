# 排班工具

目前專案保留 2 種使用方式：

- Electron 桌面版
- 純前端 Web 版

## 純前端 Web 版

這一版不需要 Node.js 後端。

- 前端直接使用 Supabase Auth 登入
- 排班主檔存放在 `schedule_documents`
- 員工可送出請假 / 加班申請
- 主管可審核申請，核准後會回寫到排班主檔
- Excel / CSV 匯出直接在瀏覽器產生下載

### Supabase 必跑 SQL

請在 Supabase SQL Editor 依序執行：

```text
supabase/001_initial_schema.sql
supabase/002_data_api_grants.sql
supabase/003_schedule_documents.sql
supabase/005_schedule_documents_authenticated.sql
```

如果你之前已經跑過匿名版的：

```text
supabase/004_schedule_documents_anon.sql
```

現在改成登入版後，請再跑一次：

```text
supabase/005_schedule_documents_authenticated.sql
```

### Auth / profiles 前置條件

登入機制依賴 Supabase Auth + `profiles`。

每個使用者都需要：

1. 在 Supabase Auth 建立帳號
2. 在 `profiles` 建立同一個 `id` 的資料列
3. 填好：
   - `employee_code`
   - `full_name`
   - `role` (`employee` 或 `manager`)

`employee_code` 需要對應到排班主檔中的人員代碼，例如 `A001`。

### 本機預覽

```powershell
npm install
npm run web
```

開啟：

```text
http://127.0.0.1:3010
```

### 檢查 Supabase Auth 設定

```powershell
npm run web:check
```

看到：

```text
supabase auth config ok
```

代表前端設定與 Supabase Auth 端點可正常連線。

### 產生發佈版

```powershell
npm run web:publish
```

會產生 [docs](C:/Users/indar/Desktop/排班/docs)。

### GitHub Pages

把 [docs](C:/Users/indar/Desktop/排班/docs) 當成發佈資料夾即可。

- 發佈來源：`main /docs`
- [docs/.nojekyll](C:/Users/indar/Desktop/排班/docs/.nojekyll) 會自動建立

### FTP 上傳

把 [docs](C:/Users/indar/Desktop/排班/docs) 裡面的檔案全部上傳到網站根目錄即可：

- `index.html`
- `styles.css`
- `renderer.js`
- `web-api.js`
- `browser-exporter.js`
- `app-config.js`

## Electron 桌面版

```powershell
npm install
npm start
```

## 打包桌面版

```powershell
npm run dist
```

輸出會在 `release/`。
