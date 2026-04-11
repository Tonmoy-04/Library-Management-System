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
    return ['reader', 'publisher'].includes(queryRole) ? queryRole : 'reader';
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
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
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

    if ((isReader || isPublisher) && !/^\d{11}$/.test(formData.phone)) {
      setError('Phone number must be exactly 11 digits');
      return;
    }

    if (isPublisher && (!formData.name || !formData.phone || !formData.description || !formData.city || !formData.country)) {
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
          phone: formData.phone,
          description: formData.description,
          city: formData.city,
          country: formData.country,
        });
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
    <div className="register-page auth-page">
      <div className="register-card auth-card auth-card-wide">
        <div className="auth-header">
          <h1 className="auth-brand">LibraryMS</h1>
          <p className="auth-subtitle">
            {role === 'reader' ? 'Create a reader account to get started.' : 'Create a publisher account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="on">
          {error && (
            <div className="auth-error auth-error-left">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Register As</label>
            <div className="auth-role-grid two-cols">
              {['reader', 'publisher'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`auth-role-btn ${role === option ? 'active' : ''}`}
                >
                  {option === 'reader' ? 'Reader' : 'Publisher'}
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
                autoComplete="name"
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
              autoComplete="username"
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
                  autoComplete="tel"
                  className="form-control"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="\d{11}"
                  maxLength={11}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  autoComplete="street-address"
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
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="organization"
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  className="form-control"
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="\d{11}"
                  maxLength={11}
                />
              </div>

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
                  style={{ minHeight: '60px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  autoComplete="address-level2"
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
                  autoComplete="country-name"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
              className="form-control"
              placeholder="********"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-meta-text">
            Already have an account?{' '}
            <Link
              to={`/login?role=${role}`}
              className="auth-link"
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
