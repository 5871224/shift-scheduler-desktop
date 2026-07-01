import { withSupabase } from "npm:@supabase/server@^1";

type MemberPayload = {
  employeeCode?: string;
  fullName?: string;
  role?: string;
  hireDate?: string | null;
  leaveDate?: string | null;
  payByDay?: boolean;
  fixedRestWeekday?: number;
  scheduleDepartmentIds?: string[];
  monthlyRestDays?: number;
};

const DEFAULT_PASSWORD = "0000";

function buildLoginEmail(employeeCode: string) {
  const normalized = String(employeeCode || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized) {
    throw new Error("工號格式無法建立登入帳號");
  }
  // ponytail: 先用 local.invalid 做內部登入帳號，完全不依賴真實信箱；若之後要接公司信箱，再把這裡改成正式 email 規則。
  return `${normalized}@local.invalid`;
}

function normalizeRole(role: string | undefined) {
  return role === "manager" ? "manager" : "employee";
}

function normalizeMember(member: MemberPayload) {
  const employeeCode = String(member?.employeeCode || "").trim();
  const fullName = String(member?.fullName || "").trim();
  if (!employeeCode || !fullName) {
    throw new Error("缺少工號或姓名");
  }
  return {
    employeeCode,
    fullName,
    role: normalizeRole(member?.role),
    hireDate: member?.hireDate || null,
    leaveDate: member?.leaveDate || null,
    payByDay: Boolean(member?.payByDay),
    fixedRestWeekday: Math.min(6, Math.max(0, Number(member?.fixedRestWeekday) || 0)),
    scheduleDepartmentIds: Array.isArray(member?.scheduleDepartmentIds)
      ? member.scheduleDepartmentIds.map((value) => String(value || "").trim()).filter(Boolean)
      : [],
    monthlyRestDays: Math.max(0, Number(member?.monthlyRestDays) || 0),
    loginEmail: buildLoginEmail(employeeCode)
  };
}

async function getActorRole(ctx: any) {
  const actorId = ctx.userClaims?.sub || ctx.userClaims?.id || "";
  if (!actorId) {
    throw new Error("找不到登入身份");
  }
  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("role")
    .eq("id", actorId)
    .single();
  if (error) {
    throw error;
  }
  return data?.role || "";
}

async function findProfile(ctx: any, currentCode: string, previousCode: string) {
  const codes = Array.from(new Set([previousCode, currentCode].map((value) => String(value || "").trim()).filter(Boolean)));
  for (const code of codes) {
    const { data, error } = await ctx.supabaseAdmin
      .from("profiles")
      .select("id, employee_code, login_email")
      .eq("employee_code", code)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (data) {
      return data;
    }
  }
  return null;
}

async function upsertMember(ctx: any, body: any) {
  const member = normalizeMember(body?.member || {});
  const previousEmployeeCode = String(body?.previousEmployeeCode || member.employeeCode).trim();
  const password = String(body?.defaultPassword || DEFAULT_PASSWORD);
  const profile = await findProfile(ctx, member.employeeCode, previousEmployeeCode);

  if (!profile) {
    const { data, error } = await ctx.supabaseAdmin.auth.admin.createUser({
      email: member.loginEmail,
      password,
      email_confirm: true,
      user_metadata: {
        employee_code: member.employeeCode,
        full_name: member.fullName
      }
    });
    if (error) {
      throw error;
    }
    const userId = data.user?.id;
    if (!userId) {
      throw new Error("建立登入帳號失敗");
    }
    const { error: insertError } = await ctx.supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        employee_code: member.employeeCode,
        full_name: member.fullName,
        role: member.role,
        hire_date: member.hireDate,
        leave_date: member.leaveDate,
        pay_by_day: member.payByDay,
        fixed_rest_weekday: member.fixedRestWeekday,
        schedule_department_ids: member.scheduleDepartmentIds,
        monthly_rest_days: member.monthlyRestDays,
        login_email: member.loginEmail
      });
    if (insertError) {
      throw insertError;
    }
    return {
      ok: true,
      created: true,
      employeeCode: member.employeeCode,
      loginEmail: member.loginEmail
    };
  }

  const { error: updateAuthError } = await ctx.supabaseAdmin.auth.admin.updateUserById(profile.id, {
    email: member.loginEmail,
    email_confirm: true,
    user_metadata: {
      employee_code: member.employeeCode,
      full_name: member.fullName
    }
  });
  if (updateAuthError && !/not found/i.test(String(updateAuthError.message || updateAuthError))) {
    throw updateAuthError;
  }
  const authUserSynced = !updateAuthError;

  const { error: updateProfileError } = await ctx.supabaseAdmin
    .from("profiles")
    .update({
      employee_code: member.employeeCode,
      full_name: member.fullName,
      role: member.role,
      hire_date: member.hireDate,
      leave_date: member.leaveDate,
      pay_by_day: member.payByDay,
      fixed_rest_weekday: member.fixedRestWeekday,
      schedule_department_ids: member.scheduleDepartmentIds,
      monthly_rest_days: member.monthlyRestDays,
      login_email: authUserSynced ? member.loginEmail : null
    })
    .eq("id", profile.id);
  if (updateProfileError) {
    throw updateProfileError;
  }

  return {
    ok: true,
    created: false,
    employeeCode: member.employeeCode,
    loginEmail: member.loginEmail
  };
}

async function resetPassword(ctx: any, body: any) {
  const employeeCode = String(body?.employeeCode || "").trim();
  const password = String(body?.password || DEFAULT_PASSWORD);
  if (!employeeCode) {
    throw new Error("缺少工號");
  }
  const profile = await findProfile(ctx, employeeCode, employeeCode);
  if (!profile?.id) {
    return new Response(JSON.stringify({ message: "找不到這位人員的登入資料" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { error } = await ctx.supabaseAdmin.auth.admin.updateUserById(profile.id, {
    password
  });
  if (error) {
    throw error;
  }
  return {
    ok: true,
    employeeCode,
    password
  };
}

console.assert(buildLoginEmail("A001") === "a001@local.invalid", "member-auth-admin buildLoginEmail failed");

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const actorRole = await getActorRole(ctx);
      if (actorRole !== "manager") {
        return new Response(JSON.stringify({ message: "此功能限主管使用" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }

      const body = await req.json();
      if (body?.action === "upsert_member") {
        return Response.json(await upsertMember(ctx, body));
      }
      if (body?.action === "reset_password") {
        const result = await resetPassword(ctx, body);
        if (result instanceof Response) {
          return result;
        }
        return Response.json(result);
      }

      return new Response(JSON.stringify({ message: "不支援的動作" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ message: error instanceof Error ? error.message : "系統錯誤" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  })
};
