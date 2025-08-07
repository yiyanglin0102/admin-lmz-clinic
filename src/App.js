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
import Account from './pages/Account.js';
import Product from './pages/Product.js';
import MenuOverview from './pages/MenuOverview';
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
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/product" element={<Product />} />
            <Route path="/product/overview" element={<MenuOverview />} />
            <Route path="/product/categories" element={<Categories />} />
            <Route path="/product/dishes" element={<Dishes />} />
            <Route path="/product/settings" element={<Settings />} />
            <Route path="/account" element={<Account />} />
          </Routes>

        </main>
      </div>
    </Router>
  );
}

export default App;