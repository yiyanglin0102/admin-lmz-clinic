import React, { useMemo, useState, useEffect } from "react";
import "../styles/IncomeReports.css";

const mockOrders = [
  // date, revenue, orders, refunds, channel, payment, topProduct
  { date: "2025-08-01", revenue: 12800, orders: 142, refunds: 2, channel: "Web", payment: "Card", product: "Matcha Latte" },
  { date: "2025-08-02", revenue: 9800, orders: 110, refunds: 3, channel: "Mobile", payment: "Card", product: "Brown Sugar Boba" },
  { date: "2025-08-03", revenue: 15250, orders: 171, refunds: 1, channel: "Web", payment: "Apple Pay", product: "Jasmine Green Tea" },
  { date: "2025-08-04", revenue: 11120, orders: 126, refunds: 4, channel: "POS", payment: "Cash", product: "Oolong Milk Tea" },
  { date: "2025-08-05", revenue: 17560, orders: 189, refunds: 2, channel: "Mobile", payment: "Card", product: "Taro Milk" },
  { date: "2025-08-06", revenue: 16320, orders: 176, refunds: 1, channel: "Web", payment: "Card", product: "Wintermelon Tea" },
  { date: "2025-08-07", revenue: 20400, orders: 215, refunds: 3, channel: "Web", payment: "Card", product: "Brown Sugar Boba" },
  { date: "2025-08-08", revenue: 22340, orders: 231, refunds: 1, channel: "Mobile", payment: "Apple Pay", product: "Matcha Latte" },
];

const presets = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "mtd", label: "MTD" },
];

const currency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const downloadCSV = (rows, filename = "income_report.csv") => {
  const header = Object.keys(rows[0] || {}).join(",");
  const body = rows.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
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

  const xScale = (i) => margin + (i * (width - margin * 2)) / Math.max(1, xs.length - 1);
  const yScale = (v) => height - margin - ((v - y0) * (height - margin * 2)) / (y1 - y0);

  const path = ys
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)},${yScale(v)}`)
    .join(" ");

  return (
    <svg className="line-chart" width="100%" viewBox={`0 0 ${width} ${height}`} role="img">
      {/* axes */}
      <line x1={margin} y1={height - margin} x2={width - margin} y2={height - margin} className="axis" />
      <line x1={margin} y1={margin} x2={margin} y2={height - margin} className="axis" />
      {/* path */}
      <path d={path} className="line" fill="none" />
      {/* points */}
      {ys.map((v, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(v)} r="3" className="dot" />
      ))}
      {/* labels */}
      {data.map((d, i) => (
        <text key={i} x={xScale(i)} y={height - margin + 14} className="tick" textAnchor="middle">
          {d.date.slice(5)}
        </text>
      ))}
      <text x={margin} y={margin - 6} className="chart-title">Revenue</text>
    </svg>
  );
};

const IncomeReports = () => {
  const [range, setRange] = useState({ start: "", end: "" });
  const [preset, setPreset] = useState("7d");
  const [channel, setChannel] = useState("all");
  const [payment, setPayment] = useState("all");
  const [rows, setRows] = useState([]);

  // simulate fetch
  useEffect(() => {
    setRows(mockOrders);
  }, []);

  // apply filters
  const filtered = useMemo(() => {
    let out = [...rows];

    if (preset) {
      const end = new Date("2025-08-08");
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

  // metrics
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
        <p className="subtitle">Track revenue, orders, and trends across channels.</p>
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
                onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
              />
              <span className="sep">to</span>
              <input
                type="date"
                className="input"
                value={range.end}
                onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Channel</label>
            <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="all">All</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="POS">POS</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Payment</label>
            <select className="select" value={payment} onChange={(e) => setPayment(e.target.value)}>
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
              <tr><th>Product</th><th className="right">Revenue</th></tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="right">{currency(p.rev)}</td>
                </tr>
              ))}
              {!topProducts.length && (
                <tr><td colSpan={2} className="empty">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="card-title">By Channel / Payment</h3>
          <div className="split">
            <table className="table">
              <thead><tr><th>Channel</th><th className="right">Revenue</th></tr></thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={c.name}><td>{c.name}</td><td className="right">{currency(c.rev)}</td></tr>
                ))}
                {!channels.length && <tr><td colSpan={2} className="empty">No data</td></tr>}
              </tbody>
            </table>

            <table className="table">
              <thead><tr><th>Payment</th><th className="right">Revenue</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.name}><td>{p.name}</td><td className="right">{currency(p.rev)}</td></tr>
                ))}
                {!payments.length && <tr><td colSpan={2} className="empty">No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IncomeReports;
