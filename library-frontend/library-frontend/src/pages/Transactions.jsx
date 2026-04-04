import React from 'react';
import Table from '../components/Table';
import '../styles/dashboard.css';

const Transactions = () => {
  const transactionsData = [
    { id: 'T001', reader: 'Alice Johnson', book: 'Clean Code', issueDate: '2023-10-01', returnDate: '2023-10-15', status: <span className="status-badge status-returned">Returned</span> },
    { id: 'T002', reader: 'Bob Smith', book: 'The Pragmatic Programmer', issueDate: '2023-10-05', returnDate: '2023-10-20', status: <span className="status-badge status-issued">Issued</span> },
    { id: 'T003', reader: 'Charlie Brown', book: 'Building Microservices', issueDate: '2023-10-10', returnDate: '2023-10-24', status: <span className="status-badge status-overdue">Overdue</span> },
    { id: 'T004', reader: 'Diana Prince', book: 'Head First Design Patterns', issueDate: '2023-10-12', returnDate: '2023-10-26', status: <span className="status-badge status-reserved">Reserved</span> },
  ];

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Transactions</h1>
          <p>Track book issuance, returns, and reservations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-success">Issue Book</button>
          <button className="btn btn-primary">Return Book</button>
        </div>
      </div>

      <Table
        columns={['Transaction ID', 'Reader', 'Book', 'Issue Date', 'Return Date', 'Status']}
        data={transactionsData}
      />
    </div>
  );
};

export default Transactions;
