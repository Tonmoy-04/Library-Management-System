import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/books', label: 'Books', icon: '📚' },
    { path: '/readers', label: 'Readers', icon: '👥' },
    { path: '/publishers', label: 'Publishers', icon: '🏢' },
    { path: '/transactions', label: 'Transactions', icon: '🔄' },
  ];

  return (
    <aside className="sidebar" style={{
      width: '260px',
      height: 'calc(100vh - 64px)',
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      position: 'fixed',
      top: '64px',
      left: 0,
      padding: '2rem 1rem',
      overflowY: 'auto'
    }}>
      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path} style={{ marginBottom: '0.5rem' }}>
            <NavLink
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                color: isActive ? 'white' : 'var(--text-main)',
                backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                transition: 'var(--transition)',
                fontWeight: isActive ? '600' : '500',
                gap: '0.75rem'
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 'auto', padding: '1rem' }}>
        <button
          onClick={handleLogout}
          style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '600',
          marginTop: '2rem',
          cursor: 'pointer'
        }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
