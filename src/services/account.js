// src/services/account.js

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

/** GET /me/profile -> profile object (with defaults if not set) */
export function getProfile() {
    return apiFetch("/me/profile");
}

/**
 * PATCH /me/profile with a partial object:
 * e.g. patchProfile({ language: "zh-TW", theme: "dark" })
 */
export function patchProfile(partial) {
    return apiFetch("/me/profile", { method: "PATCH", body: partial });
}

export async function listSessions() {
    const res = await fetch(`${API_BASE}/me/sessions`, { credentials: "include" });
    const data = await res.json();
    // console.log("listSessions", data);
    // Accept either { sessions: [...] } or Dynamo-style { Items: [...] }
    const raw = Array.isArray(data?.sessions)
        ? data.sessions
        : Array.isArray(data?.Items)
            ? data.Items
            : [];

    const sessions = raw.map((it) => ({
        sessionId: it.sessionId || it.session_id || it.id || null,
        lastSeenAt: it.lastSeenAt || it.at || it.timestamp || null,
        ip: it.ip || it.clientIp || null,
        ua: it.ua || it.userAgent || "",
        city: it.city || null,
        country: it.country || null,
        revokedAt: it.revokedAt || null,
        active: typeof it.active === "boolean" ? it.active : undefined,
        suspicious: Boolean(it.suspicious),
    }));

    return { sessions };
}

export async function createSession(payload = {}, { authToken } = {}) {
  const res = await fetch(`${API_BASE}/auth/create-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}
