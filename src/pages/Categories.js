import React, { useEffect, useMemo, useRef, useState } from "react";
import sampleCategories from "../sample_data/sample_categories.json";
import { getAllCategories, patchEditSingleCategory, createCategory, deleteCategory } from "../services/categories.js";
import "../styles/Categories.css";

const STORAGE_KEY = "admin.categories";

const Categories = () => {
  const [categories, setCategories] = useState(() => {
    const fromLS = localStorage.getItem(STORAGE_KEY);
    if (fromLS) return JSON.parse(fromLS);
    const seeded =
      (sampleCategories?.categories || []).map((c, idx) => ({
        ...c,
        createdAt: c.createdAt || Date.now() + idx,
      })) ?? [];
    return seeded;
  });

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null); // ← disable Save while calling API
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const lastDeletedRef = useRef(null);

  // Fetch from API
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCategories();
        const normalized = Array.isArray(data)
          ? data.map((item, i) => {
            const ts = item.createdAt
              ? Date.parse(item.createdAt) || Date.now() + i
              : Date.now() + i;
            return {
              id: String(item.category_id),           // keep string id
              name: String(item.category_name ?? "").trim(),
              createdAt: ts,
              _raw: item,
            };
          })
          : [];
        setCategories(normalized);

      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setToast({ message: `讀取分類失敗：${err.message}` });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist to LS for now
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // Filter + sort
  const view = useMemo(() => {
    let list = [...categories];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "nameAsc":
        list.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
        break;
      case "nameDesc":
        list.sort((a, b) => b.name.localeCompare(a.name, "zh-Hant"));
        break;
      default:
        list.sort((a, b) => a.createdAt - b.createdAt);
    }
    return list;
  }, [categories, search, sortBy]);

  const duplicateName = (name, ignoreId = null) =>
    categories.some(
      (c) => c.name.trim() === name.trim() && (ignoreId ? c.id !== ignoreId : true)
    );

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return setToast({ message: "分類名稱不可空白" });
    if (duplicateName(name)) return setToast({ message: "已存在相同分類名稱" });

    try {
      const created = await createCategory({ name }); // server generates id
      const ts = created.createdAt ? Date.parse(created.createdAt) : Date.now();

      setCategories((prev) => [
        ...prev,
        {
          id: String(created.category_id),        // string ID from server
          name: created.category_name,
          createdAt: ts,
          _raw: created,
        },
      ]);

      setNewName("");
      setToast({ message: `已新增「${created.category_name}」` });
    } catch (err) {
      setToast({ message: `新增失敗：${err.message}` });
    }
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // 🔧 New: API-backed rename
  const editName = async (id, nextName) => {
    const name = nextName.trim();
    if (!name) return setToast({ message: "分類名稱不可空白" });
    if (duplicateName(name, id)) return setToast({ message: "已存在相同分類名稱" });

    const oldName = categories.find((c) => c.id === id)?.name || "";
    if (oldName === name) {
      setEditingId(null);
      setEditValue("");
      return;
    }

    // Optimistic update
    const prev = categories;
    setSavingId(id);
    setCategories((cur) => cur.map((c) => (c.id === id ? { ...c, name } : c)));

    try {
      await patchEditSingleCategory(String(id), { name, oldName });
      setToast({ message: `已更新為「${name}」` });
    } catch (err) {
      // revert on error
      setCategories(prev);
      const msg =
        err?.message === "Rename conflict (destination exists or source missing)."
          ? "更新失敗：名稱已存在或資料已變更"
          : `更新失敗：${err?.message || "未知錯誤"}`;
      setToast({ message: msg });
    } finally {
      setSavingId(null);
      setEditingId(null);
      setEditValue("");
    }
  };

  // Save button calls editName
  const saveEdit = (id) => {
    editName(id, editValue);
  };

  const exportJson = () => {
    const data = JSON.stringify(categories, null, 2);
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("格式錯誤");
        const normalized = parsed.map((c, i) => ({
          id: Number(c.id ?? i + 1),
          name: String(c.name ?? "").trim(),
          createdAt: Number(c.createdAt ?? Date.now() + i),
        }));
        setCategories(normalized);
        setToast({ message: "匯入成功" });
      } catch {
        setToast({ message: "匯入失敗：檔案格式不正確" });
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const deleteOne = async (id) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;

    // optimistic remove
    const prev = categories;
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);

    try {
      await deleteCategory(String(id), target.name);
      setToast({
        message: `已刪除「${target.name}」`,
        actionLabel: "復原",
        onAction: async () => {
          // (optional) re-create via your create endpoint if you want true undo,
          // otherwise just restore UI:
          setCategories(prev);
          setToast({ message: "已復原" });
        },
      });
    } catch (err) {
      // rollback on failure
      setCategories(prev);
      const msg =
        err?.message === "Not found"
          ? `找不到要刪除的項目（id=${id}）`
          : err?.message === "Multiple items share this id; provide 'name' to disambiguate."
            ? "同一 id 有多筆資料，請提供名稱以刪除正確項目"
            : `刪除失敗：${err?.message || "未知錯誤"}`;
      setToast({ message: msg });
    }
  };

const deleteSelected = async () => {
  if (selectedIds.size === 0) return;
  const toDelete = categories.filter((c) => selectedIds.has(c.id));
  const prev = categories;
  setCategories(prev.filter((c) => !selectedIds.has(c.id)));
  setSelectedIds(new Set());

  try {
    await Promise.all(
      toDelete.map((c) => deleteCategory(String(c.id), c.name))
    );
    setToast({ message: `已刪除 ${toDelete.length} 筆` });
  } catch (err) {
    // rollback on any failure
    setCategories(prev);
    setToast({ message: `批次刪除失敗：${err?.message || "未知錯誤"}` });
  }
};


  const toggleSelectAll = (checked) => {
    if (checked) setSelectedIds(new Set(view.map((v) => v.id)));
    else setSelectedIds(new Set());
  };

  useEffect(() => {
    if (!toast || toast.onAction) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="categories-container">
      <div className="categories-header">產品分類管理</div>

      {loading && <div className="loading">載入中…</div>}

      {/* 工具列 */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input
            className="category-input"
            placeholder="搜尋分類名稱…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            title="排序"
          >
            <option value="createdAt">依建立時間</option>
            <option value="nameAsc">名稱（A → Z）</option>
            <option value="nameDesc">名稱（Z → A）</option>
          </select>
        </div>

        <div className="toolbar-right">
          <button className="button ghost" onClick={exportJson}>匯出</button>
          <label className="button ghost file-label">
            匯入
            <input type="file" accept="application/json" onChange={importJson} />
          </label>
          <button
            className="button danger"
            disabled={selectedIds.size === 0}
            onClick={() => setConfirmOpen(true)}
            title={selectedIds.size ? "刪除所選" : "未選取資料"}
          >
            批次刪除
          </button>
        </div>
      </div>

      {/* 新增 */}
      <div className="add-category-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="輸入新分類名稱"
          className="category-input"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button className="add-button" onClick={handleAdd}>新增分類</button>
      </div>

      {/* 資料列 */}
      {view.length === 0 ? (
        <div className="empty-state">沒有符合條件的分類</div>
      ) : (
        <div className="table">
          <div className="table-head">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={view.length > 0 && view.every((v) => selectedIds.has(v.id))}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              <span />
            </label>
            <div className="col-name head">名稱</div>
            <div className="col-created head">建立時間</div>
            <div className="col-actions head">操作</div>
          </div>

          {view.map((category) => {
            const checked = selectedIds.has(category.id);
            const isSaving = savingId === category.id;
            return (
              <div key={category.id} className="table-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(category.id);
                      else next.delete(category.id);
                      setSelectedIds(next);
                    }}
                  />
                  <span />
                </label>

                <div className="col-name">
                  {editingId === category.id ? (
                    <input
                      className="edit-input"
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isSaving) saveEdit(category.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="category-name">{category.name}</span>
                  )}
                </div>

                <div className="col-created">
                  {new Date(category.createdAt).toLocaleString()}
                </div>

                <div className="col-actions">
                  {editingId === category.id ? (
                    <>
                      <button
                        className="button save-button"
                        onClick={() => saveEdit(category.id)}
                        disabled={isSaving}
                        title={isSaving ? "更新中…" : "保存"}
                      >
                        {isSaving ? "更新中…" : "保存"}
                      </button>
                      <button className="button cancel-button" onClick={cancelEdit} disabled={isSaving}>
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="button edit-button"
                        onClick={() => startEdit(category.id, category.name)}
                      >
                        編輯
                      </button>
                      <button
                        className="button delete-button"
                        onClick={() => deleteOne(category.id)}
                      >
                        刪除
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 確認對話框 */}
      {confirmOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">確認刪除</div>
            <div className="modal-body">
              確定要刪除 {selectedIds.size} 筆已選取的分類嗎？此動作可在短時間內復原。
            </div>
            <div className="modal-actions">
              <button className="button" onClick={() => setConfirmOpen(false)}>取消</button>
              <button
                className="button danger"
                onClick={() => {
                  setConfirmOpen(false);
                  deleteSelected();
                }}
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span>{toast.message}</span>
          {toast.actionLabel && toast.onAction && (
            <button
              className="toast-action"
              onClick={() => {
                toast.onAction();
                setToast(null);
              }}
            >
              {toast.actionLabel}
            </button>
          )}
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default Categories;
