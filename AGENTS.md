# Repo Notes For Agents

這個 repo 是排班系統。

## 先看哪裡

- 前端來源：`src/renderer/`
- GitHub Pages 輸出：`docs/`
- Supabase SQL / migration：`supabase/`
- 腳本：`scripts/`

## 必守規則

1. 任何有改到網頁畫面、互動、樣式、前端資料流程的工作，完成前都要執行：

```bash
npm run web:publish
```

2. GitHub Pages 是看 `docs/`，不是看 `src/renderer/`。如果沒更新 `docs/`，使用者會以為沒改到。

3. 如果這次工作有改到前端，而且使用者沒有明確說不要，預設要把更新提交並推到 `main`，避免 GitHub Pages 停在舊版。

4. 回覆使用者時，若已改前端，應明確說明是否已：

- 更新 `docs/`
- 推送到 GitHub Pages 對應分支 / `main`

## 自動排班目前狀態

目前只有先做好基礎設定，還沒有正式自動排班演算法。

已存在的前置欄位 / 設定：

- `rules.weekStart`
- `rules.monthStartDay`
- `shift.requiredStaffCount`
- `member.scheduleDeptIds`
- `member.monthlyRestDays`

對應用途：

- `weekStart`：每週起算
- `monthStartDay`：每月起算
- `requiredStaffCount`：班別需求人數
- `scheduleDeptIds`：人員可排單位，陣列順序代表優先度，第 1 個是主要單位
- `monthlyRestDays`：該月例假 + 休息日目標天數

## 自動排班規則草稿

除非使用者另改規則，先以這些方向理解：

- 一人一天最多一班
- 優先本單位，不足再支援外單位
- 手動指定的班 / 假視為鎖定
- 月休天數是固定目標值
- 已指定的例假 / 休息日要計入月休天數
- 排不滿可留空，不要硬塞
- 同日同單位多班缺額時，依班別順序補

## 例休檢查提醒

目前例休檢查重點：

- 每 7 天至少 1 天例假
- 每 7 天至少 1 天休息日
- 連續出勤不得超過 6 天

其中連續出勤檢查是任意滑動，不限單週，並包含上個月銜接資料。

## SQL / 同步提醒

如果工作牽涉到自動排班基礎設定欄位，留意：

- `supabase/015_auto_schedule_settings.sql`
- `supabase/functions/member-auth-admin/index.ts`
- `src/renderer/web-api.js`

不要只改前端欄位名稱，漏掉同步層與資料庫欄位。
