import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

/**
 * Base URL of the web API. Override at build time by setting `extra.apiBase` in app.json,
 * or by exporting EXPO_PUBLIC_API_BASE in the environment.
 */
export const API_BASE: string =
  process.env.EXPO_PUBLIC_API_BASE ||
  (Constants.expoConfig?.extra as { apiBase?: string } | undefined)?.apiBase ||
  "http://localhost:3000";

const TOKEN_KEY = "advancia.next-auth.session-token";

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

/** Generic fetch wrapper that injects the session cookie. */
export async function api<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const token = await getStoredToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
      // The web sets next-auth.session-token as an httpOnly cookie. On mobile we attach it as Cookie.
      ...(token ? { Cookie: `next-auth.session-token=${token}` } : {}),
    },
  });
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    return { ok: false, status: res.status, error: body?.error ?? `HTTP ${res.status}` };
  }
  return { ok: true, data: body as T };
}
