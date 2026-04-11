import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { transactionAPI } from '../services/api';
import '../styles/dashboard.css';

const FINE_PER_DAY = 10;

const Transactions = () => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  };

  const openTransactionDetails = (tx) => {
    setSelectedTransaction(tx);
  };

  const calculateFine = (tx) => {
    if (tx.transaction_type !== 'issue' || !tx.due_at) {
      return 0;
    }

    const dueAt = new Date(tx.due_at);
    const settledAt = tx.returned_at ? new Date(tx.returned_at) : new Date();
    const lateMs = settledAt.getTime() - dueAt.getTime();

    if (lateMs <= 0) {
      return 0;
    }

    const lateDays = Math.ceil(lateMs / (1000 * 60 * 60 * 24));
    return lateDays * FINE_PER_DAY;
  };

  const mapRows = (rows) => rows.map((tx) => {
    const fine = calculateFine(tx);
    const isIssue = tx.transaction_type === 'issue';
    const isIssued = isIssue && tx.status === 'issued';
    const isReturned = isIssue && tx.status === 'returned';

    return {
      id: `${isIssue ? 'ISS' : 'PAY'}-${tx.id}`,
      type: isIssue ? 'Book Issue' : 'Payment',
      reader: tx.reader,
      book: tx.book,
      publisher: tx.publisher || '-',
      amount: tx.amount != null ? `$${Number(tx.amount).toFixed(2)}` : '-',
      adminShare: tx.admin_share != null ? `$${Number(tx.admin_share).toFixed(2)}` : '-',
      publisherShare: tx.publisher_share != null ? `$${Number(tx.publisher_share).toFixed(2)}` : '-',
      issueDate: tx.issued_at ? new Date(tx.issued_at).toLocaleDateString() : '-',
      dueDate: tx.due_at ? new Date(tx.due_at).toLocaleDateString() : '-',
      returnDate: tx.returned_at ? new Date(tx.returned_at).toLocaleDateString() : (isIssue ? 'Not returned' : '-'),
      fine: fine > 0 ? `৳${fine}` : '৳0',
      status: isIssue ? (
        isIssued ? (
          <button
            type="button"
            className="status-badge status-issued status-issued-link"
            onClick={() => openTransactionDetails(tx)}
            title="View issued details"
          >
            issued
          </button>
        ) : (
          <button
            type="button"
            className="status-badge status-returned status-issued-link"
            onClick={() => openTransactionDetails(tx)}
            title="View returned details"
          >
            returned
          </button>
        )
      ) : (
        <button
          type="button"
          className="status-badge status-reserved status-issued-link"
          onClick={() => openTransactionDetails(tx)}
          title="View payment details"
        >
          {tx.payment_status || 'paid'}
        </button>
      ),
      actions: isIssued ? (
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => handleReturnBook(tx.id, tx.book)}
        >
          Return
        </button>
      ) : isReturned ? (
        <button
          type="button"
          className="btn btn-sm btn-view"
          onClick={() => openTransactionDetails(tx)}
        >
          View
        </button>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>-</span>
      ),
    };
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await transactionAPI.getAll();
        const rows = response.data?.data || [];
        setTransactionsData(mapRows(rows));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleReturnBook = async (transactionId, bookName) => {
    const confirmed = window.confirm(`${bookName} book returned?`);
    if (!confirmed) return;

    try {
      await transactionAPI.returnBook(transactionId);
      setError('');
      const response = await transactionAPI.getAll();
      const rows = response.data?.data || [];
      setTransactionsData(mapRows(rows));

      if (selectedTransaction) {
        const refreshed = rows.find((item) => item.transaction_type === 'issue' && Number(item.id) === Number(selectedTransaction.id));
        setSelectedTransaction(refreshed || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book.');
    }
  };

  const selectedFine = selectedTransaction ? calculateFine(selectedTransaction) : 0;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Transactions</h1>
          <p>Track book issues, returns, payment records, and overdue fines.</p>
        </div>
      </div>

      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      {transactionsData.length > 0 ? (
        <Table
          columns={['Transaction ID', 'Type', 'Reader', 'Book', 'Publisher', 'Amount', 'Admin Share', 'Publisher Share', 'Issue Date', 'Due Date', 'Return Date', 'Fine', 'Status', 'Actions']}
          data={transactionsData}
        />
      ) : (
        !loading && <p>No transactions found in the database.</p>
      )}

      {selectedTransaction && (
        <div className="modal-backdrop" onClick={() => setSelectedTransaction(null)}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>{selectedTransaction.transaction_type === 'issue' ? 'Issue Transaction Details' : 'Payment Transaction Details'}</h3>
              <button type="button" onClick={() => setSelectedTransaction(null)}>x</button>
            </div>

            <ul className="account-list" style={{ marginBottom: '1rem' }}>
              <li><span>Type</span><strong>{selectedTransaction.transaction_type === 'issue' ? 'Book Issue' : 'Payment'}</strong></li>
              <li><span>Reader</span><strong>{selectedTransaction.reader || 'N/A'}</strong></li>
              <li><span>Book</span><strong>{selectedTransaction.book || 'N/A'}</strong></li>
              <li><span>Publisher</span><strong>{selectedTransaction.publisher || 'N/A'}</strong></li>
              <li><span>Amount</span><strong>{selectedTransaction.amount != null ? `$${Number(selectedTransaction.amount).toFixed(2)}` : '-'}</strong></li>
              <li><span>Admin Share</span><strong>{selectedTransaction.admin_share != null ? `$${Number(selectedTransaction.admin_share).toFixed(2)}` : '-'}</strong></li>
              <li><span>Publisher Share</span><strong>{selectedTransaction.publisher_share != null ? `$${Number(selectedTransaction.publisher_share).toFixed(2)}` : '-'}</strong></li>
              <li><span>Payment Status</span><strong>{selectedTransaction.payment_status || '-'}</strong></li>
              <li><span>Transaction Date</span><strong>{formatDate(selectedTransaction.transaction_date)}</strong></li>
              <li><span>Issued At</span><strong>{formatDate(selectedTransaction.issued_at)}</strong></li>
              <li><span>Due At</span><strong>{formatDate(selectedTransaction.due_at)}</strong></li>
              <li><span>Returned At</span><strong>{formatDate(selectedTransaction.returned_at)}</strong></li>
              <li><span>Status</span><strong style={{ textTransform: 'capitalize' }}>{selectedTransaction.status || 'issued'}</strong></li>
              <li><span>Fine</span><strong style={{ color: selectedFine > 0 ? '#b42318' : '#166534' }}>{selectedTransaction.transaction_type === 'issue' ? `৳${selectedFine}` : '৳0'}</strong></li>
            </ul>

            <div className="issue-modal-actions">
              <button type="button" className="btn" onClick={() => setSelectedTransaction(null)}>Close</button>
              {selectedTransaction.status === 'issued' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReturnBook(selectedTransaction.id, selectedTransaction.book)}
                >
                  Return Book
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
