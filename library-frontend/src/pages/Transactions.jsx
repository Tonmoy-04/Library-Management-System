import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { transactionAPI } from '../services/api';
import '../styles/dashboard.css';

const Transactions = () => {
  const [transactionsData, setTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await transactionAPI.getAll();
        const rows = (response.data?.data || []).map((tx) => ({
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

    fetchTransactions();
  }, []);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Transactions</h1>
          <p>Track book issuance, returns, and reservations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-success" disabled>Issue Book</button>
          <button className="btn btn-primary" disabled>Return Book</button>
        </div>
      </div>

      {loading && <p>Loading transactions...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      {transactionsData.length > 0 ? (
        <Table
          columns={['Transaction ID', 'Reader', 'Book', 'Issue Date', 'Return Date', 'Status']}
          data={transactionsData}
        />
      ) : (
        !loading && <p>No transactions found in the database.</p>
      )}
    </div>
  );
};

export default Transactions;
