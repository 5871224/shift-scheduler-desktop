const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("schedulerApi", {
  loadState: () => ipcRenderer.invoke("state:load"),
  saveState: (state) => ipcRenderer.invoke("state:save", state),
  exportExcel: (payload) => ipcRenderer.invoke("export:excel", payload),
  exportSapCsv: (payload) => ipcRenderer.invoke("export:sap-csv", payload),
  exportOvertime: (payload) => ipcRenderer.invoke("export:overtime", payload),
  exportLeave: (payload) => ipcRenderer.invoke("export:leave", payload),
  getAppInfo: () => ipcRenderer.invoke("app:info"),
  showMessage: (title, message) => ipcRenderer.invoke("dialog:message", { title, message }),
  confirmAction: (title, message) => ipcRenderer.invoke("dialog:confirm", { title, message })
});
