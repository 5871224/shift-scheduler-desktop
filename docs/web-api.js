(function installWebSchedulerApi() {
  if (window.schedulerApi) {
    return;
  }

  const config = window.SCHEDULER_CONFIG || {};
  const exporter = window.schedulerBrowserExporter;
  const baseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const anonKey = String(config.supabaseAnonKey || "");
  const documentId = String(config.documentId || "default");

  if (!baseUrl || !anonKey || !exporter) {
    throw new Error("缺少前端設定或匯出模組");
  }

  function buildHeaders(extra = {}) {
    return {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      ...extra
    };
  }

  async function supabaseJson(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, {
      ...options,
      headers: buildHeaders({
        "Content-Type": "application/json",
        ...(options.headers || {})
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Supabase ${response.status}`);
    }

    return response.json();
  }

  function makeFileName(prefix, payload, extension) {
    return `${prefix}_${payload.year}_${String(payload.month + 1).padStart(2, "0")}.${extension}`;
  }

  function downloadBlob(blob, fileName) {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  async function loadState() {
    const rows = await supabaseJson(
      `/rest/v1/schedule_documents?id=eq.${encodeURIComponent(documentId)}&select=payload`,
      { method: "GET" }
    );
    return rows[0]?.payload || null;
  }

  async function saveState(state) {
    await supabaseJson(
      "/rest/v1/schedule_documents?on_conflict=id",
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify([{
          id: documentId,
          payload: state
        }])
      }
    );
    return { ok: true, savedAt: new Date().toISOString() };
  }

  async function exportExcel(payload) {
    const blob = await exporter.workbookToBlob(await exporter.createScheduleWorkbook(payload));
    const fileName = makeFileName("排班表", payload, "xlsx");
    downloadBlob(blob, fileName);
    return { canceled: false, filePath: fileName };
  }

  async function exportSapCsv(payload) {
    const blob = new Blob(
      [exporter.buildSapLeaveCsvContent(payload)],
      { type: "text/csv;charset=utf-8" }
    );
    const fileName = makeFileName("sap休例假", payload, "csv");
    downloadBlob(blob, fileName);
    return { canceled: false, filePath: fileName };
  }

  async function exportOvertime(payload) {
    const blob = await exporter.workbookToBlob(await exporter.createOvertimeWorkbook(payload));
    const fileName = makeFileName("匯出加班", payload, "xlsx");
    downloadBlob(blob, fileName);
    return { canceled: false, filePath: fileName };
  }

  async function exportLeave(payload) {
    const blob = await exporter.workbookToBlob(await exporter.createLeaveWorkbook(payload));
    const fileName = makeFileName("匯出請假", payload, "xlsx");
    downloadBlob(blob, fileName);
    return { canceled: false, filePath: fileName };
  }

  window.schedulerApi = {
    loadState,
    saveState,
    exportExcel,
    exportSapCsv,
    exportOvertime,
    exportLeave,
    getAppInfo: async () => ({
      databasePath: `Supabase / schedule_documents / ${documentId}`,
      backend: "supabase",
      updatedAt: null
    }),
    showMessage: async (_title, message) => {
      window.alert(message);
    },
    confirmAction: async (_title, message) => window.confirm(message)
  };
})();
