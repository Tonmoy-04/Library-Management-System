import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

const Navbar = ({ showMenuToggle = false, isMenuOpen: isSidebarOpen = false, onMenuToggle, menuTargetId = 'admin-sidebar' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const displayName = user?.name || 'User';
  const subtitle = user?.email || 'Library Member';
  const initial = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);

  const handleMenuAction = (action) => {
    if (action === 'logout') {
      handleLogout();
      return;
    }

    if (action === 'profile') {
      setIsProfileMenuOpen(false);
      navigate('/profile');
      return;
    }

    if (action === 'settings') {
      setIsProfileMenuOpen(false);
      navigate('/settings');
      return;
    }

    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
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
      <div className="nav-brand-group">
        {showMenuToggle && (
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onMenuToggle}
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isSidebarOpen}
            aria-controls={menuTargetId}
          >
            <span />
            <span />
            <span />
          </button>
        )}
        <div className="nav-brand" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--primary-color)'
        }}>
          Library<span style={{ color: 'var(--text-main)' }}>MS</span>
        </div>
      </div>
      <div className="nav-user" ref={menuRef} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div className="user-info" style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{displayName}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</div>
        </div>
        <button
          type="button"
          className="avatar"
          onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          aria-expanded={isProfileMenuOpen}
          aria-haspopup="menu"
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
            cursor: 'pointer',
            boxShadow: 'var(--shadow)',
          }}
        >
          {initial}
        </button>

        {isProfileMenuOpen && (
          <div className="profile-menu-panel" role="menu" aria-label="Profile menu">
            <div className="profile-menu-card">
              <div className="profile-menu-hero">
                <div className="profile-menu-avatar">{initial}</div>
                <div className="profile-menu-user">
                  <div className="profile-menu-name">{displayName}</div>
                  <div className="profile-menu-email">{subtitle}</div>
                </div>
              </div>
            </div>

            <div className="profile-menu-divider" />

            <button type="button" className="profile-menu-item" onClick={() => handleMenuAction('profile')}>
              <span className="profile-menu-icon">👤</span>
              <span>My Profile</span>
            </button>
            <button type="button" className="profile-menu-item" onClick={() => handleMenuAction('settings')}>
              <span className="profile-menu-icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button type="button" className="profile-menu-item profile-menu-item-danger" onClick={() => handleMenuAction('logout')}>
              <span className="profile-menu-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
