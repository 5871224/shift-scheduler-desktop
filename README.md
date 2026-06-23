# 班表系統

這個專案是一個以瀏覽器為主的班表系統，前端直接呼叫 Supabase Auth、REST API、Edge Function 與資料匯出流程。

目前倉庫同時包含：

- 網頁前端原始碼：`src/renderer/`
- GitHub Pages 靜態輸出：`docs/`
- 本機預覽伺服器：`src/web-server.js`
- 發佈腳本：`scripts/publish-static-web.js`
- Supabase SQL / Function：`supabase/`

## 專案目的

系統主要處理以下工作：

- 班表排班
- 人員、單位、班別、假別設定
- 請假申請 / 加班申請 / 主管審核
- 匯出休例假、請假、加班資料
- 以 Supabase 帳號與 `profiles` 權限控制主管 / 員工功能

## 執行環境

### Node.js

此專案用 Node 啟動本機靜態預覽與產出 `docs/`。

常用指令：

```powershell
npm run web
npm run web:publish
npm run web:check
```

說明：

- `npm run web`
  啟動本機預覽站，預設網址為 `http://127.0.0.1:3010`
- `npm run web:publish`
  將 `src/renderer/` 複製到 `docs/`，作為 GitHub Pages 發佈內容
- `npm run web:check`
  檢查 `src/renderer/app-config.js` 內的公開 Supabase 設定是否可用

### 前端設定

公開前端設定放在：

- `src/renderer/app-config.js`

目前包含：

- `supabaseUrl`
- `supabaseAnonKey`
- `documentId`

這些值會被前端直接讀取，因此只能放「可公開」設定，不要放 service role key。

## 網頁結構

主要頁面檔案：

- `src/renderer/index.html`
  頁面骨架，包含工具列、班表區、modal root、auth root
- `src/renderer/styles.css`
  全站樣式
- `src/renderer/renderer.js`
  畫面渲染、互動、狀態管理、modal、拖曳排序、審核 UI
- `src/renderer/web-api.js`
  前端對 Supabase 的 API 封裝
- `src/renderer/browser-exporter.js`
  匯出檔案相關邏輯

畫面大致分成兩區：

1. 浮動工具列
   包含登入資訊、功能選單、單位 / 班別、假別
2. 班表區
   包含月份切換、固定表頭、班表格子、主管快捷設定按鈕

## 主要資料流

### 1. 啟動流程

入口在 `src/renderer/renderer.js`。

初始化時會：

1. `bindEvents()`
2. `window.schedulerApi.initializeAuth()`
3. `window.schedulerApi.getAppInfo()`
4. `window.schedulerApi.loadState()`
5. `normalizeState(payload)`
6. `renderAll()`

也就是說，畫面並不是先用資料庫即時逐筆讀取來組頁，而是先載入一份完整 state，再由前端渲染。

### 2. 前端 state

核心 state 在 `renderer.js` 的 `DEFAULT_STATE` 與 `state` 變數。

主要內容有：

- `departments`
- `members`
- `shifts`
- `leaves`
- `overtime`
- `holidays`
- `rules`
- `schedule`
- `year`
- `month`
- `selected`
- `deptFilter`

這代表：

- 設定類資料與班表資料大多由單一 state 管理
- UI 修改後通常要 `renderAll()`、`renderTable()` 或 `renderToolbar()`
- 儲存時走 `queueSave()`，最後呼叫 `schedulerApi.saveState(state)`

### 3. 儲存邏輯

前端不是每點一下就立刻打 API，而是使用 `queueSave()` 做短延遲儲存。

好處：

- 避免大量連續請求
- 排班拖曳或連續點格子時不會太卡

風險：

- 如果改到 state 但沒呼叫 `queueSave()`，資料只會停留在畫面

### 4. 權限邏輯

主管判斷集中在：

- `isManager()`
- `canEditSchedule()`
- `promptManagerAccess()`
- `syncRoleUi()`

目前規則大致是：

- 員工可登入、送請假 / 加班申請
- 主管可編輯排班、開設定頁、審核申請、匯出

如果改 UI，要注意「按鈕顯示」和「事件實際允許」是兩層：

- 顯示層：`syncRoleUi()`
- 行為層：`managerOnlyAction` 判斷與 `promptManagerAccess()`

只藏按鈕不夠，事件限制也要一起看。

## Supabase 結構

### 前端接法

`src/renderer/web-api.js` 直接用 `fetch` 呼叫：

- Supabase Auth
- `/rest/v1/*`
- `/functions/v1/*`

目前沒有用官方 JS SDK，而是自己包：

- `requestJson()`
- `restSelect()`
- `restInsert()`
- `restUpdate()`
- `requestFunction()`

這樣做的特性是簡單直接，但改表名、欄位名、RLS 時，前端很容易一起壞，修改資料庫前要先全文搜尋呼叫點。

### 目前可見的重要 API 能力

`window.schedulerApi` 主要提供：

- `initializeAuth()`
- `signIn()`
- `signOut()`
- `loadState()`
- `saveState()`
- `syncCatalogs()`
- `syncMemberProfile()`
- `resetMemberPassword()`
- `createLeaveRequest()`
- `createOvertimeRequest()`
- `listLeaveRequests()`
- `listOvertimeRequests()`
- `updateLeaveRequest()`
- `updateOvertimeRequest()`
- `exportSapCsv()`
- `exportLeave()`
- `exportOvertime()`

### SQL / Function 檔案

Supabase 相關檔案位於：

- `supabase/001_initial_schema.sql`
- `supabase/002_data_api_grants.sql`
- `supabase/003_schedule_documents.sql`
- `supabase/004_schedule_documents_anon.sql`
- `supabase/005_schedule_documents_authenticated.sql`
- `supabase/006_login_by_employee_code.sql`
- `supabase/007_schedule_documents_public_read.sql`
- `supabase/008_overtime_request_details.sql`
- `supabase/functions/member-auth-admin/index.ts`

其中 `member-auth-admin` Edge Function 用於人員帳號同步與密碼重設，這是高權限區塊，修改前要特別小心。

## 部署結構

### 本機原始碼

開發來源是：

- `src/renderer/`

### 發佈輸出

GitHub Pages / 靜態站輸出是：

- `docs/`

`npm run web:publish` 會：

1. 清空 `docs/`
2. 複製必要前端檔案進去
3. 重新寫入 `.nojekyll`
4. 重新寫入 `docs/README.txt`

所以：

- 不要手改 `docs/` 裡的內容再期待它長久存在
- 正確做法是改 `src/renderer/`，然後重新 publish

### 本機預覽

`src/web-server.js` 是很薄的靜態伺服器，只做：

- 靜態檔案服務
- `/api/health`

它不是正式後端，也不處理商業邏輯。

## 重要 UI 邏輯

### 班表固定表頭

固定表頭是另外一套 DOM，不是直接用 `thead` 顯示。

相關函式：

- `renderStickyTableHeader()`
- `renderStickyHeaderTitleCells()`
- `syncStickyHeaderLayout()`
- `syncStickyHeaderScroll()`

注意：

- 改欄寬時，固定表頭和主表格要一起看
- `thead` 本身是隱藏的，主要拿來量寬度

### 設定頁列表

班別設定 / 假別設定共用 `openListSettings(category)` 產生列表。

因此如果只改其中一種顯示，要先確認條件分支是否只影響：

- `category === "shift"`
- `category === "leave"`

最近「假別設定 > 需填時間」顯示反轉，就是只動這一層顯示，不動實際資料值。

### 請假 / 加班待審核視覺

班表格子內容由 `renderCellInner()` 組出來。

待審核視覺由：

- `segment.status === "pending"`
- `.seg-pending`

控制。

如果要再改待審核效果，優先只改 CSS，不要先碰資料結構。

## 維護注意事項

### 1. 改前端後，要同步 `docs/`

這個專案的靜態發佈來源是 `docs/`，所以前端有改就要執行：

```powershell
npm run web:publish
```

### 2. 設定與權限是兩層

新增或移除主管功能時，要一起檢查：

- `syncRoleUi()`
- `bindEvents()` 裡的 `managerOnlyAction`
- 相關 API 是否也有 `ensureManager()`

### 3. `schedule` 是核心資料

很多互動都直接寫進 `state.schedule`。

如果改：

- 排班方式
- 請假覆蓋規則
- 加班寫回規則

記得一起檢查：

- `ensureScheduleSlot()`
- `pruneEmptySchedule()`
- `applySelectionToCell()`
- 審核通過後寫回班表的邏輯

### 4. 注意 `defaultAllDay` 的語意

`leave.defaultAllDay` 不是單純顯示字串，它會同時影響：

- 假別設定表單 checkbox
- 假單預設是否整天
- 假別細節 modal 是否先隱藏時間欄
- 列表上的「需填時間」顯示

因此改文案或顯示時，要先區分：

- 是改資料意義
- 還是只改列表呈現

### 5. 核心功能選單與浮動工具列

目前工具列是 fixed 浮動卡片，核心功能選單靠絕對定位展開。

如果再改這區：

- 要注意 `overflow`
- 要注意手機版 `max-height`
- 要注意選單是否被工具列本身裁切

### 6. 不要直接依賴 `docs/` 作為唯一真實來源

真正應修改的是 `src/renderer/`。

`docs/` 是部署產物，不是主要開發來源。

## 建議修改流程

每次改動這個專案，建議照下面順序：

1. 先改 `src/renderer/*`
2. 本機檢查必要 JS 語法
3. 執行 `npm run web:publish`
4. 確認 `docs/` 一起更新
5. 再 commit / push

## 目前倉庫中容易誤會的檔案

倉庫根目錄目前可見：

- `renderer.js`
- `shift_scheduler.html`

這兩個不是目前 GitHub Pages 發佈主路徑，真正網頁來源仍以 `src/renderer/` 與 `docs/` 為主。處理時不要誤改到錯的檔案。
