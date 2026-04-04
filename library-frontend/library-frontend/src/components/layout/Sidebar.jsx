import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 h-full p-4">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/books">Books</Link></li>
        <li><Link to="/readers">Readers</Link></li>
        <li><Link to="/publishers">Publishers</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
      </ul>
    </aside>
  );
}
