import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Books from '../pages/Books';
import Readers from '../pages/Readers';
import Publishers from '../pages/Publishers';
import Transactions from '../pages/Transactions';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/books" element={<Books />} />
      <Route path="/readers" element={<Readers />} />
      <Route path="/publishers" element={<Publishers />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
