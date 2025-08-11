import React, { useEffect, useState } from "react";

export default function Avatar() {
  const [src, setSrc] = useState("");

  useEffect(() => {
    async function load() {
      const key = "prod/profiles/yiyanglin0102/avatar-1754894072011.jpg";
      const r = await fetch(
        "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com/getViewUrl?key=" +
        encodeURIComponent(key)
      );
      const { url } = await r.json();
      setSrc(url); // presigned GET
    }
    load();
  }, []);

  return (
    <img
      src={src}
      alt="avatar"
      style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 12 }}
    />
  );
}
