import React, { useEffect, useMemo, useState } from "react";
import "../styles/Discounts.css";

const mockDiscounts = [
    {
        id: "DISC10",
        name: "10% Off Summer",
        code: "SUMMER10",
        type: "percentage",         // percentage | fixed | free_shipping
        value: 10,
        active: true,
        autoApply: false,
        stackable: false,
        minSubtotal: 500,           // in cents
        start: "2025-08-01",
        end: "2025-08-31",
        usageLimit: 500,
        used: 131,
        target: { scope: "all" },   // all | products | categories | customer_tags
        channels: ["Web", "Mobile"],
    },
    {
        id: "FREESHIP",
        name: "Free Shipping New Users",
        code: "SHIPFREE",
        type: "free_shipping",
        value: 0,
        active: true,
        autoApply: true,
        stackable: false,
        minSubtotal: 0,
        start: "2025-08-01",
        end: "",
        usageLimit: 0,
        used: 78,
        target: { scope: "customer_tags", values: ["new"] },
        channels: ["Web"],
    },
    {
        id: "TWD150",
        name: "NT$150 Off Over NT$1000",
        code: "SAVE150",
        type: "fixed",
        value: 150, // in currency units
        active: false,
        autoApply: false,
        stackable: true,
        minSubtotal: 1000,
        start: "2025-08-05",
        end: "2025-09-30",
        usageLimit: 0,
        used: 12,
        target: { scope: "categories", values: ["Drinks", "Snacks"] },
        channels: ["Web", "POS"],
    },
];

const money = (v, ccy = "TWD") =>
    (v || 0).toLocaleString(undefined, { style: "currency", currency: ccy, maximumFractionDigits: 0 });

const percent = (v) => `${v}%`;

const typeLabel = (t, val, ccy = "TWD") =>
    t === "percentage" ? percent(val) : t === "fixed" ? money(val, ccy) : "Free shipping";

const badge = (text, cls = "") => <span className={`badge ${cls}`}>{text}</span>;

const emptyTarget = () => ({ scope: "all", values: [] });

const emptyForm = () => ({
    id: "",
    name: "",
    code: "",
    type: "percentage",
    value: 10,
    active: true,
    autoApply: false,
    stackable: false,
    minSubtotal: 0,
    start: "",
    end: "",
    usageLimit: 0,
    used: 0,
    target: emptyTarget(),
    channels: ["Web"],
});

const Discounts = () => {
    const [rows, setRows] = useState([]);
    const [query, setQuery] = useState("");
    const [channel, setChannel] = useState("all");
    const [status, setStatus] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        setRows(mockDiscounts);
    }, []);

    const filtered = useMemo(() => {
        let out = [...rows];
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            out = out.filter((r) => [r.name, r.code, r.id].some((f) => f.toLowerCase().includes(q)));
        }
        if (channel !== "all") out = out.filter((r) => r.channels.includes(channel));
        if (status !== "all") {
            const active = status === "active";
            out = out.filter((r) => r.active === active);
        }
        return out.sort((a, b) => a.name.localeCompare(b.name));
    }, [rows, query, channel, status]);

    const resetForm = () => {
        setEditingId(null);
        setForm(emptyForm());
    };

    const openCreate = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = (id) => {
        const r = rows.find((x) => x.id === id);
        if (!r) return;
        setEditingId(id);
        setForm(JSON.parse(JSON.stringify(r)));
        setModalOpen(true);
    };

    const saveForm = () => {
        // simple validation
        if (!form.name.trim() || !form.code.trim()) {
            alert("Name and Code are required");
            return;
        }
        if (form.type !== "free_shipping" && Number.isNaN(+form.value)) {
            alert("Value must be a number");
            return;
        }
        setRows((prev) => {
            if (editingId) {
                return prev.map((r) => (r.id === editingId ? { ...form, id: editingId } : r));
            } else {
                const id = form.code.toUpperCase().replace(/\s+/g, "_");
                return [{ ...form, id }, ...prev];
            }
        });
        setModalOpen(false);
        resetForm();
    };

    const toggleActive = (id) =>
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    const requestDelete = (id) => setDeleteId(id);

    const confirmDelete = () => {
        setRows((prev) => prev.filter((r) => r.id !== deleteId));
        setDeleteId(null);
    };

    const cancelDelete = () => setDeleteId(null);


    const onForm = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const onTargetScope = (v) => setForm((f) => ({ ...f, target: { scope: v, values: [] } }));

    return (
        <div className="discounts-wrap">
            <header className="header">
                <h1 className="title">Discounts</h1>
                <p className="subtitle">Create, edit, and manage promo codes and automatic discounts.</p>
            </header>

            {/* Toolbar */}
            <section className="card">
                <div className="toolbar">
                    <div className="search">
                        <input
                            className="input"
                            placeholder="Search by name, code, or ID"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <option value="all">All channels</option>
                        <option value="Web">Web</option>
                        <option value="Mobile">Mobile</option>
                        <option value="POS">POS</option>
                    </select>
                    <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div className="spacer" />
                    <button className="btn primary" onClick={openCreate}>New discount</button>
                </div>
            </section>

            {/* Table */}
            <section className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Discount</th>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Validity</th>
                            <th>Usage</th>
                            <th>Channels</th>
                            <th className="right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r) => (
                            <tr key={r.id}>
                                <td>
                                    <div className="stack">
                                        <div className="name">
                                            {r.name} {r.active ? badge("Active", "ok") : badge("Inactive")}
                                            {r.autoApply && badge("Auto", "auto")}
                                            {r.stackable && badge("Stackable", "stack")}
                                        </div>
                                        <div className="subtle">
                                            Min subtotal: {r.minSubtotal ? money(r.minSubtotal) : "—"} · Target: {r.target.scope}
                                        </div>
                                    </div>
                                </td>
                                <td>{r.code}</td>
                                <td>{typeLabel(r.type, r.value)}</td>
                                <td>{r.start || "—"} {r.end ? `→ ${r.end}` : ""}</td>
                                <td>{r.used}/{r.usageLimit ? r.usageLimit : "∞"}</td>
                                <td>{r.channels.join(", ")}</td>
                                <td className="right">
                                    <button className="btn ghost sm" onClick={() => toggleActive(r.id)}>
                                        {r.active ? "Disable" : "Enable"}
                                    </button>
                                    <button className="btn ghost sm" onClick={() => openEdit(r.id)}>Edit</button>
                                    <button className="btn danger sm" onClick={() => requestDelete(r.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!filtered.length && (
                            <tr>
                                <td colSpan={7} className="empty">No discounts found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Modal */}
            {modalOpen && (
                <div className="modal">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2 className="card-title">{editingId ? "Edit discount" : "New discount"}</h2>
                            <button className="btn ghost" onClick={() => setModalOpen(false)}>Close</button>
                        </div>

                        <div className="grid-2">
                            <div className="field">
                                <label className="label">Name</label>
                                <input className="input" value={form.name} onChange={(e) => onForm("name", e.target.value)} />
                            </div>

                            <div className="field">
                                <label className="label">Code</label>
                                <input className="input" value={form.code} onChange={(e) => onForm("code", e.target.value)} />
                                <p className="hint">Leave meaningful, e.g. <code>SUMMER10</code></p>
                            </div>

                            <div className="field">
                                <label className="label">Type</label>
                                <select
                                    className="select"
                                    value={form.type}
                                    onChange={(e) => onForm("type", e.target.value)}
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed amount</option>
                                    <option value="free_shipping">Free shipping</option>
                                </select>
                            </div>

                            {form.type !== "free_shipping" && (
                                <div className="field">
                                    <label className="label">{form.type === "percentage" ? "Percent %" : "Amount"}</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={form.value}
                                        min={0}
                                        onChange={(e) => onForm("value", Number(e.target.value))}
                                    />
                                </div>
                            )}

                            <div className="field">
                                <label className="label">Min subtotal</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={form.minSubtotal}
                                    min={0}
                                    onChange={(e) => onForm("minSubtotal", Number(e.target.value))}
                                />
                            </div>

                            <div className="field">
                                <label className="label">Usage limit</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={form.usageLimit}
                                    min={0}
                                    onChange={(e) => onForm("usageLimit", Number(e.target.value))}
                                />
                                <p className="hint">0 = unlimited</p>
                            </div>

                            <div className="field">
                                <label className="label">Start date</label>
                                <input type="date" className="input" value={form.start} onChange={(e) => onForm("start", e.target.value)} />
                            </div>

                            <div className="field">
                                <label className="label">End date</label>
                                <input type="date" className="input" value={form.end} onChange={(e) => onForm("end", e.target.value)} />
                                <p className="hint">Leave blank for no end date</p>
                            </div>

                            <div className="field">
                                <label className="label">Channels</label>
                                <div className="check-row">
                                    {["Web", "Mobile", "POS"].map((c) => (
                                        <label key={c} className="check">
                                            <input
                                                type="checkbox"
                                                checked={form.channels.includes(c)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    onForm(
                                                        "channels",
                                                        checked ? [...form.channels, c] : form.channels.filter((x) => x !== c)
                                                    );
                                                }}
                                            />
                                            {c}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Target scope</label>
                                <select
                                    className="select"
                                    value={form.target.scope}
                                    onChange={(e) => onTargetScope(e.target.value)}
                                >
                                    <option value="all">All products</option>
                                    <option value="products">Specific products</option>
                                    <option value="categories">Categories</option>
                                    <option value="customer_tags">Customer tags</option>
                                </select>
                            </div>

                            {form.target.scope !== "all" && (
                                <div className="field full">
                                    <label className="label">
                                        {form.target.scope === "products" && "Product IDs (comma separated)"}
                                        {form.target.scope === "categories" && "Category names (comma separated)"}
                                        {form.target.scope === "customer_tags" && "Customer tags (comma separated)"}
                                    </label>
                                    <input
                                        className="input"
                                        value={(form.target.values || []).join(", ")}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, target: { ...f.target, values: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } }))
                                        }
                                    />
                                </div>
                            )}

                            <div className="field">
                                <label className="label">Flags</label>
                                <div className="check-row">
                                    <label className="check">
                                        <input
                                            type="checkbox"
                                            checked={form.autoApply}
                                            onChange={(e) => onForm("autoApply", e.target.checked)}
                                        />
                                        Auto-apply
                                    </label>
                                    <label className="check">
                                        <input
                                            type="checkbox"
                                            checked={form.stackable}
                                            onChange={(e) => onForm("stackable", e.target.checked)}
                                        />
                                        Stackable
                                    </label>
                                    <label className="check">
                                        <input
                                            type="checkbox"
                                            checked={form.active}
                                            onChange={(e) => onForm("active", e.target.checked)}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="btn primary" onClick={saveForm}>{editingId ? "Save" : "Create"}</button>
                        </div>
                    </div>
                </div>
            )}
            {deleteId !== null && (
                <div className="modal">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h2 className="card-title">Confirm deletion</h2>
                            <button className="btn ghost" onClick={cancelDelete}>Close</button>
                        </div>

                        <p>Are you sure you want to delete this discount?</p>

                        <div className="modal-actions">
                            <button className="btn ghost" onClick={cancelDelete}>Cancel</button>
                            <button className="btn danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Discounts;
