import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { readerAuthAPI, publisherAuthAPI } from '../services/api';
import '../styles/global.css';
import '../styles/form.css';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = useMemo(() => {
    const queryRole = searchParams.get('role');
    return ['reader', 'publisher'].includes(queryRole) ? queryRole : 'admin';
  }, [searchParams]);
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    city: '',
    country: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isReader = role === 'reader';
    const isPublisher = role === 'publisher';

    // Base validation - required for all
    if (!formData.email || !formData.password || !formData.password_confirmation) {
      setError('Please fill in all required fields');
      return;
    }

    // Name required only for non-publishers
    if (!isPublisher && !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    if (isReader && (!formData.phone || !formData.address)) {
      setError('Please fill in phone and address');
      return;
    }

    if (isPublisher && (!formData.description || !formData.city || !formData.country)) {
      setError('Please fill in all publisher information');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name || formData.email.split('@')[0], // Use email prefix as name for publishers
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };

      let response;
      if (isReader) {
        response = await readerAuthAPI.register({
          ...payload,
          phone: formData.phone,
          address: formData.address,
        });
      } else if (isPublisher) {
        response = await publisherAuthAPI.register({
          ...payload,
          description: formData.description,
          city: formData.city,
          country: formData.country,
        });
      } else {
        response = await api.post('/auth/register', payload);
      }

      console.log('Registration successful', response.data);
      // Redirect to login after successful registration
      navigate('/login');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        // Format validation errors
        const errorList = Object.entries(errors)
          .map(([field, messages]) => {
            const msgs = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgs.join(', ')}`;
          })
          .join('\n');
        errorMessage = errorList || 'Validation error occurred';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)'
    }}>
      <div className="register-card" style={{
        backgroundColor: 'var(--bg-card)',
        padding: '2.5rem',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-hover)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>LibraryMS</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {role === 'reader' ? 'Create a reader account to get started.' : role === 'publisher' ? 'Create a publisher account to get started.' : 'Create a new admin account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              color: '#991b1b',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'left',
              padding: '1rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.375rem',
              border: '1px solid #fecaca',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxHeight: '100px',
              overflowY: 'auto',
              lineHeight: '1.5'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Register As</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['admin', 'reader', 'publisher'].map((option) => (
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
                  {option === 'admin' ? 'Admin' : option === 'reader' ? 'Reader' : 'Publisher'}
                </button>
              ))}
            </div>
          </div>

          {role !== 'publisher' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="user@aust.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {role === 'reader' && (
            <>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="form-control"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {role === 'publisher' && (
            <>
              <div className="form-group">
                <label htmlFor="description">Publisher Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  placeholder="Brief description of your publishing house"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  style={{ fontFamily: 'inherit', minHeight: '60px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-control"
                  placeholder="Dhaka"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="form-control"
                  placeholder="Bangladesh"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm Password</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              className="form-control"
              placeholder="********"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
