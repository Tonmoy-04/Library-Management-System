import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Dashboard from './components/Dashboard';
import Bookshelf from './components/Bookshelf';
import Reports from './components/Reports';
import Feedback from './components/Feedback';
import Settings from './Settings';
import './PublisherPortal.css';

const PublisherPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 768);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const publisherUser = JSON.parse(localStorage.getItem('user') || '{}');
  const publisherId = publisherUser?.id;
  const publisherName = publisherUser?.name || '';

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
        return <Dashboard publisherId={publisherId} />;
      case 'bookshelf':
        return <Bookshelf publisherId={publisherId} publisherName={publisherName} />;
      case 'reports':
        return <Reports publisherId={publisherId} />;
      case 'feedback':
        return <Feedback publisherId={publisherId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard publisherId={publisherId} />;
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
