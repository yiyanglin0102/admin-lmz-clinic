import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './components/Login.js';
import Dashboard from './pages/Dashboard.js';
import Orders from './pages/Orders.js';
import Transactions from './pages/Transactions.js';
import ProductEditor from './pages/ProductEditor.js';
import ProductCategories from './pages/Categories.js';
import Customers from './pages/Customers.js';
import ProductAddOns from './pages/ProductAddOns.js';
import ProductInStock from './pages/ProductInStock.js';
import ProductPrintings from './pages/ProductPrintings.js';
import ProductPreferences from './pages/ProductPreferences.js';
import Settings from './pages/Settings.js';
import ProductSettings from './pages/ProductSettings.js';
import Account from './pages/Account.js';
import ProductProduct from './pages/ProductProduct.js';
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
            <Route path="/product/overview" element={<ProductOverview />} />
            <Route path="/product/editor" element={<ProductEditor />} />
            <Route path="/product/categories" element={<ProductCategories />} />
            <Route path="/product/product" element={<ProductProduct />} />
            <Route path="/product/add-ons" element={<ProductAddOns />} />
            <Route path="/product/in-stock" element={<ProductInStock />} />
            <Route path="/product/printings" element={<ProductPrintings />} />
            <Route path="/product/preferences" element={<ProductPreferences />} />
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