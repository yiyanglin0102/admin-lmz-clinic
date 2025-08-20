// src/components/hook/useSignedImage.js
import { useEffect, useState } from "react";
import { getViewUrl } from "../../services/storage";

const signedCache = new Map(); // key -> signedUrl
const blobCache = new Map();   // cacheKey -> blobUrl

export function useSignedImage(keyOrUrl, { preferBlob = true } = {}) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let createdBlob = "";
    const ctrl = new AbortController();

    async function run() {
      setError("");
      setSrc("");

      const v = (keyOrUrl || "").trim();
      if (!v) return;

      try {
        // If it's already a full URL
        if (/^https?:\/\//i.test(v)) {
          if (!preferBlob) { setSrc(v); return; }
          const cacheKey = `url:${v}`;
          const cached = blobCache.get(cacheKey);
          if (cached) { setSrc(cached); return; }
          const r = await fetch(v, { mode: "cors", signal: ctrl.signal });
          if (!r.ok) throw new Error(`Fetch ${r.status}`);
          const b = await r.blob();
          const url = URL.createObjectURL(b);
          if (cancelled) return;
          blobCache.set(cacheKey, url);
          createdBlob = url;
          setSrc(url);
          return;
        }

        // Else treat as S3 key -> signed URL
        let signed = signedCache.get(v);
        if (!signed) {
          signed = await getViewUrl(v);
          signedCache.set(v, signed);
        }

        if (!preferBlob) { setSrc(signed); return; }

        const cachedBlob = blobCache.get(v);
        if (cachedBlob) { setSrc(cachedBlob); return; }

        const r = await fetch(signed, { mode: "cors", signal: ctrl.signal });
        if (!r.ok) throw new Error(`Fetch ${r.status}`);
        const b = await r.blob();
        const url = URL.createObjectURL(b);
        if (cancelled) return;
        blobCache.set(v, url);
        createdBlob = url;
        setSrc(url);
      } catch (e) {
        if (!cancelled) {
          setError(String(e));
          setSrc("");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      ctrl.abort();
      if (createdBlob) {
        try { URL.revokeObjectURL(createdBlob); } catch {}
      }
    };
  }, [keyOrUrl, preferBlob]);

  return { src, error };
}
