const path = require("path");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { SchedulerDatabase } = require("./services/db");
const { exportSapLeaveCsv, exportOvertimeWorkbook, exportLeaveWorkbook } = require("./services/exporter");

let mainWindow;
let database;
let databasePath;

function resolveDataDirectory() {
  if (app.isPackaged) {
    return path.dirname(process.execPath);
  }
  return path.resolve(__dirname, "..", "..");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 920,
    minWidth: 1320,
    minHeight: 720,
    autoHideMenuBar: true,
    backgroundColor: "#f4f2eb",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

async function exportSapCsv(payload) {
  const defaultFileName = `sap休例假_${payload.year}_${String(payload.month + 1).padStart(2, "0")}.csv`;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "匯出 SAP 休例假",
    defaultPath: path.join(app.getPath("documents"), defaultFileName),
    filters: [{ name: "CSV", extensions: ["csv"] }]
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  await exportSapLeaveCsv(payload, filePath);
  return { canceled: false, filePath };
}

async function exportOvertime(payload) {
  const defaultFileName = `加班_${payload.year}_${String(payload.month + 1).padStart(2, "0")}.xlsx`;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "匯出加班",
    defaultPath: path.join(app.getPath("documents"), defaultFileName),
    filters: [{ name: "Excel", extensions: ["xlsx"] }]
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  await exportOvertimeWorkbook(payload, filePath);
  return { canceled: false, filePath };
}

async function exportLeave(payload) {
  const defaultFileName = `請假_${payload.year}_${String(payload.month + 1).padStart(2, "0")}.xlsx`;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "匯出請假",
    defaultPath: path.join(app.getPath("documents"), defaultFileName),
    filters: [{ name: "Excel", extensions: ["xlsx"] }]
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  await exportLeaveWorkbook(payload, filePath);
  return { canceled: false, filePath };
}

app.whenReady().then(() => {
  const dataDirectory = resolveDataDirectory();
  database = new SchedulerDatabase(dataDirectory);
  databasePath = database.getDatabasePath();

  ipcMain.handle("state:load", () => database.loadState());
  ipcMain.handle("state:save", (_event, state) => {
    database.saveState(state);
    return { ok: true, savedAt: new Date().toISOString() };
  });
  ipcMain.handle("export:sap-csv", (_event, payload) => exportSapCsv(payload));
  ipcMain.handle("export:overtime", (_event, payload) => exportOvertime(payload));
  ipcMain.handle("export:leave", (_event, payload) => exportLeave(payload));
  ipcMain.handle("app:info", () => ({ databasePath }));
  ipcMain.handle("dialog:message", (_event, payload) => dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["確定"],
    defaultId: 0,
    noLink: true,
    title: String(payload?.title || "提示"),
    message: String(payload?.message || "")
  }));
  ipcMain.handle("dialog:confirm", async (_event, payload) => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "question",
      buttons: ["取消", "確定"],
      defaultId: 1,
      cancelId: 0,
      noLink: true,
      title: String(payload?.title || "確認"),
      message: String(payload?.message || "")
    });
    return result.response === 1;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
