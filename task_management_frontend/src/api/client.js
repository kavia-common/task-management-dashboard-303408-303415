/**
 * Thin fetch wrapper for the Task Management backend.
 *
 * Environment variables supported (container-provided list):
 * - REACT_APP_API_BASE
 * - REACT_APP_BACKEND_URL
 *
 * This app expects the backend to be reachable at port 3001 in dev.
 */

function readApiBaseUrl() {
  // Prefer explicit API base; fall back to BACKEND_URL; then default to localhost:3001.
  const fromApiBase = process.env.REACT_APP_API_BASE;
  const fromBackendUrl = process.env.REACT_APP_BACKEND_URL;
  const base = fromApiBase || fromBackendUrl || "http://localhost:3001";

  // Ensure no trailing slash to keep URL joining predictable.
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

const API_BASE = readApiBaseUrl();

/**
 * PUBLIC_INTERFACE
 * Build a URL with querystring params.
 */
export function buildUrl(path, params) {
  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * PUBLIC_INTERFACE
 * Call backend API and return JSON (or null).
 * Throws an Error with a user-friendly message on non-2xx responses.
 */
export async function apiFetch(path, { method = "GET", params, body, headers } = {}) {
  const url = buildUrl(path, params);

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const payload = await parseJsonSafe(res);
    const detail =
      payload && typeof payload === "object" && payload.detail ? payload.detail : null;
    const msg = detail || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  // 204 has no body
  if (res.status === 204) return null;
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL (useful for debugging).
 */
export function getApiBaseUrl() {
  return API_BASE;
}
