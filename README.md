# 排班系統

這個專案是前端靜態網頁版排班系統，資料存放在 Supabase。
本機開發主體在 `src/renderer/`，GitHub Pages 發佈內容在 `docs/`。

目前系統已包含：

- 月曆班表檢視與編輯
- 單位 / 人員 / 班別 / 假別 / 加班設定
- 請假申請、加班申請、主管審核
- 手機版浮動工具列
- GitHub Pages 靜態發佈

## 專案結構

- `src/renderer/index.html`
  前端頁面骨架。
- `src/renderer/styles.css`
  所有畫面樣式。
- `src/renderer/renderer.js`
  主要 UI、排班狀態、事件綁定、modal、審核流程。
- `src/renderer/web-api.js`
  瀏覽器端與 Supabase 溝通的 API 包裝。
- `src/renderer/browser-exporter.js`
  匯出 Excel / CSV、匯入人員資料。
- `src/renderer/app-config.js`
  Supabase 連線設定與 `documentId`。
- `src/web-server.js`
  本機預覽用靜態伺服器。
- `scripts/publish-static-web.js`
  將 `src/renderer/` 複製到 `docs/`。
- `scripts/check-public-supabase.js`
  檢查公開 Supabase 設定是否可用。
- `supabase/`
  SQL、RPC、Edge Function 相關檔案。

## 執行方式

安裝相依後可用以下指令：

```powershell
npm run web
npm run web:check
npm run web:publish
```

- `npm run web`
  啟動本機預覽，預設網址為 `http://127.0.0.1:3010`
- `npm run web:check`
  檢查 `src/renderer/app-config.js` 的 Supabase 公開設定
- `npm run web:publish`
  清空並重建 `docs/`，供 GitHub Pages 使用

## 發佈規則

這個專案的 GitHub Pages 來源是 `docs/`，所以前端改動必須遵守：

1. 先修改 `src/renderer/*`
2. 若是網頁版要同步生效，再執行 `npm run web:publish`
3. 確認 `docs/` 已更新
4. commit / push 到 `main`

不要直接手改 `docs/` 當正式來源，除非只是臨時檢查。

## 目前資料來源

### 1. 排班主文件

班表主資料存放在 Supabase 的 `schedule_documents`。

`renderer.js` 載入流程：

1. `bindEvents()`
2. `window.schedulerApi.initializeAuth()`
3. `window.schedulerApi.getAppInfo()`
4. `window.schedulerApi.loadState()`
5. `normalizeState(payload)`
6. `resetVisibleMonthToToday()`
7. `renderAll()`

重點：

- 重新整理時，班表預設切回今天所在月份
- 若後續同步請假 / 加班資料失敗，不應覆蓋已載入的正式班表
- `createDefaultState()` 只應作為載入失敗 fallback，不是正式資料來源

### 2. Auth / 權限資料

登入與角色資料來自 Supabase：

- `profiles`：登入者資料、工號、姓名、角色
- `schedule_documents`：班表 JSON 主文件
- `leave_requests`：請假申請
- `overtime_requests`：加班申請
- `leave_types` / `overtime_types`：同步後的申請類型資料

目前帳號權限分兩種：

- `manager`：可編輯班表、設定資料、審核申請、重設員工密碼
- `employee`：可看班表、送出自己的請假 / 加班申請、修改自己的密碼

## 前端狀態邏輯

`renderer.js` 採單一 `state` 物件驅動畫面。

主要欄位包含：

- `year` / `month`
- `deptFilter`
- `tableDeptScopeFilter`
- `departments`
- `positions`
- `members`
- `shifts`
- `leaves`
- `overtime`
- `holidays`
- `rules`
- `schedule`

其中：

- `departments`、`members`、`shifts`、`leaves`、`overtime` 是設定資料
- `schedule` 是真正的每日格子資料
- 申請單不是直接存在 `schedule`，而是先從申請表讀出後，再覆蓋到畫面上的班表格

## 班表顯示邏輯

### 日期欄

- 每週起始為週日，結束為週六
- 日期標題有隔週底紋與週界線
- 今日欄位會額外標示
- 日期欄寬會依當月天數與可用寬度自動調整

### 單位與人員欄

- 左側單位 / 人員欄寬會依實際字數自動測量
- 標題列與內容列共用同一組欄寬計算，避免錯位
- 主管可由標題旁按鈕直接開啟單位設定與人員設定

### 單位與人員顯示條件

- 若單位整月都不在營業期間內，當月班表不顯示該單位
- 若員工整月都不在職，當月班表不顯示該員工
- 單位排序與單位內人員排序都會直接影響班表顯示順序

## 請假 / 加班覆蓋邏輯

`refreshRequestData()` 會依登入狀態載入申請資料：

- 未登入：讀公開 RPC，讓班表仍可看到公開的請假 / 加班覆蓋
- 已登入員工：只讀自己的申請
- 已登入主管：讀全部申請

`syncApprovedRequestsToSchedule()` 會先清掉由申請覆蓋出的格子，再重新套用申請資料。

目前套用規則：

- `approved` 與 `pending` 都會顯示在班表上
- `rejected` 不會套到班表
- 已核准請假會清掉該格原本班別
- 加班會以加班區塊顯示在同一天格子中

## 審核流程

### 功能入口

- 功能選單可開 `請假申核`、`加班申核`
- 從這裡進入時，會自動套用預設篩選：
  - 申請人清空
  - 日期清空
  - 審核結果 = `待審核`

### 從班表提示卡進入

若從班表格子的提示卡點審核：

- 會自動帶入該筆申請人的姓名
- 會自動帶入對應日期
- 會帶入該筆申請目前狀態

### 審核頁篩選規則

審核頁目前支援：

- 申請人
- 日期
- 審核結果

重要行為：

- 篩選變更時只重開列表，不應重設已選條件
- 按「清除」時才清空目前篩選
- 儲存審核後回列表，應保留目前篩選，不應跳回預設

## 申請頁邏輯

### 請假申請

- 員工可送出請假申請
- 下方「我的請假申請」採單行列表，日期新到舊排序
- 待審核中的申請可由本人刪除

### 加班申請

- 員工可送出加班申請
- 可輸入加班時段與休息 1 / 休息 2
- 下方「我的加班申請」與請假申請使用相同列表邏輯
- 待審核中的申請可由本人刪除

### 主管直接在班表上標記加班

- 這種加班不是員工申請單
- 直接標記後固定視為已核准

## 設定頁邏輯

### 單位設定

- 單位可拖曳排序
- 單位有人員時不可刪除，必須先移轉人員
- 可設定開始日期、結束日期、不顯示
- 勾選不顯示時，單位與人員不出現在假表相關選單

### 人員設定

- 支援姓名、單位、權限、狀態、薪資方式篩選
- 狀態預設為在職
- 可匯出 / 匯入人員資料

### 班別 / 假別 / 加班設定

- 皆採列表式設定頁
- 可設定 `不顯示`
- 勾選 `不顯示` 後，不出現在浮動工具列對應區塊

假別另外支援：

- 預覽格
- 底色
- 字色
- 自動字色
- 顯示名稱

班表格子與浮動工具列中的假別文字顏色，應以假別設定中的字色為準。

## 浮動工具列

目前浮動工具列包含：

- 班表標題
- 登入者名稱
- 請假申請
- 加班申請
- 修改密碼
- 功能
- 登出

手機版預設為收合狀態，收合後只保留單一收合按鈕。

工具列內主要區塊：

- 班別
- 假別
- 加班

這些區塊的按鈕與下拉選單，會受設定頁中的顯示 / 不顯示設定影響。

## Supabase API 重點

`src/renderer/web-api.js` 目前是薄包裝，不使用額外 SDK，直接用 `fetch` 呼叫：

- `/auth/v1/*`
- `/rest/v1/*`
- `/functions/v1/*`
- `/rest/v1/rpc/*`

前端主要透過 `window.schedulerApi` 存取：

- `initializeAuth`
- `signIn`
- `signOut`
- `changePassword`
- `loadState`
- `saveState`
- `syncCatalogs`
- `syncMemberProfile`
- `resetMemberPassword`
- `createLeaveRequest`
- `createOvertimeRequest`
- `listLeaveRequests`
- `listOvertimeRequests`
- `listPublicScheduleRequests`
- `updateLeaveRequest`
- `updateOvertimeRequest`
- `updateOvertimeRequestDetails`
- `deleteLeaveRequest`
- `deleteOvertimeRequest`
- `exportSapCsv`
- `exportOvertime`
- `exportLeave`
- `exportMembers`
- `importMembers`

## 維護注意事項

### 1. 一律以 `src/renderer/` 為主

正式修改請先改：

- `src/renderer/index.html`
- `src/renderer/styles.css`
- `src/renderer/renderer.js`
- `src/renderer/web-api.js`

如需 GitHub Pages 生效，再同步 `docs/`。

### 2. `docs/` 要和 `src/renderer/` 保持一致

若兩邊不一致，GitHub Pages 顯示可能和本機看到的不一樣。

### 3. 不要把測試 fallback 當正式資料

若載入錯誤看到像「王小美」這類預設資料，代表正式資料沒有載入成功，應先查：

- Supabase 連線設定
- `schedule_documents`
- Auth / profile 同步
- 後續 RPC 或 REST 是否報錯

### 4. 修改審核相關功能時，優先注意這三件事

1. 功能入口是否要套預設篩選
2. 班表提示入口是否要保留帶入條件
3. 審核後回列表是否應保留當前篩選

### 5. 修改班表欄寬時，注意 sticky header 一起同步

相關函式：

- `syncScheduleColumnWidths()`
- `renderStickyTableHeader()`
- `syncStickyHeaderLayout()`
- `syncStickyHeaderScroll()`

### 6. 根目錄舊檔不是目前發佈來源

以下檔案目前不是 GitHub Pages 正式來源：

- `renderer.js`
- `shift_scheduler.html`

除非特別要整理歷史檔，否則不要把它們當主檔修改。
