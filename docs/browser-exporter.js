(function installBrowserExporter() {
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

  function formatDisplayDate(value) {
    if (!value) {
      return "";
    }
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text.replaceAll("-", "/");
    }
    return text;
  }

  function normalizeImportedDate(value) {
    if (!value) {
      return "";
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return formatIsoDate(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      // ponytail: Excel serial date先用1899基準直接換，已足夠支援目前匯入格式；若未來遇到1904系統再補分支。
      const utc = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (!Number.isNaN(utc.getTime())) {
        return formatIsoDate(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
      }
    }
    const text = String(value).trim();
    if (!text || text === "年/月/日") {
      return "";
    }
    const match = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (!match) {
      return "";
    }
    return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
  }

  function normalizeImportedTime(value) {
    if (!value) {
      return "";
    }
    const text = String(value).trim();
    if (!text) {
      return "";
    }
    const match = text.match(/^(\d{1,2}):(\d{2})$/) || text.match(/^(\d{2})(\d{2})$/);
    if (!match) {
      return "";
    }
    return `${String(Number(match[1])).padStart(2, "0")}:${String(Number(match[2])).padStart(2, "0")}`;
  }

  function normalizeImportedBoolean(value) {
    if (typeof value === "boolean") {
      return value;
    }
    const text = String(value ?? "").trim().toLowerCase();
    return ["1", "true", "yes", "y", "是"].includes(text);
  }

  function getCellDisplayValue(cell) {
    return String(cell?.text ?? cell?.value ?? "").trim();
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
      names.push("加班");
    }
    return names.join("\n");
  }

  function buildSapLeaveCsvContent(payload) {
    const { state, year, month } = payload;
    const leaveMap = getItemMap(state.leaves);
    const sapCodeMap = new Map([
      ["休息日", "REST"],
      ["休假", "REST"],
      ["例假", "OFF"]
    ]);
    const rows = [];

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
        const overtime = slot?.overtimeMeta || overtimeMap.get(slot?.overtime);
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
    const excludedLeaveCodes = new Set(["0036", "0047"]);
    const rows = [];
    const hiddenDepartmentIds = new Set(
      (state.departments || [])
        .filter((department) => department?.hiddenFromLeave)
        .map((department) => department.id)
    );

    for (const member of state.members) {
      if (hiddenDepartmentIds.has(member.deptId)) {
        continue;
      }
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
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = headers.map((_, index) => ({ width: index === 0 ? 14 : [4, 5, 8, 11].includes(index) ? 10 : 14 }));
    applySheetBorder(sheet);
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
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = [
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 12 },
      { width: 28 }
    ];
    applySheetBorder(sheet);
    return workbook;
  }

  async function createMemberWorkbook(payload) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("人員資料");
    const headers = ["工號", "姓名", "所屬單位", "權限", "到職日", "離職日", "計薪方式", "例假星期"];
    const weekdayLabels = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

    sheet.addRow(headers);
    (payload.state?.members || []).forEach((member) => {
      const department = (payload.state?.departments || []).find((item) => item.id === member.deptId);
      sheet.addRow([
        member.code || "",
        member.name || "",
        department?.name || "",
        member.role === "manager" ? "主管" : "員工",
        formatDisplayDate(member.hireDate || ""),
        formatDisplayDate(member.leaveDate || ""),
        member.payByDay ? "日薪" : "月薪",
        weekdayLabels[Math.max(0, Math.min(6, Number(member.fixedRestWeekday) || 0))] || "週日"
      ]);
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = [
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 12 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
      { width: 14 }
    ];
    applySheetBorder(sheet);
    return workbook;
  }

  async function createDepartmentWorkbook(payload) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("單位設定");
    const headers = ["單位", "開始日期", "結束日期", "請假匯出排除"];

    sheet.addRow(headers);
    (payload.state?.departments || []).forEach((department) => {
      sheet.addRow([
        department.name || "",
        formatDisplayDate(department.startDate || ""),
        formatDisplayDate(department.endDate || ""),
        department.hiddenFromLeave ? "是" : "否"
      ]);
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = [
      { width: 18 },
      { width: 14 },
      { width: 14 },
      { width: 16 }
    ];
    applySheetBorder(sheet);
    return workbook;
  }

  async function createShiftWorkbook(payload) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("班別設定");
    const headers = ["班別", "適用單位", "上班時間", "下班時間", "底色", "字色", "自動字色", "不顯示"];
    const departmentMap = new Map((payload.state?.departments || []).map((item) => [item.id, item.name]));

    sheet.addRow(headers);
    (payload.state?.shifts || []).forEach((shift) => {
      sheet.addRow([
        shift.name || "",
        departmentMap.get(shift.applicableDeptIds?.[0] || "") || "",
        shift.startTime || "",
        shift.endTime || "",
        shift.color || "",
        shift.textColor || "",
        shift.autoTextColor ? "是" : "否",
        shift.hiddenFromToolbar ? "是" : "否"
      ]);
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = headers.map((_, index) => ({ width: index === 0 ? 18 : 14 }));
    applySheetBorder(sheet);
    return workbook;
  }

  async function createLeaveSettingsWorkbook(payload) {
    const workbook = new ExcelJS.Workbook();
    const requestSheet = workbook.addWorksheet("請假申請預覽");
    requestSheet.addRow(["底色", "字色", "自動字色"]);
    requestSheet.addRow([
      payload.state?.requestStyles?.leave?.color || "",
      payload.state?.requestStyles?.leave?.textColor || "",
      payload.state?.requestStyles?.leave?.autoTextColor ? "是" : "否"
    ]);
    requestSheet.getRow(1).font = { bold: true };
    requestSheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    requestSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    requestSheet.columns = [{ width: 14 }, { width: 14 }, { width: 12 }];
    applySheetBorder(requestSheet);

    const sheet = workbook.addWorksheet("假別設定");
    const headers = ["假別代碼", "名稱", "需填時間", "需填原因", "底色", "字色", "自動字色", "不顯示"];
    sheet.addRow(headers);
    (payload.state?.leaves || []).forEach((item) => {
      sheet.addRow([
        item.code || "",
        item.name || "",
        item.defaultAllDay ? "是" : "否",
        item.requireReason ? "是" : "否",
        item.color || "",
        item.textColor || "",
        item.autoTextColor ? "是" : "否",
        item.hiddenFromToolbar ? "是" : "否"
      ]);
    });
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = headers.map((_, index) => ({ width: index < 2 ? 18 : 14 }));
    applySheetBorder(sheet);
    return workbook;
  }

  async function createOvertimeSettingsWorkbook(payload) {
    const workbook = new ExcelJS.Workbook();
    const requestSheet = workbook.addWorksheet("加班申請預覽");
    requestSheet.addRow(["底色", "字色", "自動字色"]);
    requestSheet.addRow([
      payload.state?.requestStyles?.overtime?.color || "",
      payload.state?.requestStyles?.overtime?.textColor || "",
      payload.state?.requestStyles?.overtime?.autoTextColor ? "是" : "否"
    ]);
    requestSheet.getRow(1).font = { bold: true };
    requestSheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    requestSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    requestSheet.columns = [{ width: 14 }, { width: 14 }, { width: 12 }];
    applySheetBorder(requestSheet);

    const sheet = workbook.addWorksheet("加班設定");
    const headers = ["名稱", "上班時間", "下班時間", "使用休息1", "休息1開始", "休息1結束", "使用休息2", "休息2開始", "休息2結束", "底色", "字色", "自動字色", "不顯示"];
    sheet.addRow(headers);
    (payload.state?.overtime || []).forEach((item) => {
      sheet.addRow([
        item.name || "",
        item.startTime || "",
        item.endTime || "",
        item.useRest1 ? "是" : "否",
        item.rest1StartTime || "",
        item.rest1EndTime || "",
        item.useRest2 ? "是" : "否",
        item.rest2StartTime || "",
        item.rest2EndTime || "",
        item.color || "",
        item.textColor || "",
        item.autoTextColor ? "是" : "否",
        item.hiddenFromToolbar ? "是" : "否"
      ]);
    });
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EBD8" } };
    sheet.columns = headers.map((_, index) => ({ width: index === 0 ? 18 : 14 }));
    applySheetBorder(sheet);
    return workbook;
  }

  async function parseMemberWorkbook(arrayBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }
    const fixedRestWeekdayMap = new Map([
      ["週一", 1],
      ["週二", 2],
      ["週三", 3],
      ["週四", 4],
      ["週五", 5],
      ["週六", 6],
      ["週日", 0],
      ["星期一", 1],
      ["星期二", 2],
      ["星期三", 3],
      ["星期四", 4],
      ["星期五", 5],
      ["星期六", 6],
      ["星期日", 0]
    ]);
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const code = getCellDisplayValue(row.getCell(1));
      const name = getCellDisplayValue(row.getCell(2));
      const departmentName = getCellDisplayValue(row.getCell(3));
      const roleText = getCellDisplayValue(row.getCell(4));
      const hireDate = normalizeImportedDate(row.getCell(5).value);
      const leaveDate = normalizeImportedDate(row.getCell(6).value);
      const salaryType = getCellDisplayValue(row.getCell(7));
      const fixedRestWeekdayText = getCellDisplayValue(row.getCell(8));
      if (![code, name, departmentName, roleText, hireDate, leaveDate, salaryType, fixedRestWeekdayText].some(Boolean)) {
        return;
      }
      rows.push({
        code,
        name,
        departmentName,
        role: roleText === "主管" ? "manager" : "employee",
        hireDate,
        leaveDate,
        payByDay: salaryType === "日薪" || salaryType === "按日計薪",
        fixedRestWeekday: fixedRestWeekdayMap.has(fixedRestWeekdayText) ? fixedRestWeekdayMap.get(fixedRestWeekdayText) : 0
      });
    });
    return rows;
  }

  async function parseDepartmentWorkbook(arrayBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const name = getCellDisplayValue(row.getCell(1));
      const startDate = normalizeImportedDate(row.getCell(2).value);
      const endDate = normalizeImportedDate(row.getCell(3).value);
      const hiddenFromLeave = normalizeImportedBoolean(getCellDisplayValue(row.getCell(4)));
      if (![name, startDate, endDate, hiddenFromLeave].some(Boolean)) {
        return;
      }
      rows.push({ name, startDate, endDate, hiddenFromLeave });
    });
    return rows;
  }

  async function parseShiftWorkbook(arrayBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const name = getCellDisplayValue(row.getCell(1));
      const departmentName = getCellDisplayValue(row.getCell(2));
      const startTime = normalizeImportedTime(row.getCell(3).value);
      const endTime = normalizeImportedTime(row.getCell(4).value);
      const color = getCellDisplayValue(row.getCell(5));
      const textColor = getCellDisplayValue(row.getCell(6));
      const autoTextColor = normalizeImportedBoolean(getCellDisplayValue(row.getCell(7)));
      const hiddenFromToolbar = normalizeImportedBoolean(getCellDisplayValue(row.getCell(8)));
      if (![name, departmentName, startTime, endTime, color, textColor, autoTextColor, hiddenFromToolbar].some(Boolean)) {
        return;
      }
      rows.push({ name, departmentName, startTime, endTime, color, textColor, autoTextColor, hiddenFromToolbar });
    });
    return rows;
  }

  async function parseLeaveSettingsWorkbook(arrayBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const requestSheet = workbook.getWorksheet("請假申請預覽");
    const sheet = workbook.getWorksheet("假別設定") || workbook.worksheets[0];
    const requestStyle = requestSheet?.rowCount >= 2
      ? {
        color: getCellDisplayValue(requestSheet.getRow(2).getCell(1)),
        textColor: getCellDisplayValue(requestSheet.getRow(2).getCell(2)),
        autoTextColor: normalizeImportedBoolean(getCellDisplayValue(requestSheet.getRow(2).getCell(3)))
      }
      : null;
    const items = [];
    if (sheet) {
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }
        const code = getCellDisplayValue(row.getCell(1));
        const name = getCellDisplayValue(row.getCell(2));
        const defaultAllDay = normalizeImportedBoolean(getCellDisplayValue(row.getCell(3)));
        const requireReason = normalizeImportedBoolean(getCellDisplayValue(row.getCell(4)));
        const color = getCellDisplayValue(row.getCell(5));
        const textColor = getCellDisplayValue(row.getCell(6));
        const autoTextColor = normalizeImportedBoolean(getCellDisplayValue(row.getCell(7)));
        const hiddenFromToolbar = normalizeImportedBoolean(getCellDisplayValue(row.getCell(8)));
        if (![code, name, defaultAllDay, requireReason, color, textColor, autoTextColor, hiddenFromToolbar].some(Boolean)) {
          return;
        }
        items.push({ code, name, defaultAllDay, requireReason, color, textColor, autoTextColor, hiddenFromToolbar });
      });
    }
    return { requestStyle, items };
  }

  async function parseOvertimeSettingsWorkbook(arrayBuffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const requestSheet = workbook.getWorksheet("加班申請預覽");
    const sheet = workbook.getWorksheet("加班設定") || workbook.worksheets[0];
    const requestStyle = requestSheet?.rowCount >= 2
      ? {
        color: getCellDisplayValue(requestSheet.getRow(2).getCell(1)),
        textColor: getCellDisplayValue(requestSheet.getRow(2).getCell(2)),
        autoTextColor: normalizeImportedBoolean(getCellDisplayValue(requestSheet.getRow(2).getCell(3)))
      }
      : null;
    const items = [];
    if (sheet) {
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }
        const name = getCellDisplayValue(row.getCell(1));
        const startTime = normalizeImportedTime(row.getCell(2).value);
        const endTime = normalizeImportedTime(row.getCell(3).value);
        const useRest1 = normalizeImportedBoolean(getCellDisplayValue(row.getCell(4)));
        const rest1StartTime = normalizeImportedTime(row.getCell(5).value);
        const rest1EndTime = normalizeImportedTime(row.getCell(6).value);
        const useRest2 = normalizeImportedBoolean(getCellDisplayValue(row.getCell(7)));
        const rest2StartTime = normalizeImportedTime(row.getCell(8).value);
        const rest2EndTime = normalizeImportedTime(row.getCell(9).value);
        const color = getCellDisplayValue(row.getCell(10));
        const textColor = getCellDisplayValue(row.getCell(11));
        const autoTextColor = normalizeImportedBoolean(getCellDisplayValue(row.getCell(12)));
        const hiddenFromToolbar = normalizeImportedBoolean(getCellDisplayValue(row.getCell(13)));
        if (![name, startTime, endTime, useRest1, rest1StartTime, rest1EndTime, useRest2, rest2StartTime, rest2EndTime, color, textColor, autoTextColor, hiddenFromToolbar].some(Boolean)) {
          return;
        }
        items.push({ name, startTime, endTime, useRest1, rest1StartTime, rest1EndTime, useRest2, rest2StartTime, rest2EndTime, color, textColor, autoTextColor, hiddenFromToolbar });
      });
    }
    return { requestStyle, items };
  }

  async function workbookToBlob(workbook) {
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob(
      [buffer],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
  }

  function runSelfCheck() {
    const csv = buildSapLeaveCsvContent({
      year: 2026,
      month: 4,
      state: {
        members: [{ id: "m1", name: "王小美", code: "A001", hireDate: "", leaveDate: "", payByDay: false }],
        leaves: [{ id: "l1", name: "休息日" }, { id: "l2", name: "例假" }],
        schedule: {
          [getScheduleKey("m1", 2026, 4, 3)]: { leave: "l1" },
          [getScheduleKey("m1", 2026, 4, 4)]: { leave: "l2" }
        }
      }
    });
    if (!csv.includes("REST") || !csv.includes("OFF")) {
      throw new Error("browser exporter self-check failed");
    }
    if (normalizeImportedDate("2025/01/02") !== "2025-01-02") {
      throw new Error("browser exporter date self-check failed");
    }
  }

  runSelfCheck();

  window.schedulerBrowserExporter = {
    buildSapLeaveCsvContent,
    createScheduleWorkbook,
    createOvertimeWorkbook,
    createLeaveWorkbook,
    createMemberWorkbook,
    createDepartmentWorkbook,
    createShiftWorkbook,
    createLeaveSettingsWorkbook,
    createOvertimeSettingsWorkbook,
    parseMemberWorkbook,
    parseDepartmentWorkbook,
    parseShiftWorkbook,
    parseLeaveSettingsWorkbook,
    parseOvertimeSettingsWorkbook,
    workbookToBlob
  };
})();
