import React, { Suspense, lazy, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
const Dashboard = lazy(() => import('./components/Dashboard'));
const Bookshelf = lazy(() => import('./components/Bookshelf'));
const Reports = lazy(() => import('./components/Reports'));
const Feedback = lazy(() => import('./components/Feedback'));
const Settings = lazy(() => import('./Settings'));
import './PublisherPortal.css';

const PublisherPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const publisherUser = JSON.parse(localStorage.getItem('user') || '{}');
  const publisherId = publisherUser?.id;
  const publisherName = publisherUser?.name || '';
  const renderWithFallback = (node) => (
    <Suspense fallback={<div className="dashboard-loading">Loading...</div>}>
      {node}
    </Suspense>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bookshelf', label: 'Bookshelf', icon: '📚' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderWithFallback(<Dashboard publisherId={publisherId} />);
      case 'bookshelf':
        return renderWithFallback(<Bookshelf publisherId={publisherId} publisherName={publisherName} />);
      case 'reports':
        return renderWithFallback(<Reports publisherId={publisherId} />);
      case 'feedback':
        return renderWithFallback(<Feedback publisherId={publisherId} />);
      case 'settings':
        return renderWithFallback(<Settings />);
      default:
        return renderWithFallback(<Dashboard publisherId={publisherId} />);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app-container publisher-portal">
      <Navbar
        showMenuToggle
        isMenuOpen={isSidebarOpen}
        onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        menuTargetId="publisher-sidebar"
      />
      <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
        <aside className={`publisher-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} id="publisher-sidebar">
          <div className="sidebar-header">
            <div>
              <div className="sidebar-title">LibraryMS</div>
              <div className="sidebar-subtitle">Publisher menu</div>
            </div>
            <button type="button" className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close publisher menu">
              ×
            </button>
          </div>
          <nav className="portal-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            🚪 Logout
          </button>
        </aside>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PublisherPortal;
