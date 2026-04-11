import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { readerAuthAPI, readerPortalAPI } from '../../services/api';
import '../Settings.css';

const ReaderSettings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await readerAuthAPI.me();
      setProfile({
        name: response.data?.name || '',
        email: response.data?.email || '',
        phone: response.data?.phone || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value;
    setProfile(prev => ({ ...prev, [name]: nextValue }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      setError('Name is required');
      return;
    }

    if (profile.phone && !/^\d{11}$/.test(profile.phone)) {
      setError('Phone number must be exactly 11 digits');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await readerAuthAPI.updateProfile(profile);

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (!passwords.current_password || !passwords.new_password || !passwords.confirm_password) {
      setError('All fields are required');
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwords.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await readerAuthAPI.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });

      setMessage('Password changed successfully!');
      setPasswords({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="settings-layout">
        {/* Tabs Navigation */}
        <nav className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            🌙 Appearance
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔐 Password
          </button>
        </nav>

        {/* Tab Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Edit Profile</h2>
              <form onSubmit={updateProfile} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                    disabled={loading}
                    inputMode="numeric"
                    pattern="\d{11}"
                    maxLength={11}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="theme-settings">
                <div className="theme-option">
                  <div className="theme-info">
                    <h3>Dark Mode</h3>
                    <p>Enable dark theme for comfortable reading at night</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={toggleTheme}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="theme-preview">
                  <p className="preview-label">Preview:</p>
                  <div className={`preview-box ${isDarkMode ? 'dark' : 'light'}`}>
                    <div className="preview-sample">Sample Text</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <h2>Change Password</h2>
              <form onSubmit={updatePassword} className="settings-form">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="current_password"
                      name="current_password"
                      value={passwords.current_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="new_password"
                      name="new_password"
                      value={passwords.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min. 8 characters)"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirm_password"
                      name="confirm_password"
                      value={passwords.confirm_password}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : '🔐 Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderSettings;
