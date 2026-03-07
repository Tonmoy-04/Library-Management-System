import React from 'react';

export default function Input(props) {
  return (
    <input
      {...props}
      className="border px-2 py-1 rounded w-full"
    />
  );
}
