// src/components/LoginActivity.jsx
import React from "react";

// Use the viewer's locale/timezone automatically
const fmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit",
  hour12: false,
});

// Pick a timestamp field (sessions use lastSeenAt; login logs may use at)
function getWhen(s) {
  return s.lastSeenAt || s.at || s.timestamp || s.time || null;
}

// "Active" dot color logic, tolerant to either sessions or login records
function dotClass(s) {
  if (s.revokedAt) return "off";
  if (typeof s.active === "boolean" && s.active) return "ok";
  const when = getWhen(s);
  if (!when) return "off";
  const mins = (Date.now() - new Date(when).getTime()) / 60000;
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

/**
 * Props:
 *  - sessions: Array of items with shape like:
 *      { sessionId?, lastSeenAt?, at?, ua?, ip?, city?, country?, revokedAt?, active?, suspicious? }
 *    You can pass your API's `sessions` array directly.
 */
export default function LoginActivity({ sessions = [] }) {
  // Sort newest first, using either lastSeenAt or at
  const rows = sessions.slice().sort((a, b) => {
    const ta = new Date(getWhen(a) || 0).getTime();
    const tb = new Date(getWhen(b) || 0).getTime();
    return tb - ta;
  });

  return (
    <section className="card">
      <h2 className="card-title">Login activity</h2>

      {!rows.length && <div className="hint">No login activity yet.</div>}

      <ul className="activity">
        {rows.map((s, idx) => {
          const when = getWhen(s);
          const key = s.sessionId || s.SK || s.id || when || idx; // robust key fallback
          const labelTime = when ? fmt.format(new Date(when)) : "—";
          const ua = s.ua || "";
          return (
            <li key={key} title={ua}>
              <span className={`dot ${dotClass(s)}`} />
              {labelTime}
              {" — "}
              {browserFromUA(ua)}
              {" — "}
              <Location city={s.city} country={s.country} ip={s.ip} />
              {s.revokedAt && <> — <span className="muted">revoked</span></>}
              {s.suspicious && <> — <span className="warn">suspicious</span></>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
