import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import { dashboardAPI } from '../services/api';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await dashboardAPI.getSummary();
        setSummary(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    const values = summary?.stats || {};

    return [
      { title: 'Total Books', value: values.total_books ?? 0, icon: '📚', color: '#2563eb' },
      { title: 'Total Readers', value: values.total_readers ?? 0, icon: '👥', color: '#10b981' },
      { title: 'Books Issued', value: values.books_issued ?? 0, icon: '📖', color: '#f59e0b' },
      { title: 'Overdue Books', value: values.overdue_books ?? 0, icon: '⚠️', color: '#ef4444' },
    ];
  }, [summary]);

  const recentTransactions = (summary?.recent_transactions || []).map((item) => ({
    id: `TRX${item.id}`,
    reader: item.reader,
    book: item.book,
    date: item.issued_at ? new Date(item.issued_at).toLocaleDateString() : 'N/A',
    status: (
      <span className={`status-badge ${item.status === 'returned' ? 'status-returned' : 'status-issued'}`}>
        {item.status || 'issued'}
      </span>
    ),
  }));

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {loading && <p>Loading dashboard data...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index} {...stat} />
        ))}
      </div>

      <div className="recent-activity mt-4">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Transactions</h2>
        {recentTransactions.length > 0 ? (
          <Table
            columns={['Transaction ID', 'Reader', 'Book', 'Date', 'Status']}
            data={recentTransactions}
          />
        ) : (
          !loading && <p>No transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
