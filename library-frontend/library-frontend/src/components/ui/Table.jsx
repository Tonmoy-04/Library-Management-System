import React from 'react';

export default function Table({ children }) {
  return (
    <table className="min-w-full bg-white">
      {children}
    </table>
  );
}
