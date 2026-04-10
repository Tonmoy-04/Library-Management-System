import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { readerPortalAPI } from '../../services/api';
import '../../styles/reader.css';

const DEFAULT_FILTERS = {
  search: '',
  author: '',
  category: '',
};

const Library = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadLibrary = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const response = await readerPortalAPI.getLibrary(nextFilters);
      setBooks(response.data?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load the library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const values = new Set(['All']);
    books.forEach((book) => {
      if (book.category) {
        values.add(book.category);
      }
    });
    return Array.from(values);
  }, [books]);

  const summary = useMemo(() => {
    const saved = books.filter((book) => Number(book.is_saved) === 1).length;
    const bookmarked = books.filter((book) => Number(book.is_bookmarked) === 1).length;
    const purchased = books.filter((book) => Number(book.is_purchased) === 1).length;
    const reading = books.filter((book) => Number(book.is_reading) === 1).length;

    return {
      catalog: books.length,
      saved,
      bookmarked,
      purchased,
      reading,
    };
  }, [books]);

  const handleFilterChange = (field) => (event) => {
    const { value } = event.target;
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loadLibrary(filters);
  };

  const withAction = async (callback, successMessage) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      await callback();
      setMessage(successMessage);
      await loadLibrary(filters);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = (bookId) => withAction(
    () => readerPortalAPI.saveBook(bookId),
    'Book saved to your library.'
  );

  const handleBookmark = (book) => withAction(
    () => readerPortalAPI.addBookmark({ book_id: Number(book.id), page_number: 1, note: '' }),
    'Book bookmarked.'
  );

  const handleBuy = (bookId) => withAction(
    () => readerPortalAPI.purchaseBook(bookId),
    'Book purchased.'
  );

  const handleAddToLibrary = (book) => withAction(
    () => readerPortalAPI.continueReading(book.id),
    'Book added to My Library.'
  );

  return (
    <div className="reader-library-page">
      <div className="page-header reader-page-header">
        <div className="page-title">
          <h1>Library</h1>
          <p>
            Browse the full catalog and manage your personal reading state.
            {user?.name ? ` Signed in as ${user.name}.` : ''}
          </p>
        </div>
        <Link to="/reader/my-library" className="btn btn-secondary">
          Open My Library
        </Link>
      </div>

      <section className="reader-summary-grid" aria-label="Library summary">
        <article className="reader-summary-card">
          <p className="reader-summary-label">Catalog</p>
          <h3>{summary.catalog}</h3>
          <small>Books available to readers</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Saved</p>
          <h3>{summary.saved}</h3>
          <small>Books you marked for later</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Bookmarked</p>
          <h3>{summary.bookmarked}</h3>
          <small>Books with saved positions</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Purchased</p>
          <h3>{summary.purchased}</h3>
          <small>Titles already in your collection</small>
        </article>
      </section>

      {error && <p className="issue-message issue-error">{error}</p>}
      {message && <p className="issue-message issue-success">{message}</p>}

      <form className="reader-filter-grid reader-library-filters" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Search titles, authors, or ISBN"
          value={filters.search}
          onChange={handleFilterChange('search')}
        />
        <input
          type="text"
          placeholder="Filter by author"
          value={filters.author}
          onChange={handleFilterChange('author')}
        />
        <select value={filters.category} onChange={handleFilterChange('category')}>
          {categories.map((category) => (
            <option key={category} value={category === 'All' ? '' : category}>
              {category}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="reader-library-toolbar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFilters(DEFAULT_FILTERS);
            loadLibrary(DEFAULT_FILTERS);
          }}
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div className="card reader-section">
          <div className="card-body">Loading library...</div>
        </div>
      ) : books.length === 0 ? (
        <div className="card reader-section">
          <div className="card-body">
            <p className="reader-empty">No books found in the library.</p>
          </div>
        </div>
      ) : (
        <div className="reader-catalog-grid">
          {books.map((book) => {
            const isSaved = Number(book.is_saved) === 1;
            const isBookmarked = Number(book.is_bookmarked) === 1;
            const isPurchased = Number(book.is_purchased) === 1;
            const isReading = Number(book.is_reading) === 1;
            const canAddToLibrary = isPurchased || isReading;

            return (
              <article key={book.id} className="reader-book-card reader-library-card">
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
                    <span>Rating {Number(book.rating || 0).toFixed(1)}</span>
                  </p>

                  <p className="reader-library-description">
                    {book.description || 'No description available for this title yet.'}
                  </p>

                  <div className="reader-status-pills">
                    <span className={`reader-status-pill ${isSaved ? 'active' : ''}`}>Save</span>
                    <span className={`reader-status-pill ${isBookmarked ? 'active' : ''}`}>Bookmark</span>
                    <span className={`reader-status-pill ${isPurchased ? 'active' : ''}`}>Purchased</span>
                    <span className={`reader-status-pill ${isReading ? 'active' : ''}`}>Reading</span>
                  </div>

                  <div className="reader-book-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleSave(book.id)}
                      disabled={actionLoading || isSaved}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleBookmark(book)}
                      disabled={actionLoading || isBookmarked}
                    >
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    {canAddToLibrary ? (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => handleAddToLibrary(book)}
                        disabled={actionLoading}
                      >
                        Add to My Library
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleBuy(book.id)}
                        disabled={actionLoading}
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Library;
