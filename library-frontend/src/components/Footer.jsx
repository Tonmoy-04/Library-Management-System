import React from 'react';
import '../styles/global.css';

const Footer = ({ offsetLeft = 260 }) => {
  const footerWidth = offsetLeft > 0 ? `calc(100% - ${offsetLeft}px)` : '100%';

  return (
    <footer className="footer" style={{
      padding: '1.5rem 2rem',
      backgroundColor: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.875rem',
      position: 'relative',
      marginLeft: `${offsetLeft}px`,
      width: footerWidth
    }}>
      <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
