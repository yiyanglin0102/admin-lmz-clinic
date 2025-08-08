import React, { useEffect, useMemo, useState } from "react";
import "../styles/Transactions.css";
import { sample_TransactionsOrderTickets } from "../sample_data/sample_TransactionsOrderTickets";

const presets = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "mtd", label: "MTD" },
  { key: "qtd", label: "QTD" },
];

const currencyFmt = (n, ccy = "TWD") =>
  (n ?? 0).toLocaleString(undefined, { style: "currency", currency: ccy });

const downloadCSV = (rows, filename = "transactions.csv") => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]).join(",");
  const body = rows
    .map((r) =>
      Object.values(r)
        .map((v) =>
          typeof v === "string" && v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v
        )
        .join(",")
    )
    .join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const pageSizes = [10, 20, 50];

const rowToFlatCSV = (o) => ({
  id: o.id,
  date: o.createdAt,
  customer: o.customer?.name || "",
  email: o.customer?.email || "",
  channel: o.channel,
  paymentMethod: o.paymentMethod,
  status: o.status,
  itemsCount: o.items.reduce((s, it) => s + it.qty, 0),
  subtotal: o.subtotal,
  tax: o.tax,
  fees: o.fees,
  discount: o.discount,
  total: o.total,
  currency: o.currency,
});

const Transactions = () => {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState("7d");
  const [range, setRange] = useState({ start: "", end: "" });
  const [payment, setPayment] = useState("all");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    // import sample data
    setRows(sample_TransactionsOrderTickets);
  }, []);

  // derive filter options from data
  const optionSets = useMemo(() => {
    const pay = new Set();
    const st = new Set();
    const ch = new Set();
    rows.forEach((r) => {
      pay.add(r.paymentMethod);
      st.add(r.status);
      ch.add(r.channel);
    });
    return {
      payments: ["all", ...Array.from(pay)],
      statuses: ["all", ...Array.from(st)],
      channels: ["all", ...Array.from(ch)],
    };
  }, [rows]);

  // filtering
  const filtered = useMemo(() => {
    let out = [...rows];

    // date by preset
    if (preset) {
      const end = new Date(); // now
      const start = new Date(end);
      if (preset === "7d") start.setDate(end.getDate() - 6);
      if (preset === "30d") start.setDate(end.getDate() - 29);
      if (preset === "mtd") start.setDate(1);
      if (preset === "qtd") {
        const m = end.getMonth();
        const qStartMonth = Math.floor(m / 3) * 3;
        start.setMonth(qStartMonth, 1);
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      out = out.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= start && d <= end;
      });
    }

    // custom range overrides preset when both set
    if (range.start && range.end) {
      const s = new Date(range.start + "T00:00:00");
      const e = new Date(range.end + "T23:59:59");
      out = out.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= s && d <= e;
      });
    }

    // payment/status/channel
    if (payment !== "all") out = out.filter((r) => r.paymentMethod === payment);
    if (status !== "all") out = out.filter((r) => r.status === status);
    if (channel !== "all") out = out.filter((r) => r.channel === channel);

    // text query on id, customer, email
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => {
        return (
          r.id.toLowerCase().includes(q) ||
          (r.customer?.name || "").toLowerCase().includes(q) ||
          (r.customer?.email || "").toLowerCase().includes(q)
        );
      });
    }

    return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [rows, preset, range, payment, status, channel, query]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // kpis
  const kpis = useMemo(() => {
    const total = filtered.reduce((s, r) => s + r.total, 0);
    const count = filtered.length;
    const refunds = filtered.filter((r) => r.status === "refunded").length;
    const avg = count ? total / count : 0;
    return { total, count, avg, refunds };
  }, [filtered]);

  const exportRows = filtered.map(rowToFlatCSV);

  return (
    <div className="tx-wrap">
      <header className="tx-header">
        <h1 className="tx-title">Transactions</h1>
        <p className="tx-subtitle">Filter and inspect all orders in detail.</p>
      </header>

      {/* Filters */}
      <section className="card">
        <div className="tx-toolbar">
          <div className="field grow">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Search by order ID, customer, email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

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
            <label className="label">Payment</label>
            <select className="select" value={payment} onChange={(e) => setPayment(e.target.value)}>
              {optionSets.payments.map((p) => (
                <option key={p} value={p}>
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {optionSets.statuses.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Channel</label>
            <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
              {optionSets.channels.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="spacer" />
          <button className="btn ghost" onClick={() => downloadCSV(exportRows)}>
            Export CSV
          </button>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpis">
        <div className="kpi">
          <div className="kpi-label">Total revenue</div>
          <div className="kpi-value">{currencyFmt(kpis.total)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Orders</div>
          <div className="kpi-value">{kpis.count.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg order value</div>
          <div className="kpi-value">{currencyFmt(kpis.avg)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Refunded</div>
          <div className="kpi-value">{kpis.refunds}</div>
        </div>
      </section>

      {/* Table */}
      <section className="card">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Channel</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="right">Total</th>
              <th className="right">Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => {
              const isOpen = openId === r.id;
              const itemCount = r.items.reduce((s, it) => s + it.qty, 0);
              return (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>
                      <div className="stack">
                        <div className="name">{r.id}</div>
                        <div className="subtle">
                          {itemCount} items • {r.currency}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stack">
                        <div className="name">{r.customer?.name}</div>
                        <div className="subtle">{r.customer?.email}</div>
                      </div>
                    </td>
                    <td>{r.channel}</td>
                    <td>{r.paymentMethod}</td>
                    <td>
                      <span className={`badge ${r.status}`}>
                        {r.status[0].toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="right">{currencyFmt(r.total, r.currency)}</td>
                    <td className="right">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="right">
                      <button
                        className="btn ghost sm"
                        onClick={() => setOpenId(isOpen ? null : r.id)}
                      >
                        {isOpen ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable details */}
                  {isOpen && (
                    <tr className="details-row">
                      <td colSpan={8}>
                        <div className="details">
                          <div className="details-cols">
                            <div>
                              <h4>Line Items</h4>
                              <table className="mini">
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th className="right">Qty</th>
                                    <th className="right">Price</th>
                                    <th className="right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {r.items.map((it, idx) => (
                                    <tr key={idx}>
                                      <td>{it.name}</td>
                                      <td className="right">{it.qty}</td>
                                      <td className="right">{currencyFmt(it.price, r.currency)}</td>
                                      <td className="right">
                                        {currencyFmt(it.qty * it.price, r.currency)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div>
                              <h4>Summary</h4>
                              <table className="mini">
                                <tbody>
                                  <tr>
                                    <td>Subtotal</td>
                                    <td className="right">{currencyFmt(r.subtotal, r.currency)}</td>
                                  </tr>
                                  <tr>
                                    <td>Tax</td>
                                    <td className="right">{currencyFmt(r.tax, r.currency)}</td>
                                  </tr>
                                  <tr>
                                    <td>Fees</td>
                                    <td className="right">{currencyFmt(r.fees, r.currency)}</td>
                                  </tr>
                                  <tr>
                                    <td>Discount</td>
                                    <td className="right">-{currencyFmt(r.discount, r.currency)}</td>
                                  </tr>
                                  <tr className="total">
                                    <td>Total</td>
                                    <td className="right">{currencyFmt(r.total, r.currency)}</td>
                                  </tr>
                                </tbody>
                              </table>

                              <h4 className="mt">Meta</h4>
                             <h4 className="mt">Meta</h4>
<div className="meta">
  <div><span className="key">Payment ID:</span> {r.meta?.paymentId || "—"}</div>
  <div><span className="key">Provider:</span> {r.meta?.provider || "—"}</div>
  <div><span className="key">Transaction Ref:</span> {r.meta?.transactionRef || "—"}</div>
  <div><span className="key">IP:</span> {r.meta?.ip || "—"}</div>
  <div><span className="key">User Agent:</span> {r.meta?.userAgent || "—"}</div>
  <div><span className="key">Device:</span> {r.meta?.device || "—"}</div>
  <div><span className="key">App Version:</span> {r.meta?.appVersion || "—"}</div>
  <div><span className="key">Language:</span> {r.meta?.language || "—"}</div>
  <div><span className="key">Geo:</span> {r.meta?.geo || "—"}</div>
  <div><span className="key">Coupon:</span> {r.meta?.couponCode || "—"}</div>
  <div><span className="key">Shipping:</span> {r.meta?.shippingMethod || "—"} {r.meta?.shippingCost ? `(${r.currency} ${r.meta.shippingCost})` : ""}</div>
  <div><span className="key">Service fee:</span> {r.meta?.serviceFee || 0}</div>
  <div><span className="key">Risk score:</span> {r.meta?.riskScore ?? "—"}</div>
  <div><span className="key">Manual review:</span> {r.meta?.reviewRequired ? "Yes" : "No"}</div>
  <div><span className="key">Created:</span> {new Date(r.createdAt).toLocaleString()}</div>
  <div><span className="key">Paid:</span> {r.meta?.paidAt ? new Date(r.meta.paidAt).toLocaleString() : "—"}</div>
  <div><span className="key">Fulfilled:</span> {r.meta?.fulfilledAt ? new Date(r.meta.fulfilledAt).toLocaleString() : "—"}</div>
  <div><span className="key">Refunded:</span> {r.meta?.refundedAt ? new Date(r.meta.refundedAt).toLocaleString() : "—"}</div>
  <div><span className="key">Fulfillment:</span> {r.meta?.fulfillmentStatus || "—"}</div>
  <div><span className="key">Store:</span> {r.meta?.storeLocation || "—"}</div>
  <div><span className="key">Cashier:</span> {r.meta?.cashier || "—"}</div>
  <div><span className="key">Register:</span> {r.meta?.registerId || "—"}</div>
  <div><span className="key">Tax Region:</span> {r.meta?.taxRegion || "—"} ({(r.meta?.taxRate ?? 0) * 100}%)</div>
  <div><span className="key">Tax ID:</span> {r.meta?.taxId || "—"}</div>
  <div><span className="key">Customer Tax ID:</span> {r.meta?.customerTaxId || "—"}</div>
  <div><span className="key">Tags:</span> {(r.meta?.tags || []).join(", ") || "—"}</div>
  <div><span className="key">Attachments:</span> {r.meta?.attachments?.length ? r.meta.attachments.map((a, i) => <a key={i} href={a.url}>[{a.type}]</a>) : "—"}</div>
  <div><span className="key">Internal notes:</span> {r.meta?.notesInternal || r.notes || "—"}</div>
</div>

                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {!paged.length && (
              <tr>
                <td colSpan={8} className="empty">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pager">
          <div className="left">
            <span>
              Showing{" "}
              <strong>
                {filtered.length ? (page - 1) * pageSize + 1 : 0}-
                {Math.min(page * pageSize, filtered.length)}
              </strong>{" "}
              of <strong>{filtered.length}</strong>
            </span>
          </div>
          <div className="right">
            <select
              className="select sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {pageSizes.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <button className="btn ghost sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <button
              className="btn ghost sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Transactions;
