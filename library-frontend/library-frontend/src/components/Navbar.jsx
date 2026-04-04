import React from 'react';
import '../styles/global.css';

const Navbar = () => {
  return (
    <nav className="navbar" style={{
      height: '64px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      boxShadow: 'var(--shadow)'
    }}>
      <div className="nav-brand" style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--primary-color)'
      }}>
        Library<span style={{ color: 'var(--text-main)' }}>MS</span>
      </div>
      <div className="nav-user" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div className="user-info" style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Admin User</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Librarian</div>
        </div>
        <div className="avatar" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          A
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
