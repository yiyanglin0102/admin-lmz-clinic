// src/pages/Account.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import "../styles/Account.css";
import { getProfile, patchProfile, listSessions } from "../services/account";
import LoginActivity from "../components/LoginActivity";

const API_BASE = "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com";

// ===== Mock toggle =====
// Set to true to use local mock sessions (Option B runtime generator).
const DEV_USE_MOCK_SESSIONS = false;

// Create "now - X minutes" ISO
function isoAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function createDevSessions() {
  return [
    { sessionId: "sess-a1", lastSeenAt: isoAgo(2),   ip: "203.0.113.88", ua: "Mozilla/5.0 ... Chrome/126",  active: true,  city: "Taipei", country: "TW" },
    { sessionId: "sess-b2", lastSeenAt: isoAgo(20),  ip: "198.51.100.45", ua: "Mozilla/5.0 ... Edg/126",    active: false, city: "New York", country: "US", suspicious: true },
    { sessionId: "sess-c3", lastSeenAt: isoAgo(120), ip: "192.0.2.77",    ua: "Mozilla/5.0 ... Safari/17",  active: false, city: "Tokyo", country: "JP", revokedAt: new Date(Date.now() - 115*60*1000).toISOString() },
    { sessionId: "sess-d4", lastSeenAt: isoAgo(4320),ip: "203.0.113.200", ua: "Mozilla/5.0 ... Firefox/125",active: false, city: "San Francisco", country: "US" }
  ];
}

function Avatar({ keyPath }) {
  const [src, setSrc] = useState("");
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    if (!keyPath) return;
    try {
      setErr("");
      const res = await fetch(
        `${API_BASE}/getViewUrl?key=${encodeURIComponent(keyPath)}`,
        { mode: "cors" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      if (!data?.url) throw new Error("No URL returned");
      setSrc(data.url);
    } catch (e) {
      setErr(String(e));
      setSrc("");
    }
  }, [keyPath]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div>
      {src ? <img src={src} alt="avatar" className="avatar" /> : <div className="avatar placeholder" />}
      {err && <div style={{ color: "crimson", marginTop: 6, fontSize: 12 }}>{err}</div>}
    </div>
  );
}

const MAX_MB = 8;
const ACCEPT = "image/png,image/jpeg,image/webp";

const Account = () => {
  const [displayName, setDisplayName] = useState("Yi-Yang Lin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [sessions, setSessions] = useState([]);

  const [avatarKey, setAvatarKey] = useState(
    "prod/profiles/yiyanglin0102/avatar-1754894072011.jpg"
  );

  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const pickFile = () => fileInputRef.current?.click();

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) {
      alert("Please choose a PNG, JPG, or WEBP image.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      alert(`Please choose a file under ${MAX_MB} MB.`);
      e.target.value = "";
      return;
    }
    setDraftFile(f);
    const url = URL.createObjectURL(f);
    setDraftPreview(url);
  };

  const cancelDraft = () => {
    setDraftFile(null);
    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftPreview("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmUpload = async () => {
    if (!draftFile) return;
    setUploading(true);
    setProgress(0);
    try {
      const r1 = await fetch(`${API_BASE}/getUploadUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: draftFile.type })
      });
      const { uploadUrl, key } = await r1.json();
      if (!r1.ok || !uploadUrl) throw new Error("Failed to get upload URL");
      await putWithProgress(uploadUrl, draftFile, draftFile.type, (p) => setProgress(p));
      setAvatarKey(key);
      cancelDraft();
    } catch (err) {
      alert(`Upload error: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  const putWithProgress = (url, file, contentType, onProgress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`S3 PUT ${xhr.status}`));
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(file);
    });

  const save = async () => {
    setSaving(true);
    setSaved(false);
    // TODO: persist displayName + avatarKey
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => { console.log("Changing password..."); };
  const enable2FA      = async () => { console.log("Enabling 2FA..."); };
  const disable2FA     = async () => { console.log("Disabling 2FA..."); };
  const logOutAllDevices = async () => { console.log("Logging out from all devices..."); };
  const editRecoveryEmail = async () => { console.log("Recovering email..."); };
  const editRecoveryPhone = async () => { console.log("Recovering phone..."); };
  const deleteAccount = async () => { console.log("Deleting account..."); };
  const exportAccountData = async () => { console.log("Exporting account data..."); };

  useEffect(() => {
    (async () => {
      try {
        if (DEV_USE_MOCK_SESSIONS) {
          setSessions(createDevSessions());
        } else {
          const { sessions } = await listSessions();
          setSessions(sessions || []);
        }
      } catch (e) {
        console.error("Failed to load sessions:", e);
        setSessions([]);
      }
    })();
  }, []);

  const isActive = (s) => {
    if (s.revokedAt) return false;
    if (typeof s.active === "boolean") return s.active;
    const mins = (Date.now() - new Date(s.lastSeenAt).getTime()) / 60000;
    return mins <= 5;
  };

  const activeCount = sessions.filter(isActive).length;

  return (
    <div className="account-wrap">
      <header className="account-header">
        <h1 className="account-title">Account</h1>
        <p className="account-subtitle">Manage your profile and security.</p>
      </header>

      {/* Profile */}
      <section className="card">
        <h2 className="card-title">Profile</h2>
        <div className="profile-row">
          <Avatar keyPath={avatarKey} />
          <div className="profile-meta">
            <div className="field">
              <label className="label">Display name</label>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="hint">Shown across the admin portal.</p>
            </div>
            <p><strong>Email:</strong> yi.yang@example.com <span className="ok">Verified</span></p>
            <p><strong>Role:</strong> Super Admin</p>

            <div className="profile-actions" style={{ gap: 8, display: "flex", alignItems: "center" }}>
              <button className="btn primary" onClick={pickFile}>Change profile picture</button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                style={{ display: "none" }}
                onChange={onPickFile}
              />
            </div>

            {draftPreview && (
              <div className="draft-wrap">
                <div className="draft-row">
                  <img src={draftPreview} alt="preview" className="avatar preview" />
                  <div style={{ flex: 1 }}>
                    <div className="hint">Preview — not saved yet</div>
                    {uploading ? (
                      <div className="progress">
                        <div className="bar" style={{ width: `${progress}%` }} />
                        <span>{progress}%</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn primary" onClick={confirmUpload}>Upload</button>
                        <button className="btn ghost" onClick={cancelDraft}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Security */}
      <section className="card">
        <h2 className="card-title">Security</h2>
        <div className="grid-2">
          <div className="field">
            <label className="label">Password</label>
            <div className="inline">
              <span>●●●●●●●●</span>
              <button className="btn ghost sm" onClick={changePassword}>Change password</button>
            </div>
          </div>

          <div className="field">
            <label className="label">Two-Factor Authentication (2FA)</label>
            <div className="inline">
              <span>Disabled</span>
              <button className="btn ghost sm" onClick={enable2FA}>Enable 2FA</button>
              <button className="btn ghost sm" onClick={disable2FA}>Disable 2FA</button>
            </div>
          </div>

          <div className="field full">
            <label className="label">Active sessions</label>
            <div className="inline">
              <span>{activeCount} devices signed in</span>
              <button className="btn ghost sm" onClick={logOutAllDevices}>Log out of all devices</button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Activity */}
      <LoginActivity sessions={sessions} />

      {/* Recovery */}
      <section className="card">
        <h2 className="card-title">Account recovery</h2>
        <div className="grid-2">
          <div className="field">
            <label className="label">Recovery email</label>
            <div className="inline">
              <span>recovery@example.com</span>
              <button className="btn ghost sm" onClick={editRecoveryEmail}>Edit</button>
            </div>
          </div>
          <div className="field">
            <label className="label">Recovery phone</label>
            <div className="inline">
              <span>+886 912 345 678</span>
              <button className="btn ghost sm" onClick={editRecoveryPhone}>Edit</button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="card danger">
        <h2 className="card-title">Danger Zone</h2>
        <div className="danger-row">
          <div>
            <h3>Export account data</h3>
            <p className="hint">Download your account profile and settings.</p>
          </div>
          <button className="btn ghost" onClick={exportAccountData}>Export</button>
        </div>
        <div className="danger-row">
          <div>
            <h3>Delete account</h3>
            <p className="hint">This action is permanent and cannot be undone.</p>
          </div>
          <button className="btn danger" onClick={deleteAccount}>Delete</button>
        </div>
      </section>

      <footer className="actions">
        <button className="btn ghost" onClick={() => window.location.reload()}>Reset</button>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="saved-badge">Saved ✓</span>}
      </footer>
    </div>
  );
};

export default Account;
