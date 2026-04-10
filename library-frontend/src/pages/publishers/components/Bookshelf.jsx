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
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Books');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    pdf: null,
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
    let list = [...submissions];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'All Books') {
      const statusKey = filterStatus.toLowerCase();
      list = list.filter(book => book.status === statusKey);
    }

    // Sort by creation date
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return list;
  }, [submissions, searchQuery, filterStatus]);

  const handleChange = (event) => {
    const { name, value, type, files } = event.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const openModal = () => {
    setError('');
    setSuccess('');
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      pdf: null,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
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
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('author', formData.author.trim());
      payload.append('description', formData.description.trim() || '');
      payload.append('price', Number(formData.price));
      if (formData.pdf) {
        payload.append('pdf', formData.pdf);
      }

      await publisherAPI.submitBookToBookshelf(publisherId, payload);

      setSuccess('Book submitted for admin review.');
      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        pdf: null,
      });
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
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
      {/* Page Header */}
      <div className="bookshelf-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📚 Bookshelf</h1>
            <p>Manage your published books</p>
          </div>
          <div className="header-controls">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by title or author..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="filter-dropdown"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>All Books</option>
              <option>Pending</option>
              <option>Accepted</option>
              <option>Declined</option>
            </select>
            <button className="btn-add-book" onClick={openModal}>
              ➕ Add New Book
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Book</h2>
              <button 
                className="modal-close" 
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="book-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input 
                    id="title" 
                    name="title" 
                    className="form-control" 
                    value={formData.title} 
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input 
                    id="author" 
                    name="author" 
                    className="form-control" 
                    value={formData.author} 
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (BDT) *</label>
                  <input 
                    id="price" 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="1" 
                    className="form-control" 
                    value={formData.price} 
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pdf">PDF Upload *</label>
                  <input 
                    id="pdf" 
                    name="pdf" 
                    type="file" 
                    accept=".pdf"
                    className="form-control" 
                    onChange={handleChange}
                    disabled={saving}
                    required
                  />
                  {formData.pdf && <p className="file-name">📄 {formData.pdf.name}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows="4" 
                  className="form-control" 
                  value={formData.description} 
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Tell readers about your book..."
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                >
                  {saving ? 'Submitting...' : 'Submit Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your bookshelf...</p>
        </div>
      ) : orderedSubmissions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p className="empty-message">You haven't published any books yet.</p>
          <button className="btn-add-first" onClick={openModal}>
            ➕ Add Your First Book
          </button>
        </div>
      ) : (
        <div className="books-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {orderedSubmissions.map((book) => {
                const status = statusConfig[book.status] || statusConfig.pending;
                return (
                  <tr key={book.id} className="book-row">
                    <td className="book-cell book-title">{book.title}</td>
                    <td className="book-cell book-author">{book.author}</td>
                    <td className="book-cell book-price">${Number(book.price || 0).toFixed(2)}</td>
                    <td className="book-cell book-status">
                      <span className={`status-badge status-${status.className}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="book-cell book-date">
                      {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookshelf;
