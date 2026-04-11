import React from 'react';
import '../styles/global.css';

const Footer = () => {
  return (
    <footer className="footer modern-footer">
      <p className="modern-footer-text">&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
