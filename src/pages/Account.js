import React, { useState } from "react";
import "../styles/Account.css";

const Account = () => {
  const [displayName, setDisplayName] = useState("Yi-Yang Lin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    // TODO: call your backend (e.g., update profile + Cognito attribute if used)
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
          <img
            src="https://via.placeholder.com/80"
            alt="Profile"
            className="avatar"
          />
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
            <div className="profile-actions">
              <button className="btn primary">Change profile picture</button>
            </div>
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

      {/* Danger Zone (moved here) */}
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
