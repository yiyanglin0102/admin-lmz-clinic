import React, { useState } from "react";
import "../styles/Settings.css";

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    // Localization
    language: "en",
    region: "TW",
    timeZone: "Asia/Taipei",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "24h",
    numberFormat: "1,234.56",
    currency: "TWD",
    theme: "system",

    // Notifications
    notifEmail: true,
    notifSMS: false,
    notifPush: true,
    notifLoginAlerts: true,
    notifDigest: "daily",

    // Security
    autoLogoutMins: 30,
    ipRestrict: false,
    ipAllowlist: "",
    twoFactor: false,

    // Privacy
    telemetry: false,
    marketingEmails: false,
    cookiePref: "balanced",
  });

  const onChange = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    // TODO: call your backend to persist settings
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="settings-wrap">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">
          Preferences for localization, notifications, security, and privacy.
        </p>
      </header>

      {/* Localization */}
      <section className="card">
        <h2 className="card-title">Localization</h2>
        <div className="grid-2">
          <div className="field">
            <label className="label">Language</label>
            <select
              className="select"
              value={settings.language}
              onChange={(e) => onChange("language", e.target.value)}
            >
              <option value="en">English</option>
              <option value="zh-TW">中文（繁體）</option>
              <option value="ja">日本語</option>
            </select>
            <p className="hint">Affects UI text and date/number formatting.</p>
          </div>

          <div className="field">
            <label className="label">Region</label>
            <select
              className="select"
              value={settings.region}
              onChange={(e) => onChange("region", e.target.value)}
            >
              <option value="TW">Taiwan</option>
              <option value="US">United States</option>
              <option value="JP">Japan</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Time zone</label>
            <select
              className="select"
              value={settings.timeZone}
              onChange={(e) => onChange("timeZone", e.target.value)}
            >
              <option value="Asia/Taipei">GMT+8 Taipei</option>
              <option value="America/New_York">GMT-5 New York</option>
              <option value="Europe/London">GMT+0 London</option>
              <option value="Asia/Tokyo">GMT+9 Tokyo</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Date format</label>
            <select
              className="select"
              value={settings.dateFormat}
              onChange={(e) => onChange("dateFormat", e.target.value)}
            >
              <option value="YYYY/MM/DD">YYYY/MM/DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Time format</label>
            <div className="radio-row">
              <label className="radio">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={settings.timeFormat === "24h"}
                  onChange={() => onChange("timeFormat", "24h")}
                />
                24-hour
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={settings.timeFormat === "12h"}
                  onChange={() => onChange("timeFormat", "12h")}
                />
                12-hour
              </label>
            </div>
          </div>

          <div className="field">
            <label className="label">Number format</label>
            <select
              className="select"
              value={settings.numberFormat}
              onChange={(e) => onChange("numberFormat", e.target.value)}
            >
              <option value="1,234.56">1,234.56</option>
              <option value="1.234,56">1.234,56</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Currency</label>
            <select
              className="select"
              value={settings.currency}
              onChange={(e) => onChange("currency", e.target.value)}
            >
              <option value="TWD">TWD</option>
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Theme</label>
            <div className="radio-row">
              <label className="radio">
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === "light"}
                  onChange={() => onChange("theme", "light")}
                />
                Light
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === "dark"}
                  onChange={() => onChange("theme", "dark")}
                />
                Dark
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === "system"}
                  onChange={() => onChange("theme", "system")}
                />
                System
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="card">
        <h2 className="card-title">Notifications</h2>
        <div className="grid-2">
          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.notifEmail}
                onChange={(e) => onChange("notifEmail", e.target.checked)}
              />
              Email notifications
            </label>
          </div>
          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.notifSMS}
                onChange={(e) => onChange("notifSMS", e.target.checked)}
              />
              SMS notifications
            </label>
          </div>
          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.notifPush}
                onChange={(e) => onChange("notifPush", e.target.checked)}
              />
              Push notifications
            </label>
          </div>
          <div className="field">
            <label className="label">Email digest</label>
            <select
              className="select"
              value={settings.notifDigest}
              onChange={(e) => onChange("notifDigest", e.target.value)}
            >
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.notifLoginAlerts}
                onChange={(e) => onChange("notifLoginAlerts", e.target.checked)}
              />
              Login alerts for new devices/IP
            </label>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="card">
        <h2 className="card-title">Security</h2>
        <div className="grid-2">
          <div className="field">
            <label className="label">Auto-logout (minutes)</label>
            <input
              type="number"
              className="input"
              min={5}
              step={5}
              value={settings.autoLogoutMins}
              onChange={(e) =>
                onChange("autoLogoutMins", Number(e.target.value || 0))
              }
            />
          </div>

          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.twoFactor}
                onChange={(e) => onChange("twoFactor", e.target.checked)}
              />
              Require 2FA (TOTP/SMS)
            </label>
            <p className="hint">If using Cognito, map this to User Pool MFA.</p>
          </div>

          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.ipRestrict}
                onChange={(e) => onChange("ipRestrict", e.target.checked)}
              />
              Restrict login to allowed IPs
            </label>
          </div>

          <div className="field full">
            <label className="label">IP allowlist (one per line)</label>
            <textarea
              className="textarea"
              rows={4}
              placeholder={"203.0.113.0/24\n198.51.100.23"}
              value={settings.ipAllowlist}
              onChange={(e) => onChange("ipAllowlist", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="card">
        <h2 className="card-title">Privacy</h2>
        <div className="grid-2">
          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.telemetry}
                onChange={(e) => onChange("telemetry", e.target.checked)}
              />
              Share anonymous usage analytics
            </label>
          </div>
          <div className="field checkbox">
            <label>
              <input
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={(e) => onChange("marketingEmails", e.target.checked)}
              />
              Allow product updates/marketing emails
            </label>
          </div>
          <div className="field">
            <label className="label">Cookie preference</label>
            <select
              className="select"
              value={settings.cookiePref}
              onChange={(e) => onChange("cookiePref", e.target.value)}
            >
              <option value="minimal">Minimal</option>
              <option value="balanced">Balanced</option>
              <option value="full">Full</option>
            </select>
          </div>
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

export default Settings;
