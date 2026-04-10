import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import '../styles/account.css';

const Settings = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const storageKey = 'library-account-settings';

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved
      ? JSON.parse(saved)
      : {
          emailNotifications: true,
          compactView: false,
          syncAcrossDevices: true,
        };
  });
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  const handleToggle = (key) => {
    setSavedMessage('');
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSavedMessage('Settings saved successfully.');
    window.setTimeout(() => setSavedMessage(''), 1800);
  };

  const handleBack = () => {
    navigate(role === 'reader' ? '/reader/home' : role === 'publisher' ? '/publisher/portal' : '/');
  };

  return (
    <div className="account-shell">
      <Navbar />
      <main className="account-page">
        <section className="account-hero account-hero-settings">
          <div>
            <p className="account-kicker">Preferences</p>
            <h1>Settings</h1>
            <p>Fine-tune how the library app looks and behaves for you.</p>
          </div>
          <div className="account-hero-actions">
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save changes
            </button>
            <button type="button" className="btn" onClick={handleBack}>
              Back to app
            </button>
          </div>
        </section>

        {savedMessage && <div className="account-toast">{savedMessage}</div>}

        <section className="account-grid account-grid-settings">
          <article className="account-card">
            <h2>Notifications</h2>
            <div className="setting-row">
              <div>
                <strong>Email notifications</strong>
                <p>Get updates about issues, returns, and account activity.</p>
              </div>
              <button type="button" className={`setting-switch ${settings.emailNotifications ? 'on' : ''}`} onClick={() => handleToggle('emailNotifications')}>
                <span />
              </button>
            </div>
            <div className="setting-row">
              <div>
                <strong>Sync across devices</strong>
                <p>Keep your account consistent everywhere.</p>
              </div>
              <button type="button" className={`setting-switch ${settings.syncAcrossDevices ? 'on' : ''}`} onClick={() => handleToggle('syncAcrossDevices')}>
                <span />
              </button>
            </div>
          </article>

          <article className="account-card account-card-accent">
            <h2>Display</h2>
            <div className="setting-row">
              <div>
                <strong>Compact view</strong>
                <p>Use denser spacing for tables and cards.</p>
              </div>
              <button type="button" className={`setting-switch ${settings.compactView ? 'on' : ''}`} onClick={() => handleToggle('compactView')}>
                <span />
              </button>
            </div>
            <p className="account-note">These settings are saved locally for now.</p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Settings;
