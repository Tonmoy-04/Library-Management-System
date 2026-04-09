import React from 'react';
import '../styles/global.css';

const Footer = () => {
  return (
    <footer className="footer" style={{
      padding: '1.5rem 2rem',
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem',
      position: 'relative'
    }}>
      <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
