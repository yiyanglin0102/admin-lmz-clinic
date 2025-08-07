// src/components/Sidebar/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import NavItem from './NavItem';
import '../../styles/Sidebar.css';

const Sidebar = () => {
  const [expandedSections, setExpandedSections] = useState({ productManagement: false });

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('sidebarState');
    if (saved) setExpandedSections(JSON.parse(saved));
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Dashboard</h3>
      </div>

      <nav className="sidebar-nav">
        <SidebarGroup title="Operations">
          <NavItem to="/dashboard" icon="📊" label="Dashboard" />
          <NavItem to="/orders" icon="🧾" label="Order Tickets" />
          <NavItem to="/smart-ordering" icon="🤖" label="Smart Ordering" />
          <NavItem to="/kitchen" icon="👨‍🍳" label="Kitchen Display" />
          <NavItem to="/customer" icon="👀" label="Customer Display" />
        </SidebarGroup>

        <SidebarGroup title="Product">
        <div className="nav-group">
          <div className="product-label" onClick={() => toggleSection('productManagement')}>
            <span className="nav-icon">📋</span>
            <span>Product Management</span>
            {expandedSections.productManagement ? <FiChevronDown /> : <FiChevronRight />}
          </div>
          {expandedSections.productManagement && (
            <div className="subproduct">
              <NavItem to="/product/overview" icon="📊" label="Product Overview" indent />
              <NavItem to="/product/editor" icon="✏️" label="Product Editor" indent />
              <NavItem to="/product/categories" icon="🗂️" label="Categories" indent />
              <NavItem to="/product/dishes" icon="🍛" label="Dishes" indent />
              <NavItem to="/product/addons" icon="➕" label="Add-Ons" indent />
              <NavItem to="/product/preferences" icon="⚙️" label="Preference" indent />
              <NavItem to="/product/instock" icon="📦" label="In Stock" indent />
              <NavItem to="/product/printings" icon="🖨️" label="Printings" indent />
              <NavItem to="/product/settings" icon="🔧" label="Product Settings" indent />
            </div>
          )}
        </div>
        </SidebarGroup>
        
        <SidebarGroup title="Financial">
          <NavItem to="/transactions" icon="💳" label="Transactions" />
          <NavItem to="/discounts" icon="🏷️" label="Discounts" />
          <NavItem to="/income-reports" icon="📈" label="Income Report" />
        </SidebarGroup>

        <SidebarGroup title="System">
          <NavItem to="/account" icon="👤" label="Account" />
          <NavItem to="/devices" icon="💻" label="Devices" />
          <NavItem to="/settings" icon="⚙️" label="Settings" />
        </SidebarGroup>
      </nav>
    </div>
  );
};

const SidebarGroup = ({ title, children }) => (
  <div className="nav-group">
    <p className="group-title">{title}</p>
    {children}
  </div>
);

export default Sidebar;
