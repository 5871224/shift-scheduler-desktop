(function initRestCompliance(globalScope) {
  const REGULAR_HOLIDAY_CODE = "0036";
  const REST_DAY_CODE = "0047";
  const DEFAULT_WEEK_START = 0;

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function toDateString(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function createDate(year, month, day) {
    return new Date(year, month, day);
  }

  function addDays(date, count) {
    const next = new Date(date);
    next.setDate(next.getDate() + count);
    return next;
  }

  function startOfWeek(date, weekStart = DEFAULT_WEEK_START) {
    const offset = (date.getDay() - weekStart + 7) % 7;
    return addDays(date, -offset);
  }

  function endOfWeek(date, weekStart = DEFAULT_WEEK_START) {
    return addDays(startOfWeek(date, weekStart), 6);
  }

  function buildCalendarWeeks(year, month, weekStart = DEFAULT_WEEK_START) {
    const monthStart = createDate(year, month, 1);
    const monthEnd = createDate(year, month + 1, 0);
    const rangeStart = startOfWeek(monthStart, weekStart);
    const rangeEnd = endOfWeek(monthEnd, weekStart);
    const weeks = [];
    let cursor = new Date(rangeStart);

    while (cursor <= rangeEnd) {
      const dates = [];
      for (let index = 0; index < 7; index += 1) {
        dates.push(toDateString(addDays(cursor, index)));
      }
      weeks.push({
        startDate: dates[0],
        endDate: dates[6],
        dates
      });
      cursor = addDays(cursor, 7);
    }

    return weeks;
  }

  function buildDayMap(days) {
    return new Map((Array.isArray(days) ? days : []).map((day) => [day.date, day]));
  }

  function shouldSkipWeek(member, week) {
    return Boolean(
      (member.hireDate && week.dates.includes(member.hireDate)) ||
      (member.leaveDate && week.dates.includes(member.leaveDate))
    );
  }

  function checkRestCompliance(config) {
    const weeks = buildCalendarWeeks(config.year, config.month, config.weekStart);
    const issues = [];
    let checkedWeeks = 0;
    let skippedWeeks = 0;

    (config.memberCalendars || []).forEach((member) => {
      const dayMap = buildDayMap(member.days);
      weeks.forEach((week) => {
        if (shouldSkipWeek(member, week)) {
          skippedWeeks += 1;
          return;
        }

        const activeDays = week.dates
          .map((date) => ({ date, ...(dayMap.get(date) || {}) }))
          .filter((day) => day.active);
        if (!activeDays.length) {
          return;
        }

        checkedWeeks += 1;
        const regularHolidays = activeDays.filter((day) => day.leaveCode === REGULAR_HOLIDAY_CODE);
        const restDays = activeDays.filter((day) => day.leaveCode === REST_DAY_CODE);

        if (!regularHolidays.length) {
          issues.push({
            severity: "error",
            type: "missing_regular_holiday",
            memberId: member.memberId,
            memberName: member.memberName,
            memberCode: member.memberCode || "",
            weekStart: week.startDate,
            weekEnd: week.endDate,
            message: "本週未標記例假"
          });
        }

        if (!restDays.length) {
          issues.push({
            severity: "error",
            type: "missing_rest_day",
            memberId: member.memberId,
            memberName: member.memberName,
            memberCode: member.memberCode || "",
            weekStart: week.startDate,
            weekEnd: week.endDate,
            message: "本週未標記休息日"
          });
        }

        regularHolidays.forEach((day) => {
          if (!day.hasShift && !day.hasOvertime) {
            return;
          }
          issues.push({
            severity: "warning",
            type: "regular_holiday_work",
            memberId: member.memberId,
            memberName: member.memberName,
            memberCode: member.memberCode || "",
            weekStart: week.startDate,
            weekEnd: week.endDate,
            date: day.date,
            message: "例假日有排班或加班，請確認是否符合第40條例外事由"
          });
        });
      });
    });

    return {
      weeks,
      checkedWeeks,
      skippedWeeks,
      checkedMembers: (config.memberCalendars || []).length,
      issues
    };
  }

  const api = {
    REGULAR_HOLIDAY_CODE,
    REST_DAY_CODE,
    DEFAULT_WEEK_START,
    buildCalendarWeeks,
    checkRestCompliance
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  globalScope.restCompliance = api;
})(typeof window !== "undefined" ? window : globalThis);
