import React, { useEffect, useState, useCallback, useRef } from "react";
import "../styles/Account.css";

const API_BASE = "https://3srgkiu0yl.execute-api.ap-southeast-1.amazonaws.com";

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
      {src ? (
        <img src={src} alt="avatar" className="avatar" />
      ) : (
        <div className="avatar placeholder" />
      )}
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

  // The current server-side key for this user's avatar (store in DB in real app)
  const [avatarKey, setAvatarKey] = useState(
    "prod/profiles/yiyanglin0102/avatar-1754894072011.jpg"
  );

  // "Edit" (local) state for choosing a new photo before upload
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // open file dialog
  const pickFile = () => fileInputRef.current?.click();

  // when a file is chosen
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

  // cancel draft
  const cancelDraft = () => {
    setDraftFile(null);
    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftPreview("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // upload draft to S3 and set as active avatar
  const confirmUpload = async () => {
    if (!draftFile) return;
    setUploading(true);
    setProgress(0);
    try {
      // 1) Get pre-signed PUT
      const r1 = await fetch(`${API_BASE}/getUploadUrl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: draftFile.type })
      });
      const { uploadUrl, key } = await r1.json();
      if (!r1.ok || !uploadUrl) throw new Error("Failed to get upload URL");

      // 2) PUT to S3 with progress reporting
      await putWithProgress(uploadUrl, draftFile, draftFile.type, (p) => setProgress(p));

      // 3) Persist key to your backend user (TODO in real app)
      setAvatarKey(key); // triggers <Avatar> to reload via /getViewUrl

      // 4) cleanup
      cancelDraft();
    } catch (err) {
      alert(`Upload error: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  // XHR for progress (fetch doesn't expose upload progress)
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
    // TODO: send displayName + avatarKey to your backend to persist
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

            {/* Edit avatar controls */}
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

            {/* Draft preview + actions */}
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
              <button className="btn ghost sm">Change password</button>
            </div>
          </div>

          <div className="field">
            <label className="label">Two-Factor Authentication (2FA)</label>
            <div className="inline">
              <span>Disabled</span>
              <button className="btn ghost sm">Enable 2FA</button>
            </div>
          </div>

          <div className="field full">
            <label className="label">Active sessions</label>
            <div className="inline">
              <span>3 devices signed in</span>
              <button className="btn ghost sm">Log out of all devices</button>
            </div>
          </div>
        </div>
      </section>

      {/* Login Activity */}
      <section className="card">
        <h2 className="card-title">Login activity</h2>
        <ul className="activity">
          <li><span className="dot ok" /> 2025-08-08 09:15 — Chrome — Taipei</li>
          <li><span className="dot warn" /> 2025-08-07 22:43 — Edge — New York</li>
        </ul>
      </section>

      {/* Recovery */}
      <section className="card">
        <h2 className="card-title">Account recovery</h2>
        <div className="grid-2">
          <div className="field">
            <label className="label">Recovery email</label>
            <div className="inline">
              <span>recovery@example.com</span>
              <button className="btn ghost sm">Edit</button>
            </div>
          </div>
          <div className="field">
            <label className="label">Recovery phone</label>
            <div className="inline">
              <span>+886 912 345 678</span>
              <button className="btn ghost sm">Edit</button>
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
          <button className="btn ghost">Export</button>
        </div>
        <div className="danger-row">
          <div>
            <h3>Delete account</h3>
            <p className="hint">This action is permanent and cannot be undone.</p>
          </div>
          <button className="btn danger">Delete</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="actions">
        <button className="btn ghost" onClick={() => window.location.reload()}>
          Reset
        </button>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="saved-badge">Saved ✓</span>}
      </footer>
    </div>
  );
};

export default Account;
