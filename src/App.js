import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import Sidebar from "./components/Sidebar/Sidebar";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Transactions from "./pages/Transactions";
import ProductEditor from "./pages/ProductEditor";
import ProductCategories from "./pages/Categories";
import Customers from "./pages/Customers";
import ProductAddOns from "./pages/ProductAddOns";
import ProductInStock from "./pages/ProductInStock";
import ProductPrintings from "./pages/ProductPrintings";
import ProductPreferences from "./pages/ProductPreferences";
import Settings from "./pages/Settings";
import ProductSettings from "./pages/ProductSettings";
import Account from "./pages/Account";
import ProductProduct from "./pages/ProductProduct";
import ProductOverview from "./pages/ProductOverview";
import IncomeReports from "./pages/IncomeReports";
import Discounts from "./pages/Discounts";
import OidcCallback from "./pages/OidcCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import "./styles/App.css";

function AppShell() {
  const auth = useAuth();

  // Keep the DOM identical: always render <Sidebar /> directly under .app
  // Toggle a modifier class on the root for CSS-only hiding.
  const appClass = auth.isAuthenticated ? "app" : "app app--unauthed";

  return (
    <div className={appClass}>
      <Sidebar />

      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<OidcCallback />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/product/overview" element={<ProtectedRoute><ProductOverview /></ProtectedRoute>} />
          <Route path="/product/editor" element={<ProtectedRoute><ProductEditor /></ProtectedRoute>} />
          <Route path="/product/categories" element={<ProtectedRoute><ProductCategories /></ProtectedRoute>} />
          <Route path="/product/product" element={<ProtectedRoute><ProductProduct /></ProtectedRoute>} />
          <Route path="/product/add-ons" element={<ProtectedRoute><ProductAddOns /></ProtectedRoute>} />
          <Route path="/product/in-stock" element={<ProtectedRoute><ProductInStock /></ProtectedRoute>} />
          <Route path="/product/printings" element={<ProtectedRoute><ProductPrintings /></ProtectedRoute>} />
          <Route path="/product/preferences" element={<ProtectedRoute><ProductPreferences /></ProtectedRoute>} />
          <Route path="/product/settings" element={<ProtectedRoute><ProductSettings /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/discounts" element={<ProtectedRoute><Discounts /></ProtectedRoute>} />
          <Route path="/income-reports" element={<ProtectedRoute><IncomeReports /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
