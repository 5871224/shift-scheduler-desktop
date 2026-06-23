const COLORS = [
  { hex: "#378ADD", label: "藍色" },
  { hex: "#185FA5", label: "深藍" },
  { hex: "#23395B", label: "海軍藍" },
  { hex: "#355070", label: "鋼藍" },
  { hex: "#1D9E75", label: "綠色" },
  { hex: "#2F6F4F", label: "墨綠" },
  { hex: "#2A9D8F", label: "青綠" },
  { hex: "#3A5A40", label: "森林綠" },
  { hex: "#E24B4A", label: "紅色" },
  { hex: "#9C2F2F", label: "深紅" },
  { hex: "#A44A3F", label: "磚紅" },
  { hex: "#D85A30", label: "橘紅" },
  { hex: "#EF9F27", label: "橙色" },
  { hex: "#C46B2D", label: "土橘" },
  { hex: "#BA7517", label: "琥珀" },
  { hex: "#639922", label: "草綠" },
  { hex: "#7F77DD", label: "紫色" },
  { hex: "#5B4B8A", label: "深紫" },
  { hex: "#8F3B76", label: "莓紫" },
  { hex: "#6D597A", label: "灰紫" },
  { hex: "#D4537E", label: "粉紅" },
  { hex: "#5DCAA5", label: "薄荷" },
  { hex: "#888780", label: "石灰" }
];

const LEAVE_CATALOG = [
  { code: "0010", name: "事假" },
  { code: "0011", name: "病假" },
  { code: "0012", name: "婚假" },
  { code: "0013", name: "喪假" },
  { code: "0014", name: "公假" },
  { code: "0015", name: "公傷假" },
  { code: "0016", name: "產假" },
  { code: "0017", name: "特休假" },
  { code: "0018", name: "陪產(檢)假" },
  { code: "0019", name: "補休假" },
  { code: "0020", name: "產檢假" },
  { code: "0022", name: "無薪病假(時)" },
  { code: "0023", name: "彈性假" },
  { code: "0024", name: "特准半薪病假" },
  { code: "0026", name: "家庭照顧假" },
  { code: "0027", name: "半薪生理假" },
  { code: "0028", name: "全薪流產假" },
  { code: "0029", name: "半薪流產假" },
  { code: "0031", name: "無薪病假(天)" },
  { code: "0033", name: "特准事假" },
  { code: "0034", name: "刷卡遲到" },
  { code: "0035", name: "刷卡早退" },
  { code: "0036", name: "例假" },
  { code: "0038", name: "公傷假(天)" },
  { code: "0039", name: "曠職" },
  { code: "0040", name: "教育訓練假" },
  { code: "0041", name: "颱風豪雨假" },
  { code: "0042", name: "選舉假" },
  { code: "0043", name: "國定假日假" },
  { code: "0044", name: "颱風豪雨假(不扣薪)" },
  { code: "0045", name: "內部會議假" },
  { code: "0046", name: "原住民祭儀假" },
  { code: "0047", name: "休息日" },
  { code: "0048", name: "無薪生理假" },
  { code: "0049", name: "防疫假(有薪)" },
  { code: "0050", name: "防疫假(無薪)" },
  { code: "0051", name: "特別補休假" },
  { code: "0052", name: "遲到/早退(SK)" },
  { code: "0053", name: "婚假(天)(SK)" },
  { code: "0054", name: "公傷假(半薪)(時)(SK)" },
  { code: "0090", name: "系統使用的假" },
  { code: "0091", name: "家庭照顧假(扣事假用)" },
  { code: "0092", name: "半薪生理假(扣病假用)" }
];

const LEGACY_LEAVE_NAME_MAP = {
  "特休": "0017",
  "病假": "0011",
  "事假": "0010",
  "例假": "0036",
  "休假": "0047"
};

const DEFAULT_STATE = {
  role: "manager",
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  selected: { type: null, id: null },
  deptFilter: "all",
  tableDeptScopeFilter: "all",
  departments: [
    { id: "d1", name: "門市", startDate: "", endDate: "" },
    { id: "d2", name: "行政", startDate: "", endDate: "" }
  ],
  positions: [
    { id: "p1", code: "MGR", name: "主管" },
    { id: "p2", code: "STF", name: "員工" }
  ],
  members: [
    { id: "m1", code: "A001", name: "王小美", deptId: "d1", positionId: "p1", proxyMemberId: "m2", hireDate: "2025-01-01", leaveDate: "", payByDay: false, role: "manager" },
    { id: "m2", code: "A002", name: "林佳怡", deptId: "d1", positionId: "p2", proxyMemberId: "m1", hireDate: "2025-01-01", leaveDate: "", payByDay: false, role: "employee" },
    { id: "m3", code: "A003", name: "陳建宏", deptId: "d1", positionId: "p2", proxyMemberId: "", hireDate: "2025-01-01", leaveDate: "", payByDay: false, role: "employee" },
    { id: "m4", code: "B001", name: "吳佩珊", deptId: "d2", positionId: "p1", proxyMemberId: "m5", hireDate: "2025-01-01", leaveDate: "", payByDay: false, role: "manager" },
    { id: "m5", code: "B002", name: "張志豪", deptId: "d2", positionId: "p2", proxyMemberId: "m4", hireDate: "2025-01-01", leaveDate: "", payByDay: false, role: "employee" }
  ],
  shifts: [
      {
        id: "s1",
        name: "早班",
        color: "#378ADD",
        startTime: "08:00",
        endTime: "17:00",
        applicableDeptIds: ["d1"],
        positionRequirements: [{ positionId: "p1", count: 1 }]
      },
    {
        id: "s2",
        name: "中班",
        color: "#1D9E75",
        startTime: "12:00",
        endTime: "21:00",
        applicableDeptIds: ["d1"],
        positionRequirements: [{ positionId: "p2", count: 1 }]
      },
    {
        id: "s3",
        name: "晚班",
        color: "#E24B4A",
        startTime: "16:00",
        endTime: "23:00",
        applicableDeptIds: ["d2"],
        positionRequirements: []
      }
  ],
  leaves: [
    { id: "l1", code: "0017", name: "特休假", color: "#EF9F27", defaultAllDay: false, requireReason: false },
    { id: "l2", code: "0011", name: "病假", color: "#D4537E", defaultAllDay: false, requireReason: false },
    { id: "l3", code: "0010", name: "事假", color: "#888780", defaultAllDay: false, requireReason: false },
    { id: "l4", code: "0047", name: "休息日", color: "#7F77DD", defaultAllDay: false, requireReason: false },
    { id: "l5", code: "0036", name: "例假", color: "#639922", defaultAllDay: false, requireReason: false }
  ],
  overtime: [
    {
      id: "o1",
      name: "加班",
      color: "#D85A30",
      startTime: "",
      endTime: "",
      useRest1: false,
      rest1StartTime: "",
      rest1EndTime: "",
      useRest2: false,
      rest2StartTime: "",
      rest2EndTime: ""
    }
  ],
  holidays: [
    { id: "h1", date: "2026-01-01", name: "元旦" }
  ],
  rules: {
    maxConsecutiveWorkDays: 6,
    forbidProxyLeaveConflict: true,
    requireEmploymentWindow: true
  },
  schedule: {}
};

const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_LABELS = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];
const REQUEST_STATUS_LABELS = {
  pending: "待審核",
  approved: "已核准",
  rejected: "已退回",
  cancelled: "已取消"
};

let state = createDefaultState();
let modalColor = COLORS[0].hex;
let modalContext = {};
let saveTimer = null;
let isSaving = false;
let latestSaveStatus = "";
let appInfo = null;
let dragMemberId = "";
let leaveTooltipTimer = null;
let coreActionsOpen = false;
let currentSession = null;
let currentProfile = null;
let currentMember = null;
let leaveRequestRecords = [];
let overtimeRequestRecords = [];
let requestOverlaySourceLoaded = false;
let requestReviewFilters = {
  leave: { memberCode: "", date: "", status: "" },
  overtime: { memberCode: "", date: "", status: "" }
};
let memberSettingsFilters = {
  name: "",
  employment: "active"
};
let authErrorMessage = "";
let authPromptMessage = "";
let authModalOpen = false;
let eventsBound = false;
let dragSortItemId = "";
let dragSortCategory = "";
let toolbarCollapsed = false;
let toolbarCollapseInitialized = false;
let measureTextContext = null;

function renderStickyTableHeader(days) {
  const container = document.getElementById("tableStickyHeaderDays");
  const stickyHeader = document.getElementById("tableStickyHeader");
  if (!container || !stickyHeader) {
    return;
  }
  renderStickyHeaderTitleCells();
  const today = new Date();
  const isToday = (day) => (
    today.getFullYear() === state.year &&
    today.getMonth() === state.month &&
    today.getDate() === day
  );
  const cells = [];
  for (let day = 1; day <= days; day += 1) {
    const weekday = weekdayOf(day);
    const cls = weekday === 0 ? "sun" : weekday === 6 ? "sat" : "";
    const weekStripeClass = getWeekStripeClass(day);
    const weekBoundaryClass = getWeekBoundaryClass(day, days);
    cells.push(
      `<div class="table-sticky-cell table-sticky-cell-day ${cls} ${weekStripeClass} ${weekBoundaryClass} ${isToday(day) ? "today" : ""}">${day}<span>${WEEKDAY_LABELS[weekday]}</span></div>`
    );
  }
  container.innerHTML = cells.join("");
  requestAnimationFrame(() => {
    syncStickyHeaderLayout();
    syncStickyHeaderScroll();
  });
}

function renderStickyHeaderTitleCells() {
  const deptCell = document.querySelector(".table-sticky-cell-dept");
  const personCell = document.querySelector(".table-sticky-cell-person");
  if (!deptCell || !personCell) {
    return;
  }
  const renderCell = (label, dataAttr) => `
    <div class="table-sticky-cell-title">
      <span class="table-sticky-cell-label">${label}</span>
      ${isManager() ? renderActionIconButton("edit", `${dataAttr}=\"true\"`, "table-header-settings-btn") : ""}
    </div>
  `;
  deptCell.innerHTML = renderCell("單位", "data-open-department-settings");
  personCell.innerHTML = renderCell("人員", "data-open-member-settings");
}

function syncStickyHeaderLayout() {
  const table = document.getElementById("mainTable");
  const deptCell = document.querySelector(".table-sticky-cell-dept");
  const personCell = document.querySelector(".table-sticky-cell-person");
  const dayCells = Array.from(document.querySelectorAll(".table-sticky-cell-day"));
  const headerCells = Array.from(table?.querySelectorAll("thead th") || []);
  if (!deptCell || !personCell || headerCells.length < 2) {
    return;
  }

  const setWidth = (element, width) => {
    const px = `${Math.round(width)}px`;
    element.style.width = px;
    element.style.minWidth = px;
    element.style.maxWidth = px;
  };

  setWidth(deptCell, headerCells[0].getBoundingClientRect().width);
  setWidth(personCell, headerCells[1].getBoundingClientRect().width);
  dayCells.forEach((cell, index) => {
    const headerCell = headerCells[index + 2];
    if (!headerCell) {
      return;
    }
    setWidth(cell, headerCell.getBoundingClientRect().width);
  });
}

function syncStickyHeaderScroll() {
  const tableWrap = document.getElementById("tableWrap");
  const container = document.getElementById("tableStickyHeaderDays");
  if (!tableWrap || !container) {
    return;
  }
  container.style.transform = `translateX(${-tableWrap.scrollLeft}px)`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultState() {
  return deepClone(DEFAULT_STATE);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function uid(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function getMeasureTextContext() {
  if (!measureTextContext) {
    measureTextContext = document.createElement("canvas").getContext("2d");
  }
  return measureTextContext;
}

function measureTextWidth(text, computedStyle) {
  const context = getMeasureTextContext();
  if (!context) {
    return String(text || "").length * 16;
  }
  context.font = [
    computedStyle.fontStyle,
    computedStyle.fontVariant,
    computedStyle.fontWeight,
    computedStyle.fontSize,
    computedStyle.fontFamily
  ].filter(Boolean).join(" ");
  return context.measureText(String(text || "")).width;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncScheduleColumnWidths() {
  const root = document.documentElement;
  const deptSample = document.querySelector(".dept-col");
  const personSample = document.querySelector(".person-col .member-main") || document.querySelector(".person-col");
  const tableWrap = document.getElementById("tableWrap");
  if (!root || !deptSample || !personSample) {
    return;
  }

  const deptStyle = getComputedStyle(deptSample);
  const personStyle = getComputedStyle(personSample);
  const headerStyle = getComputedStyle(document.querySelector(".table-sticky-cell") || deptSample);
  const visibleGroups = getVisibleTableGroups();
  const visibleDepartments = visibleGroups.map(({ department }) => department.name);
  const visibleMembers = visibleGroups.flatMap(({ members }) => members.map((member) => member.name));
  const managerButtonAllowance = isManager() ? 28 : 0;
  const deptContentWidth = visibleDepartments.reduce((max, text) => Math.max(max, measureTextWidth(text, deptStyle)), 0);
  const personContentWidth = visibleMembers.reduce((max, text) => Math.max(max, measureTextWidth(text, personStyle)), 0);
  const deptHeaderWidth = measureTextWidth("單位", headerStyle) + managerButtonAllowance;
  const personHeaderWidth = measureTextWidth("人員", headerStyle) + managerButtonAllowance;
  const deptWidth = clamp(Math.ceil(Math.max(deptContentWidth, deptHeaderWidth) + 18), 52, 88);
  const personWidth = clamp(Math.ceil(Math.max(personContentWidth, personHeaderWidth) + 18), 64, 118);
  const days = daysInMonth(state.year, state.month);
  const availableDayWidth = tableWrap
    ? Math.floor((tableWrap.clientWidth - deptWidth - personWidth - 2) / Math.max(days, 1))
    : 0;
  const dayWidth = clamp(availableDayWidth || 37, 33, 50);
  root.style.setProperty("--dept-col-width", `${deptWidth}px`);
  root.style.setProperty("--person-col-width", `${personWidth}px`);
  root.style.setProperty("--day-col-width", `${dayWidth}px`);
}

function scheduleKey(memberId, year, month, day) {
  return `${memberId}_${year}_${month}_${day}`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function weekdayOf(day) {
  return new Date(state.year, state.month, day).getDay();
}

function getWeekIndexForDay(day) {
  return Math.floor((day + weekdayOf(1) - 1) / 7);
}

function getWeekStripeClass(day) {
  return getWeekIndexForDay(day) % 2 === 1 ? "week-alt" : "";
}

function getWeekBoundaryClass(day, daysInCurrentMonth) {
  const classes = [];
  const weekday = weekdayOf(day);
  if (day === 1 || weekday === 0) {
    classes.push("week-boundary-start");
  }
  if (day === daysInCurrentMonth || weekday === 6) {
    classes.push("week-boundary-end");
  }
  return classes.join(" ");
}

function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function resetVisibleMonthToToday() {
  const today = new Date();
  state.year = today.getFullYear();
  state.month = today.getMonth();
}

function isMemberCurrentlyActive(member) {
  const today = new Date();
  const todayString = toDateString(today.getFullYear(), today.getMonth(), today.getDate());
  if (member.hireDate && member.hireDate > todayString) {
    return false;
  }
  return !member.leaveDate || member.leaveDate >= todayString;
}

function toDateObject(dateString) {
  const [year, month, day] = String(dateString || "").split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function enumerateDateRange(startDate, endDate) {
  const start = toDateObject(startDate);
  const end = toDateObject(endDate);
  if (!start || !end || start > end) {
    return [];
  }
  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toDateString(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function normalizeTimeText(value) {
  const match = String(value ?? "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) {
    return "";
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return "";
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toMinutes(value) {
  const normalized = normalizeTimeText(value);
  if (!normalized) {
    return null;
  }
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

function isValidTimeRange(start, end) {
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);
  return startMinutes !== null && endMinutes !== null && startMinutes < endMinutes;
}

function isValidDateRange(start, end) {
  return Boolean(start && end && start < end);
}

function reportValidationError(message) {
  setSaveStatus(message);
  if (window.schedulerApi?.showMessage) {
    window.schedulerApi.showMessage("提示", message);
    return;
  }
  window.alert(message);
}

function syncCoreActionsMenu() {
  const menu = document.getElementById("coreActionsMenu");
  const toggle = document.getElementById("coreActionsToggle");
  if (!menu || !toggle) {
    return;
  }
  menu.classList.toggle("open", coreActionsOpen);
  menu.setAttribute("aria-hidden", coreActionsOpen ? "false" : "true");
  toggle.setAttribute("aria-expanded", coreActionsOpen ? "true" : "false");
}

function toggleCoreActionsMenu(force) {
  coreActionsOpen = typeof force === "boolean" ? force : !coreActionsOpen;
  syncCoreActionsMenu();
}

function closeCoreActionsMenu() {
  if (!coreActionsOpen) {
    return;
  }
  coreActionsOpen = false;
  syncCoreActionsMenu();
}

function showInfoMessage(message) {
  if (window.schedulerApi?.showMessage) {
    window.schedulerApi.showMessage("提示", message);
    return;
  }
  window.alert(message);
}

function formatSchedulerError(error, fallback = "操作失敗") {
  const message = String(error?.message || error || "").trim();
  if (
    message.includes("Could not find the 'end_time' column of 'overtime_requests'") ||
    message.includes("Could not find the 'start_time' column of 'overtime_requests'")
  ) {
    return "加班資料庫尚未套用新版欄位，請先執行 supabase/008_overtime_request_details.sql。";
  }
  return message || fallback;
}

async function confirmAction(message) {
  if (window.schedulerApi?.confirmAction) {
    return window.schedulerApi.confirmAction("確認", message);
  }
  return window.confirm(message);
}

function buildTimeOptions(selectedValue, values) {
  const options = ['<option value=""></option>'];
  values.forEach((value) => {
    options.push(`<option value="${value}" ${value === selectedValue ? "selected" : ""}>${value}</option>`);
  });
  return options.join("");
}

function splitTimeValue(value) {
  const normalized = normalizeTimeText(value);
  if (!normalized) {
    return ["", ""];
  }
  return normalized.split(":");
}

function timeInputMarkup(id, value, disabled = false) {
  const [hour, minute] = splitTimeValue(value);
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  const minutes = ["00", "10", "20", "30", "40", "50"];
  return `
    <div class="time-picker" data-time-field="${id}">
      <select id="${id}Hour" ${disabled ? "disabled" : ""}>
        ${buildTimeOptions(hour, hours)}
      </select>
      <span class="time-picker-separator">:</span>
      <select id="${id}Minute" ${disabled ? "disabled" : ""}>
        ${buildTimeOptions(minute, minutes)}
      </select>
    </div>
  `;
}

function readTimeInputValue(id) {
  const hour = document.getElementById(`${id}Hour`)?.value || "";
  const minute = document.getElementById(`${id}Minute`)?.value || "";
  if (!hour || !minute) {
    return "";
  }
  return normalizeTimeText(`${hour}:${minute}`);
}

function setTimeInputDisabled(id, disabled) {
  const hourInput = document.getElementById(`${id}Hour`);
  const minuteInput = document.getElementById(`${id}Minute`);
  if (hourInput) {
    hourInput.disabled = disabled;
  }
  if (minuteInput) {
    minuteInput.disabled = disabled;
  }
}

function isMemberActiveOnDate(member, year, month, day) {
  const date = toDateString(year, month, day);
  if (member.hireDate && date < member.hireDate) {
    return false;
  }
  if (member.leaveDate && date > member.leaveDate) {
    return false;
  }
  return true;
}

function doesDateRangeOverlapMonth(startDate, endDate, year, month) {
  const monthStart = toDateString(year, month, 1);
  const monthEnd = toDateString(year, month, daysInMonth(year, month));
  if (startDate && startDate > monthEnd) {
    return false;
  }
  if (endDate && endDate < monthStart) {
    return false;
  }
  return true;
}

function isDepartmentActiveInMonth(department, year, month) {
  return doesDateRangeOverlapMonth(department?.startDate || "", department?.endDate || "", year, month);
}

function isMemberActiveInMonth(member, year, month) {
  return doesDateRangeOverlapMonth(member?.hireDate || "", member?.leaveDate || "", year, month);
}

function textColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#2b241c" : "#ffffff";
}

function sanitizeDepartment(department, fallbackIndex) {
  return {
    id: department?.id || uid(`d${fallbackIndex}`),
    name: department?.name || `單位 ${fallbackIndex + 1}`,
    startDate: department?.startDate || "",
    endDate: department?.endDate || ""
  };
}

function sanitizePosition(position, fallbackIndex) {
  return {
    id: position?.id || uid(`p${fallbackIndex}`),
    code: position?.code || `P${String(fallbackIndex + 1).padStart(2, "0")}`,
    name: position?.name || `職位 ${fallbackIndex + 1}`
  };
}

function sanitizeMember(member, fallbackIndex, merged) {
  return {
    id: member?.id || uid(`m${fallbackIndex}`),
    code: member?.code || `M${String(fallbackIndex + 1).padStart(3, "0")}`,
    name: member?.name || `人員 ${fallbackIndex + 1}`,
    deptId: member?.deptId && merged.departments.some((department) => department.id === member.deptId)
      ? member.deptId
      : merged.departments[0]?.id || "",
    positionId: member?.positionId && merged.positions.some((position) => position.id === member.positionId)
      ? member.positionId
      : merged.positions[0]?.id || "",
    proxyMemberId: member?.proxyMemberId || "",
    hireDate: member?.hireDate || "",
    leaveDate: member?.leaveDate || "",
    payByDay: Boolean(member?.payByDay),
    role: member?.role === "manager" ? "manager" : "employee"
  };
}

function sanitizeShift(shift, fallbackIndex, merged) {
  const applicableDeptIds = Array.isArray(shift?.applicableDeptIds)
    ? shift.applicableDeptIds.filter((deptId) => merged.departments.some((department) => department.id === deptId))
    : [];
  const applicableDeptId = shift?.applicableDeptId && merged.departments.some((department) => department.id === shift.applicableDeptId)
    ? shift.applicableDeptId
    : applicableDeptIds[0] || merged.departments[0]?.id || "";
    return {
      id: shift?.id || uid(`s${fallbackIndex}`),
      name: shift?.name || `班別 ${fallbackIndex + 1}`,
      color: shift?.color || COLORS[fallbackIndex % COLORS.length].hex,
      startTime: shift?.startTime || "",
      endTime: shift?.endTime || "",
      hiddenFromToolbar: Boolean(shift?.hiddenFromToolbar),
      applicableDeptIds: applicableDeptId ? [applicableDeptId] : [],
      positionRequirements: Array.isArray(shift?.positionRequirements)
        ? shift.positionRequirements
        .filter((item) => item && item.positionId)
        .map((item) => ({ positionId: item.positionId, count: Math.max(0, Number(item.count) || 0) }))
      : []
  };
}

function sanitizeNamedColorItem(item, fallbackIndex, prefix, label) {
  return {
    id: item?.id || uid(`${prefix}${fallbackIndex}`),
    name: item?.name || `${label} ${fallbackIndex + 1}`,
    color: item?.color || COLORS[fallbackIndex % COLORS.length].hex
  };
}

function resolveLeaveCatalogEntry(item, fallbackIndex) {
  const requestedCode = item?.code || LEGACY_LEAVE_NAME_MAP[item?.name] || "";
  const byCode = LEAVE_CATALOG.find((entry) => entry.code === requestedCode);
  if (byCode) {
    return byCode;
  }
  const byName = LEAVE_CATALOG.find((entry) => entry.name === item?.name);
  if (byName) {
    return byName;
  }
  return LEAVE_CATALOG[fallbackIndex % LEAVE_CATALOG.length];
}

function sanitizeLeaveItem(item, fallbackIndex) {
  const catalogEntry = resolveLeaveCatalogEntry(item, fallbackIndex);
  return {
    id: item?.id || uid(`l${fallbackIndex}`),
    code: catalogEntry.code,
    name: catalogEntry.name,
    color: item?.color || COLORS[fallbackIndex % COLORS.length].hex,
    hiddenFromToolbar: Boolean(item?.hiddenFromToolbar),
    defaultAllDay: Boolean(item?.defaultAllDay),
    requireReason: Boolean(item?.requireReason)
  };
}

function sanitizeOvertimeItem(item, fallbackIndex) {
    return {
      id: item?.id || uid(`o${fallbackIndex}`),
      name: "加班",
      color: item?.color || COLORS[fallbackIndex % COLORS.length].hex,
      hiddenFromToolbar: Boolean(item?.hiddenFromToolbar),
      startTime: item?.startTime || "",
      endTime: item?.endTime || "",
      useRest1: Boolean(item?.useRest1),
      rest1StartTime: item?.rest1StartTime || "",
      rest1EndTime: item?.rest1EndTime || "",
      useRest2: Boolean(item?.useRest2),
      rest2StartTime: item?.rest2StartTime || "",
      rest2EndTime: item?.rest2EndTime || ""
    };
  }

function sanitizeHoliday(holiday, fallbackIndex) {
  return {
    id: holiday?.id || uid(`h${fallbackIndex}`),
    date: holiday?.date || "",
    name: holiday?.name || `國定假日 ${fallbackIndex + 1}`
  };
}

function cleanupScheduleEntries(schedule, merged) {
  const validShiftIds = new Set(merged.shifts.map((shift) => shift.id));
  const validLeaveIds = new Set(merged.leaves.map((leave) => leave.id));
  const validOvertimeIds = new Set(merged.overtime.map((item) => item.id));
  const fallbackOvertimeId = merged.overtime[0]?.id || null;
  const nextSchedule = {};

  Object.entries(schedule || {}).forEach(([key, slot]) => {
    const hasOvertimeMeta = slot?.overtimeMeta && typeof slot.overtimeMeta === "object";
    const overtimeId = validOvertimeIds.has(slot?.overtime)
      ? slot.overtime
      : hasOvertimeMeta
        ? fallbackOvertimeId
        : null;
    const nextSlot = {
      shift: validShiftIds.has(slot?.shift) ? slot.shift : null,
      leave: validLeaveIds.has(slot?.leave) ? slot.leave : null,
      overtime: overtimeId,
      leaveRequestId: validLeaveIds.has(slot?.leave) ? slot?.leaveRequestId || null : null,
      overtimeRequestId: overtimeId ? slot?.overtimeRequestId || null : null,
      leaveMeta: validLeaveIds.has(slot?.leave) && slot?.leaveMeta && typeof slot.leaveMeta === "object"
        ? {
          allDay: slot.leaveMeta.allDay !== false,
          startTime: slot.leaveMeta.allDay === false ? (slot.leaveMeta.startTime || "") : "",
          endTime: slot.leaveMeta.allDay === false ? (slot.leaveMeta.endTime || "") : "",
          reasonEnabled: Boolean(slot.leaveMeta.reasonEnabled),
          reason: slot.leaveMeta.reasonEnabled ? (slot.leaveMeta.reason || "") : "",
          requestStatus: slot.leaveMeta.requestStatus || "approved"
        }
        : null,
      overtimeMeta: overtimeId && hasOvertimeMeta
        ? {
          startTime: slot.overtimeMeta.startTime || "",
          endTime: slot.overtimeMeta.endTime || "",
          useRest1: Boolean(slot.overtimeMeta.useRest1),
          rest1StartTime: slot.overtimeMeta.useRest1 ? (slot.overtimeMeta.rest1StartTime || "") : "",
          rest1EndTime: slot.overtimeMeta.useRest1 ? (slot.overtimeMeta.rest1EndTime || "") : "",
          useRest2: Boolean(slot.overtimeMeta.useRest2),
          rest2StartTime: slot.overtimeMeta.useRest2 ? (slot.overtimeMeta.rest2StartTime || "") : "",
          rest2EndTime: slot.overtimeMeta.useRest2 ? (slot.overtimeMeta.rest2EndTime || "") : "",
          requestStatus: slot.overtimeMeta.requestStatus || "approved",
          reason: slot.overtimeMeta.reason || ""
        }
        : null
    };
    if (nextSlot.shift || nextSlot.leave || nextSlot.overtime) {
      nextSchedule[key] = nextSlot;
    }
  });

  return nextSchedule;
}

function mergeDefaultLeaves(leaves) {
  const existingCodes = new Set(leaves.map((leave) => leave.code || LEGACY_LEAVE_NAME_MAP[leave.name] || leave.name));
  const missingDefaults = DEFAULT_STATE.leaves
    .filter((leave) => !existingCodes.has(leave.code))
    .map((leave) => ({ ...leave }));
  return [...leaves, ...missingDefaults];
}

function normalizeState(payload) {
  if (!payload || typeof payload !== "object") {
    return createDefaultState();
  }

  const merged = createDefaultState();
  merged.role = "manager";
  merged.year = Number.isInteger(payload.year) ? payload.year : merged.year;
  merged.month = Number.isInteger(payload.month) ? payload.month : merged.month;
  merged.selected = payload.selected && typeof payload.selected === "object"
    ? { type: payload.selected.type ?? null, id: payload.selected.id ?? null }
    : merged.selected;
  merged.departments = Array.isArray(payload.departments)
    ? payload.departments.map((department, index) => sanitizeDepartment(department, index))
    : merged.departments;
  merged.positions = Array.isArray(payload.positions) && payload.positions.length
    ? payload.positions.map((position, index) => sanitizePosition(position, index))
    : merged.positions;
  merged.members = Array.isArray(payload.members)
    ? payload.members.map((member, index) => sanitizeMember(member, index, merged))
    : merged.members;
  merged.shifts = Array.isArray(payload.shifts) && payload.shifts.length
    ? payload.shifts.map((shift, index) => sanitizeShift(shift, index, merged))
    : merged.shifts;
  merged.shifts = merged.shifts.filter((shift) => shift.name !== "休息");
  merged.leaves = Array.isArray(payload.leaves) && payload.leaves.length
    ? payload.leaves.map((item, index) => sanitizeLeaveItem(item, index))
    : merged.leaves;
  merged.leaves = mergeDefaultLeaves(merged.leaves);
  merged.overtime = Array.isArray(payload.overtime) && payload.overtime.length
    ? payload.overtime.map((item, index) => sanitizeOvertimeItem(item, index))
    : merged.overtime;
  merged.overtime = merged.overtime.length ? [merged.overtime[0]] : [{ ...DEFAULT_STATE.overtime[0] }];
  merged.holidays = Array.isArray(payload.holidays)
    ? payload.holidays.map((holiday, index) => sanitizeHoliday(holiday, index)).filter((holiday) => holiday.date)
    : merged.holidays;
  merged.rules = {
    maxConsecutiveWorkDays: Math.max(1, Number(payload.rules?.maxConsecutiveWorkDays) || merged.rules.maxConsecutiveWorkDays),
    forbidProxyLeaveConflict: payload.rules?.forbidProxyLeaveConflict !== false,
    requireEmploymentWindow: payload.rules?.requireEmploymentWindow !== false
  };
  merged.deptFilter = typeof payload.deptFilter === "string" ? payload.deptFilter : merged.deptFilter;
  merged.tableDeptScopeFilter = typeof payload.tableDeptScopeFilter === "string" ? payload.tableDeptScopeFilter : merged.tableDeptScopeFilter;
  merged.schedule = cleanupScheduleEntries(payload.schedule && typeof payload.schedule === "object" ? payload.schedule : merged.schedule, merged);

  if (!merged.departments.some((department) => department.id === merged.deptFilter)) {
    merged.deptFilter = "all";
  }
  if (!merged.departments.some((department) => department.id === merged.tableDeptScopeFilter)) {
    merged.tableDeptScopeFilter = "all";
  }

  return merged;
}

function setSaveStatus(message, saving = false) {
  latestSaveStatus = message;
  isSaving = saving;
}

function getDepartmentName(deptId) {
  return state.departments.find((department) => department.id === deptId)?.name || "未指定單位";
}

function getPositionName(positionId) {
  return state.positions.find((position) => position.id === positionId)?.name || "未指定職位";
}

function getSalaryTypeLabel(member) {
  return member?.payByDay ? "按日計薪" : "月薪";
}

function getDepartmentSummary(deptIds) {
  if (!Array.isArray(deptIds) || !deptIds.length) {
    return "全部單位";
  }
  return getDepartmentName(deptIds[0]);
}

function shiftAllowsDepartment(shift, deptId) {
  return !Array.isArray(shift?.applicableDeptIds) || !shift.applicableDeptIds.length || shift.applicableDeptIds.includes(deptId);
}

function getItemList(category) {
  if (category === "shift") return state.shifts;
  if (category === "leave") return state.leaves;
  return state.overtime;
}

function getItem(category, id) {
  return getItemList(category).find((item) => item.id === id);
}

function getSlot(memberId, day) {
  return state.schedule[scheduleKey(memberId, state.year, state.month, day)] || null;
}

function getLeaveLabel(leave) {
  if (!leave) {
    return "";
  }
  return leave.code ? `${leave.code} ${leave.name}` : leave.name;
}

function isLoggedIn() {
  return Boolean(currentSession?.user);
}

function isManager() {
  return currentProfile?.role === "manager";
}

function canEditSchedule() {
  return isManager();
}

function getCurrentProfileName() {
  return currentProfile?.full_name || currentSession?.user?.email || "";
}

function getRequestActor() {
  if (currentMember) {
    return {
      code: currentMember.code || currentProfile?.employee_code || "",
      name: currentMember.name || getCurrentProfileName()
    };
  }
  if (currentProfile) {
    return {
      code: currentProfile.employee_code || "",
      name: currentProfile.full_name || getCurrentProfileName()
    };
  }
  return null;
}

function getCurrentRoleLabel() {
  return isManager() ? "主管" : "員工";
}

function resolveCurrentMember() {
  if (!currentProfile?.employee_code) {
    return null;
  }
  return state.members.find((member) => member.code === currentProfile.employee_code) || null;
}

function getRequestStatusLabel(status) {
  return REQUEST_STATUS_LABELS[status] || status;
}

function formatRequestDateText(startDate, endDate) {
  if (!startDate) {
    return "";
  }
  return startDate === endDate || !endDate ? startDate : `${startDate} ~ ${endDate}`;
}

function formatRequestTimeText(record) {
  if (record.isAllDay !== false) {
    return "整天";
  }
  return `${record.startTime || "--:--"} - ${record.endTime || "--:--"}`;
}

function formatOvertimeTimeText(record) {
  return `${record.startTime || "--:--"} - ${record.endTime || "--:--"}`;
}

function formatOvertimeRestLines(record) {
  const lines = [];
  if (record.useRest1) {
    lines.push(`休息1：${record.rest1StartTime || "--:--"} - ${record.rest1EndTime || "--:--"}`);
  }
  if (record.useRest2) {
    lines.push(`休息2：${record.rest2StartTime || "--:--"} - ${record.rest2EndTime || "--:--"}`);
  }
  return lines;
}

function getAllowedLeaveRequestItems() {
  return state.leaves.filter((item) => !["0036", "0047"].includes(item.code));
}

function getRequestStatusOptions(selectedValue) {
  return ["pending", "approved", "rejected"].map((status) => (
    `<option value="${status}" ${status === selectedValue ? "selected" : ""}>${escapeHtml(getRequestStatusLabel(status))}</option>`
  )).join("");
}

function openSignInDialog(message = "") {
  authPromptMessage = message;
  authErrorMessage = "";
  authModalOpen = true;
  renderAuthGate();
}

function closeSignInDialog() {
  authPromptMessage = "";
  authErrorMessage = "";
  authModalOpen = false;
  renderAuthGate();
}

function promptManagerAccess(message) {
  if (!isLoggedIn()) {
    openSignInDialog(message || "此功能需先登入主管帳號");
    return false;
  }
  if (!isManager()) {
    showInfoMessage("此功能限主管使用");
    return false;
  }
  return true;
}

function shouldDefaultCollapseToolbar() {
  return window.innerWidth <= 960;
}

function syncToolbarCollapseUi() {
  const toolbarCard = document.querySelector(".toolbar-floating-card");
  const toggle = document.getElementById("toolbarCollapseToggle");
  if (!toolbarCard || !toggle) {
    return;
  }
  toolbarCard.classList.toggle("toolbar-floating-card-collapsed", toolbarCollapsed);
  toggle.setAttribute("aria-expanded", toolbarCollapsed ? "false" : "true");
  toggle.setAttribute("aria-label", toolbarCollapsed ? "展開工具列" : "收合工具列");
  toggle.setAttribute("title", toolbarCollapsed ? "展開工具列" : "收合工具列");
  toggle.innerHTML = toolbarCollapsed
    ? `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6"></path>
      </svg>
    `
    : `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 15l6-6 6 6"></path>
      </svg>
    `;
}

function initializeToolbarCollapse() {
  if (toolbarCollapseInitialized) {
    return;
  }
  toolbarCollapsed = shouldDefaultCollapseToolbar();
  toolbarCollapseInitialized = true;
}

function toggleToolbarCollapse() {
  toolbarCollapsed = !toolbarCollapsed;
  syncToolbarCollapseUi();
}

function syncRoleUi() {
  const toolbarCard = document.querySelector(".toolbar-floating-card");
  initializeToolbarCollapse();
  const toolbarGrid = document.getElementById("toolbarGrid");
  if (toolbarGrid) {
    toolbarGrid.style.display = isManager() ? "grid" : "none";
  }
  if (toolbarCard) {
    toolbarCard.classList.toggle("toolbar-floating-card-compact", !isManager());
  }
  syncToolbarCollapseUi();
  const coreActionsShell = document.getElementById("coreActionsShell");
  if (coreActionsShell) {
    coreActionsShell.style.display = isManager() ? "" : "none";
  }
  const managerOnlyIds = [
    "deptSettingsButton",
    "shiftSettingsButton",
    "leaveSettingsButton",
    "overtimeSettingsButton",
    "leaveApprovalButton",
    "overtimeApprovalButton"
  ];
  managerOnlyIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    element.style.display = isManager() ? "" : "none";
    element.disabled = !isManager();
  });

  ["shiftChips", "leaveChips", "overtimeChips"].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    element.classList.toggle("chips-readonly", !canEditSchedule());
  });

}

function renderAuthBar() {
  const container = document.getElementById("authBar");
  const signOutSlot = document.getElementById("signOutSlot");
  if (!container) {
    return;
  }
  if (signOutSlot) {
    signOutSlot.innerHTML = "";
  }
  if (!isLoggedIn()) {
    container.innerHTML = `
      <button class="ghost-btn compact-btn" type="button" data-open-sign-in="true">登入</button>
    `;
    return;
  }
  if (!currentProfile) {
    container.innerHTML = `
      <div class="session-pill">已登入，但尚未建立身份資料</div>
    `;
    if (signOutSlot) {
      signOutSlot.innerHTML = `<button class="ghost-btn compact-btn" id="signOutButton" type="button">登出</button>`;
    }
    return;
  }
  const requestButtons = currentProfile ? `
    <button class="ghost-btn compact-btn" type="button" data-open-leave-request="true">請假申請</button>
    <button class="ghost-btn compact-btn" type="button" data-open-overtime-request="true">加班申請</button>
  ` : "";
  container.innerHTML = `
    <div class="session-pill">${escapeHtml(getCurrentProfileName())}</div>
    ${requestButtons}
  `;
  if (signOutSlot) {
    signOutSlot.innerHTML = `<button class="ghost-btn compact-btn" id="signOutButton" type="button">登出</button>`;
  }
}

function renderAuthGate() {
  const root = document.getElementById("authRoot");
  if (!root) {
    return;
  }
  if (!authModalOpen) {
    root.innerHTML = "";
    return;
  }
  if (!isLoggedIn()) {
    root.innerHTML = `
      <div class="auth-overlay">
        <div class="auth-card">
          <h3>登入</h3>
          ${authPromptMessage ? `<p class="modal-description">${escapeHtml(authPromptMessage)}</p>` : ""}
          <div class="form-row">
            <label for="loginAccount">工號</label>
            <input id="loginAccount" type="text" autocomplete="username" placeholder="請輸入工號">
          </div>
          <div class="form-row">
            <label for="loginPassword">密碼</label>
            <input id="loginPassword" type="password" autocomplete="current-password" placeholder="請輸入密碼">
          </div>
          ${authErrorMessage ? `<div class="auth-error">${escapeHtml(authErrorMessage)}</div>` : ""}
          <div class="modal-footer auth-footer">
            <button class="btn-cancel" type="button" data-close-auth-gate="true">取消</button>
            <button class="btn-primary" type="button" data-auth-sign-in="true">登入</button>
          </div>
        </div>
      </div>
    `;
    return;
  }
  root.innerHTML = "";
}

function hasSapLeaveRows() {
  const sapLeaveCodes = new Set(["0036", "0047"]);
  return state.members.some((member) => {
    if (member.payByDay) {
      return false;
    }
    for (let day = 1; day <= daysInMonth(state.year, state.month); day += 1) {
      if (!isMemberActiveOnDate(member, state.year, state.month, day)) {
        continue;
      }
      const leaveId = getSlot(member.id, day)?.leave;
      const leave = getItem("leave", leaveId);
      if (leave && sapLeaveCodes.has(leave.code)) {
        return true;
      }
    }
    return false;
  });
}

function hasOvertimeRows() {
  return state.members.some((member) => {
    for (let day = 1; day <= daysInMonth(state.year, state.month); day += 1) {
      if (!isMemberActiveOnDate(member, state.year, state.month, day)) {
        continue;
      }
      if (getSlot(member.id, day)?.overtime) {
        return true;
      }
    }
    return false;
  });
}

function hasLeaveRows() {
  const excludedLeaveCodes = new Set(["0036", "0047"]);
  return state.members.some((member) => {
    for (let day = 1; day <= daysInMonth(state.year, state.month); day += 1) {
      if (!isMemberActiveOnDate(member, state.year, state.month, day)) {
        continue;
      }
      const leave = getItem("leave", getSlot(member.id, day)?.leave);
      if (leave && !excludedLeaveCodes.has(leave.code)) {
        return true;
      }
    }
    return false;
  });
}

function shouldPromptLeaveDetail(leave, leaveMeta = null) {
  return Boolean(
    leave?.defaultAllDay ||
    leave?.requireReason ||
    leaveMeta?.reason ||
    leaveMeta?.startTime ||
    leaveMeta?.endTime ||
    leaveMeta?.allDay !== undefined
  );
}

function formatLeaveDetailSummary(leave, leaveMeta) {
  const lines = [];
  if (leaveMeta?.requestStatus) {
    lines.push(`狀態：${getRequestStatusLabel(leaveMeta.requestStatus)}`);
  }
  if (leave && (leave.defaultAllDay || leaveMeta?.allDay !== undefined || leaveMeta?.startTime || leaveMeta?.endTime)) {
    if (leaveMeta?.allDay !== false) {
      lines.push("時間：整天");
    } else {
      lines.push(`時間：${leaveMeta?.startTime || "--:--"} - ${leaveMeta?.endTime || "--:--"}`);
    }
  }
  if (leave && (leave.requireReason || leaveMeta?.reasonEnabled || leaveMeta?.reason)) {
    lines.push(`原因：${leaveMeta?.reason || "未填寫"}`);
  }
  return lines;
}

function hideLeaveTooltip() {
  if (leaveTooltipTimer) {
    clearTimeout(leaveTooltipTimer);
    leaveTooltipTimer = null;
  }
  document.getElementById("leaveTooltipRoot")?.remove();
}

function scheduleHideLeaveTooltip() {
  if (leaveTooltipTimer) {
    clearTimeout(leaveTooltipTimer);
  }
  leaveTooltipTimer = setTimeout(() => {
    hideLeaveTooltip();
  }, 120);
}

function formatOvertimeDetailSummary(overtimeMeta) {
  const lines = [];
  if (overtimeMeta?.requestStatus) {
    lines.push(`狀態：${getRequestStatusLabel(overtimeMeta.requestStatus)}`);
  }
  lines.push(`時間：${overtimeMeta?.startTime || "--:--"} - ${overtimeMeta?.endTime || "--:--"}`);
  if (overtimeMeta?.useRest1) {
    lines.push(`休息1：${overtimeMeta.rest1StartTime || "--:--"} - ${overtimeMeta.rest1EndTime || "--:--"}`);
  }
  if (overtimeMeta?.useRest2) {
    lines.push(`休息2：${overtimeMeta.rest2StartTime || "--:--"} - ${overtimeMeta.rest2EndTime || "--:--"}`);
  }
  if (overtimeMeta?.reason) {
    lines.push(`原因：${overtimeMeta.reason}`);
  }
  return lines;
}

function showScheduleTooltip(memberId, day, category, anchorRect) {
  const slot = getSlot(memberId, day);
  const isLeave = category === "leave";
  const item = getItem(category, slot?.[category]);
  const meta = isLeave ? slot?.leaveMeta : slot?.overtimeMeta;
  const requestId = isLeave ? slot?.leaveRequestId : slot?.overtimeRequestId;
  const shouldShow = isLeave
    ? item && shouldPromptLeaveDetail(item, meta)
    : item && meta;
  if (!shouldShow) {
    hideLeaveTooltip();
    return;
  }

  const lines = isLeave
    ? formatLeaveDetailSummary(item, meta)
    : formatOvertimeDetailSummary(meta);
  if (!lines.length) {
    hideLeaveTooltip();
    return;
  }

  hideLeaveTooltip();
  const root = document.createElement("div");
  root.id = "leaveTooltipRoot";
  root.className = "leave-tooltip";
  root.style.left = `${Math.min(window.innerWidth - 250, anchorRect.left + window.scrollX + 10)}px`;
  root.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
  root.innerHTML = `
    <div class="leave-tooltip-head">
      <div class="leave-tooltip-title">${escapeHtml(isLeave ? getLeaveLabel(item) : (item?.name || "加班"))}</div>
      ${isManager()
        ? (isLeave
          ? renderActionIconButton("edit", `data-edit-leave-assignment="${memberId}:${day}"`, "leave-tooltip-btn")
          : renderActionIconButton("edit", `data-edit-overtime-assignment="${memberId}:${day}"`, "leave-tooltip-btn"))
        : ""}
    </div>
    ${lines.map((line) => `<div class="leave-tooltip-line">${escapeHtml(line)}</div>`).join("")}
    ${isManager() && requestId ? `<div class="leave-tooltip-actions"><button class="btn-primary tooltip-review-btn" type="button" data-open-request-review="${category}:${requestId}">審核</button></div>` : ""}
  `;
  root.addEventListener("mouseenter", () => {
    if (leaveTooltipTimer) {
      clearTimeout(leaveTooltipTimer);
      leaveTooltipTimer = null;
    }
  });
  root.addEventListener("mouseleave", scheduleHideLeaveTooltip);
  document.body.appendChild(root);
}

function closeModal() {
  modalContext = {};
  document.getElementById("modalRoot").innerHTML = "";
  hideLeaveTooltip();
}

function setModal(content) {
  document.getElementById("modalRoot").innerHTML = content;
}

function renderDeptFilter() {
  const select = document.getElementById("deptFilter");
  const departments = state.departments.filter((department) => isDepartmentActiveInMonth(department, state.year, state.month));
  if (state.deptFilter !== "all" && !departments.some((department) => department.id === state.deptFilter)) {
    state.deptFilter = "all";
  }
  select.innerHTML = `
    <option value="all">全部單位</option>
    ${departments.map((department) => (
      `<option value="${department.id}" ${state.deptFilter === department.id ? "selected" : ""}>${escapeHtml(department.name)}</option>`
    )).join("")}
  `;
}

function renderTableDeptScopeFilter() {
  const select = document.getElementById("tableDeptScopeFilter");
  if (!select) {
    return;
  }
  const departments = state.departments.filter((department) => isDepartmentActiveInMonth(department, state.year, state.month));
  if (state.tableDeptScopeFilter !== "all" && !departments.some((department) => department.id === state.tableDeptScopeFilter)) {
    state.tableDeptScopeFilter = "all";
  }
  select.innerHTML = `
    <option value="all">全部顯示</option>
    ${departments.map((department) => (
      `<option value="${department.id}" ${state.tableDeptScopeFilter === department.id ? "selected" : ""}>${escapeHtml(department.name)}</option>`
    )).join("")}
  `;
}

function renderChips(containerId, category, items) {
  const container = document.getElementById(containerId);
  const chips = items.map((item) => {
    const active = state.selected.type === category && state.selected.id === item.id;
    const style = active
      ? `color:${item.color};background:${item.color}20;border-color:${item.color};`
      : `color:${item.color};border-color:${item.color}55;`;
    return `<button class="chip ${active ? "active" : ""}" style="${style}" type="button" data-chip-type="${category}" data-chip-id="${item.id}">${escapeHtml(item.name)}</button>`;
  });
  const cancelType = `cancel-${category}`;
  const cancelActive = state.selected.type === cancelType;
  chips.push(`<button class="chip cancel ${cancelActive ? "active" : ""}" type="button" data-chip-type="${cancelType}" data-chip-id="">取消</button>`);
  container.innerHTML = chips.join("");
}

function renderToolbar() {
  renderDeptFilter();
  renderTableDeptScopeFilter();
  const visibleShifts = state.deptFilter === "all"
    ? state.shifts
    : state.shifts.filter((shift) => shiftAllowsDepartment(shift, state.deptFilter));
  renderChips("shiftChips", "shift", visibleShifts.filter((item) => !item.hiddenFromToolbar));
  renderChips("leaveChips", "leave", state.leaves.filter((item) => !item.hiddenFromToolbar));
  renderChips("overtimeChips", "overtime", state.overtime.filter((item) => !item.hiddenFromToolbar));
  syncRoleUi();
}

function memberLabel(member) {
  return `<div class="member-main">${escapeHtml(member.name)}</div>`;
}

function memberHasScheduledShiftInDepartment(member, departmentId) {
  for (let day = 1; day <= daysInMonth(state.year, state.month); day += 1) {
    if (!isMemberActiveOnDate(member, state.year, state.month, day)) {
      continue;
    }
    const shift = getItem("shift", getSlot(member.id, day)?.shift);
    if (shift && shiftAllowsDepartment(shift, departmentId)) {
      return true;
    }
  }
  return false;
}

function getVisibleTableGroups() {
  return state.departments
    .filter((department) => isDepartmentActiveInMonth(department, state.year, state.month))
    .map((department) => ({
      department,
      members: state.members.filter((member) => {
        if (member.deptId !== department.id) {
          return false;
        }
        if (!isMemberActiveInMonth(member, state.year, state.month)) {
          return false;
        }
        if (state.tableDeptScopeFilter === "all") {
          return true;
        }
        return memberHasScheduledShiftInDepartment(member, state.tableDeptScopeFilter);
      })
    }))
    .filter(({ members }) => members.length);
}

function renderCellInner(key, memberId = "", day = 0) {
  const cellState = state.schedule[key];
  if (!cellState) {
    return '<div class="cell-inner"></div>';
  }
  const segments = [];
  if (cellState.shift) {
    const shift = getItem("shift", cellState.shift);
    if (shift) {
      segments.push({ category: "shift", name: shift.name, color: shift.color, status: "approved" });
    }
  }
  if (cellState.leave) {
    const leave = getItem("leave", cellState.leave);
    if (leave) {
      segments.push({
        category: "leave",
        name: leave.name,
        color: leave.color,
        status: cellState.leaveMeta?.requestStatus || "approved"
      });
    }
  }
  if (cellState.overtime) {
    const overtime = getItem("overtime", cellState.overtime);
    const color = overtime?.color || DEFAULT_STATE.overtime[0].color;
    segments.push({
      category: "overtime",
      name: "加班",
      color,
      status: cellState.overtimeMeta?.requestStatus || "approved"
    });
  }
  if (!segments.length) {
    return '<div class="cell-inner"></div>';
  }
  return `<div class="cell-inner">${segments.map((segment) => (
    `<div class="seg ${segment.status === "pending" ? "seg-pending" : ""}" style="background-color:${segment.color};color:${textColor(segment.color)}" ${
      segment.category === "leave" && shouldPromptLeaveDetail(segment, cellState.leaveMeta)
        ? `data-hover-schedule-detail="${memberId}:${day}:leave"`
        : segment.category === "overtime" && cellState.overtimeMeta
          ? `data-hover-schedule-detail="${memberId}:${day}:overtime"`
          : ""
    }>${escapeHtml(segment.name)}</div>`
  )).join("")}</div>`;
}

function renderTable() {
  hideLeaveTooltip();
  const table = document.getElementById("mainTable");
  const days = daysInMonth(state.year, state.month);
  const today = new Date();
  const isToday = (day) => (
    today.getFullYear() === state.year &&
    today.getMonth() === state.month &&
    today.getDate() === day
  );

  let html = '<colgroup><col class="col-dept"><col class="col-person">';
  for (let day = 1; day <= days; day += 1) {
    html += '<col class="col-day">';
  }
  html += "</colgroup><tbody>";

  const groups = getVisibleTableGroups();

  if (!groups.length) {
    html += `<tr><td class="empty-table" colspan="${days + 2}">${state.tableDeptScopeFilter === "all" ? "目前還沒有人員" : "當月沒有排到此單位班別的人員"}</td></tr>`;
  } else {
    groups.forEach(({ department, members }) => {
      members.forEach((member, index) => {
        html += "<tr>";
        if (index === 0) {
          html += `<td class="dept-col" rowspan="${members.length}">${escapeHtml(department.name)}</td>`;
        }
        html += `<td class="person-col"><div class="member-label">${memberLabel(member)}</div></td>`;
        for (let day = 1; day <= days; day += 1) {
          const active = isMemberActiveOnDate(member, state.year, state.month, day);
          const weekBoundaryClass = getWeekBoundaryClass(day, days);
          if (!active) {
            html += `<td class="cell inactive-cell ${weekBoundaryClass}" data-disabled="true"><div class="cell-inner"></div></td>`;
            continue;
          }
          const key = scheduleKey(member.id, state.year, state.month, day);
          html += `<td class="cell ${weekBoundaryClass} ${isToday(day) ? "today" : ""}" data-member-id="${member.id}" data-day="${day}">${renderCellInner(key, member.id, day)}</td>`;
        }
        html += "</tr>";
      });
    });
  }

  html += "</tbody>";
  table.innerHTML = html;
  syncScheduleColumnWidths();
  renderStickyTableHeader(days);
}

function renderHeader() {
  document.getElementById("monthTitle").textContent = `${state.year} 年 ${MONTH_LABELS[state.month]}`;
  document.getElementById("dbHint").textContent = "";
  renderAuthBar();
}

function renderAll() {
  renderHeader();
  renderToolbar();
  renderTable();
  renderAuthGate();
}

function ensureScheduleSlot(memberId, day) {
  const key = scheduleKey(memberId, state.year, state.month, day);
  if (!state.schedule[key]) {
    state.schedule[key] = { shift: null, leave: null, overtime: null };
  }
  return state.schedule[key];
}

function pruneEmptySchedule() {
  Object.keys(state.schedule).forEach((key) => {
    const slot = state.schedule[key];
    if (!slot || (!slot.shift && !slot.leave && !slot.overtime)) {
      delete state.schedule[key];
    }
  });
}

function queueSave() {
  if (!canEditSchedule()) {
    return;
  }
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(async () => {
    try {
      await window.schedulerApi.saveState(state);
    } catch (error) {
      setSaveStatus(`儲存失敗：${error.message}`);
    }
  }, 250);
}

function applySelectionToCell(memberId, day) {
  if (!canEditSchedule()) {
    return;
  }
  const member = state.members.find((item) => item.id === memberId);
  if (!member || !isMemberActiveOnDate(member, state.year, state.month, day)) {
    return;
  }
  if (!state.selected.type) {
    return;
  }
  const slot = ensureScheduleSlot(memberId, day);
  const { type, id } = state.selected;
  if (type === "leave") {
    const leave = getItem("leave", id);
    if (!leave) {
      return;
    }
    if (shouldPromptLeaveDetail(leave, slot.leave === id ? slot.leaveMeta : null)) {
      openLeaveAssignmentModal(memberId, day, id);
      return;
    }
    slot.leave = slot.leave === id ? null : id;
    slot.leaveMeta = null;
    if (!slot.leave) {
      slot.leaveMeta = null;
    }
    pruneEmptySchedule();
    renderTable();
    queueSave();
    return;
  }
  if (type === "shift") slot.shift = slot.shift === id ? null : id;
  if (type === "overtime") {
    const nextOvertimeId = slot.overtime === id ? null : id;
    slot.overtime = nextOvertimeId;
    if (nextOvertimeId) {
      slot.overtimeMeta = {
        ...(slot.overtimeMeta || {}),
        requestStatus: "approved"
      };
      slot.overtimeRequestId = null;
    } else {
      slot.overtimeMeta = null;
      slot.overtimeRequestId = null;
    }
  }
  if (type === "cancel-shift") slot.shift = null;
  if (type === "cancel-leave") {
    slot.leave = null;
    slot.leaveMeta = null;
  }
  if (type === "cancel-overtime") {
    slot.overtime = null;
    slot.overtimeMeta = null;
    slot.overtimeRequestId = null;
  }
  pruneEmptySchedule();
  renderTable();
  queueSave();
}

function selectChip(type, id) {
  if (!canEditSchedule()) {
    return;
  }
  if (state.selected.type === type && state.selected.id === id) {
    state.selected = { type: null, id: null };
  } else {
    state.selected = { type, id };
  }
  renderToolbar();
}

function removeAssignmentsByItem(category, id) {
  Object.values(state.schedule).forEach((slot) => {
    if (slot[category] === id) {
      slot[category] = null;
      if (category === "leave") {
        slot.leaveMeta = null;
      }
    }
  });
  pruneEmptySchedule();
}

function openEntityListModal(config) {
  const headerButtons = config.headerButtons || "";
  const headerActionBlock = headerButtons
    ? `<div class="modal-header-actions">${headerButtons}</div>`
    : '<div class="modal-header-actions"></div>';
  const closeButton = `
    <div class="modal-header-close">
      <button class="settings-icon-btn modal-close-btn" type="button" data-close-button="true" aria-label="關閉" title="關閉">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12"></path>
          <path d="M18 6l-12 12"></path>
        </svg>
      </button>
    </div>
  `;
  const showFooter = !config.hideFooterClose || config.footerButtons;
  setModal(`
    <div class="modal-overlay" data-close-modal="true">
      <div class="${config.modalClass || "modal modal-wide"}">
        <div class="modal-header">
          <h3>${escapeHtml(config.title)}</h3>
          <div class="modal-header-tools">
            ${headerActionBlock}
            ${closeButton}
          </div>
        </div>
        <div class="modal-body">
          ${config.description ? `<p class="modal-description">${escapeHtml(config.description)}</p>` : ""}
          ${config.body}
        </div>
        ${showFooter ? `
          <div class="modal-footer">
            ${config.hideFooterClose ? "" : '<button class="btn-cancel" type="button" data-close-button="true">關閉</button>'}
            ${config.footerButtons || ""}
          </div>
        ` : ""}
      </div>
    </div>
  `);
}

function syncLeaveAssignmentModalUi() {
  const allDay = document.getElementById("leaveAssignmentAllDay")?.checked;
  const reasonEnabled = document.getElementById("leaveAssignmentReasonEnabled")?.checked;
  const timeSection = document.getElementById("leaveAssignmentTimeSection");
  const reasonSection = document.getElementById("leaveAssignmentReasonSection");
  const reasonInput = document.getElementById("leaveAssignmentReason");

  if (timeSection) {
    timeSection.style.display = allDay ? "none" : "";
  }
  setTimeInputDisabled("leaveAssignmentStartTime", Boolean(allDay));
  setTimeInputDisabled("leaveAssignmentEndTime", Boolean(allDay));
  if (reasonSection) {
    reasonSection.style.display = reasonEnabled ? "" : "none";
  }
  if (reasonInput) {
    if (reasonEnabled) {
      reasonInput.disabled = false;
      reasonInput.removeAttribute("disabled");
      reasonInput.readOnly = false;
      reasonInput.style.pointerEvents = "auto";
    } else {
      reasonInput.disabled = true;
      reasonInput.setAttribute("disabled", "disabled");
      reasonInput.style.pointerEvents = "none";
    }
  }
}

function syncOvertimeFormUi() {
  const useRest1 = Boolean(document.getElementById("overtimeUseRest1")?.checked);
  const useRest2 = Boolean(document.getElementById("overtimeUseRest2")?.checked);
  const rest1Fields = document.getElementById("overtimeRest1Fields");
  const rest2Fields = document.getElementById("overtimeRest2Fields");
  const rest2Toggle = document.getElementById("overtimeUseRest2");
  const rest1Inputs = ["overtimeRest1StartTime", "overtimeRest1EndTime"];
  const rest2Inputs = ["overtimeRest2StartTime", "overtimeRest2EndTime"];

  if (rest1Fields) {
    rest1Fields.style.display = useRest1 ? "" : "none";
  }
  rest1Inputs.forEach((id) => setTimeInputDisabled(id, !useRest1));

  if (!useRest1) {
    if (rest2Toggle) {
      rest2Toggle.checked = false;
      rest2Toggle.disabled = true;
    }
    if (rest2Fields) {
      rest2Fields.style.display = "none";
    }
    rest2Inputs.forEach((id) => setTimeInputDisabled(id, true));
    return;
  }

  if (rest2Toggle) {
    rest2Toggle.disabled = false;
  }
  if (rest2Fields) {
    rest2Fields.style.display = useRest2 ? "" : "none";
  }
  rest2Inputs.forEach((id) => setTimeInputDisabled(id, !useRest2));
}

function openLeaveAssignmentModal(memberId, day, leaveId) {
  const member = state.members.find((item) => item.id === memberId);
  const leave = getItem("leave", leaveId);
  if (!member || !leave) {
    return;
  }

  const slot = getSlot(memberId, day);
  const existingMeta = slot?.leave === leaveId ? slot.leaveMeta || null : null;
  const defaultAllDay = existingMeta?.allDay ?? leave.defaultAllDay;
  const reasonEnabled = existingMeta?.reasonEnabled ?? leave.requireReason;
  const startTime = existingMeta?.startTime || "";
  const endTime = existingMeta?.endTime || "";
  const reason = existingMeta?.reason || "";

  modalContext = { category: "leave-assignment", memberId, day, leaveId };
  openEntityListModal({
    title: "休假明細",
    modalClass: "modal modal-form-compact",
    body: `
      <div class="form-row">
        <label>假別</label>
        <div class="readonly-pill">${escapeHtml(member.name)} · ${day} 日 · ${escapeHtml(getLeaveLabel(leave))}</div>
      </div>
      <div class="form-row checkbox-row checkbox-row-left">
        <label>
          <input id="leaveAssignmentAllDay" type="checkbox" ${defaultAllDay ? "checked" : ""}>
          整天
        </label>
      </div>
      <div class="form-grid" id="leaveAssignmentTimeSection" style="${defaultAllDay ? "display:none;" : ""}">
        <div class="form-row">
          <label for="leaveAssignmentStartTime">開始時間</label>
          ${timeInputMarkup("leaveAssignmentStartTime", startTime, defaultAllDay)}
        </div>
        <div class="form-row">
          <label for="leaveAssignmentEndTime">結束時間</label>
          ${timeInputMarkup("leaveAssignmentEndTime", endTime, defaultAllDay)}
        </div>
      </div>
      <div class="form-row checkbox-row checkbox-row-left">
        <label>
          <input id="leaveAssignmentReasonEnabled" type="checkbox" ${reasonEnabled ? "checked" : ""}>
          原因
        </label>
      </div>
      <div class="form-row" id="leaveAssignmentReasonSection" style="${reasonEnabled ? "" : "display:none;"}">
        <label for="leaveAssignmentReason">原因內容</label>
        <input id="leaveAssignmentReason" type="text" maxlength="60" value="${escapeHtml(reason)}" ${reasonEnabled ? "" : "disabled"} placeholder="請輸入原因">
      </div>
    `,
    footerButtons: `<button class="btn-primary" type="button" data-save-leave-assignment="true">儲存</button>`
  });
  syncLeaveAssignmentModalUi();
}

function saveLeaveAssignmentFromModal() {
  const { memberId, day, leaveId } = modalContext;
  const slot = ensureScheduleSlot(memberId, Number(day));
  const allDay = document.getElementById("leaveAssignmentAllDay")?.checked !== false;
  const reasonEnabled = Boolean(document.getElementById("leaveAssignmentReasonEnabled")?.checked);
  const startTime = readTimeInputValue("leaveAssignmentStartTime");
  const endTime = readTimeInputValue("leaveAssignmentEndTime");
  if (!allDay && !isValidTimeRange(startTime, endTime)) {
    reportValidationError("開始時間必須早於結束時間");
    return;
  }

  slot.leave = leaveId;
  slot.leaveMeta = {
    allDay,
    startTime: allDay ? "" : startTime,
    endTime: allDay ? "" : endTime,
    reasonEnabled,
    reason: reasonEnabled ? (document.getElementById("leaveAssignmentReason")?.value.trim() || "") : "",
    requestStatus: slot.leaveMeta?.requestStatus || "approved"
  };
  closeModal();
  renderTable();
  queueSave();
}

function openOvertimeAssignmentModal(memberId, day) {
  const member = state.members.find((item) => item.id === memberId);
  const slot = getSlot(memberId, day);
  const overtimeMeta = slot?.overtimeMeta || null;
  if (!member || !slot?.overtime) {
    return;
  }
  modalContext = {
    category: "overtime-assignment",
    memberId,
    day,
    requestId: slot.overtimeRequestId || ""
  };
  openEntityListModal({
    title: "修改加班",
    modalClass: "modal modal-form-compact",
    body: `
      <div class="form-row">
        <label>人員</label>
        <div class="readonly-pill">${escapeHtml(member.name)} · ${day} 日</div>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="scheduleOvertimeStartTime">加班開始</label>
          ${timeInputMarkup("scheduleOvertimeStartTime", overtimeMeta?.startTime || "")}
        </div>
        <div class="form-row">
          <label for="scheduleOvertimeEndTime">加班結束</label>
          ${timeInputMarkup("scheduleOvertimeEndTime", overtimeMeta?.endTime || "")}
        </div>
      </div>
      <div class="form-section">
        <div class="form-row checkbox-row">
          <label class="overtime-use-label">
            <input id="scheduleOvertimeUseRest1" type="checkbox" ${overtimeMeta?.useRest1 ? "checked" : ""}>
            使用休息1
          </label>
        </div>
        <div class="form-grid" id="scheduleOvertimeRest1Fields" style="${overtimeMeta?.useRest1 ? "" : "display:none;"}">
          <div class="form-row">
            <label for="scheduleOvertimeRest1StartTime">休息1開始</label>
            ${timeInputMarkup("scheduleOvertimeRest1StartTime", overtimeMeta?.rest1StartTime || "", !overtimeMeta?.useRest1)}
          </div>
          <div class="form-row">
            <label for="scheduleOvertimeRest1EndTime">休息1結束</label>
            ${timeInputMarkup("scheduleOvertimeRest1EndTime", overtimeMeta?.rest1EndTime || "", !overtimeMeta?.useRest1)}
          </div>
        </div>
      </div>
      <div class="form-section">
        <div class="form-row checkbox-row">
          <label class="overtime-use-label">
            <input id="scheduleOvertimeUseRest2" type="checkbox" ${overtimeMeta?.useRest1 && overtimeMeta?.useRest2 ? "checked" : ""} ${overtimeMeta?.useRest1 ? "" : "disabled"}>
            使用休息2
          </label>
        </div>
        <div class="form-grid" id="scheduleOvertimeRest2Fields" style="${overtimeMeta?.useRest1 && overtimeMeta?.useRest2 ? "" : "display:none;"}">
          <div class="form-row">
            <label for="scheduleOvertimeRest2StartTime">休息2開始</label>
            ${timeInputMarkup("scheduleOvertimeRest2StartTime", overtimeMeta?.rest2StartTime || "", !(overtimeMeta?.useRest1 && overtimeMeta?.useRest2))}
          </div>
          <div class="form-row">
            <label for="scheduleOvertimeRest2EndTime">休息2結束</label>
            ${timeInputMarkup("scheduleOvertimeRest2EndTime", overtimeMeta?.rest2EndTime || "", !(overtimeMeta?.useRest1 && overtimeMeta?.useRest2))}
          </div>
        </div>
      </div>
    `,
    footerButtons: '<button class="btn-primary" type="button" data-save-overtime-assignment="true">儲存</button>'
  });
  syncScheduleOvertimeFormUi();
}

async function saveOvertimeAssignmentFromModal() {
  const { memberId, day, requestId } = modalContext;
  const startTime = readTimeInputValue("scheduleOvertimeStartTime");
  const endTime = readTimeInputValue("scheduleOvertimeEndTime");
  const useRest1 = Boolean(document.getElementById("scheduleOvertimeUseRest1")?.checked);
  const useRest2 = Boolean(document.getElementById("scheduleOvertimeUseRest2")?.checked) && useRest1;
  const rest1StartTime = readTimeInputValue("scheduleOvertimeRest1StartTime");
  const rest1EndTime = readTimeInputValue("scheduleOvertimeRest1EndTime");
  const rest2StartTime = readTimeInputValue("scheduleOvertimeRest2StartTime");
  const rest2EndTime = readTimeInputValue("scheduleOvertimeRest2EndTime");
  if (!memberId || !day) {
    reportValidationError("請確認加班資料");
    return;
  }
  if (!isValidTimeRange(startTime, endTime)) {
    reportValidationError("加班開始時間必須早於加班結束時間");
    return;
  }
  if (useRest1 && !isValidTimeRange(rest1StartTime, rest1EndTime)) {
    reportValidationError("休息1開始時間必須早於結束時間");
    return;
  }
  if (useRest2 && !isValidTimeRange(rest2StartTime, rest2EndTime)) {
    reportValidationError("休息2開始時間必須早於結束時間");
    return;
  }
  const slot = ensureScheduleSlot(memberId, Number(day));
  slot.overtime = state.overtime[0]?.id || slot.overtime;
  slot.overtimeMeta = {
    startTime,
    endTime,
    useRest1,
    rest1StartTime: useRest1 ? rest1StartTime : "",
    rest1EndTime: useRest1 ? rest1EndTime : "",
    useRest2,
    rest2StartTime: useRest2 ? rest2StartTime : "",
    rest2EndTime: useRest2 ? rest2EndTime : "",
    requestStatus: requestId ? (slot.overtimeMeta?.requestStatus || "approved") : "approved",
    reason: slot.overtimeMeta?.reason || ""
  };
  if (!requestId) {
    slot.overtimeRequestId = null;
  }
  if (requestId) {
    // ponytail: 現在先讓班表修改直接回寫核準中的加班明細；若後續要加審核歷程，再拆成專用編修紀錄。
    await window.schedulerApi.updateOvertimeRequestDetails({
      id: requestId,
      startTime,
      endTime,
      useRest1,
      rest1StartTime: useRest1 ? rest1StartTime : "",
      rest1EndTime: useRest1 ? rest1EndTime : "",
      useRest2,
      rest2StartTime: useRest2 ? rest2StartTime : "",
      rest2EndTime: useRest2 ? rest2EndTime : ""
    });
    overtimeRequestRecords = overtimeRequestRecords.map((record) => (
      record.id === requestId
        ? { ...record, startTime, endTime, useRest1, rest1StartTime: useRest1 ? rest1StartTime : "", rest1EndTime: useRest1 ? rest1EndTime : "", useRest2, rest2StartTime: useRest2 ? rest2StartTime : "", rest2EndTime: useRest2 ? rest2EndTime : "" }
        : record
    ));
  }
  closeModal();
  renderTable();
  queueSave();
}

function openListSettings(category) {
  const titleMap = {
    shift: "班別設定",
    leave: "假別設定",
    overtime: "加班設定"
  };
  const list = getItemList(category);
  const body = list.length
      ? `
        <div class="settings-table-wrap">
          <div class="settings-table">
            <div class="settings-table-row settings-table-head settings-table-row-${category}">
              <div>顏色</div>
              ${category === "leave" ? "<div>假別代碼</div>" : ""}
              <div>${category === "shift" ? "班別" : category === "leave" ? "假別" : "加班"}</div>
              <div>${category === "shift" ? "適用單位" : category === "leave" ? "需填時間" : "時段"}</div>
              ${category === "overtime" ? "<div>休息1</div><div>休息2</div>" : ""}
              ${category === "shift" ? "<div>時段</div>" : ""}
              ${category === "leave" ? "<div>需填原因</div>" : ""}
              <div>不顯示</div>
              <div class="settings-table-actions-head">操作</div>
            </div>
            ${list.map((item) => `
              <div class="settings-table-row settings-table-row-${category} sortable-settings-item" draggable="true" data-sort-category="${category}" data-sort-item="${item.id}">
                <div class="settings-table-color"><div class="dot" style="background:${item.color}"></div></div>
                ${category === "leave" ? `<div class="settings-table-code">${escapeHtml(item.code || "")}</div>` : ""}
                <div class="settings-table-name">${escapeHtml(item.name)}</div>
                <div class="settings-table-meta">${category === "shift"
                  ? escapeHtml(getDepartmentSummary(item.applicableDeptIds))
                  : category === "leave"
                    ? (item.defaultAllDay ? "是" : "否")
                    : escapeHtml(`${item.startTime || "--:--"} - ${item.endTime || "--:--"}`)
                }</div>
                ${category === "overtime"
                  ? `<div class="settings-table-meta">${item.useRest1 ? escapeHtml(`${item.rest1StartTime || "--:--"} - ${item.rest1EndTime || "--:--"}`) : "-"}</div>
                     <div class="settings-table-meta">${item.useRest2 ? escapeHtml(`${item.rest2StartTime || "--:--"} - ${item.rest2EndTime || "--:--"}`) : "-"}</div>`
                  : ""}
                ${category === "shift"
                  ? `<div class="settings-table-meta">${escapeHtml(`${item.startTime || "--:--"} - ${item.endTime || "--:--"}`)}</div>`
                  : ""}
                ${category === "leave"
                  ? `<div class="settings-table-meta">${item.requireReason ? "是" : "否"}</div>`
                  : ""}
                <div class="settings-table-meta">${item.hiddenFromToolbar ? "是" : "否"}</div>
                <div class="settings-table-actions">
                  ${renderActionIconButton("edit", `data-edit-item="${category}" data-edit-id="${item.id}"`)}
                  ${renderActionIconButton("delete", `data-delete-category="${category}" data-delete-id="${item.id}"`)}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `
      : '<div class="empty-state">目前還沒有資料</div>';

  openEntityListModal({
    title: titleMap[category],
    modalClass: category === "shift" || category === "leave" || category === "overtime"
      ? "modal modal-wide catalog-settings-modal"
      : undefined,
    body,
    headerButtons: `<button class="btn-primary" type="button" data-open-add="${category}">新增${escapeHtml(titleMap[category].replace("設定", ""))}</button>`,
    hideFooterClose: true
  });
}

function readApplicableDepartmentInput() {
  const selectedDeptId = document.getElementById("shiftApplicableDept")?.value || "";
  return selectedDeptId ? [selectedDeptId] : [];
}

function renderCompactColorPicker(selectedHex) {
  return `
    <div class="compact-color-picker">
      <button class="compact-color-trigger" type="button" data-open-native-color="true" aria-label="選擇顏色">
        <span class="compact-color-chip" style="background:${selectedHex}"></span>
      </button>
      <input class="native-color-input hidden-color-input" type="color" value="${selectedHex}" data-native-color="true">
    </div>
  `;
}

function renderActionIconButton(kind, attrs, extraClass = "") {
  const title = kind === "delete" ? "刪除" : "修改";
  const dangerClass = kind === "delete" ? " settings-icon-btn-danger" : "";
  const icon = kind === "delete"
    ? `
      <path d="M4 7h16"></path>
      <path d="M9 7V4h6v3"></path>
      <path d="M7 7l1 13h8l1-13"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
    `
    : `
      <path d="M4 20h4l10-10a2 2 0 0 0-4-4L4 16v4z"></path>
      <path d="M13.5 6.5l4 4"></path>
    `;
  return `
    <button class="settings-icon-btn${dangerClass}${extraClass ? ` ${extraClass}` : ""}" type="button" ${attrs} aria-label="${title}" title="${title}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        ${icon}
      </svg>
    </button>
  `;
}

function syncColorPickerUi() {
  document.querySelectorAll(".compact-color-chip").forEach((chip) => {
    chip.style.background = modalColor;
  });
  document.querySelectorAll(".native-color-input").forEach((input) => {
    input.value = modalColor;
  });
}

function openShiftFormModal(mode, shiftId = "") {
  const shift = mode === "edit"
    ? state.shifts.find((item) => item.id === shiftId)
    : {
      id: "",
      name: "",
      color: COLORS[0].hex,
      startTime: "",
      endTime: "",
      hiddenFromToolbar: false,
      applicableDeptIds: [state.deptFilter !== "all" ? state.deptFilter : (state.departments[0]?.id || "")].filter(Boolean),
      positionRequirements: []
    };
  if (!shift) {
    return;
  }
  modalColor = shift.color;
  modalContext = { mode, category: "shift", targetId: shiftId };

  openEntityListModal({
    title: mode === "edit" ? "修改班別" : "新增班別",
    modalClass: "modal modal-wide modal-form-compact",
    body: `
      <div class="form-row form-row-compact">
        ${renderCompactColorPicker(shift.color)}
      </div>
      <div class="form-row">
        <label for="shiftApplicableDept">適用單位</label>
        <select id="shiftApplicableDept">${buildSelectOptions(state.departments, "id", (item) => item.name, shift.applicableDeptIds?.[0] || "")}</select>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="shiftName">名稱</label>
          <textarea id="shiftName" class="single-line-textarea" rows="1" maxlength="12" lang="zh-Hant" spellcheck="false" placeholder="例如早班">${escapeHtml(shift.name)}</textarea>
        </div>
      </div>
      <div class="form-section">
      <div class="form-grid">
        <div class="form-row">
          <label for="shiftStartTime">上班時間</label>
          ${timeInputMarkup("shiftStartTime", shift.startTime || "")}
        </div>
        <div class="form-row">
          <label for="shiftEndTime">下班時間</label>
          ${timeInputMarkup("shiftEndTime", shift.endTime || "")}
        </div>
      </div>
      </div>
      <div class="form-row checkbox-row checkbox-row-left">
        <label class="catalog-visibility-toggle">
          <input id="shiftHiddenFromToolbar" type="checkbox" ${shift.hiddenFromToolbar ? "checked" : ""}>
          不顯示
        </label>
      </div>
    `,
    headerButtons: `<button class="btn-primary" type="button" data-save-shift="${mode}">${mode === "edit" ? "儲存修改" : "新增班別"}</button>`,
    hideFooterClose: true
  });
}

function saveShiftFromModal(mode) {
  const name = document.getElementById("shiftName")?.value.trim();
  if (!name) {
    document.getElementById("shiftName")?.focus();
    return;
  }
  const startTime = readTimeInputValue("shiftStartTime");
  const endTime = readTimeInputValue("shiftEndTime");
  if (!isValidTimeRange(startTime, endTime)) {
    reportValidationError("上班時間必須早於下班時間");
    return;
  }
  const payload = {
    id: mode === "edit" ? modalContext.targetId : uid("s"),
    name,
    color: modalColor,
    startTime,
    endTime,
    hiddenFromToolbar: Boolean(document.getElementById("shiftHiddenFromToolbar")?.checked),
    applicableDeptIds: readApplicableDepartmentInput(),
    positionRequirements: []
  };

  if (mode === "edit") {
    state.shifts = state.shifts.map((shift) => shift.id === payload.id ? payload : shift);
  } else {
    state.shifts.push(payload);
  }
  closeModal();
  renderAll();
  openListSettings("shift");
  queueSave();
}

function openNamedColorFormModal(category, mode, targetId = "") {
  const list = getItemList(category);
  const item = mode === "edit"
    ? list.find((entry) => entry.id === targetId)
    : {
      id: "",
      code: LEAVE_CATALOG[0].code,
      name: LEAVE_CATALOG[0].name,
      color: COLORS[0].hex,
      defaultAllDay: false,
      requireReason: false,
      hiddenFromToolbar: false,
      startTime: "",
      endTime: "",
      useRest1: false,
      rest1StartTime: "",
      rest1EndTime: "",
      useRest2: false,
      rest2StartTime: "",
      rest2EndTime: ""
    };
  if (!item) {
    return;
  }
  modalColor = item.color;
  modalContext = { category, mode, targetId };
  const titleMap = {
    shift: "班別",
    leave: "假別",
    overtime: "加班"
  };
  openEntityListModal({
      title: `${mode === "edit" ? "修改" : "新增"}${titleMap[category]}`,
      modalClass: category === "leave" || category === "overtime"
        ? "modal modal-wide modal-form-compact"
        : "modal modal-wide",
      body: `
      <div class="form-row form-row-compact">
        ${category === "leave" ? "<label>顏色</label>" : ""}
        ${renderCompactColorPicker(item.color)}
      </div>
      <div class="form-row">
        <label for="${category === "leave" ? "leaveCatalogCode" : "namedItemName"}">${category === "leave" ? "假別" : "名稱"}</label>
        ${category === "leave"
          ? `<select id="leaveCatalogCode">${buildSelectOptions(LEAVE_CATALOG, "code", (entry) => `${entry.code} ${entry.name}`, item.code || "")}</select>`
          : `<textarea id="namedItemName" class="single-line-textarea" rows="1" maxlength="12" lang="zh-Hant" spellcheck="false" placeholder="請輸入名稱">${escapeHtml(item.name)}</textarea>`
        }
      </div>
      ${category === "leave" ? `
        <div class="form-section">
          <div class="form-row checkbox-row checkbox-row-left">
            <label class="leave-toggle-label">
              <input id="leaveDefaultAllDay" type="checkbox" ${item.defaultAllDay ? "checked" : ""}>
              需填時間
            </label>
          </div>
          <div class="form-row checkbox-row checkbox-row-left">
            <label class="leave-toggle-label">
              <input id="leaveRequireReason" type="checkbox" ${item.requireReason ? "checked" : ""}>
              需填原因
            </label>
          </div>
        </div>
      ` : ""}
      ${category === "overtime" ? `
        <div class="form-section">
          <div class="form-grid">
            <div class="form-row">
              <label for="overtimeStartTime">上班時間</label>
              ${timeInputMarkup("overtimeStartTime", item.startTime || "")}
            </div>
            <div class="form-row">
              <label for="overtimeEndTime">下班時間</label>
              ${timeInputMarkup("overtimeEndTime", item.endTime || "")}
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-row checkbox-row">
            <label class="overtime-use-label">
              <input id="overtimeUseRest1" type="checkbox" ${item.useRest1 ? "checked" : ""}>
              使用休息1
            </label>
          </div>
          <div class="form-grid" id="overtimeRest1Fields" style="${item.useRest1 ? "" : "display:none;"}">
            <div class="form-row">
              <label for="overtimeRest1StartTime">休息1開始</label>
              ${timeInputMarkup("overtimeRest1StartTime", item.rest1StartTime || "", !item.useRest1)}
            </div>
            <div class="form-row">
              <label for="overtimeRest1EndTime">休息1結束</label>
              ${timeInputMarkup("overtimeRest1EndTime", item.rest1EndTime || "", !item.useRest1)}
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-row checkbox-row">
            <label class="overtime-use-label">
              <input id="overtimeUseRest2" type="checkbox" ${item.useRest1 && item.useRest2 ? "checked" : ""} ${item.useRest1 ? "" : "disabled"}>
              使用休息2
            </label>
          </div>
          <div class="form-grid" id="overtimeRest2Fields" style="${item.useRest1 && item.useRest2 ? "" : "display:none;"}">
            <div class="form-row">
              <label for="overtimeRest2StartTime">休息2開始</label>
              ${timeInputMarkup("overtimeRest2StartTime", item.rest2StartTime || "", !(item.useRest1 && item.useRest2))}
            </div>
            <div class="form-row">
              <label for="overtimeRest2EndTime">休息2結束</label>
              ${timeInputMarkup("overtimeRest2EndTime", item.rest2EndTime || "", !(item.useRest1 && item.useRest2))}
            </div>
          </div>
        </div>
      ` : ""}
      <div class="form-row checkbox-row checkbox-row-left">
        <label class="catalog-visibility-toggle">
          <input id="${category}HiddenFromToolbar" type="checkbox" ${item.hiddenFromToolbar ? "checked" : ""}>
          不顯示
        </label>
      </div>
    `,
    headerButtons: `<button class="btn-primary" type="button" data-save-named-item="${category}:${mode}">${mode === "edit" ? "儲存修改" : "新增"}</button>`,
    hideFooterClose: true
  });
  if (category === "overtime") {
    syncOvertimeFormUi();
  }
}

function saveNamedColorItem(category, mode) {
  if (category === "shift") {
    saveShiftFromModal(mode);
    return;
  }
  const selectedLeave = category === "leave"
    ? LEAVE_CATALOG.find((entry) => entry.code === (document.getElementById("leaveCatalogCode")?.value || ""))
    : null;
  const name = category === "leave"
    ? (selectedLeave?.name || "")
    : (document.getElementById("namedItemName")?.value.trim() || "");
  if (!name) {
    document.getElementById(category === "leave" ? "leaveCatalogCode" : "namedItemName")?.focus();
    return;
  }
  if (category === "overtime") {
    const startTime = readTimeInputValue("overtimeStartTime");
    const endTime = readTimeInputValue("overtimeEndTime");
    if (!isValidTimeRange(startTime, endTime)) {
      reportValidationError("上班時間必須早於下班時間");
      return;
    }
    const useRest1 = Boolean(document.getElementById("overtimeUseRest1")?.checked);
    const useRest2 = Boolean(document.getElementById("overtimeUseRest2")?.checked) && useRest1;
    if (useRest1) {
      const rest1Start = readTimeInputValue("overtimeRest1StartTime");
      const rest1End = readTimeInputValue("overtimeRest1EndTime");
      if (!isValidTimeRange(rest1Start, rest1End)) {
        reportValidationError("休息1開始時間必須早於結束時間");
        return;
      }
      if (useRest2) {
        const rest2Start = readTimeInputValue("overtimeRest2StartTime");
        const rest2End = readTimeInputValue("overtimeRest2EndTime");
        if (!isValidTimeRange(rest2Start, rest2End)) {
          reportValidationError("休息2開始時間必須早於結束時間");
          return;
        }
      }
    }
  }
  const payload = {
    id: mode === "edit" ? modalContext.targetId : uid(category[0]),
    code: category === "leave" ? selectedLeave?.code : undefined,
    name,
    color: modalColor,
    defaultAllDay: category === "leave" ? document.getElementById("leaveDefaultAllDay")?.checked : undefined,
    requireReason: category === "leave" ? document.getElementById("leaveRequireReason")?.checked : undefined,
    hiddenFromToolbar: Boolean(document.getElementById(`${category}HiddenFromToolbar`)?.checked),
    startTime: category === "overtime" ? readTimeInputValue("overtimeStartTime") : undefined,
    endTime: category === "overtime" ? readTimeInputValue("overtimeEndTime") : undefined,
    useRest1: category === "overtime" ? Boolean(document.getElementById("overtimeUseRest1")?.checked) : undefined,
    rest1StartTime: category === "overtime" ? readTimeInputValue("overtimeRest1StartTime") : undefined,
    rest1EndTime: category === "overtime" ? readTimeInputValue("overtimeRest1EndTime") : undefined,
    useRest2: category === "overtime" ? Boolean(document.getElementById("overtimeUseRest2")?.checked) : undefined,
    rest2StartTime: category === "overtime" ? readTimeInputValue("overtimeRest2StartTime") : undefined,
    rest2EndTime: category === "overtime" ? readTimeInputValue("overtimeRest2EndTime") : undefined
  };
  if (category === "overtime" && payload.useRest1 === false) {
    payload.useRest2 = false;
    payload.rest1StartTime = "";
    payload.rest1EndTime = "";
    payload.rest2StartTime = "";
    payload.rest2EndTime = "";
  } else if (category === "overtime" && payload.useRest2 === false) {
    payload.rest2StartTime = "";
    payload.rest2EndTime = "";
  }
  const currentList = getItemList(category);
  const nextList = mode === "edit"
    ? currentList.map((item) => item.id === payload.id ? payload : item)
    : [...currentList, payload];
  if (category === "leave") state.leaves = nextList;
  if (category === "overtime") state.overtime = nextList;
  closeModal();
  renderAll();
  openListSettings(category);
  queueSave();
  if (category === "leave" || category === "overtime") {
    syncRequestCatalogs().catch((error) => setSaveStatus(`同步設定失敗：${error.message}`));
  }
}

async function deleteListItem(category, id) {
  const labelMap = {
    shift: "班別",
    leave: "假別",
    overtime: "加班"
  };
  const confirmed = await confirmAction(`確定要刪除這個${labelMap[category] || "項目"}嗎？`);
  if (!confirmed) {
    return;
  }
  if (category === "shift") state.shifts = state.shifts.filter((item) => item.id !== id);
  if (category === "leave") state.leaves = state.leaves.filter((item) => item.id !== id);
  if (category === "overtime") state.overtime = state.overtime.filter((item) => item.id !== id);
  removeAssignmentsByItem(category, id);
  renderAll();
  openListSettings(category);
  queueSave();
}

function openDepartmentSettings() {
  const body = state.departments.length
    ? state.departments.map((department) => {
      const members = state.members.filter((member) => member.deptId === department.id);
      return `
        <div class="dept-block drop-zone sortable-settings-item" draggable="true" data-sort-category="department" data-sort-item="${department.id}" data-drop-department="${department.id}">
          <div class="dept-heading">
            <div class="dept-name">${escapeHtml(department.name)}</div>
            <div class="dept-count">${members.length} 位</div>
          </div>
          <div class="member-inline-list">
            ${members.length
              ? members.map((member) => `
                <div class="member-item draggable-member" draggable="true" data-member-card="${member.id}" data-drop-member="${member.id}" data-drop-department="${department.id}">
                  <span>${escapeHtml(member.name)}</span>
                </div>
              `).join("")
              : '<div class="dept-empty-pill">拖曳人員到這裡</div>'
            }
          </div>
          <div class="list-item-actions">
            ${renderActionIconButton("edit", `data-edit-department="${department.id}"`)}
            ${renderActionIconButton("delete", `data-delete-department="${department.id}"`)}
          </div>
        </div>
      `;
    }).join("")
    : '<div class="empty-state">目前還沒有單位</div>';
  openEntityListModal({
    title: "單位設定",
    modalClass: "modal modal-wide department-settings-modal",
    body,
    headerButtons: `<button class="btn-primary" type="button" data-open-add-department="true">新增單位</button>`,
    hideFooterClose: true
  });
}

function openDepartmentForm(mode, departmentId = "") {
  const department = mode === "edit"
    ? state.departments.find((item) => item.id === departmentId)
    : { id: "", name: "", startDate: "", endDate: "" };
  if (!department) {
    return;
  }
  modalContext = { mode, category: "department", targetId: departmentId };
  openEntityListModal({
    title: `${mode === "edit" ? "修改" : "新增"}單位`,
    modalClass: "modal modal-form-compact",
    body: `
      <div class="form-row">
        <label for="departmentName">單位名稱</label>
        <input id="departmentName" type="text" maxlength="12" value="${escapeHtml(department.name)}" placeholder="請輸入單位名稱">
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="departmentStartDate">開始日期</label>
          <input id="departmentStartDate" type="date" value="${escapeHtml(department.startDate || "")}">
        </div>
        <div class="form-row">
          <label for="departmentEndDate">結束日期</label>
          <input id="departmentEndDate" type="date" value="${escapeHtml(department.endDate || "")}">
        </div>
      </div>
    `,
    headerButtons: `<button class="btn-primary" type="button" data-save-department="${mode}">${mode === "edit" ? "儲存修改" : "新增單位"}</button>`,
    hideFooterClose: true
  });
}

function saveDepartment(mode) {
  const name = document.getElementById("departmentName")?.value.trim();
  const startDate = document.getElementById("departmentStartDate")?.value || "";
  const endDate = document.getElementById("departmentEndDate")?.value || "";
  if (!name) {
    document.getElementById("departmentName")?.focus();
    return;
  }
  if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
    reportValidationError("開始日期必須早於結束日期");
    return;
  }
  const payload = { id: mode === "edit" ? modalContext.targetId : uid("d"), name, startDate, endDate };
  if (mode === "edit") {
    state.departments = state.departments.map((department) => department.id === modalContext.targetId ? payload : department);
  } else {
    state.departments.push(payload);
  }
  closeModal();
  renderAll();
  openDepartmentSettings();
  queueSave();
}

function removeScheduleByMember(memberId) {
  Object.keys(state.schedule).forEach((key) => {
    if (key.startsWith(`${memberId}_`)) {
      delete state.schedule[key];
    }
  });
}

async function deleteDepartment(departmentId) {
  const memberIds = state.members.filter((member) => member.deptId === departmentId).map((member) => member.id);
  if (memberIds.length) {
    showInfoMessage("這個單位還有人員，請先將人員移轉到其他單位後再刪除。");
    return;
  }
  const confirmed = await confirmAction("確定要刪除這個單位嗎？");
  if (!confirmed) {
    return;
  }
  state.departments = state.departments.filter((department) => department.id !== departmentId);
  memberIds.forEach(removeScheduleByMember);
  if (state.deptFilter === departmentId) {
    state.deptFilter = "all";
  }
  if (state.tableDeptScopeFilter === departmentId) {
    state.tableDeptScopeFilter = "all";
  }
  renderAll();
  openDepartmentSettings();
  queueSave();
}

function moveMemberToDepartment(memberId, departmentId, targetMemberId = "") {
  const member = state.members.find((item) => item.id === memberId);
  if (!member || targetMemberId === memberId) {
    return;
  }
  const remaining = state.members.filter((item) => item.id !== memberId);
  const targetDeptId = targetMemberId
    ? (remaining.find((item) => item.id === targetMemberId)?.deptId || departmentId)
    : departmentId;
  const grouped = new Map(state.departments.map((department) => [department.id, []]));
  remaining.forEach((item) => {
    if (grouped.has(item.deptId)) {
      grouped.get(item.deptId).push(item);
    }
  });
  if (!grouped.has(targetDeptId)) {
    return;
  }
  const movedMember = { ...member, deptId: targetDeptId };
  const targetList = grouped.get(targetDeptId);
  const targetIndex = targetMemberId ? targetList.findIndex((item) => item.id === targetMemberId) : -1;
  if (targetIndex >= 0) {
    targetList.splice(targetIndex, 0, movedMember);
  } else {
    targetList.push(movedMember);
  }
  state.members = state.departments.flatMap((department) => grouped.get(department.id) || []);
  openDepartmentSettings();
  renderAll();
  queueSave();
}

function reorderListItem(category, draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) {
    return;
  }
  const currentList = category === "department"
    ? [...state.departments]
    : [...getItemList(category)];
  const fromIndex = currentList.findIndex((item) => item.id === draggedId);
  const targetIndex = currentList.findIndex((item) => item.id === targetId);
  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) {
    return;
  }
  const [moved] = currentList.splice(fromIndex, 1);
  currentList.splice(targetIndex, 0, moved);
  if (category === "department") {
    state.departments = currentList;
  }
  if (category === "shift") {
    state.shifts = currentList;
  }
  if (category === "leave") {
    state.leaves = currentList;
  }
  renderAll();
  if (category === "department") {
    openDepartmentSettings();
  } else {
    openListSettings(category);
  }
  queueSave();
}

function buildSelectOptions(items, valueField, labelBuilder, selectedValue, includeEmpty = false, emptyLabel = "未指定") {
  const entries = [];
  if (includeEmpty) {
    entries.push(`<option value="">${escapeHtml(emptyLabel)}</option>`);
  }
  entries.push(...items.map((item) => `<option value="${escapeHtml(item[valueField])}" ${item[valueField] === selectedValue ? "selected" : ""}>${escapeHtml(labelBuilder(item))}</option>`));
  return entries.join("");
}

function openMemberSettings() {
  const normalizedName = memberSettingsFilters.name.trim().toLowerCase();
  const filteredMembers = state.members.filter((member) => {
    const matchesName = !normalizedName || member.name.toLowerCase().includes(normalizedName);
    const active = isMemberCurrentlyActive(member);
    const matchesEmployment = memberSettingsFilters.employment === "all"
      ? true
      : memberSettingsFilters.employment === "inactive"
        ? !active
        : active;
    return matchesName && matchesEmployment;
  });
  const body = `
      <div class="member-settings-filters">
        <div class="form-row">
          <label for="memberSettingsNameFilter">姓名</label>
          <input id="memberSettingsNameFilter" type="text" value="${escapeHtml(memberSettingsFilters.name)}" placeholder="輸入姓名" data-member-settings-filter-field="name">
        </div>
        <div class="form-row">
          <label for="memberSettingsEmploymentFilter">狀態</label>
          <select id="memberSettingsEmploymentFilter" data-member-settings-filter-field="employment">
            <option value="active" ${memberSettingsFilters.employment === "active" ? "selected" : ""}>在職</option>
            <option value="inactive" ${memberSettingsFilters.employment === "inactive" ? "selected" : ""}>離職</option>
            <option value="all" ${memberSettingsFilters.employment === "all" ? "selected" : ""}>全部</option>
          </select>
        </div>
      </div>
      ${state.members.length
        ? `
      <div class="member-table-wrap">
        <div class="member-table">
          <div class="member-table-row member-table-head">
            <div>工號</div>
            <div>姓名</div>
            <div>單位</div>
            <div>權限</div>
            <div>到職日</div>
            <div>離職日</div>
            <div>薪資方式</div>
            <div class="member-table-actions-head">操作</div>
          </div>
          ${filteredMembers.map((member) => `
            <div class="member-table-row">
              <div class="member-table-code">${escapeHtml(member.code)}</div>
              <div class="member-table-name">${escapeHtml(member.name)}</div>
              <div>${escapeHtml(getDepartmentName(member.deptId))}</div>
              <div>${member.role === "manager" ? "主管" : "員工"}</div>
              <div>${escapeHtml(member.hireDate || "-")}</div>
              <div>${escapeHtml(member.leaveDate || "-")}</div>
              <div>${getSalaryTypeLabel(member)}</div>
              <div class="member-table-actions">
                ${renderActionIconButton("edit", `data-edit-member="${member.id}"`)}
                ${renderActionIconButton("delete", `data-delete-member="${member.id}"`)}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
        `
        : '<div class="empty-state">目前還沒有人員</div>'
      }
      ${state.members.length && !filteredMembers.length ? '<div class="empty-state">沒有符合篩選條件的人員</div>' : ""}
    `;
  openEntityListModal({
    title: "人員設定",
    modalClass: "modal modal-wide member-settings-modal",
    body,
    headerButtons: `
      <button class="ghost-btn" type="button" data-export-members="true">匯出</button>
      <button class="ghost-btn" type="button" data-import-members="true">匯入</button>
      <button class="btn-primary" type="button" data-open-add-member="true">新增人員</button>
    `,
    hideFooterClose: true
  });
}

function openMemberForm(mode, memberId = "") {
  const member = mode === "edit"
    ? state.members.find((item) => item.id === memberId)
    : {
      id: "",
      code: "",
      name: "",
      deptId: state.departments[0]?.id || "",
      positionId: "",
      proxyMemberId: "",
      hireDate: "",
      leaveDate: "",
      payByDay: false,
      role: "employee"
    };
  if (!member) {
    return;
  }
  modalContext = { mode, category: "member", targetId: memberId };
  openEntityListModal({
    title: `${mode === "edit" ? "修改" : "新增"}人員`,
    modalClass: "modal modal-form-compact",
    body: `
      <div class="form-grid two-col">
        <div class="form-row">
          <label for="memberCode">工號</label>
          <input id="memberCode" type="text" maxlength="12" value="${escapeHtml(member.code)}" placeholder="例如 A001">
        </div>
        <div class="form-row">
          <label for="memberName">姓名</label>
          <input id="memberName" type="text" maxlength="12" value="${escapeHtml(member.name)}" placeholder="請輸入姓名">
        </div>
        <div class="form-row">
          <label for="memberDept">所屬單位</label>
          <select id="memberDept">${buildSelectOptions(state.departments, "id", (item) => item.name, member.deptId)}</select>
        </div>
        <div class="form-row">
          <label for="memberRole">權限</label>
          <select id="memberRole">
            <option value="employee" ${member.role === "manager" ? "" : "selected"}>員工</option>
            <option value="manager" ${member.role === "manager" ? "selected" : ""}>主管</option>
          </select>
        </div>
        <div class="form-row">
          <label for="memberHireDate">到職日</label>
          <input id="memberHireDate" type="date" value="${escapeHtml(member.hireDate)}">
        </div>
        <div class="form-row">
          <label for="memberLeaveDate">離職日</label>
          <input id="memberLeaveDate" type="date" value="${escapeHtml(member.leaveDate)}">
        </div>
        <div class="form-row form-row-wide">
          <label for="memberSalaryType">薪資方式</label>
          <select id="memberSalaryType">
            <option value="monthly" ${member.payByDay ? "" : "selected"}>月薪</option>
            <option value="daily" ${member.payByDay ? "selected" : ""}>按日計薪</option>
          </select>
        </div>
        ${mode === "edit" ? `
          <div class="form-row form-row-wide">
            <button class="ghost-btn" type="button" data-reset-member-password="${escapeHtml(member.code)}">重設密碼為 0000</button>
          </div>
        ` : ""}
      </div>
    `,
    headerButtons: `<button class="btn-primary" type="button" data-save-member="${mode}">${mode === "edit" ? "儲存修改" : "新增人員"}</button>`,
    hideFooterClose: true
  });
}

async function saveMember(mode) {
  const hireDate = document.getElementById("memberHireDate")?.value || "";
  const leaveDate = document.getElementById("memberLeaveDate")?.value || "";
  if (hireDate && leaveDate && !isValidDateRange(hireDate, leaveDate)) {
    reportValidationError("到職日必須早於離職日");
    return;
  }
  const previousMember = mode === "edit"
    ? state.members.find((member) => member.id === modalContext.targetId) || null
    : null;
  const payload = {
    id: mode === "edit" ? modalContext.targetId : uid("m"),
    code: document.getElementById("memberCode")?.value.trim(),
    name: document.getElementById("memberName")?.value.trim(),
    deptId: document.getElementById("memberDept")?.value || "",
    positionId: mode === "edit" ? (state.members.find((member) => member.id === modalContext.targetId)?.positionId || "") : "",
    proxyMemberId: "",
    hireDate,
    leaveDate,
    payByDay: document.getElementById("memberSalaryType")?.value === "daily",
    role: document.getElementById("memberRole")?.value === "manager" ? "manager" : "employee"
  };
  if (!payload.code || !payload.name || !payload.deptId) {
    return;
  }
  try {
    await window.schedulerApi.syncMemberProfile(payload, previousMember?.code || "");
  } catch (error) {
    setSaveStatus(`同步人員資料失敗：${error.message}`);
    return;
  }
  if (mode === "edit") {
    state.members = state.members.map((member) => member.id === payload.id ? payload : member);
  } else {
    state.members.push(payload);
  }
  if (currentProfile && currentProfile.employee_code === (previousMember?.code || payload.code)) {
    currentProfile = {
      ...currentProfile,
      employee_code: payload.code,
      full_name: payload.name,
      role: payload.role
    };
  }
  currentMember = resolveCurrentMember();
  closeModal();
  renderAll();
  openMemberSettings();
  queueSave();
}

async function exportMembersFromSettings() {
  try {
    await window.schedulerApi.exportMembers({
      state,
      year: state.year,
      month: state.month
    });
  } catch (error) {
    setSaveStatus(`匯出失敗：${error.message}`);
  }
}

async function importMembersFromSettings() {
  try {
    const result = await window.schedulerApi.importMembers();
    if (result.canceled) {
      return;
    }
    const departmentMap = new Map(state.departments.map((department) => [department.name.trim(), department.id]));
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let syncFailed = 0;
    let firstSyncError = "";

    for (const row of result.rows || []) {
      const code = String(row.code || "").trim();
      const name = String(row.name || "").trim();
      const departmentName = String(row.departmentName || "").trim();
      const deptId = departmentMap.get(departmentName);
      if (!code || !name || !deptId) {
        skipped += 1;
        continue;
      }
      if (row.hireDate && row.leaveDate && !isValidDateRange(row.hireDate, row.leaveDate)) {
        skipped += 1;
        continue;
      }
      const existing = state.members.find((member) => member.code === code) || null;
      const payload = {
        id: existing?.id || uid("m"),
        code,
        name,
        deptId,
        positionId: existing?.positionId || "",
        proxyMemberId: existing?.proxyMemberId || "",
        hireDate: row.hireDate || "",
        leaveDate: row.leaveDate || "",
        payByDay: Boolean(row.payByDay),
        role: row.role === "manager" ? "manager" : "employee"
      };
      try {
        await window.schedulerApi.syncMemberProfile(payload, existing?.code || "");
      } catch (error) {
        syncFailed += 1;
        if (!firstSyncError) {
          firstSyncError = `${code || "(空白工號)"}：${error.message || "同步失敗"}`;
        }
        continue;
      }
      if (existing) {
        state.members = state.members.map((member) => member.id === existing.id ? payload : member);
        updated += 1;
      } else {
        state.members.push(payload);
        imported += 1;
      }
    }

    currentMember = resolveCurrentMember();
    renderAll();
    openMemberSettings();
    queueSave();
    const summary = `匯入完成：新增 ${imported} 筆，更新 ${updated} 筆，略過 ${skipped} 筆，同步失敗 ${syncFailed} 筆`;
    if (syncFailed > 0) {
      showInfoMessage(`${summary}\n第一筆同步失敗：${firstSyncError}`);
      setSaveStatus(`匯入同步失敗：${firstSyncError}`);
      return;
    }
    showInfoMessage(summary);
  } catch (error) {
    setSaveStatus(`匯入失敗：${error.message}`);
  }
}

async function deleteMember(memberId) {
  const confirmed = await confirmAction("確定要刪除這位人員嗎？");
  if (!confirmed) {
    return;
  }
  state.members = state.members.filter((member) => member.id !== memberId);
  state.members = state.members.map((member) => ({
    ...member,
    proxyMemberId: member.proxyMemberId === memberId ? "" : member.proxyMemberId
  }));
  removeScheduleByMember(memberId);
  renderAll();
  openMemberSettings();
  queueSave();
}

async function resetMemberPasswordFromModal(employeeCode) {
  const code = String(employeeCode || "").trim();
  if (!code) {
    return;
  }
  const confirmed = await confirmAction(`確定要將 ${code} 的密碼重設為 0000 嗎？`);
  if (!confirmed) {
    return;
  }
  try {
    await window.schedulerApi.resetMemberPassword(code);
    showInfoMessage(`${code} 的密碼已重設為 0000`);
  } catch (error) {
    setSaveStatus(`重設密碼失敗：${error.message}`);
  }
}

async function refreshRequestData() {
  if (!isLoggedIn() || !currentProfile) {
    try {
      const publicRequests = await window.schedulerApi.listPublicScheduleRequests();
      leaveRequestRecords = publicRequests.leaveRequests;
      overtimeRequestRecords = publicRequests.overtimeRequests;
      requestOverlaySourceLoaded = true;
    } catch {
      requestOverlaySourceLoaded = false;
      leaveRequestRecords = [];
      overtimeRequestRecords = [];
    }
    return;
  }
  leaveRequestRecords = await window.schedulerApi.listLeaveRequests({ manager: isManager() });
  overtimeRequestRecords = await window.schedulerApi.listOvertimeRequests({ manager: isManager() });
  requestOverlaySourceLoaded = true;
}

function syncApprovedRequestsToSchedule() {
  if (!requestOverlaySourceLoaded) {
    return;
  }
  Object.values(state.schedule).forEach((slot) => {
    if (slot?.leaveRequestId) {
      slot.leave = null;
      slot.leaveMeta = null;
      slot.leaveRequestId = null;
    }
    if (slot?.overtimeRequestId) {
      slot.overtime = null;
      slot.overtimeRequestId = null;
      slot.overtimeMeta = null;
    }
  });
  leaveRequestRecords.forEach((record) => {
    applyApprovedLeaveRequestToSchedule(record);
  });
  overtimeRequestRecords.forEach((record) => {
    applyApprovedOvertimeRequestToSchedule(record);
  });
  pruneEmptySchedule();
}

async function syncRequestCatalogs() {
  if (!isManager()) {
    return;
  }
  await window.schedulerApi.syncCatalogs(state);
}

function renderRequestSummaryLines(record, kind) {
  const lines = [];
  if (record.memberName || record.memberCode) {
    lines.push(`${record.memberCode || "-"} · ${record.memberName || "-"}`);
  }
  if (kind === "leave") {
    lines.push(`${record.leaveCode || ""} ${record.leaveName || ""}`.trim());
    lines.push(`日期：${formatRequestDateText(record.startDate, record.endDate)}`);
    lines.push(`時間：${formatRequestTimeText(record)}`);
  } else {
    lines.push("加班");
    lines.push(`日期：${record.workDate || ""}`);
    lines.push(`時間：${formatOvertimeTimeText(record)}`);
    lines.push(...formatOvertimeRestLines(record));
  }
  lines.push(`狀態：${getRequestStatusLabel(record.status)}`);
  if (record.reason) {
    lines.push(`原因：${record.reason}`);
  }
  if (record.managerNote) {
    lines.push(`主管備註：${record.managerNote}`);
  }
  return lines.filter(Boolean);
}

function getCompactManagerRequestMetaLines(record, kind) {
  const lines = [
    kind === "leave"
      ? `${record.leaveName || ""}｜${formatRequestDateText(record.startDate, record.endDate)}｜${formatRequestTimeText(record)}`
      : `加班｜${record.workDate || ""}｜${formatOvertimeTimeText(record)}`
  ];
  if (kind === "overtime") {
    lines.push(...formatOvertimeRestLines(record));
  }
  if (record.reason) {
    lines.push(`原因：${record.reason}`);
  }
  if (record.managerNote) {
    lines.push(`主管備註：${record.managerNote}`);
  }
  return lines.filter(Boolean);
}

function renderEmployeeRequestList(kind, records) {
  const sortedRecords = [...records].sort((left, right) => {
    const leftDate = kind === "leave"
      ? `${left.endDate || left.startDate || ""}|${left.startDate || ""}|${left.createdAt || ""}`
      : `${left.workDate || ""}|${left.createdAt || ""}`;
    const rightDate = kind === "leave"
      ? `${right.endDate || right.startDate || ""}|${right.startDate || ""}|${right.createdAt || ""}`
      : `${right.workDate || ""}|${right.createdAt || ""}`;
    return rightDate.localeCompare(leftDate);
  });
  if (!records.length) {
    return '<div class="empty-state">目前還沒有申請資料</div>';
  }
  return sortedRecords.map((record) => `
    <div class="request-item request-item-compact">
      <div class="request-head request-head-compact">
        <div class="request-title request-title-compact">${escapeHtml(kind === "leave" ? `${record.leaveName || ""}`.trim() : "加班")}</div>
        <div class="request-head-actions">
        <span class="request-status request-status-${escapeHtml(record.status)}">${escapeHtml(getRequestStatusLabel(record.status))}</span>
          ${record.status === "pending"
            ? `<button class="ghost-btn compact-btn request-delete-btn" type="button" data-delete-request="${kind}:${record.id}">刪除</button>`
            : ""}
        </div>
      </div>
      <div class="request-inline-meta">
        <span class="request-meta">${escapeHtml(kind === "leave" ? formatRequestDateText(record.startDate, record.endDate) : record.workDate || "-")}</span>
        <span class="request-inline-divider">｜</span>
        <span class="request-meta">${escapeHtml(kind === "leave" ? formatRequestTimeText(record) : formatOvertimeTimeText(record))}</span>
        ${record.reason ? `<span class="request-inline-divider">｜</span><span class="request-meta">${escapeHtml(`原因：${record.reason}`)}</span>` : ""}
      </div>
    </div>
  `).join("");
}

async function deleteEmployeeRequest(kind, requestId) {
  const label = kind === "leave" ? "請假申請" : "加班申請";
  const confirmed = await confirmAction(`確定要刪除這筆${label}嗎？`);
  if (!confirmed) {
    return;
  }
  if (kind === "leave") {
    await window.schedulerApi.deleteLeaveRequest(requestId);
    await refreshRequestData();
    renderTable();
    await openLeaveRequestModal();
    return;
  }
  await window.schedulerApi.deleteOvertimeRequest(requestId);
  await refreshRequestData();
  renderTable();
  await openOvertimeRequestModal();
}

function renderManagerRequestList(kind, records) {
  const filter = requestReviewFilters[kind] || { memberCode: "", date: "", status: "" };
  const filteredRecords = records.filter((record) => {
    const memberKeyword = String(filter.memberCode || "").trim();
    const memberMatch = !memberKeyword || `${record.memberName || ""}`.includes(memberKeyword);
    const dateValue = kind === "leave" ? record.startDate : record.workDate;
    const dateMatch = !filter.date || dateValue === filter.date;
    const statusMatch = !filter.status || record.status === filter.status;
    return memberMatch && dateMatch && statusMatch;
  });
  if (!records.length) {
    return '<div class="empty-state">目前沒有可審核資料</div>';
  }
  return `
    <div class="request-filter-bar">
      <div class="form-row">
        <label for="${kind}ReviewFilterMember">申請人</label>
        <input id="${kind}ReviewFilterMember" type="text" value="${escapeHtml(filter.memberCode)}" placeholder="輸入姓名" data-request-filter-kind="${kind}" data-request-filter-field="memberCode">
      </div>
      <div class="form-row">
        <label for="${kind}ReviewFilterDate">日期</label>
        <input id="${kind}ReviewFilterDate" type="date" value="${escapeHtml(filter.date)}" data-request-filter-kind="${kind}" data-request-filter-field="date">
      </div>
      <div class="form-row">
        <label for="${kind}ReviewFilterStatus">審核結果</label>
        <select id="${kind}ReviewFilterStatus" data-request-filter-kind="${kind}" data-request-filter-field="status">
          <option value="">全部</option>
          <option value="pending" ${filter.status === "pending" ? "selected" : ""}>待審核</option>
          <option value="approved" ${filter.status === "approved" ? "selected" : ""}>已核准</option>
          <option value="rejected" ${filter.status === "rejected" ? "selected" : ""}>已退回</option>
          <option value="cancelled" ${filter.status === "cancelled" ? "selected" : ""}>已取消</option>
        </select>
      </div>
      <div class="request-filter-actions">
        <button class="ghost-btn compact-btn" type="button" data-clear-request-filters="${kind}">清除</button>
      </div>
    </div>
    <div class="request-list-wrap">
      ${filteredRecords.length ? filteredRecords.map((record) => `
    <div class="request-review-row">
      <div class="request-review-main">
        <div class="request-review-person">${escapeHtml(record.memberName || "-")}</div>
        <div class="request-review-summary">
          ${getCompactManagerRequestMetaLines(record, kind).map((line) => `<div class="request-meta">${escapeHtml(line)}</div>`).join("")}
        </div>
      </div>
      <span class="request-status request-status-${escapeHtml(record.status)}">${escapeHtml(getRequestStatusLabel(record.status))}</span>
      <div class="request-review-controls">
        <div class="form-row">
          <label for="${kind}ReviewStatus_${record.id}">審核</label>
          <select id="${kind}ReviewStatus_${record.id}">${getRequestStatusOptions(record.status)}</select>
        </div>
        <div class="form-row">
          <label for="${kind}ReviewNote_${record.id}">備註</label>
          <input id="${kind}ReviewNote_${record.id}" type="text" maxlength="120" value="${escapeHtml(record.managerNote || "")}" placeholder="可選填">
        </div>
        <div class="request-actions">
          <button class="btn-primary" type="button" data-save-request-review="${kind}:${record.id}">儲存審核</button>
        </div>
      </div>
    </div>
  `).join("") : '<div class="empty-state">沒有符合篩選條件的資料</div>'}
    </div>
  `;
}

function syncLeaveRequestFormUi() {
  const allDay = document.getElementById("leaveRequestAllDay")?.checked !== false;
  const timeSection = document.getElementById("leaveRequestTimeSection");
  if (timeSection) {
    timeSection.style.display = allDay ? "none" : "";
  }
  setTimeInputDisabled("leaveRequestStartTime", allDay);
  setTimeInputDisabled("leaveRequestEndTime", allDay);
}

function syncOvertimeRequestFormUi() {
  const useRest1 = Boolean(document.getElementById("overtimeRequestUseRest1")?.checked);
  const useRest2 = Boolean(document.getElementById("overtimeRequestUseRest2")?.checked) && useRest1;
  const rest1Fields = document.getElementById("overtimeRequestRest1Fields");
  const rest2Fields = document.getElementById("overtimeRequestRest2Fields");
  const rest2Toggle = document.getElementById("overtimeRequestUseRest2");

  if (rest1Fields) {
    rest1Fields.style.display = useRest1 ? "" : "none";
  }
  setTimeInputDisabled("overtimeRequestRest1StartTime", !useRest1);
  setTimeInputDisabled("overtimeRequestRest1EndTime", !useRest1);

  if (rest2Toggle) {
    rest2Toggle.disabled = !useRest1;
    if (!useRest1) {
      rest2Toggle.checked = false;
    }
  }
  if (rest2Fields) {
    rest2Fields.style.display = useRest2 ? "" : "none";
  }
  setTimeInputDisabled("overtimeRequestRest2StartTime", !useRest2);
  setTimeInputDisabled("overtimeRequestRest2EndTime", !useRest2);
}

function syncScheduleOvertimeFormUi() {
  const useRest1 = Boolean(document.getElementById("scheduleOvertimeUseRest1")?.checked);
  const useRest2 = Boolean(document.getElementById("scheduleOvertimeUseRest2")?.checked) && useRest1;
  const rest1Fields = document.getElementById("scheduleOvertimeRest1Fields");
  const rest2Fields = document.getElementById("scheduleOvertimeRest2Fields");
  const rest2Toggle = document.getElementById("scheduleOvertimeUseRest2");

  if (rest1Fields) {
    rest1Fields.style.display = useRest1 ? "" : "none";
  }
  setTimeInputDisabled("scheduleOvertimeRest1StartTime", !useRest1);
  setTimeInputDisabled("scheduleOvertimeRest1EndTime", !useRest1);

  if (rest2Toggle) {
    rest2Toggle.disabled = !useRest1;
    if (!useRest1) {
      rest2Toggle.checked = false;
    }
  }
  if (rest2Fields) {
    rest2Fields.style.display = useRest2 ? "" : "none";
  }
  setTimeInputDisabled("scheduleOvertimeRest2StartTime", !useRest2);
  setTimeInputDisabled("scheduleOvertimeRest2EndTime", !useRest2);
}

async function openLeaveRequestModal() {
  if (!isLoggedIn()) {
    openSignInDialog("送出請假申請前請先登入");
    return;
  }
  const actor = getRequestActor();
  if (!actor) {
    showInfoMessage("目前帳號尚未建立身份資料，無法送出請假申請");
    return;
  }
  await refreshRequestData();
  const leaveItems = getAllowedLeaveRequestItems();
  const defaultLeave = leaveItems[0];
  openEntityListModal({
    title: "請假申請",
    modalClass: "modal modal-wide",
    body: `
      <div class="form-grid">
        <div class="form-row">
          <label>申請人</label>
          <div class="readonly-pill">${escapeHtml(actor.code)} · ${escapeHtml(actor.name)}</div>
        </div>
        <div class="form-row">
          <label for="leaveRequestType">假別</label>
          <select id="leaveRequestType">${leaveItems.map((item) => `<option value="${item.id}">${escapeHtml(getLeaveLabel(item))}</option>`).join("")}</select>
        </div>
        <div class="form-row">
          <label for="leaveRequestStartDate">開始日期</label>
          <input id="leaveRequestStartDate" type="date" value="${toDateString(state.year, state.month, 1)}">
        </div>
        <div class="form-row">
          <label for="leaveRequestEndDate">結束日期</label>
          <input id="leaveRequestEndDate" type="date" value="${toDateString(state.year, state.month, 1)}">
        </div>
      </div>
      <div class="form-row checkbox-row checkbox-row-left">
        <label>
          <input id="leaveRequestAllDay" type="checkbox" ${defaultLeave?.defaultAllDay !== false ? "checked" : ""}>
          整天
        </label>
      </div>
      <div class="form-grid" id="leaveRequestTimeSection" style="${defaultLeave?.defaultAllDay !== false ? "display:none;" : ""}">
        <div class="form-row">
          <label for="leaveRequestStartTime">開始時間</label>
          ${timeInputMarkup("leaveRequestStartTime", "")}
        </div>
        <div class="form-row">
          <label for="leaveRequestEndTime">結束時間</label>
          ${timeInputMarkup("leaveRequestEndTime", "")}
        </div>
      </div>
      <div class="form-row">
        <label for="leaveRequestReason">原因</label>
        <input id="leaveRequestReason" type="text" maxlength="120" placeholder="請輸入原因">
      </div>
      <div class="request-section">
        <div class="section-title">我的請假申請</div>
        ${renderEmployeeRequestList("leave", leaveRequestRecords)}
      </div>
    `,
    footerButtons: '<button class="btn-primary" type="button" data-save-leave-request="true">送出申請</button>'
  });
  syncLeaveRequestFormUi();
}

async function saveLeaveRequestFromModal() {
  const leaveId = document.getElementById("leaveRequestType")?.value || "";
  const leave = getItem("leave", leaveId);
  const startDate = document.getElementById("leaveRequestStartDate")?.value || "";
  const endDate = document.getElementById("leaveRequestEndDate")?.value || "";
  const isAllDay = document.getElementById("leaveRequestAllDay")?.checked !== false;
  const startTime = readTimeInputValue("leaveRequestStartTime");
  const endTime = readTimeInputValue("leaveRequestEndTime");
  if (!leave || !startDate || !endDate || !isValidDateRange(startDate, endDate) && startDate !== endDate) {
    reportValidationError("請確認請假日期");
    return;
  }
  if (!isAllDay && !isValidTimeRange(startTime, endTime)) {
    reportValidationError("開始時間必須早於結束時間");
    return;
  }
  await window.schedulerApi.createLeaveRequest({
    leaveCode: leave.code,
    startDate,
    endDate,
    isAllDay,
    startTime,
    endTime,
    reason: document.getElementById("leaveRequestReason")?.value.trim() || ""
  });
  await refreshRequestData();
  const nextRecord = leaveRequestRecords.find((record) => (
    record.memberCode === currentProfile?.employee_code &&
    record.leaveCode === leave.code &&
    record.startDate === startDate &&
    record.endDate === endDate
  ));
  if (nextRecord) {
    applyApprovedLeaveRequestToSchedule(nextRecord);
    renderTable();
  }
  showInfoMessage("請假申請已送出");
  await openLeaveRequestModal();
}

async function openOvertimeRequestModal() {
  if (!isLoggedIn()) {
    openSignInDialog("送出加班申請前請先登入");
    return;
  }
  const actor = getRequestActor();
  if (!actor) {
    showInfoMessage("目前帳號尚未建立身份資料，無法送出加班申請");
    return;
  }
  await refreshRequestData();
  openEntityListModal({
    title: "加班申請",
    modalClass: "modal modal-wide",
    body: `
      <div class="form-grid">
        <div class="form-row">
          <label>申請人</label>
          <div class="readonly-pill">${escapeHtml(actor.code)} · ${escapeHtml(actor.name)}</div>
        </div>
        <div class="form-row">
          <label for="overtimeRequestDate">加班日期</label>
          <input id="overtimeRequestDate" type="date" value="${toDateString(state.year, state.month, 1)}">
        </div>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="overtimeRequestStartTime">加班開始</label>
          ${timeInputMarkup("overtimeRequestStartTime", "")}
        </div>
        <div class="form-row">
          <label for="overtimeRequestEndTime">加班結束</label>
          ${timeInputMarkup("overtimeRequestEndTime", "")}
        </div>
      </div>
      <div class="form-section">
        <div class="form-row checkbox-row">
          <label class="overtime-use-label">
            <input id="overtimeRequestUseRest1" type="checkbox">
            使用休息1
          </label>
        </div>
        <div class="form-grid" id="overtimeRequestRest1Fields" style="display:none;">
          <div class="form-row">
            <label for="overtimeRequestRest1StartTime">休息1開始</label>
            ${timeInputMarkup("overtimeRequestRest1StartTime", "", true)}
          </div>
          <div class="form-row">
            <label for="overtimeRequestRest1EndTime">休息1結束</label>
            ${timeInputMarkup("overtimeRequestRest1EndTime", "", true)}
          </div>
        </div>
      </div>
      <div class="form-section">
        <div class="form-row checkbox-row">
          <label class="overtime-use-label">
            <input id="overtimeRequestUseRest2" type="checkbox" disabled>
            使用休息2
          </label>
        </div>
        <div class="form-grid" id="overtimeRequestRest2Fields" style="display:none;">
          <div class="form-row">
            <label for="overtimeRequestRest2StartTime">休息2開始</label>
            ${timeInputMarkup("overtimeRequestRest2StartTime", "", true)}
          </div>
          <div class="form-row">
            <label for="overtimeRequestRest2EndTime">休息2結束</label>
            ${timeInputMarkup("overtimeRequestRest2EndTime", "", true)}
          </div>
        </div>
      </div>
      <div class="form-row">
        <label for="overtimeRequestReason">原因</label>
        <input id="overtimeRequestReason" type="text" maxlength="120" placeholder="請輸入原因">
      </div>
      <div class="request-section">
        <div class="section-title">我的加班申請</div>
        ${renderEmployeeRequestList("overtime", overtimeRequestRecords)}
      </div>
    `,
    footerButtons: '<button class="btn-primary" type="button" data-save-overtime-request="true">送出申請</button>'
  });
  syncOvertimeRequestFormUi();
}

async function saveOvertimeRequestFromModal() {
  const workDate = document.getElementById("overtimeRequestDate")?.value || "";
  const startTime = readTimeInputValue("overtimeRequestStartTime");
  const endTime = readTimeInputValue("overtimeRequestEndTime");
  const useRest1 = Boolean(document.getElementById("overtimeRequestUseRest1")?.checked);
  const useRest2 = Boolean(document.getElementById("overtimeRequestUseRest2")?.checked) && useRest1;
  const rest1StartTime = readTimeInputValue("overtimeRequestRest1StartTime");
  const rest1EndTime = readTimeInputValue("overtimeRequestRest1EndTime");
  const rest2StartTime = readTimeInputValue("overtimeRequestRest2StartTime");
  const rest2EndTime = readTimeInputValue("overtimeRequestRest2EndTime");
  if (!workDate) {
    reportValidationError("請確認加班日期");
    return;
  }
  if (!isValidTimeRange(startTime, endTime)) {
    reportValidationError("加班開始時間必須早於加班結束時間");
    return;
  }
  if (useRest1 && !isValidTimeRange(rest1StartTime, rest1EndTime)) {
    reportValidationError("休息1開始時間必須早於結束時間");
    return;
  }
  if (useRest2 && !isValidTimeRange(rest2StartTime, rest2EndTime)) {
    reportValidationError("休息2開始時間必須早於結束時間");
    return;
  }
  try {
    await window.schedulerApi.createOvertimeRequest({
      workDate,
      startTime,
      endTime,
      useRest1,
      rest1StartTime,
      rest1EndTime,
      useRest2,
      rest2StartTime,
      rest2EndTime,
      reason: document.getElementById("overtimeRequestReason")?.value.trim() || ""
    });
  } catch (error) {
    showInfoMessage(`加班申請送出失敗：${formatSchedulerError(error, "送出失敗")}`);
    return;
  }
  await refreshRequestData();
  const nextRecord = overtimeRequestRecords.find((record) => (
    record.memberCode === currentProfile?.employee_code &&
    record.workDate === workDate &&
    record.startTime === startTime &&
    record.endTime === endTime
  ));
  if (nextRecord) {
    applyApprovedOvertimeRequestToSchedule(nextRecord);
    renderTable();
  }
  showInfoMessage("加班申請已送出");
  await openOvertimeRequestModal();
}

async function openLeaveApprovalModal() {
  if (!promptManagerAccess("審核請假前請先登入主管帳號")) {
    return;
  }
  await refreshRequestData();
  openEntityListModal({
    title: "請假審核",
    modalClass: "modal modal-wide",
    body: renderManagerRequestList("leave", leaveRequestRecords)
  });
}

async function openOvertimeApprovalModal() {
  if (!promptManagerAccess("審核加班前請先登入主管帳號")) {
    return;
  }
  await refreshRequestData();
  openEntityListModal({
    title: "加班審核",
    modalClass: "modal modal-wide",
    body: renderManagerRequestList("overtime", overtimeRequestRecords)
  });
}

async function openRequestReviewFromTooltip(kind, requestId) {
  if (!promptManagerAccess("審核申請前請先登入主管帳號")) {
    return;
  }
  await refreshRequestData();
  const records = kind === "leave" ? leaveRequestRecords : overtimeRequestRecords;
  const record = records.find((item) => item.id === requestId);
  requestReviewFilters[kind] = {
    memberCode: record?.memberCode || "",
    date: kind === "leave" ? (record?.startDate || "") : (record?.workDate || ""),
    status: record?.status || ""
  };
  if (kind === "leave") {
    await openLeaveApprovalModal();
  } else {
    await openOvertimeApprovalModal();
  }
}

function clearScheduleLeaveByRequestId(requestId) {
  Object.values(state.schedule).forEach((slot) => {
    if (slot?.leaveRequestId === requestId) {
      slot.leave = null;
      slot.leaveMeta = null;
      slot.leaveRequestId = null;
    }
  });
}

function clearScheduleOvertimeByRequestId(requestId) {
  Object.values(state.schedule).forEach((slot) => {
    if (slot?.overtimeRequestId === requestId) {
      slot.overtime = null;
      slot.overtimeRequestId = null;
      slot.overtimeMeta = null;
    }
  });
}

function applyApprovedLeaveRequestToSchedule(record) {
  clearScheduleLeaveByRequestId(record.id);
  if (!["pending", "approved"].includes(record.status)) {
    pruneEmptySchedule();
    return;
  }
  const member = state.members.find((item) => item.code === record.memberCode);
  const leave = state.leaves.find((item) => item.code === record.leaveCode);
  if (!member || !leave) {
    return;
  }
  enumerateDateRange(record.startDate, record.endDate).forEach((dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const slotKey = scheduleKey(member.id, year, month - 1, day);
    const slot = state.schedule[slotKey] || { shift: null, leave: null, overtime: null };
    if (record.status === "approved") {
      slot.shift = null;
    }
    slot.leave = leave.id;
    slot.leaveMeta = {
      allDay: record.isAllDay !== false,
      startTime: record.isAllDay !== false ? "" : record.startTime || "",
      endTime: record.isAllDay !== false ? "" : record.endTime || "",
      reasonEnabled: Boolean(record.reason),
      reason: record.reason || "",
      requestStatus: record.status
    };
    slot.leaveRequestId = record.id;
    state.schedule[slotKey] = slot;
  });
  pruneEmptySchedule();
}

function applyApprovedOvertimeRequestToSchedule(record) {
  clearScheduleOvertimeByRequestId(record.id);
  if (!["pending", "approved"].includes(record.status)) {
    pruneEmptySchedule();
    return;
  }
  const member = state.members.find((item) => item.code === record.memberCode);
  const overtime = state.overtime[0];
  if (!member || !overtime || !record.workDate) {
    return;
  }
  const [year, month, day] = record.workDate.split("-").map(Number);
  const slotKey = scheduleKey(member.id, year, month - 1, day);
  const slot = state.schedule[slotKey] || { shift: null, leave: null, overtime: null };
  slot.overtime = overtime.id;
  slot.overtimeMeta = {
    startTime: record.startTime || "",
    endTime: record.endTime || "",
    useRest1: Boolean(record.useRest1),
    rest1StartTime: record.useRest1 ? (record.rest1StartTime || "") : "",
    rest1EndTime: record.useRest1 ? (record.rest1EndTime || "") : "",
    useRest2: Boolean(record.useRest2),
    rest2StartTime: record.useRest2 ? (record.rest2StartTime || "") : "",
    rest2EndTime: record.useRest2 ? (record.rest2EndTime || "") : "",
    requestStatus: record.status,
    reason: record.reason || ""
  };
  slot.overtimeRequestId = record.id;
  state.schedule[slotKey] = slot;
  pruneEmptySchedule();
}

async function saveRequestReview(kind, requestId) {
  if (!promptManagerAccess("審核申請前請先登入主管帳號")) {
    return;
  }
  const status = document.getElementById(`${kind}ReviewStatus_${requestId}`)?.value || "pending";
  const managerNote = document.getElementById(`${kind}ReviewNote_${requestId}`)?.value.trim() || "";
  if (kind === "leave") {
    await window.schedulerApi.updateLeaveRequest({ id: requestId, status, managerNote });
  } else {
    await window.schedulerApi.updateOvertimeRequest({ id: requestId, status, managerNote });
  }
  await refreshRequestData();
  syncApprovedRequestsToSchedule();
  const nextRecord = (kind === "leave" ? leaveRequestRecords : overtimeRequestRecords).find((item) => item.id === requestId);
  if (nextRecord) {
    if (kind === "leave") {
      applyApprovedLeaveRequestToSchedule(nextRecord);
    } else {
      applyApprovedOvertimeRequestToSchedule(nextRecord);
    }
    await forceSave();
  }
  renderAll();
  if (kind === "leave") {
    await openLeaveApprovalModal();
  } else {
    await openOvertimeApprovalModal();
  }
}

async function handleSignIn() {
  const loginAccount = document.getElementById("loginAccount")?.value.trim() || "";
  const password = document.getElementById("loginPassword")?.value || "";
  if (!loginAccount || !password) {
    authErrorMessage = "請輸入工號與密碼";
    renderAuthGate();
    return;
  }
  try {
    authErrorMessage = "";
    await window.schedulerApi.signIn(loginAccount, password);
    closeSignInDialog();
    await loadApp();
  } catch (error) {
    authErrorMessage = error.message || "登入失敗";
    renderAuthGate();
  }
}

async function handleSignOut() {
  await window.schedulerApi.signOut();
  authErrorMessage = "";
  authPromptMessage = "";
  authModalOpen = false;
  currentSession = null;
  currentProfile = null;
  currentMember = null;
  leaveRequestRecords = [];
  overtimeRequestRecords = [];
  appInfo = null;
  closeModal();
  closeCoreActionsMenu();
  await loadApp();
}

function changeMonth(delta) {
  state.month += delta;
  if (state.month > 11) {
    state.month = 0;
    state.year += 1;
  }
  if (state.month < 0) {
    state.month = 11;
    state.year -= 1;
  }
  renderAll();
  queueSave();
}



async function exportSapCsv() {
  if (!hasSapLeaveRows()) {
    showInfoMessage("目前沒有可匯出的休例假資料");
    return;
  }
  try {
    const result = await window.schedulerApi.exportSapCsv({
      state,
      year: state.year,
      month: state.month
    });
    if (result.canceled) {
      return;
    }
  } catch (error) {
    setSaveStatus(`匯出失敗：${error.message}`);
  }
}

async function exportOvertime() {
  if (!hasOvertimeRows()) {
    showInfoMessage("目前沒有可匯出的加班資料");
    return;
  }
  try {
    const result = await window.schedulerApi.exportOvertime({
      state,
      year: state.year,
      month: state.month
    });
    if (result.canceled) {
      return;
    }
  } catch (error) {
    setSaveStatus(`匯出失敗：${error.message}`);
  }
}

async function exportLeave() {
  if (!hasLeaveRows()) {
    showInfoMessage("目前沒有可匯出的請假資料");
    return;
  }
  try {
    const result = await window.schedulerApi.exportLeave({
      state,
      year: state.year,
      month: state.month
    });
    if (result.canceled) {
      return;
    }
  } catch (error) {
    setSaveStatus(`匯出失敗：${error.message}`);
  }
}

async function forceSave() {
  if (!canEditSchedule()) {
    return;
  }
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    await window.schedulerApi.saveState(state);
  } catch (error) {
    setSaveStatus(`儲存失敗：${error.message}`);
  }
}

function bindEvents() {
  if (eventsBound) {
    return;
  }
  eventsBound = true;
  const bindClick = (id, handler) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", handler);
    }
  };

  bindClick("coreActionsToggle", (event) => {
    event.stopPropagation();
    toggleCoreActionsMenu();
  });
  bindClick("toolbarCollapseToggle", (event) => {
    event.stopPropagation();
    toggleToolbarCollapse();
  });
  bindClick("prevMonthButton", () => changeMonth(-1));
  bindClick("nextMonthButton", () => changeMonth(1));
  bindClick("exportSapButton", () => {
    closeCoreActionsMenu();
    exportSapCsv();
  });
  bindClick("exportOvertimeButton", () => {
    closeCoreActionsMenu();
    exportOvertime();
  });
  bindClick("exportLeaveButton", () => {
    closeCoreActionsMenu();
    exportLeave();
  });
  bindClick("deptSettingsButton", openDepartmentSettings);
  bindClick("shiftSettingsButton", () => openListSettings("shift"));
  bindClick("leaveSettingsButton", () => openListSettings("leave"));
  bindClick("overtimeSettingsButton", () => openListSettings("overtime"));
  bindClick("leaveApprovalButton", async () => {
    closeCoreActionsMenu();
    await openLeaveApprovalModal();
  });
  bindClick("overtimeApprovalButton", async () => {
    closeCoreActionsMenu();
    await openOvertimeApprovalModal();
  });

  const tableWrap = document.getElementById("tableWrap");
  if (tableWrap) {
    tableWrap.addEventListener("scroll", syncStickyHeaderScroll, { passive: true });
  }
  window.addEventListener("resize", () => {
    syncScheduleColumnWidths();
    syncStickyHeaderLayout();
    syncStickyHeaderScroll();
    if (!toolbarCollapseInitialized) {
      initializeToolbarCollapse();
    }
    syncToolbarCollapseUi();
  });

  const deptFilter = document.getElementById("deptFilter");
  if (deptFilter) {
    deptFilter.addEventListener("change", (event) => {
      state.deptFilter = event.target.value;
      renderToolbar();
      renderTable();
      queueSave();
    });
  }
  const tableDeptScopeFilter = document.getElementById("tableDeptScopeFilter");
  if (tableDeptScopeFilter) {
    tableDeptScopeFilter.addEventListener("change", (event) => {
      state.tableDeptScopeFilter = event.target.value;
      renderToolbar();
      renderTable();
      queueSave();
    });
  }

  document.body.addEventListener("click", async (event) => {
    const target = event.target.closest("button, td");
    if (!target) {
      return;
    }
    if (target.dataset.openSignIn) {
      openSignInDialog();
      return;
    }
    if (target.dataset.closeAuthGate) {
      closeSignInDialog();
      return;
    }
    if (target.dataset.authSignIn) {
      await handleSignIn();
      return;
    }
    if (target.id === "signOutButton" || target.id === "authGateSignOutButton") {
      await handleSignOut();
      return;
    }
    if (target.id === "coreActionsToggle") {
      return;
    }
    if (target.dataset.closeButton) {
      closeModal();
      return;
    }
    const cellTarget = target instanceof Element ? target.closest(".cell") : null;
    if (cellTarget instanceof HTMLElement) {
      if (cellTarget.classList.contains("inactive-cell")) {
        return;
      }
      const memberId = cellTarget.dataset.memberId;
      const day = Number(cellTarget.dataset.day);
      if (!state.selected.type) {
        const slot = getSlot(memberId, day);
        if (canEditSchedule() && slot?.overtime) {
          openOvertimeAssignmentModal(memberId, day);
          return;
        }
      }
      applySelectionToCell(memberId, day);
      return;
    }
    const managerOnlyAction = Boolean(
      target.dataset.openDepartmentSettings ||
      target.dataset.openMemberSettings ||
      target.dataset.deleteCategory ||
      target.dataset.editLeaveAssignment ||
      target.dataset.openAdd ||
      target.dataset.editItem ||
      target.dataset.saveShift ||
      target.dataset.saveNamedItem ||
      target.dataset.saveOvertimeAssignment ||
      target.dataset.openAddDepartment ||
      target.dataset.editDepartment ||
      target.dataset.saveDepartment ||
      target.dataset.deleteDepartment ||
      target.dataset.openAddMember ||
      target.dataset.exportMembers ||
      target.dataset.importMembers ||
      target.dataset.editMember ||
      target.dataset.saveMember ||
      target.dataset.deleteMember ||
      target.dataset.resetMemberPassword
    );
    if (managerOnlyAction && !isManager()) {
      promptManagerAccess("此功能需先登入主管帳號");
      return;
    }
    if (target.dataset.openLeaveRequest) {
      await openLeaveRequestModal();
      return;
    }
    if (target.dataset.openDepartmentSettings) {
      openDepartmentSettings();
      return;
    }
    if (target.dataset.openMemberSettings) {
      openMemberSettings();
      return;
    }
    if (target.dataset.openOvertimeRequest) {
      await openOvertimeRequestModal();
      return;
    }
    if (target.dataset.resetMemberPassword) {
      await resetMemberPasswordFromModal(target.dataset.resetMemberPassword);
      return;
    }
    if (target.dataset.chipType !== undefined) {
      selectChip(target.dataset.chipType, target.dataset.chipId || null);
      return;
    }
    if (target.dataset.openNativeColor) {
      target.parentElement?.querySelector(".native-color-input")?.click();
      return;
    }
    if (target.dataset.color) {
      modalColor = target.dataset.color;
      syncColorPickerUi();
      return;
    }

    if (target.dataset.deleteCategory) {
      await deleteListItem(target.dataset.deleteCategory, target.dataset.deleteId);
      return;
    }
    if (target.dataset.editLeaveAssignment) {
      const [memberId, day] = target.dataset.editLeaveAssignment.split(":");
      const slot = getSlot(memberId, Number(day));
      hideLeaveTooltip();
      if (slot?.leave) {
        openLeaveAssignmentModal(memberId, Number(day), slot.leave);
      }
      return;
    }
    if (target.dataset.editOvertimeAssignment) {
      const [memberId, day] = target.dataset.editOvertimeAssignment.split(":");
      hideLeaveTooltip();
      openOvertimeAssignmentModal(memberId, Number(day));
      return;
    }
    if (target.dataset.openRequestReview) {
      const [kind, requestId] = target.dataset.openRequestReview.split(":");
      hideLeaveTooltip();
      await openRequestReviewFromTooltip(kind, requestId);
      return;
    }
    if (target.dataset.deleteRequest) {
      const [kind, requestId] = target.dataset.deleteRequest.split(":");
      await deleteEmployeeRequest(kind, requestId);
      return;
    }
    if (target.dataset.clearRequestFilters) {
      requestReviewFilters[target.dataset.clearRequestFilters] = { memberCode: "", date: "", status: "" };
      if (target.dataset.clearRequestFilters === "leave") {
        await openLeaveApprovalModal();
      } else {
        await openOvertimeApprovalModal();
      }
      return;
    }
    if (target.dataset.openAdd === "shift") openShiftFormModal("add");
    if (target.dataset.openAdd === "leave") openNamedColorFormModal("leave", "add");
    if (target.dataset.openAdd === "overtime") openNamedColorFormModal("overtime", "add");
    if (target.dataset.editItem === "shift") openShiftFormModal("edit", target.dataset.editId);
    if (target.dataset.editItem === "leave") openNamedColorFormModal("leave", "edit", target.dataset.editId);
    if (target.dataset.editItem === "overtime") openNamedColorFormModal("overtime", "edit", target.dataset.editId);
    if (target.dataset.saveShift) saveShiftFromModal(target.dataset.saveShift);
    if (target.dataset.saveNamedItem) {
      const [category, mode] = target.dataset.saveNamedItem.split(":");
      saveNamedColorItem(category, mode);
    }
    if (target.dataset.saveLeaveAssignment) saveLeaveAssignmentFromModal();
    if (target.dataset.saveOvertimeAssignment) {
      await saveOvertimeAssignmentFromModal();
      return;
    }
    if (target.dataset.saveLeaveRequest) {
      await saveLeaveRequestFromModal();
      return;
    }
    if (target.dataset.saveOvertimeRequest) {
      await saveOvertimeRequestFromModal();
      return;
    }
    if (target.dataset.saveRequestReview) {
      const [kind, requestId] = target.dataset.saveRequestReview.split(":");
      await saveRequestReview(kind, requestId);
      return;
    }

    if (target.dataset.openAddDepartment) openDepartmentForm("add");
    if (target.dataset.editDepartment) openDepartmentForm("edit", target.dataset.editDepartment);
    if (target.dataset.saveDepartment) saveDepartment(target.dataset.saveDepartment);
    if (target.dataset.deleteDepartment) {
      await deleteDepartment(target.dataset.deleteDepartment);
      return;
    }

    if (target.dataset.openAddMember) openMemberForm("add");
    if (target.dataset.exportMembers) {
      await exportMembersFromSettings();
      return;
    }
    if (target.dataset.importMembers) {
      await importMembersFromSettings();
      return;
    }
    if (target.dataset.editMember) openMemberForm("edit", target.dataset.editMember);
    if (target.dataset.saveMember) {
      await saveMember(target.dataset.saveMember);
      return;
    }
    if (target.dataset.deleteMember) {
      await deleteMember(target.dataset.deleteMember);
    }
  });

  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.dataset.memberSettingsFilterField === "name") {
      memberSettingsFilters.name = target.value || "";
      openMemberSettings();
      return;
    }
    if (target.dataset.nativeColor) {
      modalColor = target.value;
      syncColorPickerUi();
    }
  });

  document.body.addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof HTMLSelectElement && target.dataset.memberSettingsFilterField === "employment") {
      memberSettingsFilters.employment = target.value || "active";
      openMemberSettings();
      return;
    }
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const toggleMap = {
      overtimeUseRest1: ["overtimeRest1StartTime", "overtimeRest1EndTime"],
      overtimeUseRest2: ["overtimeRest2StartTime", "overtimeRest2EndTime"]
    };
    if (target.id === "leaveAssignmentAllDay" || target.id === "leaveAssignmentReasonEnabled") {
      syncLeaveAssignmentModalUi();
      return;
    }
    if (target.id === "leaveRequestAllDay") {
      syncLeaveRequestFormUi();
      return;
    }
    if (target.id === "overtimeRequestUseRest1" || target.id === "overtimeRequestUseRest2") {
      syncOvertimeRequestFormUi();
      return;
    }
    if (target.id === "scheduleOvertimeUseRest1" || target.id === "scheduleOvertimeUseRest2") {
      syncScheduleOvertimeFormUi();
      return;
    }
    if (target.id === "overtimeUseRest1" || target.id === "overtimeUseRest2") {
      syncOvertimeFormUi();
      return;
    }
    const targets = toggleMap[target.id];
    if (!targets) {
      return;
    }
    targets.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.disabled = !target.checked;
      }
    });
  });

  document.body.addEventListener("mouseover", (event) => {
    const target = event.target.closest("[data-hover-schedule-detail]");
    if (!target) {
      return;
    }
    const [memberId, day, category] = target.dataset.hoverScheduleDetail.split(":");
    if (leaveTooltipTimer) {
      clearTimeout(leaveTooltipTimer);
      leaveTooltipTimer = null;
    }
    showScheduleTooltip(memberId, Number(day), category, target.getBoundingClientRect());
  });

  document.body.addEventListener("mouseout", (event) => {
    const target = event.target.closest("[data-hover-schedule-detail]");
    if (!target) {
      return;
    }
    const related = event.relatedTarget;
    if (related instanceof HTMLElement && (related.closest("[data-hover-schedule-detail]") || related.closest("#leaveTooltipRoot"))) {
      return;
    }
    scheduleHideLeaveTooltip();
  });

  document.body.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) || !target.dataset.requestFilterKind) {
      return;
    }
    const kind = target.dataset.requestFilterKind;
    const field = target.dataset.requestFilterField;
    requestReviewFilters[kind] = {
      ...(requestReviewFilters[kind] || { memberCode: "", date: "", status: "" }),
      [field]: target.value || ""
    };
    if (kind === "leave") {
      await openLeaveApprovalModal();
    } else {
      await openOvertimeApprovalModal();
    }
  });

  document.body.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-member-card]");
    if (card) {
      dragMemberId = card.dataset.memberCard || "";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", dragMemberId);
      return;
    }
    const sortItem = event.target.closest("[data-sort-item]");
    if (sortItem) {
      dragSortItemId = sortItem.dataset.sortItem || "";
      dragSortCategory = sortItem.dataset.sortCategory || "";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", dragSortItemId);
      return;
    }
  });

  document.body.addEventListener("dragover", (event) => {
    const memberTarget = event.target.closest("[data-drop-member]");
    if (memberTarget && dragMemberId) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      return;
    }
    const sortItem = event.target.closest("[data-sort-item]");
    if (sortItem && dragSortItemId && dragSortCategory === (sortItem.dataset.sortCategory || "")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      return;
    }
    const dropZone = event.target.closest("[data-drop-department]");
    if (!dropZone || !dragMemberId) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  document.body.addEventListener("drop", (event) => {
    const memberTarget = event.target.closest("[data-drop-member]");
    if (memberTarget && dragMemberId) {
      event.preventDefault();
      moveMemberToDepartment(
        dragMemberId,
        memberTarget.dataset.dropDepartment || "",
        memberTarget.dataset.dropMember || ""
      );
      dragMemberId = "";
      return;
    }
    const sortItem = event.target.closest("[data-sort-item]");
    if (sortItem && dragSortItemId && dragSortCategory === (sortItem.dataset.sortCategory || "")) {
      event.preventDefault();
      reorderListItem(dragSortCategory, dragSortItemId, sortItem.dataset.sortItem || "");
      dragSortItemId = "";
      dragSortCategory = "";
      return;
    }
    const dropZone = event.target.closest("[data-drop-department]");
    if (!dropZone || !dragMemberId) {
      return;
    }
    event.preventDefault();
    moveMemberToDepartment(dragMemberId, dropZone.dataset.dropDepartment);
    dragMemberId = "";
  });

  document.body.addEventListener("dragend", () => {
    dragMemberId = "";
    dragSortItemId = "";
    dragSortCategory = "";
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    const menu = document.getElementById("coreActionsMenu");
    const toggle = document.getElementById("coreActionsToggle");
    if (!menu || !toggle) {
      return;
    }
    if (menu.contains(target) || toggle.contains(target)) {
      return;
    }
    closeCoreActionsMenu();
  });
}

async function loadApp() {
  bindEvents();
  authErrorMessage = "";
  try {
    const authContext = await window.schedulerApi.initializeAuth();
    currentSession = authContext.session;
    currentProfile = authContext.profile;
    appInfo = await window.schedulerApi.getAppInfo();
    const payload = await window.schedulerApi.loadState();
    state = normalizeState(payload);
    resetVisibleMonthToToday();
    currentMember = resolveCurrentMember();
    if (isManager()) {
      await syncRequestCatalogs();
    }
    await refreshRequestData();
    syncApprovedRequestsToSchedule();
    if (isManager()) {
      await forceSave();
    }
  } catch (error) {
    setSaveStatus(`載入失敗：${error.message}`);
    authErrorMessage = error.message || "載入失敗";
    state = createDefaultState();
    currentSession = null;
    currentProfile = null;
    currentMember = null;
    leaveRequestRecords = [];
    overtimeRequestRecords = [];
    requestOverlaySourceLoaded = false;
    appInfo = null;
  }
  renderAll();
  syncCoreActionsMenu();
}

loadApp();








