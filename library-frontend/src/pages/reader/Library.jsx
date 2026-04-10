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
    const bookmarked = books.filter((book) => Number(book.is_bookmarked) === 1).length;
    const purchased = books.filter((book) => Number(book.is_purchased) === 1).length;

    return {
      catalog: books.length,
      bookmarked,
      purchased,
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

  const handleBookmark = (book) => withAction(
    () => readerPortalAPI.addBookmark({ book_id: Number(book.id), page_number: 1, note: '' }),
    'Book bookmarked.'
  );

  const handleBuy = (bookId) => withAction(
    () => readerPortalAPI.purchaseBook(bookId),
    'Book purchased.'
  );

  const renderBooksTable = (rows) => (
    <div className="reader-table-wrap">
      <table className="reader-books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((book) => {
            const isBookmarked = Number(book.is_bookmarked) === 1;
            const isPurchased = Number(book.is_purchased) === 1;
            const progress = Math.max(0, Math.min(100, Number(book.progress_percent || 0)));

            return (
              <tr key={book.id}>
                <td data-label="Title">
                  <div className="reader-title-cell">
                    {isPurchased ? (
                      <Link to={`/reader/books/${book.id}?openPdf=1`} className="reader-title-main">
                        {book.title}
                      </Link>
                    ) : (
                      <strong className="reader-title-main">{book.title}</strong>
                    )}
                    <span className="reader-title-sub">Digital Edition</span>
                  </div>
                </td>
                <td data-label="Author">{book.author || 'Unknown author'}</td>
                <td data-label="Category">{book.category || 'General'}</td>
                <td data-label="Price">${Number(book.price || 0).toFixed(2)}</td>
                <td data-label="Rating">{Number(book.rating || 0).toFixed(1)}</td>
                <td data-label="Progress">
                  <div className="reader-table-progress">
                    <div className="reader-book-progress-bar">
                      <div style={{ width: `${progress}%` }} />
                    </div>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                </td>
                <td data-label="Status">
                  <span className={`reader-status-chip ${isPurchased ? 'purchased' : isBookmarked ? 'purchased' : 'available'}`}>
                    {isPurchased ? 'Purchased' : isBookmarked ? 'Bookmarked' : 'Available'}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="reader-table-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleBookmark(book)}
                      disabled={actionLoading || isBookmarked}
                    >
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleBuy(book.id)}
                      disabled={actionLoading || isPurchased}
                    >
                      {isPurchased ? 'Purchased' : 'Buy'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
          placeholder="Search titles or authors"
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

      <section className="card reader-section" id="browse-books">
        <div className="card-header reader-section-header"><h3>Books Table</h3></div>
        <div className="card-body">
          {loading ? (
            <p className="reader-empty">Loading books...</p>
          ) : books.length === 0 ? (
            <p className="reader-empty">No books found in the library.</p>
          ) : (
            renderBooksTable(books)
          )}
        </div>
      </section>
    </div>
  );
};

export default Library;
