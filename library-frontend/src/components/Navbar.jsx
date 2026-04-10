import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

const Navbar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { user, logout, isReader, isPublisher } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('');
  const displayName = user?.name || 'User';
  const subtitle = user?.email || 'Library Member';
  const initial = displayName.charAt(0).toUpperCase();

  const homePath = useMemo(() => {
    if (isReader) return '/reader/home';
    if (isPublisher) return '/publisher/portal';
    return '/';
  }, [isPublisher, isReader]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setActivePanel('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setActivePanel('');
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    setMenuOpen(true);
    setActivePanel((prev) => (prev === 'profile' ? '' : 'profile'));
  };

  const handleSettingsClick = () => {
    setMenuOpen(true);
    setActivePanel((prev) => (prev === 'settings' ? '' : 'settings'));
  };

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
      }} ref={menuRef}>
        <div className="user-info" style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{displayName}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</div>
        </div>

        <button
          type="button"
          className="avatar"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          title="Open profile menu"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: 'none'
          }}
        >
          {initial}
        </button>

        {menuOpen && (
          <div className="profile-menu" role="menu">
            <button type="button" className="profile-menu-item" onClick={handleProfileClick}>My Profile</button>
            <button type="button" className="profile-menu-item" onClick={handleSettingsClick}>Settings</button>
            <button
              type="button"
              className="profile-menu-item"
              onClick={() => {
                setMenuOpen(false);
                setActivePanel('');
                navigate(homePath);
              }}
            >
              Dashboard
            </button>
            <button type="button" className="profile-menu-item danger" onClick={handleLogout}>Logout</button>

            {activePanel === 'profile' && (
              <div className="profile-menu-panel" role="region" aria-label="Profile details">
                <h4>{displayName}</h4>
                <p>{subtitle}</p>
                <small>Role: {isReader ? 'Reader' : isPublisher ? 'Publisher' : 'Admin'}</small>
              </div>
            )}

            {activePanel === 'settings' && (
              <div className="profile-menu-panel" role="region" aria-label="Settings shortcuts">
                <button type="button" className="profile-chip" onClick={() => navigate(homePath)}>Go to dashboard</button>
                <button type="button" className="profile-chip" onClick={() => setActivePanel('profile')}>Account details</button>
                <button type="button" className="profile-chip" onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
