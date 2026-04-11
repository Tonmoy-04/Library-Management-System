import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api, { readerAuthAPI, publisherAuthAPI } from '../services/api';
import '../styles/global.css';
import '../styles/form.css';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const initialRole = useMemo(() => {
    const queryRole = searchParams.get('role');
    return ['admin', 'publisher', 'reader'].includes(queryRole) ? queryRole : 'admin';
  }, [searchParams]);
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncAutofillValues = () => {
      const nextEmail = emailInputRef.current?.value || '';
      const nextPassword = passwordInputRef.current?.value || '';

      if (nextEmail) {
        setEmail(nextEmail);
      }

      if (nextPassword) {
        setPassword(nextPassword);
      }
    };

    const timer = window.setTimeout(syncAutofillValues, 300);
    return () => window.clearTimeout(timer);
  }, []);

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
    <div className="login-page auth-page">
      <div className="login-card auth-card">
        <div className="auth-header">
          <h1 className="auth-brand">LibraryMS</h1>
          <p className="auth-subtitle">Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Login As</label>
            <div className="auth-role-grid">
              {['admin', 'publisher', 'reader'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`auth-role-btn ${role === option ? 'active' : ''}`}
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
              name="email"
              autoComplete="email"
              ref={emailInputRef}
              className="form-control"
              placeholder="user@aust.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInput={(e) => setEmail(e.target.value)}
              onFocus={() => {
                const value = emailInputRef.current?.value || '';
                if (value && value !== email) {
                  setEmail(value);
                }
              }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              ref={passwordInputRef}
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={(e) => setPassword(e.target.value)}
              onFocus={() => {
                const value = passwordInputRef.current?.value || '';
                if (value && value !== password) {
                  setPassword(value);
                }
              }}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-meta-text">
            Don't have an account?{' '}
            <Link
              to={role === 'reader' ? '/register?role=reader' : role === 'publisher' ? '/register?role=publisher' : '/register?role=admin'}
              className="auth-link"
            >
              Register here
            </Link>
          </p>
          <button
            type="button"
            className="auth-link-btn"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
