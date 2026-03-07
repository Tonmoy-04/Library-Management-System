import React from 'react';

export default function StatCard({ title, value }) {
  return (
    <div className="p-4 shadow rounded bg-white">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
