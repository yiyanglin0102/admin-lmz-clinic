// src/components/utils/photos.js
export function normalizePhotoEntry(p) {
  if (!p) return "";
  if (typeof p === "string") return p;
  if (typeof p === "object") {
    if (typeof p.url === "string") return p.url;
    if (typeof p.key === "string") return p.key;
    if (typeof p.S === "string") return p.S;
    if (Array.isArray(p.L) && p.L[0]?.S) return p.L[0].S;
  }
  return "";
}

export function getPhotoKeysOrUrls(product) {
  const raw = product?.photos;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizePhotoEntry).filter(Boolean);
  if (raw?.L && Array.isArray(raw.L)) return raw.L.map(normalizePhotoEntry).filter(Boolean);
  return [];
}
