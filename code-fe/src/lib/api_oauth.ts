const BASE_URL = "http://localhost:8000";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function oauthLogin(
  username: string,
  password: string,
  scope?: string
) {
  const url = `${BASE_URL}/auth/login`;
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  if (scope) params.append("scope", scope);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const body =
    contentType.includes("application/json") && text ? JSON.parse(text) : text;

  if (!res.ok) {
    const err: any = new Error("Login failed");
    err.status = res.status;
    err.body = body;
    throw err;
  }

  if (body && (body.access_token || body.token)) {
    setAccessToken(body.access_token || body.token);
  }

  return body;
}

export default { oauthLogin, setAccessToken };
