import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import { getSettings, patchSettings } from "../services/settings";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        console.log("GET /me/settings response:", data); // 👈 log API result here
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {loading ? "Loading..." : <pre>{JSON.stringify(settings, null, 2)}</pre>}
    </div>
  );
};

export default Settings;
