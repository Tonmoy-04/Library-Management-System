import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Dashboard from './components/Dashboard';
import Bookshelf from './components/Bookshelf';
import Reports from './components/Reports';
import Feedback from './components/Feedback';
import './PublisherPortal.css';

const PublisherPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const publisherId = JSON.parse(localStorage.getItem('user'))?.id;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'bookshelf', label: 'Bookshelf', icon: '📚' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard publisherId={publisherId} />;
      case 'bookshelf':
        return <Bookshelf publisherId={publisherId} />;
      case 'reports':
        return <Reports publisherId={publisherId} />;
      case 'feedback':
        return <Feedback publisherId={publisherId} />;
      default:
        return <Dashboard publisherId={publisherId} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="publisher-sidebar">
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
