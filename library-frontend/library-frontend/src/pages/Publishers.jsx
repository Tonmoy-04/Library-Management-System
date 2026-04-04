import React from 'react';
import Table from '../components/Table';
import '../styles/dashboard.css';

const Publishers = () => {
  const publishersData = [
    { id: 'P001', name: 'O\'Reilly Media', email: 'contact@oreilly.com', website: 'oreilly.com', location: 'California, USA' },
    { id: 'P002', name: 'Prentice Hall', email: 'info@prenticehall.com', website: 'prenticehall.com', location: 'New Jersey, USA' },
    { id: 'P003', name: 'Addison-Wesley', email: 'sales@awl.com', website: 'awl.com', location: 'Massachusetts, USA' },
    { id: 'P004', name: 'Packt Publishing', email: 'enquiry@packt.com', website: 'packt.com', location: 'Birmingham, UK' },
  ];

  const actions = [
    { label: 'Edit', type: 'edit', onClick: (row) => console.log('Edit', row) },
    { label: 'Delete', type: 'delete', onClick: (row) => console.log('Delete', row) },
  ];

  return (
    <div className="publishers-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Publishers Management</h1>
          <p>Maintain information about book publishers.</p>
        </div>
        <button className="btn btn-primary">+ Add Publisher</button>
      </div>

      <Table
        columns={['ID', 'Name', 'Email', 'Website', 'Location']}
        data={publishersData}
        actions={actions}
      />
    </div>
  );
};

export default Publishers;
