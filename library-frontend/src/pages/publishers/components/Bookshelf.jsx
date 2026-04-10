import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Bookshelf.css';
import { publisherAPI } from '../../../services/api';

const statusConfig = {
  pending: { label: 'Pending', icon: '🟡', className: 'pending' },
  accepted: { label: 'Accepted', icon: '🟢', className: 'accepted' },
  declined: { label: 'Declined', icon: '🔴', className: 'declined' },
};

const Bookshelf = ({ publisherId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    file_url: '',
    cover_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await publisherAPI.getBookshelfSubmissions(publisherId);
      setSubmissions(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookshelf submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [publisherId]);

  const orderedSubmissions = useMemo(() => {
    const list = [...submissions];
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return list;
  }, [submissions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.price) {
      setError('Title, author, and price are required.');
      return;
    }

    setSaving(true);
    try {
      await publisherAPI.submitBookToBookshelf(publisherId, {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim() || null,
        price: Number(formData.price),
        file_url: formData.file_url.trim() || null,
        cover_url: formData.cover_url.trim() || null,
      });

      setSuccess('Book submitted for admin review.');
      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        file_url: '',
        cover_url: '',
      });
      await fetchSubmissions();
    } catch (err) {
      const validationError = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : '';
      setError(validationError || err.response?.data?.message || 'Submission failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bookshelf">
      <div className="page-header">
        <div className="page-title">
          <h1>Publisher Bookshelf</h1>
          <p>Submit books for admin approval and track review status.</p>
        </div>
      </div>

      <div className="issue-modal" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add Book</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" className="form-control" value={formData.title} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input id="author" name="author" className="form-control" value={formData.author} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input id="price" name="price" type="number" min="0" step="0.01" className="form-control" value={formData.price} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows="3" className="form-control" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="file_url">File URL</label>
            <input id="file_url" name="file_url" className="form-control" placeholder="https://..." value={formData.file_url} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="cover_url">Cover URL</label>
            <input id="cover_url" name="cover_url" className="form-control" placeholder="https://..." value={formData.cover_url} onChange={handleChange} />
          </div>

          {error && <p className="issue-message issue-error">{error}</p>}
          {success && <p className="issue-message issue-success">{success}</p>}

          <div className="issue-modal-actions">
            <button className="btn btn-success" type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Book'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bookshelf-loading">Loading bookshelf...</div>
      ) : orderedSubmissions.length === 0 ? (
        <div className="empty-state">No submissions yet.</div>
      ) : (
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {orderedSubmissions.map((book) => {
              const status = statusConfig[book.status] || statusConfig.pending;
              return (
                <tr key={book.id} className="book-row">
                  <td className="book-title-cell">{book.title}</td>
                  <td className="book-author-cell">{book.author}</td>
                  <td className="book-price-cell">${Number(book.price || 0).toFixed(2)}</td>
                  <td className="book-status-cell">
                    <span className={`book-status ${status.className}`}>
                      {status.icon} {status.label}
                    </span>
                  </td>
                  <td>{book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Bookshelf;
