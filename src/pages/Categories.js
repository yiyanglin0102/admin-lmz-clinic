import React, { useEffect, useMemo, useRef, useState } from "react";
import sampleCategories from "../sample_data/sample_categories.json";
import "../styles/Categories.css";

/**
 * 功能亮點
 * - 搜尋 / 排序 (A→Z / Z→A / 建立時間)
 * - 新增/編輯即時驗證（防重複、空白）
 * - 批次選取與刪除（帶確認）
 * - 刪除後 6 秒內可 Undo
 * - 鍵盤快捷鍵：Enter=保存、Esc=取消
 * - LocalStorage 持久化
 * - 匯出 / 匯入（JSON）
 */
const STORAGE_KEY = "admin.categories";

const Categories = () => {
  const [categories, setCategories] = useState(() => {
    const fromLS = localStorage.getItem(STORAGE_KEY);
    if (fromLS) return JSON.parse(fromLS);
    // seed 初始資料，加上 createdAt
    const seeded =
      (sampleCategories?.categories || []).map((c, idx) => ({
        ...c,
        createdAt: c.createdAt || Date.now() + idx, // 保序
      })) ?? [];
    return seeded;
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt"); // nameAsc | nameDesc | createdAt
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message, actionLabel, onAction }
  const lastDeletedRef = useRef(null);

  // 持久化
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // 篩選 + 排序
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
        // createdAt
        list.sort((a, b) => a.createdAt - b.createdAt);
    }
    return list;
  }, [categories, search, sortBy]);

  const duplicateName = (name, ignoreId = null) =>
    categories.some(
      (c) => c.name.trim() === name.trim() && (ignoreId ? c.id !== ignoreId : true)
    );

  // 新增
  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return setToast({ message: "分類名稱不可空白" });
    if (duplicateName(name)) return setToast({ message: "已存在相同分類名稱" });

    const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
    const next = [
      ...categories,
      { id: newId, name, createdAt: Date.now() },
    ];
    setCategories(next);
    setNewName("");
    setToast({ message: `已新增「${name}」` });
  };

  // 編輯
  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };
  const saveEdit = (id) => {
    const name = editValue.trim();
    if (!name) return setToast({ message: "分類名稱不可空白" });
    if (duplicateName(name, id)) return setToast({ message: "已存在相同分類名稱" });

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
    setEditingId(null);
    setToast({ message: `已更新為「${name}」` });
  };

  // 單筆刪除（帶 Undo）
  const deleteOne = (id) => {
    const target = categories.find((c) => c.id === id);
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    lastDeletedRef.current = { type: "single", data: target };
    setToast({
      message: `已刪除「${target?.name}」`,
      actionLabel: "復原",
      onAction: () => {
        if (!lastDeletedRef.current) return;
        setCategories((prev) => [...prev, lastDeletedRef.current.data]);
        lastDeletedRef.current = null;
        setToast({ message: "已復原" });
      },
    });
  };

  // 批次刪除
  const deleteSelected = () => {
    if (selectedIds.size === 0) return;
    const deleted = categories.filter((c) => selectedIds.has(c.id));
    const kept = categories.filter((c) => !selectedIds.has(c.id));
    setCategories(kept);
    setSelectedIds(new Set());
    lastDeletedRef.current = { type: "bulk", data: deleted };
    setToast({
      message: `已刪除 ${deleted.length} 筆`,
      actionLabel: "復原",
      onAction: () => {
        if (!lastDeletedRef.current) return;
        setCategories((prev) => [...prev, ...lastDeletedRef.current.data]);
        lastDeletedRef.current = null;
        setToast({ message: "已復原" });
      },
    });
  };

  // 全選/反選
  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(view.map((v) => v.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 匯出 / 匯入
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
        // 標準化
        const normalized = parsed.map((c, i) => ({
          id: Number(c.id ?? i + 1),
          name: String(c.name ?? "").trim(),
          createdAt: Number(c.createdAt ?? Date.now() + i),
        }));
        setCategories(normalized);
        setToast({ message: "匯入成功" });
      } catch (err) {
        setToast({ message: "匯入失敗：檔案格式不正確" });
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  };

  // UI helpers
  const isAllChecked =
    view.length > 0 && view.every((v) => selectedIds.has(v.id));
  const hasSelection = selectedIds.size > 0;

  // 自動隱藏 toast
  useEffect(() => {
    if (!toast || toast.onAction) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="categories-container">
      <div className="categories-header">產品分類管理</div>

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
          <button className="button ghost" onClick={exportJson}>
            匯出
          </button>
          <label className="button ghost file-label">
            匯入
            <input type="file" accept="application/json" onChange={importJson} />
          </label>
          <button
            className="button danger"
            disabled={!hasSelection}
            onClick={() => setConfirmOpen(true)}
            title={hasSelection ? "刪除所選" : "未選取資料"}
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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <button className="add-button" onClick={handleAdd}>
          新增分類
        </button>
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
                checked={isAllChecked}
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

                {/* 名稱 / 編輯 */}
                <div className="col-name">
                  {editingId === category.id ? (
                    <input
                      className="edit-input"
                      value={editValue}
                      autoFocus
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(category.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
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
                      >
                        保存
                      </button>
                      <button className="button cancel-button" onClick={cancelEdit}>
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
              <button className="button" onClick={() => setConfirmOpen(false)}>
                取消
              </button>
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
          <button className="toast-close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Categories;