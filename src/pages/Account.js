// src/pages/Account.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import "../styles/Account.css";
import LoginActivity from "../components/LoginActivity";
import { getProfile, patchProfile, listSessions } from "../services/account";
import { getUploadUrl, getViewUrl, putWithProgress } from "../services/storage";
import { useSignedImage } from "../components/hook/useSignedImage";

const MAX_MB = 8;
const ACCEPT = "image/png,image/jpeg,image/webp";

/** Canonical UI shape for profile */
const DEFAULT_PROFILE = {
  userId: "",
  email: "",
  displayName: "",
  avatarKey: "",
  createdAt: "",
  role: "User",
  twoFactor: false,
  locale: "zh-TW",
  timeZone: "Asia/Taipei",
  region: "TW",
  currency: "TWD",
};

/** Map whatever backend returns into the canonical UI shape */
function normalizeProfile(raw) {
  const r = raw || {};
  return {
    userId: r.userId || r.userID || r.id || "",
    email: r.email || r.primaryEmail || "",
    displayName: r.displayName || r.name || "",
    avatarKey: r.avatarKey || r.avatar || "",
    createdAt: r.createdAt || r.created_at || r.created || "",
    role: r.role || r.userRole || "User",
    twoFactor: Boolean(r.twoFactor ?? r.mfaEnabled ?? r.totpEnabled ?? r.has2FA),
    locale: r.locale || r.buyer_locale || r.language || "zh-TW",
    timeZone: r.timeZone || r.timezone || "Asia/Taipei",
    region: r.region || "TW",
    currency: r.currency || r.display_currency || "TWD",
  };
}

/** Avatar renders:
 * - srcOverride if provided (blob or signed URL)
 * - otherwise resolves keyPath via useSignedImage (signed or blob)
 */
function Avatar({ keyPath, srcOverride }) {
  const { src: signedSrc, error } = useSignedImage(keyPath, { preferBlob: false });
  const src = srcOverride || signedSrc;

  return (
    <div>
      {src ? <img src={src} alt="avatar" className="avatar" /> : <div className="avatar placeholder" />}
      {error && <div style={{ color: "crimson", marginTop: 6, fontSize: 12 }}>{error}</div>}
    </div>
  );
}

const Account = () => {
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [sessions, setSessions] = useState([]);

  // Draft file BEFORE uploading to S3
  const [draftFile, setDraftFile] = useState(null);
  const [draftPreview, setDraftPreview] = useState(""); // blob URL from local selection

  // After uploading to S3 (but before save), we hold a PENDING key + preview src
  const [pendingAvatarKey, setPendingAvatarKey] = useState("");
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState(""); // signed URL (or blob if fallback)

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null); // canonical shape
  const profileLoaded = Boolean(profile);

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

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelDraft = () => {
    setDraftFile(null);
    if (draftPreview && pendingAvatarSrc !== draftPreview) {
      URL.revokeObjectURL(draftPreview);
    }
    setDraftPreview("");
    setProgress(0);
    clearFileInput();
  };

  // Revert the staged avatar change (if user uploaded to S3 but didn't save)
  const revertPendingPhoto = () => {
    setPendingAvatarKey("");
    setPendingAvatarSrc("");
  };

  // Upload to S3 only; DO NOT write to DB.
  // After success, keep the S3 key in pending state so Save() can persist later.
  const confirmUpload = async () => {
    if (!draftFile) return;
    setUploading(true);
    setProgress(0);
    try {
      const { uploadUrl, key } = await getUploadUrl(draftFile.type);
      if (!uploadUrl || !key) throw new Error("Failed to get upload URL");

      await putWithProgress(uploadUrl, draftFile, draftFile.type, (p) => setProgress(p));

      // Get a signed view URL for the pending key so preview remains after we close draft
      try {
        const url = await getViewUrl(key);
        setPendingAvatarSrc(url);
      } catch {
        // Fallback: if we can't fetch a view URL, keep the local blob preview
        setPendingAvatarSrc(draftPreview);
      }

      setPendingAvatarKey(key); // staged; not saved yet
      cancelDraft(); // close draft UI
    } catch (err) {
      alert(`Upload error: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  // Persist to DB ONLY here
  const save = async () => {
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        displayName,
        avatarKey: pendingAvatarKey || profile.avatarKey,
      };
      const updated = await patchProfile(payload);

      if (updated) {
        const norm = normalizeProfile(updated);
        setProfile(norm);
        setDisplayName(norm.displayName || "");
      } else {
        // Merge locally if API doesn't return updated profile
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                displayName,
                avatarKey: pendingAvatarKey || prev.avatarKey,
              }
            : prev
        );
      }

      // Commit finished — clear pending state
      setPendingAvatarKey("");
      setPendingAvatarSrc("");

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert(`Save failed: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    console.log("Changing password...");
  };
  const enable2FA = async () => {
    console.log("Enabling 2FA...");
  };
  const disable2FA = async () => {
    console.log("Disabling 2FA...");
  };
  const logOutAllDevices = async () => {
    console.log("Logging out from all devices...");
  };
  const editRecoveryEmail = async () => {
    console.log("Recovering email...");
  };
  const editRecoveryPhone = async () => {
    console.log("Recovering phone...");
  };
  const deleteAccount = async () => {
    console.log("Deleting account...");
  };
  const exportAccountData = async () => {
    console.log("Exporting account data...");
  };

  // Load profile
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        const norm = normalizeProfile(data);
        setProfile(norm);
        setDisplayName(norm.displayName || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
        setProfile({ ...DEFAULT_PROFILE });
      }
    })();
  }, []);

  // Load sessions once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await listSessions();
        const items = Array.isArray(resp?.sessions) ? resp.sessions : [];
        if (!cancelled) setSessions(items);
      } catch (e) {
        console.error("Failed to load sessions:", e);
        if (!cancelled) setSessions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (s) => {
    if (s.revokedAt) return false;
    if (typeof s.active === "boolean") return s.active;
    const mins = (Date.now() - new Date(s.lastSeenAt).getTime()) / 60000;
    return mins <= 5;
  };
  const activeCount = sessions.filter(isActive).length;

  // What to display in the avatar slot:
  // - If user picked a file but hasn't uploaded to S3 yet -> draftPreview (blob)
  // - Else if we uploaded to S3 but haven't saved -> pendingAvatarSrc (signed or blob)
  // - Else show the persisted avatar via keyPath
  const avatarSrcOverride = draftPreview || pendingAvatarSrc;

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
          <Avatar keyPath={profile?.avatarKey} srcOverride={avatarSrcOverride} />
          <div className="profile-meta">
            <div className="field">
              <label className="label">Display name</label>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profileLoaded ? "Enter display name" : "Loading..."}
                disabled={!profileLoaded}
              />
              <p className="hint">Shown across the admin portal.</p>
            </div>

            <p>
              <strong>Email:</strong> {profile?.email || "—"} <span className="ok">Verified</span>
            </p>
            <p>
              <strong>Role:</strong> {profile?.role || "User"}
            </p>

            <div
              className="profile-actions"
              style={{ gap: 8, display: "flex", alignItems: "center", flexWrap: "wrap" }}
            >
              <button className="btn primary" onClick={pickFile} disabled={!profileLoaded}>
                Change profile picture
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                style={{ display: "none" }}
                onChange={onPickFile}
              />

              {pendingAvatarKey && (
                <>
                  <button className="btn ghost" onClick={revertPendingPhoto}>
                    Revert photo change
                  </button>
                  <span className="badge">Pending photo</span>
                </>
              )}
            </div>

            {/* Draft UI (picked but not uploaded to S3 yet) */}
            {draftPreview && (
              <div className="draft-wrap">
                <div className="draft-row">
                  <img src={draftPreview} alt="preview" className="avatar preview" />
                  <div style={{ flex: 1 }}>
                    <div className="hint">Preview — not uploaded yet</div>
                    {uploading ? (
                      <div className="progress">
                        <div className="bar" style={{ width: `${progress}%` }} />
                        <span>{progress}%</span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn primary" onClick={confirmUpload}>
                          Upload
                        </button>
                        <button className="btn ghost" onClick={cancelDraft}>
                          Cancel
                        </button>
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
              <button className="btn ghost sm" onClick={changePassword}>
                Change password
              </button>
            </div>
          </div>

          <div className="field">
            <label className="label">Two-Factor Authentication (2FA)</label>
            <div className="inline">
              <span>{profile?.twoFactor ? "Enabled" : "Disabled"}</span>
              <button className="btn ghost sm" onClick={enable2FA} disabled={profile?.twoFactor}>
                Enable 2FA
              </button>
              <button className="btn ghost sm" onClick={disable2FA} disabled={!profile?.twoFactor}>
                Disable 2FA
              </button>
            </div>
          </div>

          <div className="field full">
            <label className="label">Active sessions</label>
            <div className="inline">
              <span>{activeCount} devices signed in</span>
              <button className="btn ghost sm" onClick={logOutAllDevices}>
                Log out of all devices
              </button>
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
              <button className="btn ghost sm" onClick={editRecoveryEmail}>
                Edit
              </button>
            </div>
          </div>
          <div className="field">
            <label className="label">Recovery phone</label>
            <div className="inline">
              <span>+886 912 345 678</span>
              <button className="btn ghost sm" onClick={editRecoveryPhone}>
                Edit
              </button>
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
          <button className="btn ghost" onClick={exportAccountData}>
            Export
          </button>
        </div>
        <div className="danger-row">
          <div>
            <h3>Delete account</h3>
            <p className="hint">This action is permanent and cannot be undone.</p>
          </div>
          <button className="btn danger" onClick={deleteAccount}>
            Delete
          </button>
        </div>
      </section>

      <footer className="actions">
        <button className="btn ghost" onClick={() => window.location.reload()}>
          Reset
        </button>
        <button className="btn primary" onClick={save} disabled={saving || !profileLoaded}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="saved-badge">Saved ✓</span>}
      </footer>
    </div>
  );
};

export default Account;
