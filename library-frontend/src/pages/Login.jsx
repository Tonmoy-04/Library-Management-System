import React, { useState } from 'react';
import '../styles/global.css';
import '../styles/form.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    // Mock login
    console.log('Login attempt', { email, password });
    onLogin();
  };

  return (
    <div className="login-page" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="login-card" style={{
        backgroundColor: 'var(--bg-card)',
        padding: '2.5rem',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-hover)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>LibraryMS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="admin@library.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Login
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="#" style={{ color: 'var(--primary-color)', fontSize: '0.875rem' }}>Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
