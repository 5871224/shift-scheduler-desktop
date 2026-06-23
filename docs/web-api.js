(function installWebSchedulerApi() {
  if (window.schedulerApi) {
    return;
  }

  const config = window.SCHEDULER_CONFIG || {};
  const exporter = window.schedulerBrowserExporter;
  const baseUrl = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const anonKey = String(config.supabaseAnonKey || "");
  const documentId = String(config.documentId || "default");
  const sessionStorageKey = `scheduler.supabase.session.${baseUrl}`;

  if (!baseUrl || !anonKey || !exporter) {
    throw new Error("缺少 Supabase 設定");
  }

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

  function pickFile(accept) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.style.display = "none";
      document.body.appendChild(input);
      input.addEventListener("change", () => {
        const file = input.files?.[0] || null;
        input.remove();
        resolve(file);
      }, { once: true });
      input.click();
    });
  }

  function normalizeSession(payload) {
    if (!payload?.access_token || !payload?.user) {
      return null;
    }
    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token || "",
      token_type: payload.token_type || "bearer",
      expires_in: Number(payload.expires_in || 0),
      expires_at: Number(payload.expires_at || 0),
      user: payload.user
    };
  }

  function readStoredSession() {
    try {
      return normalizeSession(JSON.parse(localStorage.getItem(sessionStorageKey) || "null"));
    } catch {
      return null;
    }
  }

  function persistSession(session) {
    currentSession = normalizeSession(session);
    if (currentSession) {
      localStorage.setItem(sessionStorageKey, JSON.stringify(currentSession));
    } else {
      localStorage.removeItem(sessionStorageKey);
    }
  }

  function clearSession() {
    currentSession = null;
    currentProfile = null;
    localStorage.removeItem(sessionStorageKey);
  }

  function buildHeaders(options = {}) {
    const { auth = false, contentType = true, extra = {} } = options;
    const headers = {
      apikey: anonKey,
      ...extra
    };
    if (auth && currentSession?.access_token) {
      headers.Authorization = `Bearer ${currentSession.access_token}`;
    }
    if (contentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  async function readError(response) {
    const text = await response.text();
    if (!text) {
      return `HTTP ${response.status}`;
    }
    try {
      const parsed = JSON.parse(text);
      return parsed.message || parsed.error_description || parsed.error || text;
    } catch {
      return text;
    }
  }

  async function requestJson(pathname, options = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, {
      ...options,
      headers: buildHeaders({
        auth: options.auth,
        contentType: options.contentType !== false,
        extra: options.headers || {}
      })
    });
    if (!response.ok) {
      throw new Error(await readError(response));
    }
    if (response.status === 204) {
      return null;
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function requestFunction(functionName, payload) {
    const response = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
      method: "POST",
      headers: buildHeaders({
        auth: true,
        extra: {
          Accept: "application/json"
        }
      }),
      body: JSON.stringify(payload || {})
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`尚未部署 ${functionName} Edge Function`);
      }
      throw new Error(await readError(response));
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function buildQuery(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    });
    const query = search.toString();
    return query ? `?${query}` : "";
  }

  function quoteFilterValue(value) {
    return `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }

  function buildInFilter(values) {
    return `in.(${values.map((value) => quoteFilterValue(value)).join(",")})`;
  }

  async function restSelect(table, options = {}) {
    const { select = "*", filters = {}, order = "", limit = "", auth = false } = options;
    return requestJson(
      `/rest/v1/${table}${buildQuery({
        select,
        order,
        limit,
        ...filters
      })}`,
      {
        method: "GET",
        auth,
        headers: {
          Accept: "application/json"
        }
      }
    );
  }

  async function restInsert(table, rows, options = {}) {
    const { auth = false, onConflict = "", prefer = "return=representation" } = options;
    return requestJson(
      `/rest/v1/${table}${buildQuery(onConflict ? { on_conflict: onConflict } : {})}`,
      {
        method: "POST",
        auth,
        headers: {
          Prefer: prefer
        },
        body: JSON.stringify(rows)
      }
    );
  }

  async function restUpdate(table, filters, payload, options = {}) {
    const { auth = false, prefer = "return=representation" } = options;
    return requestJson(
      `/rest/v1/${table}${buildQuery(filters)}`,
      {
        method: "PATCH",
        auth,
        headers: {
          Prefer: prefer
        },
        body: JSON.stringify(payload)
      }
    );
  }

  async function restDelete(table, filters, options = {}) {
    const { auth = false, prefer = "return=minimal" } = options;
    return requestJson(
      `/rest/v1/${table}${buildQuery(filters)}`,
      {
        method: "DELETE",
        auth,
        headers: {
          Prefer: prefer
        }
      }
    );
  }

  async function restRpc(functionName, payload = {}, options = {}) {
    const { auth = false, prefer = "return=representation" } = options;
    return requestJson(
      `/rest/v1/rpc/${functionName}`,
      {
        method: "POST",
        auth,
        headers: {
          Accept: "application/json",
          Prefer: prefer
        },
        body: JSON.stringify(payload || {})
      }
    );
  }

  function ensureSignedIn() {
    if (!currentSession?.user) {
      throw new Error("請先登入");
    }
  }

  function ensureManager() {
    ensureSignedIn();
    if (currentProfile?.role !== "manager") {
      throw new Error("此功能需要主管權限");
    }
  }

  async function refreshSessionIfNeeded() {
    if (!currentSession?.refresh_token) {
      return currentSession;
    }
    if (currentSession.expires_at && Date.now() < (currentSession.expires_at - 60) * 1000) {
      return currentSession;
    }
    const payload = await requestJson("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: currentSession.refresh_token
      })
    });
    persistSession(payload);
    return currentSession;
  }

  async function fetchProfile(userId) {
    const rows = await restSelect("profiles", {
      select: "*",
      filters: {
        id: `eq.${userId}`
      },
      auth: true
    });
    return rows?.[0] || null;
  }

  async function refreshAuthContext() {
    currentProfile = null;
    if (!currentSession?.user) {
      return {
        session: null,
        profile: null
      };
    }
    await refreshSessionIfNeeded();
    currentProfile = await fetchProfile(currentSession.user.id);
    if (!currentProfile) {
      throw new Error("帳號尚未綁定身份");
    }
    return {
      session: currentSession,
      profile: currentProfile
    };
  }

  async function initializeAuth() {
    persistSession(readStoredSession());
    if (!currentSession?.user) {
      return { session: null, profile: null };
    }
    try {
      return await refreshAuthContext();
    } catch {
      clearSession();
      return { session: null, profile: null };
    }
  }

  async function getLoginEmailByEmployeeCode(employeeCode) {
    const email = await requestJson("/rest/v1/rpc/login_email_by_employee_code", {
      method: "POST",
      body: JSON.stringify({
        p_employee_code: String(employeeCode || "").trim()
      })
    });
    return typeof email === "string" ? email.trim() : "";
  }

  async function signIn(loginAccount, password) {
    const employeeCode = String(loginAccount || "").trim();
    const email = await getLoginEmailByEmployeeCode(employeeCode);
    if (!email) {
      throw new Error("找不到這個工號，或尚未設定登入帳號");
    }
    const payload = await requestJson("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    });
    persistSession(payload);
    try {
      return await refreshAuthContext();
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  async function signOut() {
    if (currentSession?.access_token) {
      try {
        await requestJson("/auth/v1/logout", {
          method: "POST",
          auth: true,
          contentType: false
        });
      } catch {
        // ponytail: logout失敗時仍直接清本機session，避免使用者卡住；若要更嚴謹可再補重試。
      }
    }
    clearSession();
    return { session: null, profile: null };
  }

  async function changePassword(newPassword) {
    ensureSignedIn();
    await requestJson("/auth/v1/user", {
      method: "PUT",
      auth: true,
      body: JSON.stringify({
        password: String(newPassword || "")
      })
    });
    return { ok: true };
  }

  async function loadState() {
    try {
      const rows = await restSelect("schedule_documents", {
        select: "payload",
        filters: {
          id: `eq.${documentId}`
        },
        auth: Boolean(currentSession?.access_token)
      });
      return rows?.[0]?.payload || null;
    } catch (error) {
      if (!currentSession?.access_token && /permission denied|42501|401|403/i.test(error.message || "")) {
        // ponytail: 未開放匿名讀取時，先讓頁面用預設資料進得去；要顯示正式班表可執行 anon select SQL。
        return null;
      }
      throw error;
    }
  }

  async function saveState(state) {
    ensureManager();
    await restInsert("schedule_documents", [{ id: documentId, payload: state }], {
      auth: true,
      onConflict: "id",
      prefer: "resolution=merge-duplicates,return=minimal"
    });
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
    if (leaveRows.length) {
      await restInsert("leave_types", leaveRows, {
        auth: true,
        onConflict: "code",
        prefer: "resolution=merge-duplicates,return=minimal"
      });
    }

    const existingOvertime = await restSelect("overtime_types", {
      select: "id,name",
      auth: true
    });
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
      if (existing?.id) {
        await restUpdate("overtime_types", { id: `eq.${existing.id}` }, payload, {
          auth: true,
          prefer: "return=minimal"
        });
      } else {
        await restInsert("overtime_types", [payload], {
          auth: true,
          prefer: "return=minimal"
        });
      }
    }
  }

  async function syncMemberProfile(member, previousEmployeeCode = "") {
    ensureManager();
    return requestFunction("member-auth-admin", {
      action: "upsert_member",
      member: {
        employeeCode: String(member?.code || "").trim(),
        fullName: member?.name || "",
        role: member?.role === "manager" ? "manager" : "employee",
        hireDate: member?.hireDate || null,
        leaveDate: member?.leaveDate || null,
        payByDay: Boolean(member?.payByDay)
      },
      previousEmployeeCode: String(previousEmployeeCode || member?.code || "").trim(),
      defaultPassword: "0000"
    });
  }

  async function resetMemberPassword(employeeCode) {
    ensureManager();
    return requestFunction("member-auth-admin", {
      action: "reset_password",
      employeeCode: String(employeeCode || "").trim(),
      password: "0000"
    });
  }

  async function getLeaveTypeByCode(code) {
    const rows = await restSelect("leave_types", {
      select: "id,code,name",
      filters: {
        code: `eq.${code}`
      },
      auth: true
    });
    if (!rows?.length) {
      throw new Error("找不到對應的假別，請先同步假別設定");
    }
    return rows[0];
  }

  async function getOvertimeTypeByName(name) {
    const rows = await restSelect("overtime_types", {
      select: "id,name",
      filters: {
        name: `eq.${name}`
      },
      auth: true
    });
    if (!rows?.length) {
      throw new Error("找不到對應的加班別，請先同步加班設定");
    }
    return rows[0];
  }

  async function getDefaultOvertimeType() {
    const rows = await restSelect("overtime_types", {
      select: "id,name",
      order: "created_at.asc",
      limit: "1",
      auth: true
    });
    if (!rows?.length) {
      throw new Error("找不到可用的加班設定");
    }
    return rows[0];
  }

  async function createLeaveRequest(payload) {
    ensureSignedIn();
    const leaveType = await getLeaveTypeByCode(payload.leaveCode);
    await restInsert("leave_requests", [{
      member_id: currentSession.user.id,
      leave_type_id: leaveType.id,
      start_date: payload.startDate,
      end_date: payload.endDate,
      is_all_day: payload.isAllDay,
      start_time: payload.isAllDay ? null : payload.startTime,
      end_time: payload.isAllDay ? null : payload.endTime,
      reason: payload.reason || ""
    }], {
      auth: true,
      prefer: "return=minimal"
    });
    return { ok: true };
  }

  async function createOvertimeRequest(payload) {
    ensureSignedIn();
    const overtimeType = payload.overtimeName
      ? await getOvertimeTypeByName(payload.overtimeName).catch(() => getDefaultOvertimeType())
      : await getDefaultOvertimeType();
    await restInsert("overtime_requests", [{
      member_id: currentSession.user.id,
      overtime_type_id: overtimeType.id,
      work_date: payload.workDate,
      start_time: payload.startTime || null,
      end_time: payload.endTime || null,
      use_rest_1: Boolean(payload.useRest1),
      rest_1_start_time: payload.useRest1 ? payload.rest1StartTime || null : null,
      rest_1_end_time: payload.useRest1 ? payload.rest1EndTime || null : null,
      use_rest_2: Boolean(payload.useRest2),
      rest_2_start_time: payload.useRest2 ? payload.rest2StartTime || null : null,
      rest_2_end_time: payload.useRest2 ? payload.rest2EndTime || null : null,
      reason: payload.reason || ""
    }], {
      auth: true,
      prefer: "return=minimal"
    });
    return { ok: true };
  }

  async function fetchProfilesByIds(ids) {
    if (!ids.length) {
      return new Map();
    }
    const rows = await restSelect("profiles", {
      select: "id,employee_code,full_name,role",
      filters: {
        id: buildInFilter(ids)
      },
      auth: true
    });
    return new Map((rows || []).map((item) => [item.id, item]));
  }

  async function fetchLeaveTypesByIds(ids) {
    if (!ids.length) {
      return new Map();
    }
    const rows = await restSelect("leave_types", {
      select: "id,code,name",
      filters: {
        id: buildInFilter(ids)
      },
      auth: true
    });
    return new Map((rows || []).map((item) => [item.id, item]));
  }

  async function fetchOvertimeTypesByIds(ids) {
    if (!ids.length) {
      return new Map();
    }
    const rows = await restSelect("overtime_types", {
      select: "id,name",
      filters: {
        id: buildInFilter(ids)
      },
      auth: true
    });
    return new Map((rows || []).map((item) => [item.id, item]));
  }

  async function listLeaveRequests(options = {}) {
    ensureSignedIn();
    const filters = {};
    if (!options.manager) {
      filters.member_id = `eq.${currentSession.user.id}`;
    }
    const rows = await restSelect("leave_requests", {
      select: "*",
      filters,
      order: "created_at.desc",
      auth: true
    });

    const memberIds = [...new Set((rows || []).map((item) => item.member_id).filter(Boolean))];
    const leaveTypeIds = [...new Set((rows || []).map((item) => item.leave_type_id).filter(Boolean))];
    const profileMap = await fetchProfilesByIds(memberIds);
    const leaveTypeMap = await fetchLeaveTypesByIds(leaveTypeIds);

    return (rows || []).map((item) => ({
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
    const filters = {};
    if (!options.manager) {
      filters.member_id = `eq.${currentSession.user.id}`;
    }
    const rows = await restSelect("overtime_requests", {
      select: "*",
      filters,
      order: "created_at.desc",
      auth: true
    });

    const memberIds = [...new Set((rows || []).map((item) => item.member_id).filter(Boolean))];
    const overtimeTypeIds = [...new Set((rows || []).map((item) => item.overtime_type_id).filter(Boolean))];
    const profileMap = await fetchProfilesByIds(memberIds);
    const overtimeTypeMap = await fetchOvertimeTypesByIds(overtimeTypeIds);

    return (rows || []).map((item) => ({
      id: item.id,
      memberId: item.member_id,
      memberCode: profileMap.get(item.member_id)?.employee_code || "",
      memberName: profileMap.get(item.member_id)?.full_name || "",
      overtimeName: overtimeTypeMap.get(item.overtime_type_id)?.name || "",
      workDate: item.work_date,
      startTime: item.start_time || "",
      endTime: item.end_time || "",
      useRest1: Boolean(item.use_rest_1),
      rest1StartTime: item.rest_1_start_time || "",
      rest1EndTime: item.rest_1_end_time || "",
      useRest2: Boolean(item.use_rest_2),
      rest2StartTime: item.rest_2_start_time || "",
      rest2EndTime: item.rest_2_end_time || "",
      reason: item.reason || "",
      status: item.status,
      managerNote: item.manager_note || "",
      approvedAt: item.approved_at || "",
      createdAt: item.created_at
    }));
  }

  async function listPublicScheduleRequests() {
    const rows = await restRpc("get_public_schedule_requests", {}, { auth: false });
    const leaveRequests = [];
    const overtimeRequests = [];
    (rows || []).forEach((item) => {
      if (item.kind === "leave") {
        leaveRequests.push({
          id: item.request_id,
          memberCode: item.member_code || "",
          memberName: item.member_name || "",
          leaveCode: item.leave_code || "",
          leaveName: item.leave_name || "",
          startDate: item.start_date,
          endDate: item.end_date,
          isAllDay: item.is_all_day !== false,
          startTime: item.start_time || "",
          endTime: item.end_time || "",
          reason: "",
          status: item.status,
          managerNote: "",
          approvedAt: "",
          createdAt: item.created_at || ""
        });
        return;
      }
      if (item.kind === "overtime") {
        overtimeRequests.push({
          id: item.request_id,
          memberCode: item.member_code || "",
          memberName: item.member_name || "",
          overtimeName: item.overtime_name || "",
          workDate: item.work_date,
          startTime: item.start_time || "",
          endTime: item.end_time || "",
          useRest1: Boolean(item.use_rest_1),
          rest1StartTime: item.rest_1_start_time || "",
          rest1EndTime: item.rest_1_end_time || "",
          useRest2: Boolean(item.use_rest_2),
          rest2StartTime: item.rest_2_start_time || "",
          rest2EndTime: item.rest_2_end_time || "",
          reason: "",
          status: item.status,
          managerNote: "",
          approvedAt: "",
          createdAt: item.created_at || ""
        });
      }
    });
    return { leaveRequests, overtimeRequests };
  }

  async function updateLeaveRequest(payload) {
    ensureManager();
    const nextStatus = payload.status;
    await restUpdate("leave_requests", {
      id: `eq.${payload.id}`
    }, {
      status: nextStatus,
      manager_note: payload.managerNote || "",
      approved_by: nextStatus === "pending" ? null : currentSession.user.id,
      approved_at: nextStatus === "pending" ? null : new Date().toISOString()
    }, {
      auth: true,
      prefer: "return=minimal"
    });
    return { ok: true };
  }

  async function updateOvertimeRequest(payload) {
    ensureManager();
    const nextStatus = payload.status;
    await restUpdate("overtime_requests", {
      id: `eq.${payload.id}`
    }, {
      status: nextStatus,
      manager_note: payload.managerNote || "",
      approved_by: nextStatus === "pending" ? null : currentSession.user.id,
      approved_at: nextStatus === "pending" ? null : new Date().toISOString()
    }, {
      auth: true,
      prefer: "return=minimal"
    });
    return { ok: true };
  }

  async function updateOvertimeRequestDetails(payload) {
    ensureManager();
    await restUpdate("overtime_requests", {
      id: `eq.${payload.id}`
    }, {
      start_time: payload.startTime || null,
      end_time: payload.endTime || null,
      use_rest_1: Boolean(payload.useRest1),
      rest_1_start_time: payload.useRest1 ? payload.rest1StartTime || null : null,
      rest_1_end_time: payload.useRest1 ? payload.rest1EndTime || null : null,
      use_rest_2: Boolean(payload.useRest2),
      rest_2_start_time: payload.useRest2 ? payload.rest2StartTime || null : null,
      rest_2_end_time: payload.useRest2 ? payload.rest2EndTime || null : null
    }, {
      auth: true,
      prefer: "return=minimal"
    });
    return { ok: true };
  }

  async function deleteLeaveRequest(requestId) {
    ensureSignedIn();
    await restDelete("leave_requests", {
      id: `eq.${requestId}`,
      member_id: `eq.${currentSession.user.id}`,
      status: "eq.pending"
    }, {
      auth: true
    });
    return { ok: true };
  }

  async function deleteOvertimeRequest(requestId) {
    ensureSignedIn();
    await restDelete("overtime_requests", {
      id: `eq.${requestId}`,
      member_id: `eq.${currentSession.user.id}`,
      status: "eq.pending"
    }, {
      auth: true
    });
    return { ok: true };
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

  async function exportMembers(payload) {
    const blob = await exporter.workbookToBlob(await exporter.createMemberWorkbook(payload));
    const fileName = "人員資料.xlsx";
    downloadBlob(blob, fileName);
    return { canceled: false, filePath: fileName };
  }

  async function importMembers() {
    const file = await pickFile(".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    if (!file) {
      return { canceled: true, rows: [] };
    }
    return {
      canceled: false,
      rows: await exporter.parseMemberWorkbook(await file.arrayBuffer())
    };
  }

  window.schedulerApi = {
    initializeAuth,
    getAuthContext: () => ({ session: currentSession, profile: currentProfile }),
    signIn,
    signOut,
    changePassword,
    loadState,
    saveState,
    syncCatalogs,
    syncMemberProfile,
    resetMemberPassword,
    createLeaveRequest,
    createOvertimeRequest,
    listLeaveRequests,
    listOvertimeRequests,
    listPublicScheduleRequests,
    updateLeaveRequest,
    updateOvertimeRequest,
    updateOvertimeRequestDetails,
    deleteLeaveRequest,
    deleteOvertimeRequest,
    exportSapCsv,
    exportOvertime,
    exportLeave,
    exportMembers,
    importMembers,
    getAppInfo: async () => ({
      databasePath: `Supabase / schedule_documents / ${documentId}`,
      backend: "supabase-static",
      updatedAt: null
    }),
    showMessage: async (_title, message) => {
      window.alert(message);
    },
    confirmAction: async (_title, message) => window.confirm(message)
  };
})();
