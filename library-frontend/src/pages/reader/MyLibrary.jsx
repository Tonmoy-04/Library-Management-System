import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readerPortalAPI } from '../../services/api';
import '../../styles/reader.css';

const TABS = [
  { key: 'saved', label: 'Saved Books' },
  { key: 'bookmarked', label: 'Bookmarked Books' },
  { key: 'purchased', label: 'Purchased Books' },
  { key: 'reading', label: 'Currently Reading' },
];

const MyLibrary = () => {
  const [collections, setCollections] = useState({ saved: [], bookmarked: [], purchased: [], reading: [] });
  const [activeTab, setActiveTab] = useState('saved');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCollections = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await readerPortalAPI.getMyLibrary();
      setCollections(response.data?.data || { saved: [], bookmarked: [], purchased: [], reading: [] });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load your library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const summary = useMemo(() => TABS.map((tab) => ({
    ...tab,
    count: collections[tab.key]?.length || 0,
  })), [collections]);

  const runAction = async (callback, successMessage) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      await callback();
      setMessage(successMessage);
      await loadCollections();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const removeStatus = (bookId, status) => runAction(
    () => readerPortalAPI.removeLibraryStatus(bookId, status),
    'Library status removed.'
  );

  const markReading = (bookId) => runAction(
    () => readerPortalAPI.continueReading(bookId),
    'Marked as currently reading.'
  );

  const renderBookCard = (book, status) => {
    const isReading = Number(book.is_reading) === 1;
    const removeLabel = status === 'reading' ? 'Back to Purchased' : 'Remove';

    return (
      <article key={`${status}-${book.id}`} className="reader-book-card reader-library-card">
        <div className="reader-book-cover" aria-hidden="true">
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} loading="lazy" />
          ) : (
            <span>{book.title?.slice(0, 1) || 'B'}</span>
          )}
        </div>

        <div className="reader-book-content">
          <div className="reader-book-head">
            <h3>{book.title}</h3>
            <Link to={`/reader/books/${book.id}`} className="btn btn-secondary">
              Details
            </Link>
          </div>

          <p className="reader-book-meta">
            <span>{book.author || 'Unknown author'}</span>
            <span>{book.category || 'General'}</span>
            <span>${Number(book.price || 0).toFixed(2)}</span>
          </p>

          <div className="reader-status-pills">
            {(book.library_statuses || []).map((item) => (
              <span key={`${book.id}-${item}`} className={`reader-status-pill ${item === status ? 'active' : ''}`}>
                {item}
              </span>
            ))}
          </div>

          <div className="reader-book-actions">
            {status === 'purchased' && !isReading && (
              <button
                type="button"
                className="btn btn-success"
                onClick={() => markReading(book.id)}
                disabled={actionLoading}
              >
                Mark Reading
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => removeStatus(book.id, status)}
              disabled={actionLoading}
            >
              {removeLabel}
            </button>
          </div>
        </div>
      </article>
    );
  };

  const activeBooks = collections[activeTab] || [];

  return (
    <div className="reader-library-page">
      <div className="page-header reader-page-header">
        <div className="page-title">
          <h1>My Library</h1>
          <p>Manage the books you saved, bookmarked, purchased, or are currently reading.</p>
        </div>
        <Link to="/reader/library" className="btn btn-secondary">
          Back to Library
        </Link>
      </div>

      <section className="reader-summary-grid" aria-label="My Library summary">
        {summary.map((tab) => (
          <article key={tab.key} className="reader-summary-card">
            <p className="reader-summary-label">{tab.label}</p>
            <h3>{tab.count}</h3>
            <small>Books in this section</small>
          </article>
        ))}
      </section>

      {error && <p className="issue-message issue-error">{error}</p>}
      {message && <p className="issue-message issue-success">{message}</p>}

      <div className="reader-tab-bar" role="tablist" aria-label="My Library sections">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`reader-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span>{collections[tab.key]?.length || 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card reader-section">
          <div className="card-body">Loading your library...</div>
        </div>
      ) : activeBooks.length === 0 ? (
        <div className="card reader-section">
          <div className="card-body">
            <p className="reader-empty">No books in this section yet.</p>
          </div>
        </div>
      ) : (
        <div className="reader-catalog-grid">
          {activeBooks.map((book) => renderBookCard(book, activeTab))}
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
