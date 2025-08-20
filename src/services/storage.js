// src/services/storage.js
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com";

export const CDN_BASE = process.env.REACT_APP_CDN_BASE || "https://cdn.lmz-clinic.com";

/** Convert an S3 key (e.g. "products/P-3004/img123.jpg") to a CDN URL. */
export function s3KeyToCdnUrl(key) {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key; // already a URL
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `${CDN_BASE}/${path}`;
}

/** Optional presign PUT for uploads (kept same as before). */
async function jsonFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
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

export async function getUploadUrl({ contentType, keyPrefix = "products", filename = "" }) {
  return jsonFetch("/getUploadUrl", {
    method: "POST",
    body: { contentType, keyPrefix, filename },
  });
}

export function putWithProgress(uploadUrl, file, onProgress, contentType = file.type) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`S3 PUT ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

export async function getViewUrl(key) {
  const res = await fetch(`${API_BASE}/getViewUrl?key=${encodeURIComponent(key)}`, { mode: "cors" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || res.statusText);
  if (!data?.url) throw new Error("No URL returned");
  return data.url;
}

