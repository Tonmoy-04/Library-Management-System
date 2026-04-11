import React from 'react';
import '../styles/global.css';

const Card = ({ title, value, icon, color }) => {
  return (
    <div className="card modern-card" style={{ borderLeftColor: color || 'var(--primary-color)' }}>
      <div className="card-info">
        <h3 className="modern-card-title">{title}</h3>
        <p className="modern-card-value">{value}</p>
      </div>
      <div className="card-icon modern-card-icon">
        {icon}
      </div>
    </div>
  );
};

export default Card;
