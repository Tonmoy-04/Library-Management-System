import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import { transactionAPI } from '../services/api';
import '../styles/dashboard.css';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactionsData, setTransactionsData] = useState([]);
  const [transactionRecords, setTransactionRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionMessageType, setActionMessageType] = useState('info');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await transactionAPI.getAll();
      const records = response.data?.data || [];
      setTransactionRecords(records);

      const rows = records.map((tx) => ({
        id: `T${tx.id}`,
        reader: tx.reader,
        book: tx.book,
        issueDate: tx.issued_at ? new Date(tx.issued_at).toLocaleDateString() : 'N/A',
        returnDate: tx.returned_at ? new Date(tx.returned_at).toLocaleDateString() : 'Not returned',
        status: (
          <span className={`status-badge ${tx.status === 'returned' ? 'status-returned' : 'status-issued'}`}>
            {tx.status || 'issued'}
          </span>
        ),
      }));
      setTransactionsData(rows);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const showActionMessage = (message, type = 'info') => {
    setActionMessage(message);
    setActionMessageType(type);
  };

  const handleIssueBook = () => {
    showActionMessage('Opening Books page. Choose a book and use "Issue Book" there.', 'success');
    navigate('/books');
  };

  const handleRowReturnClick = async (rowIndex) => {
    const tx = transactionRecords[rowIndex];
    if (!tx) {
      showActionMessage('Transaction details were not found.', 'info');
      return;
    }

    const status = String(tx.status || 'issued').toLowerCase();
    if (status === 'returned') {
      const returnedDate = tx.returned_at ? new Date(tx.returned_at).toLocaleDateString() : 'a previous date';
      showActionMessage(`Transaction T${tx.id} already returned on ${returnedDate}.`, 'info');
      return;
    }

    const bookName = tx.book || 'this book';
    const confirmed = window.confirm(`"${bookName}" book returned?`);
    if (!confirmed) {
      showActionMessage(`Return cancelled for "${bookName}".`, 'info');
      return;
    }

    try {
      setReturningId(tx.id);
      const response = await transactionAPI.returnBook(tx.id);
      showActionMessage(response.data?.message || `Transaction T${tx.id} marked as returned.`, 'success');
      await fetchTransactions();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.transaction?.[0] || 'Failed to return this book.';
      showActionMessage(message, 'info');
    } finally {
      setReturningId(null);
    }
  };

  const rowActions = [
    {
      label: 'Return Book',
      type: 'issue',
      onClick: (_row, rowIndex) => handleRowReturnClick(rowIndex),
      isDisabled: (_row, rowIndex) => String(transactionRecords[rowIndex]?.status || '').toLowerCase() === 'returned'
        || returningId === transactionRecords[rowIndex]?.id,
      disabledTitle: 'This transaction is already returned',
    },
  ];

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Transactions</h1>
          <p>Track book issuance, returns, and reservations.</p>
        </div>
        <div className="transactions-actions">
          <button type="button" className="btn btn-success" onClick={handleIssueBook}>Issue Book</button>
        </div>
      </div>

      {actionMessage && (
        <div className={`transactions-action-message ${actionMessageType}`}>
          <span>{actionMessage}</span>
          <button type="button" className="transactions-message-close" onClick={() => setActionMessage('')}>x</button>
        </div>
      )}

      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      {transactionsData.length > 0 ? (
        <Table
          columns={['Transaction ID', 'Reader', 'Book', 'Issue Date', 'Return Date', 'Status']}
          data={transactionsData}
          actions={rowActions}
        />
      ) : (
        !loading && <p>No transactions found in the database.</p>
      )}
    </div>
  );
};

export default Transactions;
