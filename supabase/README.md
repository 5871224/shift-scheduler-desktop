# Supabase 第一版資料表說明

這一版是依照目前討論結果先規劃的「可落地版本」。

不是最精簡的版本，但它比較適合你後面要做：

- 員工看所有人班表
- 員工請假 / 加班申請
- 主管審核
- 手機打卡
- 多單位主管
- 跨單位支援

## 檔案

- [001_initial_schema.sql](/C:/Users/indar/Desktop/排班/supabase/001_initial_schema.sql)

把這份 SQL 貼到 Supabase SQL Editor 執行即可。

## 表的白話用途

### `departments`

單位主檔。

### `profiles`

人員主檔。  
一個登入帳號對應一個人員資料。

### `manager_departments`

主管可以管理哪些單位。  
因為你有「一個主管可管多個單位」。

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

員工送出的請假申請。

### `overtime_requests`

員工送出的加班申請。

### `clock_locations`

允許打卡的地點。

### `attendance_logs`

上下班打卡紀錄，含定位與判定結果。

## 權限目前設計

這份 SQL 已先包含基本 RLS：

- 所有登入者都可讀主要資料
- 員工只能新增 / 修改自己的申請與自己的打卡
- 主管可管理所有設定與所有申請資料

## 這份 SQL 的定位

這是第一版骨架，目的不是一次到位，而是先把：

- 登入
- 人員
- 單位
- 班別
- 班表
- 請假申請
- 加班申請
- 打卡

都先有地方可放。

## 下一步建議

建完資料表後，下一步最適合做：

1. 建測試帳號與測試單位
2. 寫前端登入
3. 先做 `profiles / departments / schedule_entries` 串接
4. 再接請假與加班申請
