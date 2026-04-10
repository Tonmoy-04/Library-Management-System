import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

const defaultNavItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/books', label: 'Books', icon: '📚' },
  { path: '/readers', label: 'Readers', icon: '👥' },
  { path: '/publishers', label: 'Publishers', icon: '🏢' },
  { path: '/transactions', label: 'Transactions', icon: '🔄' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const Sidebar = ({ navItems = defaultNavItems, logoutRedirectPath = '/login', logoutLabel = 'Logout' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(logoutRedirectPath, { replace: true });
  };

  return (
    <aside className="publisher-sidebar" aria-label="Admin sidebar navigation">
      <nav className="portal-tabs">
        {navItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-label">{item.label}</span>
            </NavLink>
          </div>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="logout-btn"
        title={logoutLabel}
      >
        🚪 {logoutLabel}
      </button>
    </aside>
  );
};

export default Sidebar;
