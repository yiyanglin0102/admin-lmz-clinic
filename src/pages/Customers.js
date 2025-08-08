import React, { useMemo, useState, useEffect } from "react";
import CustomerCard from "./CustomerCard";
import customerData from "../sample_data/sample_customers";
import "../styles/Customers.css";

const toDate = (d) => (d ? new Date(d) : null);
const fmtCurrency = (n) =>
  (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const flattenOrders = (customer) => {
  const tag = (arr, status) =>
    (arr || []).map((o) => ({
      ...o,
      _customerId: customer.id,
      _customerName: `${customer.firstName} ${customer.lastName}`,
      _username: customer.username,
      _email: customer.email,
      _phone: customer.phone,
      _status: status,
    }));
  return [
    ...tag(customer.orders.completed, "completed"),
    ...tag(customer.orders.pending, "pending"),
    ...tag(customer.orders.current, "current"),
  ];
};

export default function Customer() {
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(new Set(["completed", "pending", "current"]));
  const [payment, setPayment] = useState("any"); // any | credit | debit | mobile | cash | giftcard
  const [delivery, setDelivery] = useState("any"); // any | pickup | delivery | shipping | dine-in
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [sort, setSort] = useState("dateDesc"); // dateDesc | dateAsc | totalDesc | totalAsc
  const [onlyWithOrders, setOnlyWithOrders] = useState(false);

  // Debounce q lightly
  const [debouncedQ, setDebouncedQ] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 220);
    return () => clearTimeout(t);
  }, [q]);

  const customers = customerData.customers;

  const filters = useMemo(() => {
    const sd = startDate ? new Date(startDate) : null;
    const ed = endDate ? new Date(endDate) : null;
    const min = minTotal ? parseFloat(minTotal) : null;
    const max = maxTotal ? parseFloat(maxTotal) : null;

    const textMatch = (o) => {
      if (!debouncedQ) return true;
      const hay = [
        o.orderId,
        o._customerName,
        o._username,
        o._email,
        o._phone,
        ...(o.items || []).map((i) => i.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(debouncedQ);
    };

    const dateMatch = (o) => {
      if (!o.date) return true;
      const d = new Date(o.date);
      if (sd && d < sd) return false;
      if (ed && d > new Date(ed + "T23:59:59")) return false;
      return true;
    };

    const statusMatch = (o) => status.has(o._status);
    const paymentMatch = (o) => (payment === "any" ? true : o.paymentMethod === payment);
    const deliveryMatch = (o) => (delivery === "any" ? true : o.deliveryType === delivery);

    const totalMatch = (o) => {
      const t = Number(o.total ?? 0);
      if (min !== null && t < min) return false;
      if (max !== null && t > max) return false;
      return true;
    };

    return { textMatch, dateMatch, statusMatch, paymentMatch, deliveryMatch, totalMatch };
  }, [debouncedQ, startDate, endDate, status, payment, delivery, minTotal, maxTotal]);

  // Build filtered order list per customer
  const enriched = useMemo(() => {
    const all = customers.map((c) => {
      let orders = flattenOrders(c).filter(
        (o) =>
          filters.textMatch(o) &&
          filters.dateMatch(o) &&
          filters.statusMatch(o) &&
          filters.paymentMatch(o) &&
          filters.deliveryMatch(o) &&
          filters.totalMatch(o)
      );

      // sort
      orders.sort((a, b) => {
        switch (sort) {
          case "dateAsc":
            return new Date(a.date) - new Date(b.date);
          case "totalDesc":
            return (b.total ?? 0) - (a.total ?? 0);
          case "totalAsc":
            return (a.total ?? 0) - (b.total ?? 0);
          case "dateDesc":
          default:
            return new Date(b.date) - new Date(a.date);
        }
      });

      const revenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
      return { customer: c, orders, revenue };
    });

    return onlyWithOrders ? all.filter((x) => x.orders.length) : all;
  }, [customers, filters, sort, onlyWithOrders]);

  // Global stats (for the filtered view)
  const stats = useMemo(() => {
    const orders = enriched.flatMap((x) => x.orders);
    const revenue = orders.reduce((s, o) => s + (o.total ?? 0), 0);
    return {
      customers: enriched.length,
      orders: orders.length,
      revenue,
      avgOrder: orders.length ? revenue / orders.length : 0,
    };
  }, [enriched]);

  const exportCsv = () => {
    const rows = [
      [
        "orderId",
        "date",
        "status",
        "total",
        "paymentMethod",
        "deliveryType",
        "customerId",
        "customerName",
        "username",
        "email",
        "phone",
      ].join(","),
      ...enriched.flatMap((x) =>
        x.orders.map((o) =>
          [
            o.orderId,
            new Date(o.date).toISOString(),
            o._status,
            (o.total ?? 0).toFixed(2),
            o.paymentMethod || "",
            o.deliveryType || "",
            x.customer.id,
            `${x.customer.firstName} ${x.customer.lastName}`,
            x.customer.username,
            x.customer.email,
            x.customer.phone,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        )
      ),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleStatus = (key) => {
    setStatus((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="customer-dashboard" style={styles.wrap}>
      <h1 style={styles.h1}>Customer Management</h1>

      {/* Controls */}
      <div style={styles.controls}>
        <input
          style={styles.input}
          placeholder="Search name / phone / email / username / orderId / items…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={styles.row}>
          <label style={styles.label}>From</label>
          <input
            type="date"
            style={styles.input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label style={styles.label}>To</label>
          <input
            type="date"
            style={styles.input}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.chips}>
            {["completed", "pending", "current"].map((k) => (
              <button
                key={k}
                onClick={() => toggleStatus(k)}
                style={{
                  ...styles.chip,
                  ...(status.has(k) ? styles.chipOn : {}),
                }}
                title={`Filter: ${k}`}
              >
                {k}
              </button>
            ))}
          </div>

          <select style={styles.select} value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="any">Any Payment</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="mobile">Mobile</option>
            <option value="cash">Cash</option>
            <option value="giftcard">Gift Card</option>
          </select>

          <select style={styles.select} value={delivery} onChange={(e) => setDelivery(e.target.value)}>
            <option value="any">Any Delivery</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
            <option value="shipping">Shipping</option>
            <option value="dine-in">Dine-in</option>
          </select>

          <input
            style={{ ...styles.input, maxWidth: 120 }}
            type="number"
            placeholder="Min $"
            value={minTotal}
            onChange={(e) => setMinTotal(e.target.value)}
          />
          <input
            style={{ ...styles.input, maxWidth: 120 }}
            type="number"
            placeholder="Max $"
            value={maxTotal}
            onChange={(e) => setMaxTotal(e.target.value)}
          />

          <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="dateDesc">Newest</option>
            <option value="dateAsc">Oldest</option>
            <option value="totalDesc">Total High→Low</option>
            <option value="totalAsc">Total Low→High</option>
          </select>

          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={onlyWithOrders}
              onChange={(e) => setOnlyWithOrders(e.target.checked)}
            />
            Only customers with results
          </label>

          <button style={styles.button} onClick={exportCsv} title="Export filtered orders">
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <div><strong>Customers:</strong> {stats.customers}</div>
        <div><strong>Orders:</strong> {stats.orders}</div>
        <div><strong>Revenue:</strong> {fmtCurrency(stats.revenue)}</div>
        <div><strong>Avg Order:</strong> {fmtCurrency(stats.avgOrder)}</div>
      </div>

      {/* List */}
      {enriched.length === 0 ? (
        <div style={styles.empty}>No customers match your filters.</div>
      ) : (
        enriched.map(({ customer, orders, revenue }) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            orders={orders}
            totalRevenue={revenue}
            highlight={debouncedQ}
          />
        ))
      )}
    </div>
  );
}

const styles = {
  wrap: { padding: 16, maxWidth: 1100, margin: "0 auto" },
  h1: { margin: "0 0 12px", fontSize: 24 },
  controls: {
    display: "grid",
    gap: 8,
    gridTemplateColumns: "1fr",
    marginBottom: 10,
  },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  label: { color: "#555" },
  input: {
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: 6,
    minWidth: 160,
  },
  select: { padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6 },
  button: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },
  chips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: 20,
    background: "#fff",
    cursor: "pointer",
    textTransform: "capitalize",
  },
  chipOn: { background: "#1a73e8", color: "#fff", borderColor: "#1a73e8" },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 8,
    padding: 10,
    border: "1px solid #eee",
    borderRadius: 8,
    marginBottom: 12,
    background: "#fafafa",
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: "#666",
    border: "1px dashed #ddd",
    borderRadius: 8,
    background: "#fff",
  },
};
