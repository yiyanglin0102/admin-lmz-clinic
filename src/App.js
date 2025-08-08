import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './components/Login.js';
import Dashboard from './pages/Dashboard.js';
import Orders from './pages/Orders.js';
import Transactions from './pages/Transactions.js';
import Categories from './pages/Categories.js';
import Customers from './pages/Customers.js';
import Dishes from './pages/Dishes.js';
import Settings from './pages/Settings.js';
import ProductSettings from './pages/ProductSettings.js';
import Account from './pages/Account.js';
import Product from './pages/Product.js';
import ProductOverview from './pages/ProductOverview.js';
import IncomeReports from './pages/IncomeReports.js';
import Discounts from './pages/Discounts.js';

import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/product" element={<Product />} />
            <Route path="/product/overview" element={<ProductOverview />} />
            <Route path="/product/categories" element={<Categories />} />
            <Route path="/product/dishes" element={<Dishes />} />
            <Route path="/product/settings" element={<ProductSettings />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/income-reports" element={<IncomeReports />} />
            <Route path="/account" element={<Account />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

        </main>
      </div>
    </Router>
  );
}

export default App;