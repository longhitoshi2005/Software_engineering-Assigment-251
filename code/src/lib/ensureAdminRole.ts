// lib/ensureAdminRole.ts

export function ensureAdminRole(headers: Headers) {
  const role = headers.get("x-user-role") || "";
  const r = role.toLowerCase();

  const allowed = ["program_admin", "programadmin", "admin", "administrator", "system", "superadmin"];

  const ok = allowed.some((x) => r.includes(x));
  if (!ok) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Forbidden: PROGRAM_ADMIN required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { ok: true };
}
