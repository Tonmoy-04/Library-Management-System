import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../publishers/PublisherPortal.css';

const tabs = [
  { path: '/reader/home', label: 'Dashboard', icon: '📊' },
  { path: '/reader/library', label: 'Library', icon: '📚' },
  { path: '/reader/my-library', label: 'My Library', icon: '🗂️' },
  { path: '/reader/history', label: 'History', icon: '🧾' },
  { path: '/reader/settings', label: 'Settings', icon: '⚙️' },
];

const ReaderPortalLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isTabActive = (path) => {
    if (path === '/reader/home') {
      return location.pathname === '/reader/home' || location.pathname.startsWith('/reader/books/');
    }

    return location.pathname === path;
  };

  return (
    <div className="app-container publisher-portal reader-portal">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="publisher-sidebar" aria-label="Reader navigation">
          <nav className="portal-tabs">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`tab-button ${isTabActive(tab.path) ? 'active' : ''}`}
                title={tab.label}
              >
                <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </NavLink>
            ))}
          </nav>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            🚪 Logout
          </button>
        </aside>
        <main className="main-content">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default ReaderPortalLayout;
