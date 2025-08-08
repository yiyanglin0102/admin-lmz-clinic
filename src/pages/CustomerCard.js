import React, { useState } from "react";
import "../styles/CustomerCard.css";

const highlightText = (text, q) => {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
};

const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");
const money = (n) =>
  (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

export default function CustomerCard({ customer, orders, totalRevenue, highlight }) {
  const [expanded, setExpanded] = useState(false);

  const lastOrder = orders[0];
  const totals = orders.reduce(
    (acc, o) => {
      acc.total += o.total ?? 0;
      acc.count += 1;
      return acc;
    },
    { total: 0, count: 0 }
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.name}>
            {highlightText(`${customer.firstName} ${customer.lastName}`, highlight)}
          </h3>
          <div style={styles.meta}>
            <span>@{highlightText(customer.username, highlight)}</span> •{" "}
            <span>{highlightText(customer.email, highlight)}</span> •{" "}
            <span>{highlightText(customer.phone, highlight)}</span>
          </div>
        </div>
        <div style={styles.right}>
          <div style={styles.kpis}>
            <div><strong>Orders</strong><div>{totals.count}</div></div>
            <div><strong>Revenue</strong><div>{money(totalRevenue)}</div></div>
            <div><strong>Last</strong><div>{fmt(lastOrder?.date)}</div></div>
          </div>
          <button style={styles.toggle} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "▲ Hide Orders" : "▼ Show Orders"}
          </button>
        </div>
      </div>

      <div style={styles.details}>
        <div><strong>Joined:</strong> {fmt(customer.accountCreationDate)}</div>
        <div><strong>Gender:</strong> {customer.gender}</div>
        <div><strong>DoB:</strong> {new Date(customer.dob).toLocaleDateString()}</div>
        <div>
          <strong>Address:</strong>{" "}
          {customer.homeAddress.street}, {customer.homeAddress.city},{" "}
          {customer.homeAddress.state} {customer.homeAddress.zip}
        </div>
        <div><strong>Loyalty:</strong> {customer.loyaltyPoints}</div>
      </div>

      {expanded && (
        <div style={styles.orders}>
          {orders.length === 0 ? (
            <div style={styles.empty}>No orders match filters for this customer.</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Delivery</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.orderId}>
                    <td>{highlightText(o.orderId, highlight)}</td>
                    <td>{new Date(o.date).toLocaleString()}</td>
                    <td style={{ textTransform: "capitalize" }}>{o._status}</td>
                    <td>{money(o.total)}</td>
                    <td>{o.paymentMethod || "—"}</td>
                    <td>{o.deliveryType || "—"}</td>
                    <td>
                      {o.receiptUrl ? (
                        <a href={o.receiptUrl} target="_blank" rel="noreferrer">
                          Download
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #eaeaea",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,.04)",
  },
  header: { display: "flex", justifyContent: "space-between", gap: 10 },
  name: { margin: 0 },
  meta: { color: "#666", fontSize: 13, marginTop: 4 },
  right: { display: "flex", alignItems: "center", gap: 10 },
  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 90px)",
    textAlign: "center",
    gap: 6,
    fontSize: 13,
  },
  toggle: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
  },
  details: {
    marginTop: 8,
    color: "#444",
    display: "grid",
    gap: 4,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  },
  orders: { marginTop: 12 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  empty: {
    padding: 12,
    textAlign: "center",
    border: "1px dashed #ddd",
    borderRadius: 8,
    color: "#666",
  },
};
