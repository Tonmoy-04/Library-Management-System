import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readerPortalAPI } from '../../services/api';
import '../../styles/reader.css';

const TABS = [
  { key: 'all', label: 'All Books' },
  { key: 'purchased', label: 'Purchased Books' },
  { key: 'bookmarked', label: 'Bookmarked Books' },
];

const MyLibrary = () => {
  const [collections, setCollections] = useState({ all: [], bookmarked: [], purchased: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCollections = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await readerPortalAPI.getMyLibrary();
      const data = response.data?.data || {};

      const bookmarked = data.bookmarked || [];
      const purchased = data.purchased || [];

      const allMap = new Map();
      [...bookmarked, ...purchased].forEach((book) => {
        const id = Number(book.id);
        const existing = allMap.get(id);

        if (!existing) {
          allMap.set(id, {
            ...book,
            library_statuses: Array.from(new Set(book.library_statuses || [])),
          });
          return;
        }

        allMap.set(id, {
          ...existing,
          ...book,
          library_statuses: Array.from(new Set([
            ...(existing.library_statuses || []),
            ...(book.library_statuses || []),
          ])),
        });
      });

      setCollections({
        all: Array.from(allMap.values()),
        bookmarked,
        purchased,
      });
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

  const statusLabel = (book, status) => {
    if (status === 'purchased') {
      return 'Purchased';
    }

    if (status === 'bookmarked') {
      return 'Bookmarked';
    }

    const statuses = new Set(book.library_statuses || []);
    const hasPurchased = statuses.has('purchased');
    const hasBookmarked = statuses.has('bookmarked');

    if (hasPurchased && hasBookmarked) {
      return 'Purchased + Bookmarked';
    }
    if (hasPurchased) {
      return 'Purchased';
    }
    if (hasBookmarked) {
      return 'Bookmarked';
    }

    return 'Engaged';
  };

  const renderBooksTable = (rows, status) => (
    <div className="reader-table-wrap">
      <table className="reader-books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((book) => {
            const statuses = new Set(book.library_statuses || []);
            const canRemoveBookmark = status === 'bookmarked' || (status === 'all' && statuses.has('bookmarked'));

            return (
            <tr key={`${status}-${book.id}`}>
              <td data-label="Title">
                <div className="reader-title-cell">
                  <strong className="reader-title-main">{book.title}</strong>
                  <span className="reader-title-sub">{book.isbn ? `ISBN ${book.isbn}` : 'Digital Edition'}</span>
                </div>
              </td>
              <td data-label="Author">{book.author || 'Unknown author'}</td>
              <td data-label="Category">{book.category || 'General'}</td>
              <td data-label="Price">${Number(book.price || 0).toFixed(2)}</td>
              <td data-label="Status">
                <span className={`reader-status-chip ${statusLabel(book, status).includes('Purchased') ? 'purchased' : 'available'}`}>
                  {statusLabel(book, status)}
                </span>
              </td>
              <td data-label="Actions">
                <div className="reader-table-actions">
                  <Link to={`/reader/books/${book.id}`} className="btn btn-secondary">Details</Link>
                  {canRemoveBookmark && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeStatus(book.id, 'bookmarked')}
                      disabled={actionLoading}
                    >
                      Remove Bookmark
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );

  const activeBooks = collections[activeTab] || [];

  return (
    <div className="reader-library-page">
      <div className="page-header reader-page-header">
        <div className="page-title">
          <h1>My Library</h1>
          <p>Manage all engaged books, including purchased and bookmarked titles.</p>
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
        <section className="card reader-section">
          <div className="card-header reader-section-header"><h3>{activeTab === 'all' ? 'All Engaged Books' : activeTab === 'purchased' ? 'Purchased Books' : 'Bookmarked Books'}</h3></div>
          <div className="card-body">
            {renderBooksTable(activeBooks, activeTab)}
          </div>
        </section>
      )}
    </div>
  );
};

export default MyLibrary;
