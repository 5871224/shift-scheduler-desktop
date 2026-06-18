# 排班工具桌面版

這個資料夾現在已經整理成 Electron 專案，可做成免安裝 Windows 版。

## 本機開發

```powershell
npm install
npm start
```

## 打包

```powershell
npm run dist
```

打包完成後會在 `release/` 看到：

- `排班工具-1.0.0-portable.exe`
- `排班工具-1.0.0.zip`

## 技術選型

- 畫面：`HTML / CSS / JS`
- 外殼：`Electron`
- 資料庫：`SQLite`，檔名為 `shift-scheduler.db`，直接放在 `exe` 同資料夾
- 匯出：`ExcelJS`
- 發給別人：把 `release/` 內產物直接提供即可
