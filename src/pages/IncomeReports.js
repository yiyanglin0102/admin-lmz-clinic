// src/pages/IncomeReports.js
import React, { useMemo, useState, useEffect } from "react";
import "../styles/IncomeReports.css";
import { sample_TransactionsOrderTickets } from "../sample_data/sample_TransactionsOrderTickets";

const presets = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "mtd", label: "MTD" },
];

const currency = (n) =>
  n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const downloadCSV = (rows, filename = "income_report.csv") => {
  if (!rows.length) return;
  const header = Object.keys(rows[0] || {}).join(",");
  const body = rows.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const LineChart = ({ data, width = 760, height = 220, margin = 24 }) => {
  if (!data.length) return <div className="chart-empty">No data</div>;

  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.revenue);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = (maxY - minY) * 0.1 || 1;
  const y0 = minY - pad;
  const y1 = maxY + pad;

  const xScale = (i) =>
    margin + (i * (width - margin * 2)) / Math.max(1, xs.length - 1);
  const yScale = (v) =>
    height -
    margin -
    ((v - y0) * (height - margin * 2)) / (y1 - y0);

  const path = ys
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(v)}`)
    .join(" ");

  return (
    <svg
      className="line-chart"
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      <line
        x1={margin}
        y1={height - margin}
        x2={width - margin}
        y2={height - margin}
        className="axis"
      />
      <line
        x1={margin}
        y1={margin}
        x2={margin}
        y2={height - margin}
        className="axis"
      />
      <path d={path} className="line" fill="none" />
      {ys.map((v, i) => (
        <circle
          key={i}
          cx={xScale(i)}
          cy={yScale(v)}
          r="3"
          className="dot"
        />
      ))}
      {data.map((d, i) => (
        <text
          key={i}
          x={xScale(i)}
          y={height - margin + 14}
          className="tick"
          textAnchor="middle"
        >
          {d.date.slice(5)}
        </text>
      ))}
      <text x={margin} y={margin - 6} className="chart-title">
        Revenue
      </text>
    </svg>
  );
};

const IncomeReports = () => {
  const [range, setRange] = useState({ start: "", end: "" });
  const [preset, setPreset] = useState("7d");
  const [channel, setChannel] = useState("all");
  const [payment, setPayment] = useState("all");
  const [rows, setRows] = useState([]);

  // Build daily summaries
  useEffect(() => {
    const grouped = {};
    sample_TransactionsOrderTickets.forEach((t) => {
      const date = t.createdAt.slice(0, 10); // YYYY-MM-DD
      if (!grouped[date]) {
        grouped[date] = {
          date,
          revenue: 0,
          orders: 0,
          refunds: 0,
          channel: t.channel || "Web",
          payment: t.paymentMethod || "Card",
          product: "",
          productsMap: {},
        };
      }

      const amt = parseFloat(t.total || t.amount || 0);
      grouped[date].revenue += amt;
      grouped[date].orders += 1;
      if (t.status === "refunded" || t.refundStatus === "refunded")
        grouped[date].refunds += 1;

      // Track top product
      t.items?.forEach((item) => {
        const qty = parseInt(item.qty || item.quantity || 0, 10);
        const rev = parseFloat(item.price) * qty;
        grouped[date].productsMap[item.name] =
          (grouped[date].productsMap[item.name] || 0) + rev;
      });
    });

    // Assign top product per day
    Object.values(grouped).forEach((day) => {
      const top = Object.entries(day.productsMap).sort(
        (a, b) => b[1] - a[1]
      )[0];
      day.product = top ? top[0] : "";
      delete day.productsMap;
    });

    setRows(Object.values(grouped));
  }, []);

  // Apply filters
  const filtered = useMemo(() => {
    let out = [...rows];

    if (preset && rows.length) {
      const end = new Date(Math.max(...rows.map(r => new Date(r.date))));
      const start = new Date(end);
      if (preset === "7d") start.setDate(end.getDate() - 6);
      if (preset === "30d") start.setDate(end.getDate() - 29);
      if (preset === "mtd") start.setDate(1);
      out = out.filter((r) => {
        const d = new Date(r.date + "T00:00:00");
        return d >= start && d <= end;
      });
    }

    if (range.start && range.end) {
      const s = new Date(range.start);
      const e = new Date(range.end);
      out = out.filter((r) => {
        const d = new Date(r.date + "T00:00:00");
        return d >= s && d <= e;
      });
    }

    if (channel !== "all") out = out.filter((r) => r.channel === channel);
    if (payment !== "all") out = out.filter((r) => r.payment === payment);

    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [rows, preset, range, channel, payment]);

  // KPIs
  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, r) => s + r.revenue, 0);
    const orders = filtered.reduce((s, r) => s + r.orders, 0);
    const refunds = filtered.reduce((s, r) => s + r.refunds, 0);
    const aov = orders ? revenue / orders : 0;
    return { revenue, orders, refunds, aov };
  }, [filtered]);

  const topProducts = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      map.set(r.product, (map.get(r.product) || 0) + r.revenue);
    });
    return [...map.entries()]
      .map(([name, rev]) => ({ name, rev }))
      .sort((a, b) => b.rev - a.rev)
      .slice(0, 5);
  }, [filtered]);

  const channels = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      map.set(r.channel, (map.get(r.channel) || 0) + r.revenue);
    });
    return [...map.entries()].map(([name, rev]) => ({ name, rev }));
  }, [filtered]);

  const payments = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      map.set(r.payment, (map.get(r.payment) || 0) + r.revenue);
    });
    return [...map.entries()].map(([name, rev]) => ({ name, rev }));
  }, [filtered]);

  return (
    <div className="income-wrap">
      <header className="header">
        <h1 className="title">Income Reports</h1>
        <p className="subtitle">
          Track revenue, orders, and trends across channels.
        </p>
      </header>

      {/* Filters */}
      <section className="card">
        <div className="filters">
          <div className="field">
            <label className="label">Preset</label>
            <div className="preset-row">
              {presets.map((p) => (
                <button
                  key={p.key}
                  className={`chip ${preset === p.key ? "active" : ""}`}
                  onClick={() => setPreset(p.key)}
                >
                  {p.label}
                </button>
              ))}
              <button className="chip ghost" onClick={() => setPreset("")}>
                Clear
              </button>
            </div>
          </div>

          <div className="field">
            <label className="label">Custom range</label>
            <div className="range-row">
              <input
                type="date"
                className="input"
                value={range.start}
                onChange={(e) =>
                  setRange((r) => ({ ...r, start: e.target.value }))
                }
              />
              <span className="sep">to</span>
              <input
                type="date"
                className="input"
                value={range.end}
                onChange={(e) =>
                  setRange((r) => ({ ...r, end: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Channel</label>
            <select
              className="select"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="POS">POS</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Payment</label>
            <select
              className="select"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Card">Card</option>
              <option value="Apple Pay">Apple Pay</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="spacer" />

          <button
            className="btn ghost"
            onClick={() => downloadCSV(filtered, "income_report.csv")}
            disabled={!filtered.length}
          >
            Export CSV
          </button>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpis">
        <div className="kpi">
          <div className="kpi-label">Revenue</div>
          <div className="kpi-value">{currency(totals.revenue)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Orders</div>
          <div className="kpi-value">{totals.orders.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">AOV</div>
          <div className="kpi-value">{currency(totals.aov)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Refunds</div>
          <div className="kpi-value">{totals.refunds}</div>
        </div>
      </section>

      {/* Chart */}
      <section className="card">
        <LineChart data={filtered} />
      </section>

      {/* Tables */}
      <section className="grid-2">
        <div className="card">
          <h3 className="card-title">Top Products</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="right">{currency(p.rev)}</td>
                </tr>
              ))}
              {!topProducts.length && (
                <tr>
                  <td colSpan={2} className="empty">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title">By Channel / Payment</h3>
          <div className="split">
            <table className="table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th className="right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td className="right">{currency(c.rev)}</td>
                  </tr>
                ))}
                {!channels.length && (
                  <tr>
                    <td colSpan={2} className="empty">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <table className="table">
              <thead>
                <tr>
                  <th>Payment</th>
                  <th className="right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td className="right">{currency(p.rev)}</td>
                  </tr>
                ))}
                {!payments.length && (
                  <tr>
                    <td colSpan={2} className="empty">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IncomeReports;
