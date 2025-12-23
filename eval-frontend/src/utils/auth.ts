const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) throw new Error('Missing VITE_API_BASE_URL');

export function setToken(token: string) {
  localStorage.setItem('authToken', token);
}

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error((payload as { error?: string }).error || 'Login failed');
  }
  const { token } = (await res.json()) as { token: string };
  setToken(token);
}

export function logout() {
  // Remove the JWT from localStorage
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}

export async function authFetch(
  path: string,
  options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {}
): Promise<Response> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/';
    throw new Error('Session expired, please log in again');
  }

  return res;
}