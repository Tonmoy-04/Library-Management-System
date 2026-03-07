import React from 'react';

export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <button className="mb-2" onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
}
