export function ensureDeptRole(headers: Headers) {
  const role = headers.get("x-user-role");

  if (role !== "DEPT_CHAIR") {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Forbidden: role DEPT_CHAIR required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { ok: true };
}

