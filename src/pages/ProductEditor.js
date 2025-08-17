import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import { getSettings, patchSettings } from "../services/settings";
import { getCategorySingle, getCategories, patchCategorySingle } from "../services/categories";


const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await patchCategorySingle("1", { name: "新名稱" });
        // await patchCategorySingle("1", { name: "清潔保養", oldName: "溫和清潔系列" });

        const data = await getCategories();
        console.log("GET /categories response:", data); // 👈 log API result here
        setProfile(data); // wrap to array if your UI expects a list
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {loading ? "Loading..." : <pre>{JSON.stringify(profile, null, 2)}</pre>}
    </div>
  );
};

export default Settings;
