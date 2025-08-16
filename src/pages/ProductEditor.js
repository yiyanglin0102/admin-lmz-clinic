import React, { useState, useEffect } from "react";
import "../styles/Settings.css";
import { getSettings, patchSettings } from "../services/settings";
import { getProfile, patchProfile, listSessions } from "../services/account";


const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listSessions();
        console.log("GET /me/sessions response:", data); // 👈 log API result here
        setProfile(data);
      } catch (err) {
        console.error("Failed to load sessions:", err);
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
