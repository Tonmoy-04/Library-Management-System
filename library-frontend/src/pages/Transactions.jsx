import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import { transactionAPI } from '../services/api';
import '../styles/dashboard.css';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactionsData, setTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const goToIssuedBook = (tx) => {
    navigate('/books', {
      state: {
        issueContext: {
          transactionId: tx.id,
          bookId: tx.book_id,
          bookTitle: tx.book,
          readerName: tx.reader,
          issuedAt: tx.issued_at ? new Date(tx.issued_at).toLocaleString() : 'N/A',
        },
      },
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await transactionAPI.getAll();
        const rows = (response.data?.data || []).map((tx) => ({
          id: `T${tx.id}`,
          bookId: tx.book_id,
          reader: tx.reader,
          book: tx.book,
          issueDate: tx.issued_at ? new Date(tx.issued_at).toLocaleDateString() : 'N/A',
          returnDate: tx.returned_at ? new Date(tx.returned_at).toLocaleDateString() : 'Not returned',
          status: tx.status === 'returned' ? (
            <span className="status-badge status-returned">returned</span>
          ) : (
            <button
              type="button"
              className="status-badge status-issued status-issued-link"
              onClick={() => goToIssuedBook(tx)}
              title="Open this issued book record on the Books page"
            >
              issued
            </button>
          ),
        }));
        setTransactionsData(rows.map(row => ({
          ...row,
          actions: row.status.props.className.includes('status-returned') ? (
            <span style={{ color: '#16a34a', fontWeight: 700 }}>
              ✓
            </span>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => handleReturnBook(row.id.replace('T', ''), row.book)}
            >
              Return
            </button>
          ),
        })));
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
      const newRows = (response.data?.data || []).map((tx) => ({
        id: `T${tx.id}`,
        bookId: tx.book_id,
        reader: tx.reader,
        book: tx.book,
        issueDate: tx.issued_at ? new Date(tx.issued_at).toLocaleDateString() : 'N/A',
        returnDate: tx.returned_at ? new Date(tx.returned_at).toLocaleDateString() : 'Not returned',
        status: tx.status === 'returned' ? (
          <span className="status-badge status-returned">returned</span>
        ) : (
          <button
            type="button"
            className="status-badge status-issued status-issued-link"
            onClick={() => goToIssuedBook(tx)}
            title="Open this issued book record on the Books page"
          >
            issued
          </button>
        ),
      }));
      setTransactionsData(newRows.map(row => ({
        ...row,
        actions: row.status.props.className.includes('status-returned') ? (
          <span style={{ color: '#16a34a', fontWeight: 700 }}>
            ✓
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleReturnBook(row.id.replace('T', ''), row.book)}
          >
            Return
          </button>
        ),
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to return book.');
    }
  };
  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Transactions</h1>
          <p>Track book issuance and returns.</p>
        </div>
      </div>

      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      {transactionsData.length > 0 ? (
        <Table
          columns={['Transaction ID', 'Reader', 'Book', 'Issue Date', 'Return Date', 'Status', 'Actions']}
          data={transactionsData}
        />
      ) : (
        !loading && <p>No transactions found in the database.</p>
      )}
    </div>
  );
};

export default Transactions;
