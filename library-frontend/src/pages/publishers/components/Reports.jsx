import React, { useEffect, useState } from 'react';
import '../styles/Reports.css';
import { publisherAPI } from '../../../services/api';

const Reports = ({ publisherId }) => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedBook, setSelectedBook] = useState('all');
  const [filterType, setFilterType] = useState('sales');

  useEffect(() => {
    fetchReports();
  }, [publisherId, dateRange, selectedBook, filterType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await publisherAPI.getReports(publisherId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        bookId: selectedBook !== 'all' ? selectedBook : null,
        filterType: filterType,
      });

      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reports-loading">Loading reports...</div>;
  }

  if (error) {
    return <div className="reports-error">{error}</div>;
  }

  const chartData = reports || {
    totalSales: 0,
    booksSold: 0,
    totalRevenue: 0,
    topBooks: [],
    salesTrend: [],
    performanceMetrics: {},
    userEngagement: {},
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>📈 Sales & Performance Reports</h2>
        <p>Track your sales, analyze trends, and understand reader engagement</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-inputs">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Filter Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="sales">Sales</option>
            <option value="performance">Performance</option>
            <option value="engagement">User Engagement</option>
          </select>
        </div>
      </div>

      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h4>Total Revenue</h4>
            <p className="metric-value">${chartData.totalRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h4>Books Sold</h4>
            <p className="metric-value">{chartData.booksSold || 0} copies</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h4>Total Sales</h4>
            <p className="metric-value">${chartData.totalSales || 0}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <h4>Avg Rating</h4>
            <p className="metric-value">{chartData.performanceMetrics?.avgRating?.toFixed(1) || 'N/A'} ⭐</p>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-section">
          <h3>🏆 Top Performing Books</h3>
          {chartData.topBooks && chartData.topBooks.length > 0 ? (
            <div className="top-books-list">
              {chartData.topBooks.slice(0, 5).map((book, index) => (
                <div key={book.id || index} className="book-ranking">
                  <div className="ranking-number">#{index + 1}</div>
                  <div className="book-details">
                    <h4>{book.title}</h4>
                    <p className="book-author">{book.author}</p>
                  </div>
                  <div className="book-performance">
                    <span className="sales">{book.copies_sold} copies</span>
                    <span className="revenue">${book.revenue?.toFixed(2) || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No sales data available</p>
          )}
        </div>

        <div className="report-section">
          <h3>📈 Sales Trend</h3>
          {chartData.salesTrend && chartData.salesTrend.length > 0 ? (
            <div className="sales-trend-chart">
              {chartData.salesTrend.map((day, index) => (
                <div key={index} className="trend-bar">
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        height: `${(day.sales / Math.max(...chartData.salesTrend.map((d) => d.sales))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="bar-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="bar-value">${day.sales}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No trend data available</p>
          )}
        </div>
      </div>

      {chartData.userEngagement && Object.keys(chartData.userEngagement).length > 0 && (
        <div className="engagement-section">
          <h3>👥 User Engagement Metrics</h3>
          <div className="engagement-grid">
            <div className="engagement-card">
              <h4>Total Views</h4>
              <p className="engagement-value">{chartData.userEngagement.views || 0}</p>
            </div>
            <div className="engagement-card">
              <h4>Total Downloads</h4>
              <p className="engagement-value">{chartData.userEngagement.downloads || 0}</p>
            </div>
            <div className="engagement-card">
              <h4>Average Reading Time</h4>
              <p className="engagement-value">{chartData.userEngagement.avgReadingTime || 0}min</p>
            </div>
            <div className="engagement-card">
              <h4>Repeat Readers</h4>
              <p className="engagement-value">{chartData.userEngagement.repeatReaders || 0}</p>
            </div>
          </div>
        </div>
      )}

      <button className="refresh-btn" onClick={fetchReports}>
        🔄 Refresh Reports
      </button>
    </div>
  );
};

export default Reports;
