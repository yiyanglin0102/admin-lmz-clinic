// src/components/Categories.js
import React, { useState } from 'react';
import sampleCategories from '../sample_data/sample_categories.json'; // Your JSON data
import '../styles/Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState(sampleCategories.categories);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Mock edit function (UI only)
  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  // Mock save function (UI only)
  const handleSave = (id) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, name: editValue } : cat
    ));
    setEditingId(null);
  };

  // Mock delete function (UI only)
  const handleDelete = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  // Mock add function (UI only)
  const handleAdd = () => {
    if (!newCategoryName.trim()) return;
    
    const newId = Math.max(...categories.map(c => c.id), 0) + 1;
    setCategories([
      ...categories,
      { id: newId, name: newCategoryName }
    ]);
    setNewCategoryName('');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">產品分類管理</h1>
      
      {/* Add New Category */}
      <div className="flex mb-6">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="輸入新分類名稱"
          className="flex-1 px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
        >
          新增分類
        </button>
      </div>

      {/* Categories List */}
      <ul className="space-y-2">
        {categories.map(category => (
          <li 
            key={category.id} 
            className="flex items-center justify-between p-3 bg-white rounded shadow"
          >
            {editingId === category.id ? (
              <div className="flex w-full">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1 border rounded mr-2"
                  autoFocus
                />
                <button 
                  onClick={() => handleSave(category.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                >
                  保存
                </button>
                <button 
                  onClick={() => setEditingId(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  取消
                </button>
              </div>
            ) : (
              <>
                <span className="text-gray-800">{category.name}</span>
                <div>
                  <button 
                    onClick={() => handleEdit(category.id, category.name)}
                    className="text-blue-500 hover:text-blue-700 mr-3"
                  >
                    編輯
                  </button>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    刪除
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Status Message */}
      {categories.length === 0 && (
        <p className="text-gray-500 mt-4">暫無分類</p>
      )}
    </div>
  );
};

export default Categories;