// src/services/settings.js

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com";

// Generic wrapper so all requests share headers + error handling
async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // keep cookies/session if needed
    mode: "cors",
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

// --- Public API ---

/** GET /me/settings -> settings object (with defaults if not set) */
export function getSettings() {
  return apiFetch("/me/settings");
}

/**
 * PATCH /me/settings with a partial object:
 * e.g. patchSettings({ language: "zh-TW", theme: "dark" })
 */
export function patchSettings(partial) {
  return apiFetch("/me/settings", { method: "PATCH", body: partial });
}
