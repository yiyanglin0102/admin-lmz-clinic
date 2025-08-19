import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../styles/ProductProduct.css"; // ← your stylesheet

// -------------------- Hardcoded sample data --------------------
const CATEGORIES = [
  { id: "7183c3c907b543ff8ea9b3c4bf4165e7", name: "抗老緊緻系列", createdAt: "2025-08-18T14:23:13.136Z" },
  { id: "b07b9b9a6c2a4120a7e1e1f5a3bc1212", name: "深層保濕系列", createdAt: "2025-08-10T12:00:00Z" },
  { id: "c6a87cd6d6d9444ab54a44b690112233", name: "淨痘調理系列", createdAt: "2025-08-12T09:30:00Z" },
];

const SEED_PRODUCTS = [
  {
    id: "P-1001",
    categoryId: "7183c3c907b543ff8ea9b3c4bf4165e7",
    name: "極緻抗老精華 30ml",
    description: "高濃度胜肽與維他命A衍生物，緊緻提拉，改善細紋。",
    regularPrice: 1980,
    salePrice: 1680,
    stockQty: 42,
    restockThreshold: 10,
    shipping: { weightKg: 0.18, lengthCm: 12, widthCm: 4, heightCm: 4, fee: 60 },
    photos: [
      "https://picsum.photos/seed/antiage1/640/400",
      "https://picsum.photos/seed/antiage1b/640/400",
      "https://picsum.photos/seed/antiage1c/640/400",
    ],
  },
  {
    id: "P-1002",
    categoryId: "7183c3c907b543ff8ea9b3c4bf4165e7",
    name: "彈力緊緻乳霜 50ml",
    description: "胜肽複合配方，強化肌膚結構，維持彈力與飽滿。",
    regularPrice: 1680,
    salePrice: null,
    stockQty: 30,
    restockThreshold: 8,
    shipping: { weightKg: 0.22, lengthCm: 8, widthCm: 8, heightCm: 6, fee: 60 },
    photos: [
      "https://picsum.photos/seed/antiage2/640/400",
      "https://picsum.photos/seed/antiage2b/640/400",
    ],
  },
  {
    id: "P-2001",
    categoryId: "b07b9b9a6c2a4120a7e1e1f5a3bc1212",
    name: "深層保濕精華 30ml",
    description: "玻尿酸三重鎖水，迅速補水並提升保水力。",
    regularPrice: 1280,
    salePrice: 1160,
    stockQty: 25,
    restockThreshold: 6,
    shipping: { weightKg: 0.16, lengthCm: 12, widthCm: 4, heightCm: 4, fee: 60 },
    photos: [
      "https://picsum.photos/seed/hydra1/640/400",
      "https://picsum.photos/seed/hydra1b/640/400",
    ],
  },
  {
    id: "P-2002",
    categoryId: "b07b9b9a6c2a4120a7e1e1f5a3bc1212",
    name: "水潤修護面霜 50ml",
    description: "神經醯胺配方，強化肌膚屏障，長效保濕不黏膩。",
    regularPrice: 1380,
    salePrice: null,
    stockQty: 18,
    restockThreshold: 5,
    shipping: { weightKg: 0.24, lengthCm: 8, widthCm: 8, heightCm: 6, fee: 60 },
    photos: [
      "https://picsum.photos/seed/hydra2/640/400",
      "https://picsum.photos/seed/hydra2b/640/400",
      "https://picsum.photos/seed/hydra2c/640/400",
    ],
  },
  {
    id: "P-3001",
    categoryId: "c6a87cd6d6d9444ab54a44b690112233",
    name: "淨痘調理精華 30ml",
    description: "水楊酸與鋅調理油水平衡，改善粉刺痘痘。",
    regularPrice: 980,
    salePrice: 899,
    stockQty: 12,
    restockThreshold: 4,
    shipping: { weightKg: 0.15, lengthCm: 12, widthCm: 4, heightCm: 4, fee: 60 },
    photos: [
      "https://picsum.photos/seed/acne1/640/400",
      "https://picsum.photos/seed/acne1b/640/400",
    ],
  },
  {
    id: "P-3002",
    categoryId: "c6a87cd6d6d9444ab54a44b690112233",
    name: "清爽控油凝膠 40ml",
    description: "輕盈不悶，長效控油與舒緩泛紅。",
    regularPrice: 880,
    salePrice: null,
    stockQty: 20,
    restockThreshold: 5,
    shipping: { weightKg: 0.12, lengthCm: 10, widthCm: 4, heightCm: 4, fee: 60 },
    photos: ["https://picsum.photos/seed/acne2/640/400"],
  },
];

// -------------------- Utils --------------------
const priceTWD = (n) => `NT$ ${Number(n || 0).toLocaleString("zh-TW")}`;

// -------------------- Product Modal (view + edit) --------------------
function ProductModal({ product, onSave, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(product)));
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!product) return;
    setForm(JSON.parse(JSON.stringify(product)));
    setActiveIdx(0);
    setIsEditing(false);
  }, [product]);

  const setField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const seg = path.split(".");
      let cur = next;
      for (let i = 0; i < seg.length - 1; i++) cur = cur[seg[i]] ?? (cur[seg[i]] = {});
      cur[seg[seg.length - 1]] = value;
      return next;
    });
  };

  const onFiles = (files) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;
    const urls = arr.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, photos: [...(prev.photos || []), ...urls] }));
  };

  const removePhoto = (idx) =>
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));

  const canSave =
    form.name?.trim() &&
    Number(form.regularPrice) >= 0 &&
    (form.salePrice == null || form.salePrice === "" || Number(form.salePrice) >= 0);

  const effectivePrice =
    form.salePrice != null && form.salePrice !== "" && Number(form.salePrice) < Number(form.regularPrice)
      ? Number(form.salePrice)
      : Number(form.regularPrice);

  return (
    <div className="pp-modal-backdrop" onClick={onClose}>
      <div className="pp-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="pp-modal-header">
          <div className="pp-modal-title">
            {isEditing ? "編輯商品" : "商品詳情"}：{product.name} <span className="pp-muted">#{product.id}</span>
          </div>
          <div className="pp-actions">
            {!isEditing ? (
              <>
                <button className="pp-btn" onClick={() => setIsEditing(true)}>編輯</button>
                <button className="pp-btn primary" onClick={onClose}>關閉</button>
              </>
            ) : (
              <>
                <button className="pp-btn" onClick={() => setIsEditing(false)}>取消</button>
                <button
                  className="pp-btn primary"
                  disabled={!canSave}
                  onClick={() => onSave(form)}
                  title={canSave ? "儲存變更" : "請填寫必填欄位"}
                >
                  儲存
                </button>
              </>
            )}
          </div>
        </header>

        <div className="pp-modal-body">
          {/* Left: image & thumbs */}
          <div className="pp-hero">
            <div className="pp-thumb main">
              <img
                src={(isEditing ? form.photos : product.photos)?.[activeIdx]}
                alt={`${product.name} 圖片`}
              />
            </div>

            <div className="pp-thumbs">
              {(isEditing ? form.photos : product.photos).map((src, i) => (
                <div key={`${src}-${i}`} className={`pp-thumb-btn ${i === activeIdx ? "active" : ""}`}>
                  <button className="pp-thumb-close" onClick={() => isEditing ? removePhoto(i) : setActiveIdx(i)} title={isEditing ? "移除圖片" : "查看圖片"}>×</button>
                  <button className="pp-thumb-click" onClick={() => setActiveIdx(i)}>
                    <img src={src} alt={`縮圖 ${i + 1}`} />
                  </button>
                </div>
              ))}
              {isEditing && (
                <label className="pp-upload-tile">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onFiles(e.target.files)}
                    style={{ display: "none" }}
                  />
                  <span>＋ 上傳</span>
                </label>
              )}
            </div>
          </div>

          {/* Right: info or form */}
          {!isEditing ? (
            <div className="pp-details">
              <div className="pp-detail-row"><span className="pp-detail-label">標題：</span>{product.name}</div>
              <div className="pp-detail-row"><span className="pp-detail-label">分類ID：</span>{product.categoryId}</div>
              <div className="pp-detail-row">
                <span className="pp-detail-label">價格：</span>
                <span>
                  {product.salePrice && product.salePrice < product.regularPrice ? (
                    <>
                      <span className="pp-price-sale">{priceTWD(product.salePrice)}</span>
                      <span className="pp-price-strike">{priceTWD(product.regularPrice)}</span>
                    </>
                  ) : (
                    <span className="pp-price">{priceTWD(product.regularPrice)}</span>
                  )}
                </span>
              </div>
              <div className="pp-detail-row"><span className="pp-detail-label">庫存：</span>{product.stockQty}（提醒門檻 {product.restockThreshold}）</div>
              <div className="pp-detail-row">
                <span className="pp-detail-label">運送：</span>
                {product.shipping.weightKg}kg，{product.shipping.lengthCm}×{product.shipping.widthCm}×{product.shipping.heightCm}cm，費用 {priceTWD(product.shipping.fee)}
              </div>
              <p className="pp-desc">{product.description}</p>
            </div>
          ) : (
            <form className="pp-form" onSubmit={(e) => { e.preventDefault(); if (canSave) onSave(form); }}>
              {/* Basic */}
              <fieldset className="pp-fieldset">
                <legend>基本資訊</legend>
                <label className="pp-field">
                  <span className="pp-label">產品標題</span>
                  <input
                    className="pp-input"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="輸入產品標題"
                    required
                  />
                </label>
                <label className="pp-field">
                  <span className="pp-label">產品描述</span>
                  <textarea
                    className="pp-textarea"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="輸入產品描述"
                  />
                </label>
              </fieldset>

              {/* Pricing */}
              <fieldset className="pp-fieldset">
                <legend>價格</legend>
                <div className="pp-2col">
                  <label className="pp-field">
                    <span className="pp-label">原價（Regular price）</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="pp-input"
                      value={form.regularPrice}
                      onChange={(e) => setField("regularPrice", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">特價（Sale price）</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="pp-input"
                      value={form.salePrice ?? ""}
                      onChange={(e) => setField("salePrice", e.target.value === "" ? null : (e.target.valueAsNumber || 0))}
                      placeholder="留白代表無特價"
                    />
                  </label>
                </div>
                <div className="pp-hint">實際售價：<strong>{priceTWD(effectivePrice)}</strong></div>
              </fieldset>

              {/* Restock / Inventory */}
              <fieldset className="pp-fieldset">
                <legend>庫存 / 補貨</legend>
                <div className="pp-2col">
                  <label className="pp-field">
                    <span className="pp-label">庫存數量</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="pp-input"
                      value={form.stockQty}
                      onChange={(e) => setField("stockQty", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">補貨門檻</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="pp-input"
                      value={form.restockThreshold}
                      onChange={(e) => setField("restockThreshold", e.target.valueAsNumber || 0)}
                    />
                  </label>
                </div>
                <div className="pp-inline">
                  <button type="button" className="pp-btn" onClick={() => setField("stockQty", Number(form.stockQty) + 10)}>+10 補貨</button>
                  <button type="button" className="pp-btn" onClick={() => setField("stockQty", Math.max(0, Number(form.stockQty) - 1))}>-1</button>
                </div>
              </fieldset>

              {/* Shipping */}
              <fieldset className="pp-fieldset">
                <legend>運送</legend>
                <div className="pp-4col">
                  <label className="pp-field">
                    <span className="pp-label">重量 (kg)</span>
                    <input
                      type="number" step="0.01" min="0"
                      className="pp-input"
                      value={form.shipping.weightKg}
                      onChange={(e) => setField("shipping.weightKg", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">長 (cm)</span>
                    <input
                      type="number" step="0.1" min="0"
                      className="pp-input"
                      value={form.shipping.lengthCm}
                      onChange={(e) => setField("shipping.lengthCm", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">寬 (cm)</span>
                    <input
                      type="number" step="0.1" min="0"
                      className="pp-input"
                      value={form.shipping.widthCm}
                      onChange={(e) => setField("shipping.widthCm", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">高 (cm)</span>
                    <input
                      type="number" step="0.1" min="0"
                      className="pp-input"
                      value={form.shipping.heightCm}
                      onChange={(e) => setField("shipping.heightCm", e.target.valueAsNumber || 0)}
                    />
                  </label>
                </div>
                <label className="pp-field">
                  <span className="pp-label">運費（NT$）</span>
                  <input
                    type="number" step="1" min="0"
                    className="pp-input"
                    value={form.shipping.fee}
                    onChange={(e) => setField("shipping.fee", e.target.valueAsNumber || 0)}
                  />
                </label>
              </fieldset>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------- Main: collapsible categories + modal --------------------
export default function ProductsByCategory() {
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [searchId, setSearchId] = useState("");
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [selected, setSelected] = useState(null); // product object

  const productsByCategory = useMemo(() => {
    const map = new Map();
    for (const c of CATEGORIES) map.set(c.id, []);
    for (const p of products) {
      if (!map.has(p.categoryId)) map.set(p.categoryId, []);
      map.get(p.categoryId).push(p);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
    return map;
  }, [products]);

  const filteredCategories = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) => c.id.toLowerCase().includes(q));
  }, [searchId]);

  const toggleCategory = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onSaveProduct = (next) => {
    setProducts((prev) => prev.map((p) => (p.id === next.id ? next : p)));
    setSelected(next); // keep modal open with updated data
  };

  return (
    <div className="pp-container">
      <div className="pp-header">商品管理（可收合分類＋管理表單）</div>

      <div className="pp-toolbar">
        <input
          className="pp-input"
          placeholder="以分類 ID 搜尋，例如：7183c3c9..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button className="pp-btn ghost" onClick={() => setExpandedIds(new Set(filteredCategories.map((c) => c.id)))}>全部展開</button>
        <button className="pp-btn ghost" onClick={() => setExpandedIds(new Set())}>全部收合</button>
      </div>

      <div className="pp-accordion">
        {filteredCategories.map((cat) => {
          const isOpen = expandedIds.has(cat.id);
          const list = productsByCategory.get(cat.id) || [];
          return (
            <section key={cat.id} className={`pp-section ${isOpen ? "expanded" : ""}`}>
              <button className="pp-cat-header" onClick={() => toggleCategory(cat.id)} aria-expanded={isOpen}>
                <span className={`pp-caret ${isOpen ? "open" : ""}`} aria-hidden>▸</span>
                <span className="pp-cat-name">{cat.name}</span>
                <span className="pp-cat-id">ID: {cat.id}</span>
                <span className="pp-count">{list.length} 件產品</span>
              </button>

              {isOpen && (
                <div className="pp-panel">
                  {list.length === 0 ? (
                    <div className="pp-empty">此分類暫無產品</div>
                  ) : (
                    <div className="pp-grid">
                      {list.map((p) => (
                        <article
                          key={p.id}
                          className="pp-card"
                          onClick={() => setSelected(p)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
                          title="點擊查看與編輯"
                        >
                          <div className="pp-thumb">
                            <img src={p.photos?.[0]} alt={`${p.name} 圖片`} />
                          </div>
                          <div className="pp-card-body">
                            <div className="pp-product-name">{p.name}</div>
                            <div className="pp-price">
                              {p.salePrice && p.salePrice < p.regularPrice ? (
                                <>
                                  <span className="pp-price-sale">{priceTWD(p.salePrice)}</span>
                                  <span className="pp-price-strike">{priceTWD(p.regularPrice)}</span>
                                </>
                              ) : (
                                <span>{priceTWD(p.regularPrice)}</span>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {selected && (
        <ProductModal
          product={selected}
          onSave={onSaveProduct}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
