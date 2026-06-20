(function installWebSchedulerApi() {
  if (window.schedulerApi) {
    return;
  }

  const config = window.SCHEDULER_CONFIG || {};
  const exporter = window.schedulerBrowserExporter;
  const supabaseFactory = window.supabase;
  const baseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const anonKey = String(config.supabaseAnonKey || "");
  const documentId = String(config.documentId || "default");

  if (!baseUrl || !anonKey || !exporter || !supabaseFactory?.createClient) {
    throw new Error("缺少前端設定、匯出模組或 Supabase SDK");
  }

  const supabaseClient = supabaseFactory.createClient(baseUrl, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  let currentSession = null;
  let currentProfile = null;

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

  function ensureSignedIn() {
    if (!currentSession?.user) {
      throw new Error("請先登入");
    }
  }

  function ensureManager() {
    ensureSignedIn();
    if (currentProfile?.role !== "manager") {
      throw new Error("此功能限主管使用");
    }
  }

  async function fetchProfile(userId) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data || null;
  }

  async function refreshAuthContext(sessionOverride) {
    currentSession = sessionOverride ?? (await supabaseClient.auth.getSession()).data.session ?? null;
    currentProfile = currentSession?.user ? await fetchProfile(currentSession.user.id) : null;
    return {
      session: currentSession,
      profile: currentProfile
    };
  }

  async function initializeAuth() {
    return refreshAuthContext();
  }

  async function signIn(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      throw error;
    }
    return refreshAuthContext();
  }

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw error;
    }
    currentSession = null;
    currentProfile = null;
    return { session: null, profile: null };
  }

  async function loadState() {
    ensureSignedIn();
    const { data, error } = await supabaseClient
      .from("schedule_documents")
      .select("payload")
      .eq("id", documentId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data?.payload || null;
  }

  async function saveState(state) {
    ensureManager();
    const { error } = await supabaseClient
      .from("schedule_documents")
      .upsert([{ id: documentId, payload: state }], { onConflict: "id" });

    if (error) {
      throw error;
    }
    return { ok: true, savedAt: new Date().toISOString() };
  }

  async function syncCatalogs(state) {
    ensureManager();

    const leaveRows = (state.leaves || []).map((item) => ({
      code: item.code,
      name: item.name,
      color: item.color,
      requires_time: item.defaultAllDay === false,
      requires_reason: Boolean(item.requireReason)
    }));
    const { error: leaveError } = await supabaseClient
      .from("leave_types")
      .upsert(leaveRows, { onConflict: "code" });
    if (leaveError) {
      throw leaveError;
    }

    const { data: existingOvertime, error: overtimeReadError } = await supabaseClient
      .from("overtime_types")
      .select("id,name");
    if (overtimeReadError) {
      throw overtimeReadError;
    }

    const overtimeMap = new Map((existingOvertime || []).map((item) => [item.name, item]));
    for (const item of state.overtime || []) {
      const payload = {
        name: item.name,
        color: item.color,
        start_time: item.startTime,
        end_time: item.endTime,
        use_rest_1: Boolean(item.useRest1),
        rest_1_start_time: item.useRest1 ? item.rest1StartTime || null : null,
        rest_1_end_time: item.useRest1 ? item.rest1EndTime || null : null,
        use_rest_2: Boolean(item.useRest2),
        rest_2_start_time: item.useRest2 ? item.rest2StartTime || null : null,
        rest_2_end_time: item.useRest2 ? item.rest2EndTime || null : null
      };
      const existing = overtimeMap.get(item.name);
      const query = existing
        ? supabaseClient.from("overtime_types").update(payload).eq("id", existing.id)
        : supabaseClient.from("overtime_types").insert(payload);
      const { error } = await query;
      if (error) {
        throw error;
      }
    }
  }

  async function getLeaveTypeByCode(code) {
    const { data, error } = await supabaseClient
      .from("leave_types")
      .select("id,code,name")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("找不到對應的假別資料，請先請主管同步假別設定");
    }
    return data;
  }

  async function getOvertimeTypeByName(name) {
    const { data, error } = await supabaseClient
      .from("overtime_types")
      .select("id,name")
      .eq("name", name)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("找不到對應的加班資料，請先請主管同步加班設定");
    }
    return data;
  }

  async function createLeaveRequest(payload) {
    ensureSignedIn();
    const leaveType = await getLeaveTypeByCode(payload.leaveCode);
    const { error } = await supabaseClient
      .from("leave_requests")
      .insert({
        member_id: currentSession.user.id,
        leave_type_id: leaveType.id,
        start_date: payload.startDate,
        end_date: payload.endDate,
        is_all_day: payload.isAllDay,
        start_time: payload.isAllDay ? null : payload.startTime,
        end_time: payload.isAllDay ? null : payload.endTime,
        reason: payload.reason || ""
      });

    if (error) {
      throw error;
    }
    return { ok: true };
  }

  async function createOvertimeRequest(payload) {
    ensureSignedIn();
    const overtimeType = await getOvertimeTypeByName(payload.overtimeName);
    const { error } = await supabaseClient
      .from("overtime_requests")
      .insert({
        member_id: currentSession.user.id,
        overtime_type_id: overtimeType.id,
        work_date: payload.workDate,
        reason: payload.reason || ""
      });

    if (error) {
      throw error;
    }
    return { ok: true };
  }

  async function listLeaveRequests(options = {}) {
    ensureSignedIn();
    let query = supabaseClient
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!options.manager) {
      query = query.eq("member_id", currentSession.user.id);
    }
    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = data || [];
    const memberIds = [...new Set(rows.map((item) => item.member_id).filter(Boolean))];
    const leaveTypeIds = [...new Set(rows.map((item) => item.leave_type_id).filter(Boolean))];
    const profileMap = await fetchProfilesByIds(memberIds);
    const leaveTypeMap = await fetchLeaveTypesByIds(leaveTypeIds);

    return rows.map((item) => ({
      id: item.id,
      memberId: item.member_id,
      memberCode: profileMap.get(item.member_id)?.employee_code || "",
      memberName: profileMap.get(item.member_id)?.full_name || "",
      leaveCode: leaveTypeMap.get(item.leave_type_id)?.code || "",
      leaveName: leaveTypeMap.get(item.leave_type_id)?.name || "",
      startDate: item.start_date,
      endDate: item.end_date,
      isAllDay: item.is_all_day !== false,
      startTime: item.start_time || "",
      endTime: item.end_time || "",
      reason: item.reason || "",
      status: item.status,
      managerNote: item.manager_note || "",
      approvedAt: item.approved_at || "",
      createdAt: item.created_at
    }));
  }

  async function listOvertimeRequests(options = {}) {
    ensureSignedIn();
    let query = supabaseClient
      .from("overtime_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!options.manager) {
      query = query.eq("member_id", currentSession.user.id);
    }
    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = data || [];
    const memberIds = [...new Set(rows.map((item) => item.member_id).filter(Boolean))];
    const overtimeTypeIds = [...new Set(rows.map((item) => item.overtime_type_id).filter(Boolean))];
    const profileMap = await fetchProfilesByIds(memberIds);
    const overtimeTypeMap = await fetchOvertimeTypesByIds(overtimeTypeIds);

    return rows.map((item) => ({
      id: item.id,
      memberId: item.member_id,
      memberCode: profileMap.get(item.member_id)?.employee_code || "",
      memberName: profileMap.get(item.member_id)?.full_name || "",
      overtimeName: overtimeTypeMap.get(item.overtime_type_id)?.name || "",
      workDate: item.work_date,
      reason: item.reason || "",
      status: item.status,
      managerNote: item.manager_note || "",
      approvedAt: item.approved_at || "",
      createdAt: item.created_at
    }));
  }

  async function updateLeaveRequest(payload) {
    ensureManager();
    const nextStatus = payload.status;
    const updatePayload = {
      status: nextStatus,
      manager_note: payload.managerNote || "",
      approved_by: nextStatus === "pending" ? null : currentSession.user.id,
      approved_at: nextStatus === "pending" ? null : new Date().toISOString()
    };
    const { error } = await supabaseClient
      .from("leave_requests")
      .update(updatePayload)
      .eq("id", payload.id);

    if (error) {
      throw error;
    }
    return { ok: true };
  }

  async function updateOvertimeRequest(payload) {
    ensureManager();
    const nextStatus = payload.status;
    const updatePayload = {
      status: nextStatus,
      manager_note: payload.managerNote || "",
      approved_by: nextStatus === "pending" ? null : currentSession.user.id,
      approved_at: nextStatus === "pending" ? null : new Date().toISOString()
    };
    const { error } = await supabaseClient
      .from("overtime_requests")
      .update(updatePayload)
      .eq("id", payload.id);

    if (error) {
      throw error;
    }
    return { ok: true };
  }

  async function fetchProfilesByIds(ids) {
    if (!ids.length) {
      return new Map();
    }
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id,employee_code,full_name,role")
      .in("id", ids);
    if (error) {
      throw error;
    }
    return new Map((data || []).map((item) => [item.id, item]));
  }

  async function fetchLeaveTypesByIds(ids) {
    if (!ids.length) {
      return new Map();
    }
    const { data, error } = await supabaseClient
      .from("leave_types")
      .select("id,code,name")
      .in("id", ids);
    if (error) {
      throw error;
    }
    return new Map((data || []).map((item) => [item.id, item]));
  }

  async function fetchOvertimeTypesByIds(ids) {
    if (!ids.length) {
      return new Map();
    }
    const { data, error } = await supabaseClient
      .from("overtime_types")
      .select("id,name")
      .in("id", ids);
    if (error) {
      throw error;
    }
    return new Map((data || []).map((item) => [item.id, item]));
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
    initializeAuth,
    getAuthContext: () => ({ session: currentSession, profile: currentProfile }),
    signIn,
    signOut,
    loadState,
    saveState,
    syncCatalogs,
    createLeaveRequest,
    createOvertimeRequest,
    listLeaveRequests,
    listOvertimeRequests,
    updateLeaveRequest,
    updateOvertimeRequest,
    exportExcel,
    exportSapCsv,
    exportOvertime,
    exportLeave,
    getAppInfo: async () => ({
      databasePath: `Supabase / schedule_documents / ${documentId}`,
      backend: "supabase-auth",
      updatedAt: null
    }),
    showMessage: async (_title, message) => {
      window.alert(message);
    },
    confirmAction: async (_title, message) => window.confirm(message)
  };
})();
