import React from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import '../styles/dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Total Books', value: '0', icon: '📚', color: '#2563eb' },
    { title: 'Total Readers', value: '0', icon: '👥', color: '#10b981' },
    { title: 'Books Issued', value: '0', icon: '📖', color: '#f59e0b' },
    { title: 'Overdue Books', value: '0', icon: '⚠️', color: '#ef4444' },
  ];

  const recentTransactions = [
    { id: 'TRX001', reader: 'John Doe', book: 'The Great Gatsby', date: '2023-10-25', status: <span className="status-badge status-issued">Issued</span> },
    { id: 'TRX002', reader: 'Jane Smith', book: '1984', date: '2023-10-24', status: <span className="status-badge status-returned">Returned</span> },
    { id: 'TRX003', reader: 'Mike Ross', book: 'Clean Code', date: '2023-10-23', status: <span className="status-badge status-issued">Issued</span> },
    { id: 'TRX004', reader: 'Harvey Specter', book: 'Suits', date: '2023-10-22', status: <span className="status-badge status-reserved">Reserved</span> },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} {...stat} />
        ))}
      </div>

      <div className="recent-activity mt-4">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Transactions</h2>
        <Table
          columns={['Transaction ID', 'Reader', 'Book', 'Date', 'Status']}
          data={recentTransactions}
        />
      </div>
    </div>
  );
};

export default Dashboard;
