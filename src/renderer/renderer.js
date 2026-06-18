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
  departments: [
    { id: "d1", name: "門市" },
    { id: "d2", name: "行政" }
  ],
  positions: [
    { id: "p1", code: "MGR", name: "主管" },
    { id: "p2", code: "STF", name: "員工" }
  ],
  members: [
    { id: "m1", code: "A001", name: "王小美", deptId: "d1", positionId: "p1", proxyMemberId: "m2", hireDate: "2025-01-01", leaveDate: "", payByDay: false },
    { id: "m2", code: "A002", name: "林佳怡", deptId: "d1", positionId: "p2", proxyMemberId: "m1", hireDate: "2025-01-01", leaveDate: "", payByDay: false },
    { id: "m3", code: "A003", name: "陳建宏", deptId: "d1", positionId: "p2", proxyMemberId: "", hireDate: "2025-01-01", leaveDate: "", payByDay: false },
    { id: "m4", code: "B001", name: "吳佩珊", deptId: "d2", positionId: "p1", proxyMemberId: "m5", hireDate: "2025-01-01", leaveDate: "", payByDay: false },
    { id: "m5", code: "B002", name: "張志豪", deptId: "d2", positionId: "p2", proxyMemberId: "m4", hireDate: "2025-01-01", leaveDate: "", payByDay: false }
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
      name: "平日加班",
      color: "#D85A30",
      startTime: "18:00",
      endTime: "20:00",
      useRest1: false,
      rest1StartTime: "",
      rest1EndTime: "",
      useRest2: false,
      rest2StartTime: "",
      rest2EndTime: ""
    },
    {
      id: "o2",
      name: "假日加班",
      color: "#639922",
      startTime: "09:00",
      endTime: "17:00",
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

let state = createDefaultState();
let modalColor = COLORS[0].hex;
let modalContext = {};
let saveTimer = null;
let isSaving = false;
let latestSaveStatus = "";
let appInfo = null;
let dragMemberId = "";
let leaveTooltipTimer = null;

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

function scheduleKey(memberId, year, month, day) {
  return `${memberId}_${year}_${month}_${day}`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function weekdayOf(day) {
  return new Date(state.year, state.month, day).getDay();
}

function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

function showInfoMessage(message) {
  if (window.schedulerApi?.showMessage) {
    window.schedulerApi.showMessage("提示", message);
    return;
  }
  window.alert(message);
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

function textColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#2b241c" : "#ffffff";
}

function sanitizeDepartment(department, fallbackIndex) {
  return {
    id: department?.id || uid(`d${fallbackIndex}`),
    name: department?.name || `單位 ${fallbackIndex + 1}`
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
    payByDay: Boolean(member?.payByDay)
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
    defaultAllDay: Boolean(item?.defaultAllDay),
    requireReason: Boolean(item?.requireReason)
  };
}

function sanitizeOvertimeItem(item, fallbackIndex) {
    return {
      id: item?.id || uid(`o${fallbackIndex}`),
      name: item?.name || `加班 ${fallbackIndex + 1}`,
      color: item?.color || COLORS[fallbackIndex % COLORS.length].hex,
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
  const nextSchedule = {};

  Object.entries(schedule || {}).forEach(([key, slot]) => {
    const nextSlot = {
      shift: validShiftIds.has(slot?.shift) ? slot.shift : null,
      leave: validLeaveIds.has(slot?.leave) ? slot.leave : null,
      overtime: validOvertimeIds.has(slot?.overtime) ? slot.overtime : null,
      leaveMeta: validLeaveIds.has(slot?.leave) && slot?.leaveMeta && typeof slot.leaveMeta === "object"
        ? {
          allDay: slot.leaveMeta.allDay !== false,
          startTime: slot.leaveMeta.allDay === false ? (slot.leaveMeta.startTime || "") : "",
          endTime: slot.leaveMeta.allDay === false ? (slot.leaveMeta.endTime || "") : "",
          reasonEnabled: Boolean(slot.leaveMeta.reasonEnabled),
          reason: slot.leaveMeta.reasonEnabled ? (slot.leaveMeta.reason || "") : ""
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
  merged.holidays = Array.isArray(payload.holidays)
    ? payload.holidays.map((holiday, index) => sanitizeHoliday(holiday, index)).filter((holiday) => holiday.date)
    : merged.holidays;
  merged.rules = {
    maxConsecutiveWorkDays: Math.max(1, Number(payload.rules?.maxConsecutiveWorkDays) || merged.rules.maxConsecutiveWorkDays),
    forbidProxyLeaveConflict: payload.rules?.forbidProxyLeaveConflict !== false,
    requireEmploymentWindow: payload.rules?.requireEmploymentWindow !== false
  };
  merged.deptFilter = typeof payload.deptFilter === "string" ? payload.deptFilter : merged.deptFilter;
  merged.schedule = cleanupScheduleEntries(payload.schedule && typeof payload.schedule === "object" ? payload.schedule : merged.schedule, merged);

  if (!merged.departments.some((department) => department.id === merged.deptFilter)) {
    merged.deptFilter = "all";
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

function showLeaveTooltip(memberId, day, anchorRect) {
  const slot = getSlot(memberId, day);
  const leave = getItem("leave", slot?.leave);
  if (!leave || !shouldPromptLeaveDetail(leave, slot?.leaveMeta)) {
    hideLeaveTooltip();
    return;
  }

  const lines = formatLeaveDetailSummary(leave, slot?.leaveMeta);
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
      <div class="leave-tooltip-title">${escapeHtml(getLeaveLabel(leave))}</div>
      <button class="ghost-btn compact-btn leave-tooltip-btn" type="button" data-edit-leave-assignment="${memberId}:${day}">修改</button>
    </div>
    ${lines.map((line) => `<div class="leave-tooltip-line">${escapeHtml(line)}</div>`).join("")}
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
  select.innerHTML = `
    <option value="all">全部單位</option>
    ${state.departments.map((department) => (
      `<option value="${department.id}" ${state.deptFilter === department.id ? "selected" : ""}>${escapeHtml(department.name)}</option>`
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
  const visibleShifts = state.deptFilter === "all"
    ? state.shifts
    : state.shifts.filter((shift) => shiftAllowsDepartment(shift, state.deptFilter));
  renderChips("shiftChips", "shift", visibleShifts);
  renderChips("leaveChips", "leave", state.leaves);
  renderChips("overtimeChips", "overtime", state.overtime);
}

function memberLabel(member) {
  return `<div class="member-main">${escapeHtml(member.name)}</div>`;
}

function renderCellInner(key, memberId = "", day = 0) {
  const cellState = state.schedule[key];
  if (!cellState) {
    return '<div class="cell-inner"></div>';
  }
  const segments = [];
  ["shift", "leave", "overtime"].forEach((category) => {
    if (cellState[category]) {
      const item = getItem(category, cellState[category]);
      if (item) {
        segments.push({ ...item, category });
      }
    }
  });
  if (!segments.length) {
    return '<div class="cell-inner"></div>';
  }
  return `<div class="cell-inner">${segments.map((segment) => (
    `<div class="seg" style="background:${segment.color};color:${textColor(segment.color)}" ${
      segment.category === "leave" && shouldPromptLeaveDetail(segment, cellState.leaveMeta)
        ? `data-hover-leave-detail="${memberId}:${day}"`
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

  let html = '<thead><tr><th class="dept-col">單位</th><th class="person-col">人員</th>';
  for (let day = 1; day <= days; day += 1) {
    const weekday = weekdayOf(day);
    const cls = weekday === 0 ? "sun" : weekday === 6 ? "sat" : "";
    html += `<th class="${cls} ${isToday(day) ? "today" : ""}">${day}<br><span>${WEEKDAY_LABELS[weekday]}</span></th>`;
  }
  html += "</tr></thead><tbody>";

  const groups = state.departments
    .map((department) => ({
      department,
      members: state.members.filter((member) => member.deptId === department.id)
    }))
    .filter(({ members }) => members.length);

  if (!groups.length) {
    html += `<tr><td class="empty-table" colspan="${days + 2}">目前還沒有人員</td></tr>`;
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
          if (!active) {
            html += `<td class="cell inactive-cell" data-disabled="true"></td>`;
            continue;
          }
          const key = scheduleKey(member.id, state.year, state.month, day);
          html += `<td class="cell ${isToday(day) ? "today" : ""}" data-member-id="${member.id}" data-day="${day}">${renderCellInner(key, member.id, day)}</td>`;
        }
        html += "</tr>";
      });
    });
  }

  html += "</tbody>";
  table.innerHTML = html;
}

function renderHeader() {
  document.getElementById("monthTitle").textContent = `${state.year} 年 ${MONTH_LABELS[state.month]}`;
  document.getElementById("dbHint").textContent = appInfo ? `資料庫位置：${appInfo.databasePath}` : "";
}

function renderAll() {
  renderHeader();
  renderToolbar();
  renderTable();
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
  if (type === "overtime") slot.overtime = slot.overtime === id ? null : id;
  if (type === "cancel-shift") slot.shift = null;
  if (type === "cancel-leave") {
    slot.leave = null;
    slot.leaveMeta = null;
  }
  if (type === "cancel-overtime") slot.overtime = null;
  pruneEmptySchedule();
  renderTable();
  queueSave();
}

function selectChip(type, id) {
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
  setModal(`
    <div class="modal-overlay" data-close-modal="true">
      <div class="${config.modalClass || "modal modal-wide"}">
        <div class="modal-header">
          <h3>${escapeHtml(config.title)}</h3>
          <button class="icon-btn" type="button" data-close-button="true">關閉</button>
        </div>
        <div class="modal-body">
          ${config.description ? `<p class="modal-description">${escapeHtml(config.description)}</p>` : ""}
          ${config.body}
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" type="button" data-close-button="true">關閉</button>
          ${config.footerButtons || ""}
        </div>
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
    reason: reasonEnabled ? (document.getElementById("leaveAssignmentReason")?.value.trim() || "") : ""
  };
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
    ? list.map((item) => `
      <div class="settings-item list-item-wide">
        <div class="list-item-main">
          <div class="dot" style="background:${item.color}"></div>
          <div class="settings-text-row">
            <span class="list-item-title">${escapeHtml(category === "leave" ? getLeaveLabel(item) : item.name)}</span>
            <span class="list-item-subtitle">${category === "shift"
              ? `適用單位 ${escapeHtml(getDepartmentSummary(item.applicableDeptIds))} · ${escapeHtml(item.startTime || "--:--")} - ${escapeHtml(item.endTime || "--:--")}`
              : category === "overtime"
              ? `時段 ${escapeHtml(item.startTime || "--:--")} - ${escapeHtml(item.endTime || "--:--")}`
              : `${item.defaultAllDay ? "整天" : ""}${item.defaultAllDay && item.requireReason ? " · " : ""}${item.requireReason ? "需填原因" : ""}` || "可用於排班與請假顯示"
            }</span>
          </div>
        </div>
      </div>
        <div class="list-item-actions">
          <button class="ghost-btn compact-btn" type="button" data-edit-item="${category}" data-edit-id="${item.id}">修改</button>
          <button class="ghost-btn compact-btn" type="button" data-delete-category="${category}" data-delete-id="${item.id}">刪除</button>
        </div>
      </div>
    `).join("")
    : '<div class="empty-state">目前還沒有資料</div>';

  openEntityListModal({
    title: titleMap[category],
    body,
    footerButtons: `<button class="btn-primary" type="button" data-open-add="${category}">新增</button>`
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
          <input id="shiftName" type="text" maxlength="12" value="${escapeHtml(shift.name)}" placeholder="例如早班">
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
    `,
    footerButtons: `<button class="btn-primary" type="button" data-save-shift="${mode}">${mode === "edit" ? "儲存修改" : "新增班別"}</button>`
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
          : `<input id="namedItemName" type="text" maxlength="12" value="${escapeHtml(item.name)}" placeholder="請輸入名稱">`
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
    `,
    footerButtons: `<button class="btn-primary" type="button" data-save-named-item="${category}:${mode}">${mode === "edit" ? "儲存修改" : "新增"}</button>`
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
  queueSave();
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
        <div class="dept-block drop-zone" data-drop-department="${department.id}">
          <div class="dept-header">
            <div class="dept-heading">
              <div class="dept-name">${escapeHtml(department.name)}</div>
              <div class="dept-count">${members.length} 位</div>
            </div>
            <div class="list-item-actions">
              <button class="ghost-btn compact-btn" type="button" data-edit-department="${department.id}">修改</button>
              <button class="ghost-btn compact-btn" type="button" data-delete-department="${department.id}">刪除</button>
            </div>
          </div>
          <div class="member-list">
            ${members.length
              ? members.map((member) => `
                <div class="member-item draggable-member" draggable="true" data-member-card="${member.id}">
                  <span>${escapeHtml(member.code)} · ${escapeHtml(member.name)}</span>
                </div>
              `).join("")
              : '<div class="empty-state">目前沒有指派人員</div>'
            }
          </div>
        </div>
      `;
    }).join("")
    : '<div class="empty-state">目前還沒有單位</div>';
  openEntityListModal({
    title: "單位設定",
    modalClass: "modal modal-form-compact",
    body,
    footerButtons: `<button class="btn-primary" type="button" data-open-add-department="true">新增單位</button>`
  });
}

function openDepartmentForm(mode, departmentId = "") {
  const department = mode === "edit"
    ? state.departments.find((item) => item.id === departmentId)
    : { id: "", name: "" };
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
    `,
    footerButtons: `<button class="btn-primary" type="button" data-save-department="${mode}">${mode === "edit" ? "儲存修改" : "新增單位"}</button>`
  });
}

function saveDepartment(mode) {
  const name = document.getElementById("departmentName")?.value.trim();
  if (!name) {
    document.getElementById("departmentName")?.focus();
    return;
  }
  if (mode === "edit") {
    state.departments = state.departments.map((department) => department.id === modalContext.targetId ? { ...department, name } : department);
  } else {
    state.departments.push({ id: uid("d"), name });
  }
  closeModal();
  renderAll();
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
  const confirmed = await confirmAction("確定要刪除這個單位嗎？單位下的人員也會一起刪除。");
  if (!confirmed) {
    return;
  }
  const memberIds = state.members.filter((member) => member.deptId === departmentId).map((member) => member.id);
  state.departments = state.departments.filter((department) => department.id !== departmentId);
  state.members = state.members.filter((member) => member.deptId !== departmentId);
  memberIds.forEach(removeScheduleByMember);
  if (state.deptFilter === departmentId) {
    state.deptFilter = "all";
  }
  renderAll();
  openDepartmentSettings();
  queueSave();
}

function moveMemberToDepartment(memberId, departmentId) {
  const member = state.members.find((item) => item.id === memberId);
  if (!member || member.deptId === departmentId) {
    return;
  }
  state.members = state.members.map((item) => item.id === memberId ? { ...item, deptId: departmentId } : item);
  openDepartmentSettings();
  renderAll();
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
  const body = state.members.length
    ? state.members.map((member) => `
      <div class="settings-item list-item-wide">
        <div class="list-item-main">
          <div class="settings-text-row">
            <span class="list-item-title">${escapeHtml(member.code)} · ${escapeHtml(member.name)}</span>
            <span class="list-item-subtitle">${escapeHtml(getDepartmentName(member.deptId))}</span>
            <span class="list-item-subtitle">到職 ${escapeHtml(member.hireDate || "-")} · 離職 ${escapeHtml(member.leaveDate || "-")}${member.payByDay ? " · 按日計薪" : ""}</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="ghost-btn compact-btn" type="button" data-edit-member="${member.id}">修改</button>
          <button class="ghost-btn compact-btn" type="button" data-delete-member="${member.id}">刪除</button>
        </div>
      </div>
    `).join("")
    : '<div class="empty-state">目前還沒有人員</div>';
  openEntityListModal({
    title: "人員設定",
    body,
    footerButtons: `<button class="btn-primary" type="button" data-open-add-member="true">新增人員</button>`
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
      payByDay: false
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
          <label for="memberCode">代碼</label>
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
        <div class="form-row checkbox-row checkbox-row-left">
          <label class="member-toggle-label">
            <input id="memberPayByDay" type="checkbox" ${member.payByDay ? "checked" : ""}>
            按日計薪
          </label>
        </div>
        <div class="form-row">
          <label for="memberHireDate">到職日</label>
          <input id="memberHireDate" type="date" value="${escapeHtml(member.hireDate)}">
        </div>
        <div class="form-row">
          <label for="memberLeaveDate">離職日</label>
          <input id="memberLeaveDate" type="date" value="${escapeHtml(member.leaveDate)}">
        </div>
      </div>
    `,
    footerButtons: `<button class="btn-primary" type="button" data-save-member="${mode}">${mode === "edit" ? "儲存修改" : "新增人員"}</button>`
  });
}

function saveMember(mode) {
  const hireDate = document.getElementById("memberHireDate")?.value || "";
  const leaveDate = document.getElementById("memberLeaveDate")?.value || "";
  if (hireDate && leaveDate && !isValidDateRange(hireDate, leaveDate)) {
    reportValidationError("到職日必須早於離職日");
    return;
  }
  const payload = {
    id: mode === "edit" ? modalContext.targetId : uid("m"),
    code: document.getElementById("memberCode")?.value.trim(),
    name: document.getElementById("memberName")?.value.trim(),
    deptId: document.getElementById("memberDept")?.value || "",
    positionId: mode === "edit" ? (state.members.find((member) => member.id === modalContext.targetId)?.positionId || "") : "",
    proxyMemberId: "",
    hireDate,
    leaveDate,
    payByDay: Boolean(document.getElementById("memberPayByDay")?.checked)
  };
  if (!payload.code || !payload.name || !payload.deptId) {
    return;
  }
  if (mode === "edit") {
    state.members = state.members.map((member) => member.id === payload.id ? payload : member);
  } else {
    state.members.push(payload);
  }
  closeModal();
  renderAll();
  queueSave();
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



async function exportExcel() {
  try {
    const result = await window.schedulerApi.exportExcel({
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
  document.getElementById("prevMonthButton").addEventListener("click", () => changeMonth(-1));
  document.getElementById("nextMonthButton").addEventListener("click", () => changeMonth(1));
  document.getElementById("exportButton").addEventListener("click", exportExcel);
  document.getElementById("exportSapButton").addEventListener("click", exportSapCsv);
  document.getElementById("exportOvertimeButton").addEventListener("click", exportOvertime);
  document.getElementById("exportLeaveButton").addEventListener("click", exportLeave);
  document.getElementById("deptSettingsButton").addEventListener("click", openDepartmentSettings);
  document.getElementById("shiftSettingsButton").addEventListener("click", () => openListSettings("shift"));
  document.getElementById("leaveSettingsButton").addEventListener("click", () => openListSettings("leave"));
  document.getElementById("overtimeSettingsButton").addEventListener("click", () => openListSettings("overtime"));
  document.getElementById("memberSettingsButton").addEventListener("click", openMemberSettings);

  document.getElementById("deptFilter").addEventListener("change", (event) => {
    state.deptFilter = event.target.value;
    renderToolbar();
    renderTable();
    queueSave();
  });

  document.body.addEventListener("click", async (event) => {
    const target = event.target.closest("button, td");
    if (!target) {
      return;
    }
    if (target.dataset.closeButton) {
      closeModal();
      return;
    }
      if (target.classList.contains("cell")) {
        if (target.classList.contains("inactive-cell")) {
          return;
        }
        applySelectionToCell(target.dataset.memberId, Number(target.dataset.day));
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

    if (target.dataset.openAddDepartment) openDepartmentForm("add");
    if (target.dataset.editDepartment) openDepartmentForm("edit", target.dataset.editDepartment);
    if (target.dataset.saveDepartment) saveDepartment(target.dataset.saveDepartment);
    if (target.dataset.deleteDepartment) {
      await deleteDepartment(target.dataset.deleteDepartment);
      return;
    }

    if (target.dataset.openAddMember) openMemberForm("add");
    if (target.dataset.editMember) openMemberForm("edit", target.dataset.editMember);
    if (target.dataset.saveMember) saveMember(target.dataset.saveMember);
    if (target.dataset.deleteMember) {
      await deleteMember(target.dataset.deleteMember);
    }
  });

  document.body.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (target.dataset.nativeColor) {
      modalColor = target.value;
      syncColorPickerUi();
    }
  });

  document.body.addEventListener("change", (event) => {
    const target = event.target;
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
    const target = event.target.closest("[data-hover-leave-detail]");
    if (!target) {
      return;
    }
    const [memberId, day] = target.dataset.hoverLeaveDetail.split(":");
    if (leaveTooltipTimer) {
      clearTimeout(leaveTooltipTimer);
      leaveTooltipTimer = null;
    }
    showLeaveTooltip(memberId, Number(day), target.getBoundingClientRect());
  });

  document.body.addEventListener("mouseout", (event) => {
    const target = event.target.closest("[data-hover-leave-detail]");
    if (!target) {
      return;
    }
    const related = event.relatedTarget;
    if (related instanceof HTMLElement && (related.closest("[data-hover-leave-detail]") || related.closest("#leaveTooltipRoot"))) {
      return;
    }
    scheduleHideLeaveTooltip();
  });

  document.body.addEventListener("dragstart", (event) => {
    const card = event.target.closest("[data-member-card]");
    if (!card) {
      return;
    }
    dragMemberId = card.dataset.memberCard || "";
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dragMemberId);
  });

  document.body.addEventListener("dragover", (event) => {
    const dropZone = event.target.closest("[data-drop-department]");
    if (!dropZone || !dragMemberId) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });

  document.body.addEventListener("drop", (event) => {
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
  });
}

async function loadApp() {
  bindEvents();
  try {
    appInfo = await window.schedulerApi.getAppInfo();
    const payload = await window.schedulerApi.loadState();
    state = normalizeState(payload);
  } catch (error) {
    setSaveStatus(`載入失敗：${error.message}`);
    state = createDefaultState();
  }
  renderAll();
}

loadApp();








