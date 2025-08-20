// src/pages/ProductProduct.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "../styles/ProductProduct.css";
import { getAllProducts } from "../services/products";
import { useSignedImage } from "../components/hook/useSignedImage";
import { getPhotoKeysOrUrls } from "../components/utils/photos";

// ---------- utils ----------
const priceTWD = (n) => `NT$ ${Number(n || 0).toLocaleString("zh-TW")}`;
const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" text-anchor="middle" fill="%2399a"><tspan dy=".3em">No image</tspan></text></svg>';

// ---------- S3Image: resolves S3 key or URL via hook ----------
function S3Image({ keyOrUrl, alt = "", className, preferBlob = true, imgProps = {} }) {
  const { src, error } = useSignedImage(keyOrUrl, { preferBlob });
  if (!src) {
    return (
      <div
        className={`pp-img ph ${className || ""}`}
        aria-label={error ? `image error: ${error}` : "image placeholder"}
        title={error || "loading..."}
      />
    );
  }
  return <img src={src} alt={alt} className={className} {...imgProps} />;
}

// ---------- Modal (view + edit) ----------
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

  // Photos for display:
  const viewPhotos = useMemo(() => getPhotoKeysOrUrls(product), [product]);
  const editPhotos = Array.isArray(form.photos) ? form.photos : [];
  const displayPhotos = isEditing ? editPhotos : viewPhotos;

  const onFiles = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    // Preview only; wire to S3 upload later if needed
    const urls = arr.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, photos: [...(prev.photos || []), ...urls] }));
  };

  const removePhoto = (idx) =>
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));

  const canSave =
    form.name?.trim() &&
    Number.isFinite(Number(form.regularPrice)) &&
    (form.salePrice == null || form.salePrice === "" || Number.isFinite(Number(form.salePrice)));

  const effectivePrice =
    form.salePrice != null &&
    form.salePrice !== "" &&
    Number(form.salePrice) < Number(form.regularPrice)
      ? Number(form.salePrice)
      : Number(form.regularPrice);

  return (
    <div className="pp-modal-backdrop" onClick={onClose}>
      <div className="pp-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="pp-modal-header">
          <div className="pp-modal-title">
            {isEditing ? "編輯商品" : "商品詳情"}：{product.name}{" "}
            <span className="pp-muted">#{product.product_id}</span>
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
          {/* Left: gallery */}
          <div className="pp-hero">
            <div className="pp-thumb main">
              {displayPhotos[activeIdx] ? (
                isEditing && /^blob:/.test(displayPhotos[activeIdx]) ? (
                  <img src={displayPhotos[activeIdx]} alt={`${product.name} 圖片`} />
                ) : (
                  <S3Image
                    keyOrUrl={displayPhotos[activeIdx]}
                    alt={`${product.name} 圖片`}
                    className="pp-img"
                    preferBlob={true}
                    imgProps={{ loading: "eager" }}
                  />
                )
              ) : (
                <img src={PLACEHOLDER} alt="placeholder" />
              )}
            </div>

            <div className="pp-thumbs">
              {displayPhotos.map((src, i) => (
                <div key={`${src}-${i}`} className={`pp-thumb-btn ${i === activeIdx ? "active" : ""}`}>
                  {isEditing && /^blob:/.test(src) ? (
                    <button className="pp-thumb-close" onClick={() => removePhoto(i)} title="移除圖片">×</button>
                  ) : null}
                  <button className="pp-thumb-click" onClick={() => setActiveIdx(i)}>
                    {isEditing && /^blob:/.test(src) ? (
                      <img src={src} alt={`縮圖 ${i + 1}`} />
                    ) : (
                      <S3Image
                        keyOrUrl={src}
                        alt={`縮圖 ${i + 1}`}
                        className="pp-img"
                        preferBlob={false}
                        imgProps={{ loading: "lazy" }}
                      />
                    )}
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
              <div className="pp-detail-row">
                <span className="pp-detail-label">標題：</span>{product.name}
              </div>
              <div className="pp-detail-row">
                <span className="pp-detail-label">分類：</span>
                {product.category?.category_name ?? "未分類"}（{product.category_id}）
              </div>
              <div className="pp-detail-row">
                <span className="pp-detail-label">價格：</span>
                {product.salePrice && product.salePrice < product.regularPrice ? (
                  <>
                    <span className="pp-price-sale">{priceTWD(product.salePrice)}</span>
                    <span className="pp-price-strike">{priceTWD(product.regularPrice)}</span>
                  </>
                ) : (
                  <span className="pp-price">{priceTWD(product.regularPrice)}</span>
                )}
              </div>
              <div className="pp-detail-row">
                <span className="pp-detail-label">庫存：</span>
                {product.stockQty}（提醒門檻 {product.restockThreshold}）
              </div>
              <div className="pp-detail-row">
                <span className="pp-detail-label">運送：</span>
                {product.shipping?.weightKg ?? 0}kg，{product.shipping?.lengthCm ?? 0}×
                {product.shipping?.widthCm ?? 0}×{product.shipping?.heightCm ?? 0}cm，
                費用 {priceTWD(product.shipping?.fee ?? 0)}
              </div>
              <p className="pp-desc">{product.description}</p>
            </div>
          ) : (
            <form
              className="pp-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSave) onSave(form);
              }}
            >
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
                      type="number" min="0" step="1"
                      className="pp-input"
                      value={form.regularPrice}
                      onChange={(e) => setField("regularPrice", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">特價（Sale price）</span>
                    <input
                      type="number" min="0" step="1"
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
                      type="number" min="0" step="1"
                      className="pp-input"
                      value={form.stockQty}
                      onChange={(e) => setField("stockQty", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">補貨門檻</span>
                    <input
                      type="number" min="0" step="1"
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
                      value={form.shipping?.weightKg ?? 0}
                      onChange={(e) => setField("shipping.weightKg", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">長 (cm)</span>
                    <input
                      type="number" step="0.1" min="0"
                      className="pp-input"
                      value={form.shipping?.lengthCm ?? 0}
                      onChange={(e) => setField("shipping.lengthCm", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">寬 (cm)</span>
                    <input
                      type="number" step="0.1" min="0"
                      className="pp-input"
                      value={form.shipping?.widthCm ?? 0}
                      onChange={(e) => setField("shipping.widthCm", e.target.valueAsNumber || 0)}
                    />
                  </label>
                  <label className="pp-field">
                    <span className="pp-label">高 (cm)</span>
                    <input
                      type="number" step="0.1" min="0"
                      className="pp-input"
                      value={form.shipping?.heightCm ?? 0}
                      onChange={(e) => setField("shipping.heightCm", e.target.valueAsNumber || 0)}
                    />
                  </label>
                </div>
                <label className="pp-field">
                  <span className="pp-label">運費（NT$）</span>
                  <input
                    type="number" step="1" min="0"
                    className="pp-input"
                    value={form.shipping?.fee ?? 0}
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

// ---------- Page (collapsible categories + modal, data from API) ----------
export default function ProductProduct() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [products, setProducts] = useState([]); // API items
  const [expandedIds, setExpandedIds] = useState(() => new Set()); // category ids
  const [searchId, setSearchId] = useState("");
  const [selected, setSelected] = useState(null); // selected product (API shape)

  useEffect(() => {
    (async () => {
      try {
        const resp = await getAllProducts(); // { count, items: [...] }
        const items = Array.isArray(resp?.items) ? resp.items : [];
        setProducts(items);
      } catch (e) {
        console.error("Failed to load products:", e);
        setErr(e?.message || "載入失敗");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build categories from products
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const id = p.category_id || "uncategorized";
      const name = p.category?.category_name || "未分類";
      if (!map.has(id)) map.set(id, { id, name });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
  }, [products]);

  // Group products by category id
  const productsByCategory = useMemo(() => {
    const m = new Map(categories.map((c) => [c.id, []]));
    for (const p of products) {
      const id = p.category_id || "uncategorized";
      if (!m.has(id)) m.set(id, []);
      m.get(id).push(p);
    }
    for (const arr of m.values()) arr.sort((a, b) => (a.name || "").localeCompare(b.name || "", "zh-Hant"));
    return m;
  }, [products, categories]);

  const filteredCategories = useMemo(() => {
    const q = searchId.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.id.toLowerCase().includes(q));
  }, [categories, searchId]);

  const toggleCategory = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const onSaveProduct = (next) => {
    // TODO: wire to PATCH backend if needed (optimistic update)
    setProducts((prev) => prev.map((p) => (p.product_id === next.product_id ? next : p)));
    setSelected(next);
  };

  if (loading) return <div className="pp-container">載入中…</div>;
  if (err) return <div className="pp-container">讀取失敗：{err}</div>;

  return (
    <div className="pp-container">
      <div className="pp-header">商品管理（圖片以 S3 簽名/Blob URL 顯示）</div>

      <div className="pp-toolbar">
        <input
          className="pp-input"
          placeholder="以分類 ID 搜尋，例如：7183c3c9..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button
          className="pp-btn ghost"
          onClick={() => setExpandedIds(new Set(filteredCategories.map((c) => c.id)))}
        >
          全部展開
        </button>
        <button className="pp-btn ghost" onClick={() => setExpandedIds(new Set())}>
          全部收合
        </button>
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
                      {list.map((p) => {
                        const photos = getPhotoKeysOrUrls(p);
                        return (
                          <article
                            key={p.product_id}
                            className="pp-card"
                            onClick={() => setSelected(p)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
                            title="點擊查看與編輯"
                          >
                            <div className="pp-thumb">
                              {photos[0] ? (
                                <S3Image
                                  keyOrUrl={photos[0]}
                                  alt={`${p.name} 圖片`}
                                  className="pp-img"
                                  preferBlob={true}
                                  imgProps={{ loading: "lazy" }}
                                />
                              ) : (
                                <img src={PLACEHOLDER} alt="placeholder" />
                              )}
                            </div>

                            <div className="pp-card-body">
                              <div className="pp-product-name">{p.name}</div>

                              {photos.length > 1 && (
                                <div className="pp-mini-thumbs">
                                  {photos.slice(0, 3).map((src, i) => (
                                    <S3Image
                                      key={src + i}
                                      keyOrUrl={src}
                                      alt={`縮圖 ${i + 1}`}
                                      className="pp-mini"
                                      preferBlob={false}
                                      imgProps={{ loading: "lazy" }}
                                    />
                                  ))}
                                  {photos.length > 3 && (
                                    <span className="pp-more">+{photos.length - 3}</span>
                                  )}
                                </div>
                              )}

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
                        );
                      })}
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
