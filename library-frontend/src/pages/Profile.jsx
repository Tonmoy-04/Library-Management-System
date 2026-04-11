import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import '../styles/account.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const displayName = user?.name || 'User';
  const email = user?.email || 'No email available';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleBack = () => {
    navigate(role === 'reader' ? '/reader/home' : role === 'publisher' ? '/publisher/portal' : '/');
  };

  return (
    <div className="account-shell account-shell-profile">
      <Navbar />
      <main className="account-page">
        <section className="account-hero account-hero-profile">
          <div className="account-avatar">{initial}</div>
          <div className="account-hero-copy">
            <p className="account-kicker">My Account</p>
            <h1>{displayName}</h1>
            <p>{email}</p>
          </div>
          <div className="account-hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/settings')}>
              Manage Settings
            </button>
            <button type="button" className="btn" onClick={handleBack}>
              Return to Dashboard
            </button>
          </div>
        </section>

        <section className="account-grid">
          <article className="account-card">
            <h2>Profile Information</h2>
            <ul className="account-list">
              <li><span>Full Name</span><strong>{displayName}</strong></li>
              <li><span>Email Address</span><strong>{email}</strong></li>
              <li><span>Account Type</span><strong>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}</strong></li>
              <li><span>Account Status</span><strong>Active</strong></li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Profile;
