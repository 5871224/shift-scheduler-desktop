# 排班工具

目前這個專案有 2 種使用方式：

- Electron 桌面版
- 純前端 Web 版

## 純前端 Web 版

這一版不需要 Node.js 後端。

資料：
- 直接由瀏覽器連 Supabase

匯出：
- 直接在瀏覽器產生並下載 Excel / CSV

部署：
- 可放一般靜態空間
- 可放 GitHub Pages
- 可放 Cloudflare Pages / Netlify

### Supabase 先做的事

請在 Supabase SQL Editor 依序執行：

```text
supabase/003_schedule_documents.sql
supabase/004_schedule_documents_anon.sql
```

`004_schedule_documents_anon.sql` 是讓前端用 `anon key` 直接讀寫 `schedule_documents`。

### 本機預覽

```powershell
npm install
npm run web
```

開啟：

```text
http://127.0.0.1:3010
```

### 檢查前端能不能直接連 Supabase

```powershell
npm run web:check
```

看到：

```text
public supabase check ok
```

就代表前端已能直接存取 Supabase。

### 產生發佈版

```powershell
npm run web:publish
```

會產生 [docs](C:/Users/indar/Desktop/排班/docs)。

### GitHub Pages

把 [docs](C:/Users/indar/Desktop/排班/docs) 當成發佈資料夾即可。

- 若用 GitHub Pages，可設定 `main branch /docs`
- [docs/.nojekyll](C:/Users/indar/Desktop/排班/docs/.nojekyll) 已自動建立

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
