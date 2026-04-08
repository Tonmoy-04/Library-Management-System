import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ReaderHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div className="page-title">
          <h1>Reader Home</h1>
          <p>Welcome{user?.name ? `, ${user.name}` : ''}. Here is your reader workspace.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleLogout}
          style={{ whiteSpace: 'nowrap' }}
        >
          Logout
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card">
          <div className="card-header">
            <h3>Browse Books</h3>
          </div>
          <div className="card-body">
            <p>Explore available books and discover new titles.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>My Borrowed Books</h3>
          </div>
          <div className="card-body">
            <p>Review the books you currently have on loan.</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>My Requests</h3>
          </div>
          <div className="card-body">
            <p>Track pending and approved book requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderHome;