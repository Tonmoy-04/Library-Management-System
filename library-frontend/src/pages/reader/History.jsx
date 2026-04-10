import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readerPortalAPI } from '../../services/api';
import '../../styles/reader.css';

const RANGE_OPTIONS = [
  { key: 'recent', label: 'Recent' },
  { key: 'all', label: 'All' },
];

const History = () => {
  const [range, setRange] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async (selectedRange = range) => {
    setLoading(true);
    setError('');
    try {
      const response = await readerPortalAPI.getHistory({ range: selectedRange });
      setTransactions(response.data?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const paid = transactions.filter((row) => row.payment_status === 'paid').length;
    const total = transactions.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return {
      total: transactions.length,
      paid,
      amount: total,
    };
  }, [transactions]);

  const handleRangeChange = async (selectedRange) => {
    setRange(selectedRange);
    await loadHistory(selectedRange);
  };

  return (
    <div className="reader-library-page">
      <div className="page-header reader-page-header">
        <div className="page-title">
          <h1>History</h1>
          <p>Review your recent transactions and purchase history.</p>
        </div>
        <Link to="/reader/my-library" className="btn btn-secondary">
          Open My Library
        </Link>
      </div>

      <section className="reader-summary-grid" aria-label="History summary">
        <article className="reader-summary-card">
          <p className="reader-summary-label">Transactions</p>
          <h3>{summary.total}</h3>
          <small>Purchase records found</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Paid</p>
          <h3>{summary.paid}</h3>
          <small>Successful payments</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Total Amount</p>
          <h3>${summary.amount.toFixed(2)}</h3>
          <small>Across all visible records</small>
        </article>
      </section>

      {error && <p className="issue-message issue-error">{error}</p>}

      <div className="reader-history-toolbar">
        <div className="reader-toggle-group" role="tablist" aria-label="History filter">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`reader-tab ${range === option.key ? 'active' : ''}`}
              onClick={() => handleRangeChange(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card reader-section">
          <div className="card-body">Loading history...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card reader-section">
          <div className="card-body">
            <p className="reader-empty">No transactions found.</p>
          </div>
        </div>
      ) : (
        <div className="reader-table-wrap">
          <table className="reader-recent-table reader-history-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td data-label="Book Title">
                    <div className="reader-title-cell">
                      <strong className="reader-title-main">{transaction.book_title}</strong>
                      <span className="reader-title-sub">{transaction.author || 'Unknown author'}</span>
                    </div>
                  </td>
                  <td data-label="Amount">${Number(transaction.amount || 0).toFixed(2)}</td>
                  <td data-label="Payment Status">
                    <span className={`reader-status-chip ${transaction.payment_status === 'paid' ? 'purchased' : 'available'}`}>
                      {transaction.payment_status}
                    </span>
                  </td>
                  <td data-label="Date">
                    {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleString() : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
