export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() || "http://127.0.0.1:8000/api";

type JsonValue = any;

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export async function apiRequest<T = JsonValue>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function loginRequest(email: string, password: string) {
  const data = await apiRequest<{
    access: string;
    refresh: string;
    user: any;
  }>("/auth/login/", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  setTokens(data.access, data.refresh);
  localStorage.setItem("currentUser", JSON.stringify(data.user));
  return data.user;
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
}) {
  const data = await apiRequest<{
    access?: string;
    refresh?: string;
    user: any;
    message?: string;
  }>("/auth/register/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });

  if (data.access && data.refresh) {
    setTokens(data.access, data.refresh);
    localStorage.setItem("currentUser", JSON.stringify(data.user));
  }
  return data;
}

export async function logoutRequest() {
  const refresh = localStorage.getItem("refreshToken");
  if (refresh) {
    try {
      await apiRequest("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // ignore network/token errors; client logout still proceeds
    }
  }
  clearTokens();
  localStorage.removeItem("currentUser");
}

