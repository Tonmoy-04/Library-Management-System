import React from 'react';
import '../styles/global.css';

const Card = ({ title, value, icon, color }) => {
  return (
    <div className="card" style={{
      backgroundColor: 'var(--bg-card)',
      padding: '1.5rem',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'var(--transition)',
      borderLeft: `5px solid ${color || 'var(--primary-color)'}`,
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow)';
    }}
    >
      <div className="card-info">
        <h3 style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>{title}</h3>
        <p style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-main)'
        }}>{value}</p>
      </div>
      <div className="card-icon" style={{
        fontSize: '2rem',
        opacity: 0.8
      }}>
        {icon}
      </div>
    </div>
  );
};

export default Card;
