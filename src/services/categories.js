// src/services/categories.js

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com";

async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include",
    mode: "cors",
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText;
    throw new Error(msg);
  }
  return data;
}

// ----- existing endpoints -----
export function getAllCategories() {
  return apiFetch("/category/get-all-categories");
}

export function getCategorySingle(id) {
  if (!id) throw new Error("category id is required");
  return apiFetch(`/category/get-single-category?id=${encodeURIComponent(id)}`);
}

export function patchEditSingleCategory(id, updates) {
  if (!id || !updates || typeof updates !== "object") {
    throw new Error("id and body are required");
  }
  return apiFetch("/category/edit-category", {
    method: "PATCH",
    body: { id, ...updates },
  });
}

// ✅ Updated: allow optional id/createdAt/content/restore for true “undo create”
export function createCategory({ name, id, createdAt, content, restore } = {}) {
  if (!name) throw new Error("name is required");
  const body = { name };
  if (id != null) body.id = String(id);                 // let backend honor fixed id
  if (createdAt != null) body.createdAt = createdAt;    // ISO string or epoch
  if (content != null) body.content = content;
  if (restore === true) body.restore = true;            // hint for backend logic (optional)

  return apiFetch("/category/create-category", {
    method: "POST",
    body,
  });
}

// Tiny convenience helper used by the UI when clicking 「復原」
export function restoreCategory({ id, name, createdAt, content } = {}) {
  if (!id || !name) throw new Error("id and name are required");
  return createCategory({ id, name, createdAt, content, restore: true });
}

export function deleteCategory(id, name) {
  if (!id) throw new Error("category id is required");
  return apiFetch("/category/delete-category", {
    method: "DELETE",
    body: name ? { id, name } : { id },
  });
}
