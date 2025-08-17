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

// optional list if you add it later
export function getAllCategories() {
  return apiFetch("/category/get-all-categories");
}

// const data = await getCategorySingle("3");
// GET /category-single?id=1
export function getCategorySingle(id) {
  if (!id) throw new Error("category id is required");
  return apiFetch(`/category/get-single-category?id=${encodeURIComponent(id)}`);
}

// PATCH /category/edit-category/{id}
// Body examples:
//   { name: "新名稱" }
//   { name: "新名稱", oldName: "舊名稱" }
//   { content: "描述..." }       // update non-key field only
export function patchEditSingleCategory(id, updates) {
  if (!id || !updates || typeof updates !== "object") {
    throw new Error("id and body are required");
  }
  // Lambda expects id in the body and is mounted on /patch-category
  return apiFetch("/category/edit-category", {
    method: "PATCH",
    body: { id, ...updates },
  });
}
