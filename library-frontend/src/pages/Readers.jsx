import React from 'react';
import Table from '../components/Table';
import '../styles/dashboard.css';

const Readers = () => {
  const readersData = [
    { id: 'R001', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', address: '123 Maple St' },
    { id: 'R002', name: 'Bob Smith', email: 'bob@example.com', phone: '234-567-8901', address: '456 Oak Ave' },
    { id: 'R003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', address: '789 Pine Rd' },
    { id: 'R004', name: 'Diana Prince', email: 'diana@example.com', phone: '456-789-0123', address: '101 Wonder Ln' },
  ];

  const actions = [
    { label: 'Edit', type: 'edit', onClick: (row) => console.log('Edit', row) },
    { label: 'Delete', type: 'delete', onClick: (row) => console.log('Delete', row) },
  ];

  return (
    <div className="readers-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Readers Management</h1>
          <p>Manage library members and their information.</p>
        </div>
        <button className="btn btn-primary">+ Register Reader</button>
      </div>

      <Table
        columns={['Reader ID', 'Name', 'Email', 'Phone', 'Address']}
        data={readersData}
        actions={actions}
      />
    </div>
  );
};

export default Readers;
