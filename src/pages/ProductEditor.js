import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import { getSettings, patchSettings } from "../services/settings";
import { getCategorySingle, getAllCategories, patchEditSingleCategory, createCategory } from "../services/categories";


const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // const data = await patchEditSingleCategory();
        // console.log("GET /categories response:", data); // 👈 log API result here
        // setProfile(data); // wrap to array if your UI expects a list
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
