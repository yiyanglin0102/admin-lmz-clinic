// src/components/LoginActivity.jsx
import React from "react";

const fmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
  hour12: false
});

function dotClass(s) {
  if (s.revokedAt) return "off";
  if (typeof s.active === "boolean" && s.active) return "ok";
  const mins = (Date.now() - new Date(s.lastSeenAt).getTime()) / 60000;
  if (mins <= 5) return "ok";
  if (mins <= 30) return "warn";
  return "off";
}

function browserFromUA(ua = "") {
  if (/Edg/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  return "Unknown";
}

function Location({ city, country, ip }) {
  const loc = city || country || ip || "—";
  return <>{loc}</>;
}

export default function LoginActivity({ sessions = [] }) {
  const rows = sessions.slice().sort(
    (a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt)
  );

  return (
    <section className="card">
      <h2 className="card-title">Login activity</h2>

      {!rows.length && <div className="hint">No login activity yet.</div>}

      <ul className="activity">
        {rows.map((s) => (
          <li key={s.sessionId} title={s.ua}>
            <span className={`dot ${dotClass(s)}`} />
            {fmt.format(new Date(s.lastSeenAt))}
            {" — "}
            {browserFromUA(s.ua)}
            {" — "}
            <Location city={s.city} country={s.country} ip={s.ip} />
            {s.revokedAt && <> — <span className="muted">revoked</span></>}
            {s.suspicious && <> — <span className="warn">suspicious</span></>}
          </li>
        ))}
      </ul>
    </section>
  );
}
