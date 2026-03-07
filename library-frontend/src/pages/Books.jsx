import React from 'react';
import Table from '../components/Table';
import '../styles/dashboard.css';

const Books = () => {
  const booksData = [
    { isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', price: '$45.00', publisher: 'Prentice Hall' },
    { isbn: '978-0201616224', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Software Development', price: '$50.00', publisher: 'Addison-Wesley' },
    { isbn: '978-0596007126', title: 'Head First Design Patterns', author: 'Eric Freeman', category: 'Design Patterns', price: '$42.00', publisher: 'O\'Reilly' },
    { isbn: '978-1491950296', title: 'Building Microservices', author: 'Sam Newman', category: 'Architecture', price: '$48.00', publisher: 'O\'Reilly' },
  ];

  const actions = [
    { label: 'Edit', type: 'edit', onClick: (row) => console.log('Edit', row) },
    { label: 'Delete', type: 'delete', onClick: (row) => console.log('Delete', row) },
  ];

  return (
    <div className="books-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Books Management</h1>
          <p>Manage your library's book collection.</p>
        </div>
        <button className="btn btn-primary">+ Add New Book</button>
      </div>

      <Table
        columns={['ISBN', 'Title', 'Author', 'Category', 'Price', 'Publisher']}
        data={booksData}
        actions={actions}
      />
    </div>
  );
};

export default Books;
