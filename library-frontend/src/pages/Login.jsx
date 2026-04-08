import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api, { readerAuthAPI } from '../services/api';
import '../styles/global.css';
import '../styles/form.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const loginPayload = {
        email: email,
        password: password,
      };

      const response = role === 'reader'
        ? await readerAuthAPI.login(loginPayload)
        : await api.post('/auth/login', loginPayload);

      const activeRole = response.data.role || role;

      console.log('Login successful', response.data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', activeRole);
      }

      // Call login from context
      login(response.data.user, response.data.token, activeRole);
      
      // Redirect based on selected role
      navigate(activeRole === 'reader' ? '/reader/home' : '/dashboard');
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
          {error && (
            <div style={{
              color: '#ef4444',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.375rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Login Role</label>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(148, 163, 184, 0.35)'
            }}>
              {['admin', 'reader'].map((option) => (
                <label
                  key={option}
                  htmlFor={`role-${option}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.4rem',
                    cursor: 'pointer',
                    backgroundColor: role === option ? 'var(--primary-color)' : 'transparent',
                    color: role === option ? '#ffffff' : 'var(--text-color)',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    id={`role-${option}`}
                    type="radio"
                    name="loginRole"
                    value={option}
                    checked={role === option}
                    onChange={() => setRole(option)}
                    disabled={loading}
                    style={{ margin: 0 }}
                  />
                  <span>{option === 'admin' ? 'Admin' : 'Reader'}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="user@aust.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Don't have an account?{' '}
            <a
              href="/register"
              style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Register here
            </a>
          </p>
          <a href="#" style={{ color: 'var(--primary-color)', fontSize: '0.875rem' }}>Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
