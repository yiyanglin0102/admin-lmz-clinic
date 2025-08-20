// src/components/utils/photos.js
export function normalizePhotoEntry(p) {
  if (!p) return "";
  if (typeof p === "string") return p;
  if (p.S) return p.S;                 // DDB AttributeValue
  if (p.url) return p.url;             // if you ever stored urls
  if (p.key) return p.key;             // or nested key
  return "";
}

export function getPhotoKeysOrUrls(product) {
  const raw = product?.photos;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(normalizePhotoEntry).filter(Boolean);
  if (raw.L && Array.isArray(raw.L)) return raw.L.map(normalizePhotoEntry).filter(Boolean);
  return [];
}
