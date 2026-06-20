const fs = require("fs/promises");
const ExcelJS = require("exceljs");

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getItemMap(items) {
  return new Map((items || []).map((item) => [item.id, item]));
}

function getScheduleKey(memberId, year, month, day) {
  return `${memberId}_${year}_${month}_${day}`;
}

function formatYmd(year, month, day) {
  return `${year}${String(month + 1).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

function formatIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatCompactTime(value) {
  return String(value || "").replaceAll(":", "");
}

function toArgb(hex) {
  return `FF${String(hex || "#FFFFFF").replace("#", "").toUpperCase()}`;
}

function isMemberActiveOnDate(member, year, month, day) {
  const date = formatIsoDate(year, month, day);
  if (member.hireDate && date < member.hireDate) {
    return false;
  }
  if (member.leaveDate && date > member.leaveDate) {
    return false;
  }
  return true;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (!/[",\r\n]/.test(text)) {
    return text;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

function getScheduleCellText(cell, maps) {
  if (!cell) {
    return "";
  }
  const names = [];
  if (cell.shift && maps.shifts.has(cell.shift)) {
    names.push(maps.shifts.get(cell.shift).name);
  }
  if (cell.leave && maps.leaves.has(cell.leave)) {
    names.push(maps.leaves.get(cell.leave).name);
  }
  if (cell.overtime && maps.overtime.has(cell.overtime)) {
    names.push(maps.overtime.get(cell.overtime).name);
  }
  return names.join("\n");
}

function buildSapLeaveCsvRows(payload) {
  const { state, year, month } = payload;
  const leaveMap = getItemMap(state.leaves);
  const rows = [];
  const sapCodeMap = new Map([
    ["休息日", "REST"],
    ["休假", "REST"],
    ["例假", "OFF"]
  ]);

  for (const member of state.members) {
    if (member.payByDay) {
      continue;
    }
    for (let day = 1; day <= daysInMonth(year, month); day += 1) {
      if (!isMemberActiveOnDate(member, year, month, day)) {
        continue;
      }
      const slot = state.schedule[getScheduleKey(member.id, year, month, day)];
      const leave = leaveMap.get(slot?.leave);
      const sapCode = sapCodeMap.get(leave?.name);
      if (!sapCode) {
        continue;
      }
      const date = formatYmd(year, month, day);
      rows.push([member.name, member.code, date, date, sapCode]);
    }
  }

  return rows;
}

function buildSapLeaveCsvContent(payload) {
  const rows = buildSapLeaveCsvRows(payload);
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  return rows.length ? `\uFEFF${csv}\r\n` : "\uFEFF";
}

function getOvertimeExportRows(payload) {
  const { state, year, month } = payload;
  const overtimeMap = getItemMap(state.overtime);
  const rows = [];

  for (const member of state.members) {
    for (let day = 1; day <= daysInMonth(year, month); day += 1) {
      if (!isMemberActiveOnDate(member, year, month, day)) {
        continue;
      }
      const slot = state.schedule[getScheduleKey(member.id, year, month, day)];
      const overtime = overtimeMap.get(slot?.overtime);
      if (!overtime) {
        continue;
      }
      rows.push([
        member.code,
        formatYmd(year, month, day),
        formatCompactTime(overtime.startTime),
        formatCompactTime(overtime.endTime),
        0,
        1,
        overtime.useRest1 ? formatCompactTime(overtime.rest1StartTime) : "",
        overtime.useRest1 ? formatCompactTime(overtime.rest1EndTime) : "",
        overtime.useRest1 ? 0 : "",
        overtime.useRest2 ? formatCompactTime(overtime.rest2StartTime) : "",
        overtime.useRest2 ? formatCompactTime(overtime.rest2EndTime) : "",
        overtime.useRest2 ? 0 : ""
      ]);
    }
  }

  return rows;
}

function getLeaveExportRows(payload) {
  const { state, year, month } = payload;
  const leaveMap = getItemMap(state.leaves);
  const rows = [];
  const excludedLeaveCodes = new Set(["0036", "0047"]);

  for (const member of state.members) {
    for (let day = 1; day <= daysInMonth(year, month); day += 1) {
      if (!isMemberActiveOnDate(member, year, month, day)) {
        continue;
      }
      const slot = state.schedule[getScheduleKey(member.id, year, month, day)];
      const leave = leaveMap.get(slot?.leave);
      if (!leave || excludedLeaveCodes.has(leave.code)) {
        continue;
      }
      const leaveMeta = slot?.leaveMeta || null;
      const allDay = leaveMeta?.allDay !== false;
      rows.push([
        member.code,
        formatYmd(year, month, day),
        formatYmd(year, month, day),
        allDay ? "" : formatCompactTime(leaveMeta?.startTime || ""),
        allDay ? "" : formatCompactTime(leaveMeta?.endTime || ""),
        leave.code || "",
        leaveMeta?.reason || leave.name || ""
      ]);
    }
  }

  return rows;
}

async function createScheduleWorkbook(payload) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("排班表", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 2 }]
  });
  const { state, year, month } = payload;
  const maps = {
    departments: getItemMap(state.departments),
    shifts: getItemMap(state.shifts),
    leaves: getItemMap(state.leaves),
    overtime: getItemMap(state.overtime)
  };
  const days = daysInMonth(year, month);
  const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];

  sheet.mergeCells(1, 1, 1, days + 2);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `${year} 年 ${month + 1} 月`;
  titleCell.font = { name: "Microsoft JhengHei UI", bold: true, size: 16 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };

  const headerRow = sheet.getRow(2);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.getCell(1).value = "單位";
  headerRow.getCell(2).value = "人員";
  headerRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F6F0" } };
  headerRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F6F0" } };

  for (let day = 1; day <= days; day += 1) {
    const weekday = new Date(year, month, day).getDay();
    const cell = sheet.getCell(2, day + 2);
    cell.value = `${day}\n${weekLabels[weekday]}`;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.font = {
      bold: true,
      color: weekday === 0 ? { argb: "FFD64545" } : weekday === 6 ? { argb: "FF165DAB" } : undefined
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F6F0" } };
  }

  let rowIndex = 3;
  for (const department of state.departments) {
    const members = state.members.filter((member) => member.deptId === department.id);
    if (!members.length) {
      continue;
    }
    for (const member of members) {
      const row = sheet.getRow(rowIndex);
      row.getCell(1).value = maps.departments.get(member.deptId)?.name || "";
      row.getCell(2).value = member.name;
      row.getCell(1).alignment = { vertical: "middle", wrapText: true };
      row.getCell(2).alignment = { vertical: "middle", wrapText: true };

      for (let day = 1; day <= days; day += 1) {
        const cell = row.getCell(day + 2);
        if (!isMemberActiveOnDate(member, year, month, day)) {
          cell.value = "";
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF9B9B9B" } };
          cell.font = { color: { argb: "FFFFFFFF" }, size: 10 };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          continue;
        }

        const slot = state.schedule[getScheduleKey(member.id, year, month, day)];
        cell.value = getScheduleCellText(slot, maps);
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

        const colors = [];
        if (slot?.shift && maps.shifts.has(slot.shift)) {
          colors.push(maps.shifts.get(slot.shift).color);
        }
        if (slot?.leave && maps.leaves.has(slot.leave)) {
          colors.push(maps.leaves.get(slot.leave).color);
        }
        if (slot?.overtime && maps.overtime.has(slot.overtime)) {
          colors.push(maps.overtime.get(slot.overtime).color);
        }

        if (colors.length === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: toArgb(colors[0]) } };
          cell.font = { color: { argb: "FFFFFFFF" }, size: 10 };
        } else if (colors.length > 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5EFE0" } };
          cell.font = { size: 10 };
        } else {
          cell.font = { size: 10 };
        }
      }

      row.height = 42;
      rowIndex += 1;
    }
  }

  sheet.columns = [
    { width: 18 },
    { width: 16 },
    ...Array.from({ length: days }, () => ({ width: 12 }))
  ];
  applySheetBorder(sheet);

  return workbook;
}

async function createOvertimeWorkbook(payload) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("匯出加班");
  const headers = [
    "員工編號",
    "加班日期",
    "加班時間(起)",
    "加班時間(迄)",
    "前一日",
    "加班補貼類型",
    "休息1(起)",
    "休息1(迄)",
    "支薪1",
    "休息2(起)",
    "休息2(迄)",
    "支薪2"
  ];

  sheet.addRow(headers);
  getOvertimeExportRows(payload).forEach((row) => sheet.addRow(row));
  styleSimpleExportSheet(sheet, headers.map((_, index) => ({ width: index === 0 ? 14 : [4, 5, 8, 11].includes(index) ? 10 : 14 })));
  return workbook;
}

async function createLeaveWorkbook(payload) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("匯出請假");
  const headers = [
    "員工編號",
    "請假日期(起)",
    "請假日期(迄)",
    "請假時間(起)",
    "請假時間(迄)",
    "假別",
    "說明"
  ];

  sheet.addRow(headers);
  getLeaveExportRows(payload).forEach((row) => sheet.addRow(row));
  styleSimpleExportSheet(sheet, [
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 12 },
    { width: 28 }
  ]);
  return workbook;
}

function styleSimpleExportSheet(sheet, columns) {
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
  sheet.columns = columns;
  applySheetBorder(sheet);
}

function applySheetBorder(sheet) {
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD8D2C7" } },
        left: { style: "thin", color: { argb: "FFD8D2C7" } },
        bottom: { style: "thin", color: { argb: "FFD8D2C7" } },
        right: { style: "thin", color: { argb: "FFD8D2C7" } }
      };
      if (!cell.alignment) {
        cell.alignment = rowNumber === 1
          ? { horizontal: "center", vertical: "middle", wrapText: true }
          : { horizontal: "center", vertical: "middle", wrapText: true };
      }
    });
  });
}

async function workbookToBuffer(workbook) {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function buildScheduleWorkbookBuffer(payload) {
  return workbookToBuffer(await createScheduleWorkbook(payload));
}

async function buildOvertimeWorkbookBuffer(payload) {
  return workbookToBuffer(await createOvertimeWorkbook(payload));
}

async function buildLeaveWorkbookBuffer(payload) {
  return workbookToBuffer(await createLeaveWorkbook(payload));
}

async function exportSapLeaveCsv(payload, filePath) {
  await fs.writeFile(filePath, buildSapLeaveCsvContent(payload), "utf8");
}

async function exportScheduleWorkbook(payload, filePath) {
  await fs.writeFile(filePath, await buildScheduleWorkbookBuffer(payload));
}

async function exportOvertimeWorkbook(payload, filePath) {
  await fs.writeFile(filePath, await buildOvertimeWorkbookBuffer(payload));
}

async function exportLeaveWorkbook(payload, filePath) {
  await fs.writeFile(filePath, await buildLeaveWorkbookBuffer(payload));
}

function runSelfCheck() {
  const sapRows = buildSapLeaveCsvRows({
    year: 2026,
    month: 4,
    state: {
      members: [{ id: "m1", name: "王小美", code: "A001", hireDate: "", leaveDate: "", payByDay: false }],
      leaves: [
        { id: "l1", name: "休息日" },
        { id: "l2", name: "例假" },
        { id: "l3", name: "病假" }
      ],
      schedule: {
        [getScheduleKey("m1", 2026, 4, 3)]: { leave: "l1" },
        [getScheduleKey("m1", 2026, 4, 4)]: { leave: "l2" },
        [getScheduleKey("m1", 2026, 4, 5)]: { leave: "l3" }
      }
    }
  });
  const expectedSap = [
    ["王小美", "A001", "20260503", "20260503", "REST"],
    ["王小美", "A001", "20260504", "20260504", "OFF"]
  ];
  if (JSON.stringify(sapRows) !== JSON.stringify(expectedSap)) {
    throw new Error("sap export self-check failed");
  }

  const leaveRows = getLeaveExportRows({
    year: 2026,
    month: 4,
    state: {
      members: [{ id: "m1", name: "王小美", code: "A001", hireDate: "", leaveDate: "" }],
      leaves: [
        { id: "l1", code: "0011", name: "病假" },
        { id: "l2", code: "0036", name: "例假" }
      ],
      schedule: {
        [getScheduleKey("m1", 2026, 4, 3)]: { leave: "l1", leaveMeta: { allDay: false, startTime: "09:10", endTime: "11:20", reason: "" } },
        [getScheduleKey("m1", 2026, 4, 4)]: { leave: "l2", leaveMeta: { allDay: true } }
      }
    }
  });
  const expectedLeave = [
    ["A001", "20260503", "20260503", "0910", "1120", "0011", "病假"]
  ];
  if (JSON.stringify(leaveRows) !== JSON.stringify(expectedLeave)) {
    throw new Error("leave export self-check failed");
  }
}

if (require.main === module) {
  runSelfCheck();
  console.log("exporter self-check ok");
}

module.exports = {
  exportScheduleWorkbook,
  exportSapLeaveCsv,
  exportOvertimeWorkbook,
  exportLeaveWorkbook,
  buildScheduleWorkbookBuffer,
  buildSapLeaveCsvContent,
  buildOvertimeWorkbookBuffer,
  buildLeaveWorkbookBuffer,
  buildSapLeaveCsvRows,
  getOvertimeExportRows,
  getLeaveExportRows
};
