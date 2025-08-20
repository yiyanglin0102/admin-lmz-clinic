// src/services/storage.js
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com";

export async function getViewUrl(key) {
  const res = await fetch(`${API_BASE}/getViewUrl?key=${encodeURIComponent(key)}`, { mode: "cors" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || res.statusText);
  if (!data?.url) throw new Error("No URL returned");
  return data.url;
}

export async function getUploadUrl(contentType) {
  const res = await fetch(`${API_BASE}/getUploadUrl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data; // { uploadUrl, key }
}

export function putWithProgress(uploadUrl, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`S3 PUT ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}
