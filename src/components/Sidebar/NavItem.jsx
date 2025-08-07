// src/components/Sidebar/NavItem.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, icon, label, indent = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item ${isActive ? 'active' : ''} ${indent ? 'indented' : ''}`
    }
  >
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
  </NavLink>
);

export default NavItem;
