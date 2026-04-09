import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api, { readerAuthAPI, publisherAuthAPI } from '../services/api';
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
      const credentials = {
        email: email,
        password: password,
      };

      let response;
      if (role === 'reader') {
        response = await readerAuthAPI.login(credentials);
      } else if (role === 'publisher') {
        response = await publisherAuthAPI.login(credentials);
      } else {
        response = await api.post('/auth/login', credentials);
      }

      console.log('Login successful', response.data);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', role);
      }

      // Call login from context
      login(response.data.user, response.data.token, role);
      
      // Redirect based on role
      if (role === 'reader') {
        navigate('/reader/home');
      } else if (role === 'publisher') {
        navigate('/publisher/portal');
      } else {
        navigate('/');
      }
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
            <label>Login As</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['admin', 'publisher', 'reader'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: role === option ? 'var(--primary-color)' : 'transparent',
                    color: role === option ? '#fff' : 'var(--text-main)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {option === 'admin' ? 'Admin' : option === 'publisher' ? 'Publisher' : 'Reader'}
                </button>
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
              placeholder="********"
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
            <Link
              to={role === 'reader' ? '/register?role=reader' : role === 'publisher' ? '/register?role=publisher' : '/register?role=admin'}
              style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Register here
            </Link>
          </p>
          <button
            type="button"
            style={{
              color: 'var(--primary-color)',
              fontSize: '0.875rem',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
