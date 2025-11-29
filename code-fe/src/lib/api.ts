const BASE_URL = 'http://localhost:8000'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

function authHeader(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`

  // Build headers safely so Authorization is never possibly undefined
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const ah = authHeader()
  if (ah.Authorization) headers.Authorization = ah.Authorization

  const extra = (options.headers as Record<string, string> | undefined) ?? {}
  Object.assign(headers, extra)

  const res = await fetch(url, { ...options, headers })

  const text = await res.text()
  const contentType = res.headers.get('content-type') || ''
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text

  if (!res.ok) {
    const err: any = new Error('Request failed')
    err.status = res.status
    err.body = body
    throw err
  }

  return body
}

/* Auth endpoints */
export const auth = {
  login: (sso_token: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ sso_token }) }),
  me: () => request('/auth/me'),
  refresh: (refresh_token: string) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
}

/* Users/profile */
export const users = {
  getProfile: () => request('/users/profile'),
  patchProfile: (data: Record<string, any>) => request('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  patchTutorSettings: (data: Record<string, any>) => request('/tutors/me/settings', { method: 'PATCH', body: JSON.stringify(data) }),
}

/* Academic master-data */
export const academic = {
  getSemesters: (active?: boolean) => request(`/academic/semesters${active ? '?active=true' : ''}`),
  getDepartments: () => request('/academic/departments'),
  getCourses: (params?: { q?: string; department?: string; term?: string }) => {
    const qp = new URLSearchParams()
    if (params?.q) qp.append('q', params.q)
    if (params?.department) qp.append('department', params.department)
    if (params?.term) qp.append('term', params.term)
    const qs = qp.toString()
    return request(`/academic/courses${qs ? `?${qs}` : ''}`)
  },
}

const result = {
  setAccessToken,
  auth,
  users,
  academic,
}

export default result