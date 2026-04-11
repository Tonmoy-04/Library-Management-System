import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import { publisherAPI } from '../../../services/api';
import Card from '../../../components/Card';

const Dashboard = ({ publisherId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [publisherId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await publisherAPI.getDashboard(publisherId);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  const stats = dashboardData?.stats || {
    books_published: 0,
    total_orders: 0,
    revenue: 0,
  };

  const metricCards = [
    {
      title: 'Books Published',
      value: stats.books_published,
      icon: '📚',
      color: '#2563eb'
    },
    {
      title: 'Total Orders',
      value: stats.total_orders,
      icon: '📦',
      color: '#f59e0b'
    },
    {
      title: 'Your Earnings',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: '💵',
      color: '#8b5cf6'
    },
  ];

  return (
    <div className="publisher-dashboard">
      <div className="dashboard-header">
        <div className="page-title">
          <h2>Publisher Dashboard</h2>
          <p>Manage your books, track sales, and engage with readers</p>
        </div>
      </div>

      <div className="metrics-grid">
        {metricCards.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </div>

      {dashboardData?.recent_books && dashboardData.recent_books.length > 0 && (
        <div className="recent-section">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📕 Recently Published Books</h2>
          <div className="recent-books-list">
            {dashboardData.recent_books.slice(0, 5).map((book) => (
              <div key={book.id} className="recent-book-item">
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p className="book-author">by {book.author || 'Unknown'}</p>
                  <p className="book-date">Published: {new Date(book.created_at).toLocaleDateString()}</p>
                </div>
                <div className="book-stats">
                  <span className="copies">{book.quantity} copies</span>
                  <span className="available">{book.available_quantity} available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardData?.recent_transactions && dashboardData.recent_transactions.length > 0 && (
        <div className="recent-section">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>📊 Recent Transactions</h2>
          <div className="recent-transactions-list">
            {dashboardData.recent_transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <p className="transaction-book">{transaction.book_title}</p>
                  <p className="transaction-reader">{transaction.reader_name}</p>
                </div>
                <div className="transaction-status">
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                  <p className="transaction-date">
                    Earned: ${Number(transaction.publisher_earning || 0).toFixed(2)}
                  </p>
                  <p className="transaction-date">
                    {new Date(transaction.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
