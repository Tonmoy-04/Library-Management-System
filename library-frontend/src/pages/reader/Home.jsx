import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useReaderDashboard from '../../hooks/useReaderDashboard';
import { Link } from 'react-router-dom';
import ReadingProgressList from './components/ReadingProgressList';
import RecentReads from './components/RecentReads';
import '../../styles/reader.css';

const ReaderHome = () => {
  const { user } = useAuth();
  const {
    filters,
    updateFilters,
    searchBooks,
    dashboard,
    books,
    categories,
    loading,
    actionLoading,
    error,
    purchaseBook,
    downloadBook,
    continueReading,
    addBookmark,
    removeBookmark,
  } = useReaderDashboard();

  const purchasedBooks = dashboard?.purchased_books || [];
  const readingProgress = dashboard?.reading_progress || [];
  const recentReads = dashboard?.recent_reads || [];
  const activityCount = dashboard?.activity?.length || 0;

  const purchasedById = useMemo(() => {
    const map = new Map();
    purchasedBooks.forEach((book) => map.set(Number(book.id), book));
    return map;
  }, [purchasedBooks]);

  const mergedBooks = useMemo(() => books.map((book) => {
    const purchased = purchasedById.get(Number(book.id));
    if (!purchased) {
      return book;
    }
    return {
      ...book,
      ...purchased,
      is_purchased: 1,
    };
  }), [books, purchasedById]);

  const summary = useMemo(() => {
    const averageProgress = readingProgress.length === 0
      ? 0
      : readingProgress.reduce((total, row) => total + Number(row.progress_percent || 0), 0) / readingProgress.length;

    const bookmarkedCount = mergedBooks.filter((book) => Number(book.is_bookmarked) === 1).length;

    return {
      purchasedCount: purchasedBooks.length,
      totalBooks: mergedBooks.length,
      bookmarkedCount,
      averageProgress,
    };
  }, [mergedBooks, purchasedBooks, readingProgress]);

  const sectionCards = useMemo(() => ([
    {
      path: '/reader/library',
      label: 'Library',
      value: summary.totalBooks,
      description: 'Browse the full catalog, save titles, bookmark pages, or buy a book.',
    },
    {
      path: '/reader/my-library',
      label: 'My Library',
      value: summary.purchasedCount + summary.bookmarkedCount,
      description: 'Review saved, bookmarked, purchased, and reading books in one place.',
    },
    {
      path: '/reader/history',
      label: 'History',
      value: activityCount,
      description: 'Check recent transactions and purchase history at a glance.',
    },
  ]), [activityCount, summary.bookmarkedCount, summary.purchasedCount, summary.totalBooks]);

  const filteredBooks = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const authorTerm = filters.author.trim().toLowerCase();
    const categoryTerm = filters.category.trim().toLowerCase();

    return mergedBooks.filter((book) => {
      const title = String(book.title || '').toLowerCase();
      const author = String(book.author || '').toLowerCase();
      const category = String(book.category || 'general').toLowerCase();

      const matchesSearch = searchTerm === ''
        || title.includes(searchTerm)
        || author.includes(searchTerm)
        || String(book.description || '').toLowerCase().includes(searchTerm)
        || String(book.isbn || '').toLowerCase().includes(searchTerm);

      const matchesAuthor = authorTerm === '' || author.includes(authorTerm);
      const matchesCategory = categoryTerm === '' || category.includes(categoryTerm);

      return matchesSearch && matchesAuthor && matchesCategory;
    });
  }, [filters.author, filters.category, filters.search, mergedBooks]);

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
            const progress = Math.max(0, Math.min(100, Number(book.progress_percent || 0)));
            const isPurchased = Number(book.is_purchased) === 1;
            const isBookmarked = Number(book.is_bookmarked) === 1;
            const canContinue = progress > 0;

            return (
              <tr key={book.id}>
                <td data-label="Title">
                  <div className="reader-title-cell">
                    <strong className="reader-title-main">{book.title}</strong>
                    <span className="reader-title-sub">{book.isbn ? `ISBN ${book.isbn}` : 'Digital Edition'}</span>
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
                  <span className={`reader-status-chip ${isPurchased ? 'purchased' : 'available'}`}>
                    {isPurchased ? 'Purchased' : 'Available'}
                  </span>
                </td>
                <td data-label="Actions">
                  <div className="reader-table-actions">
                    <Link to={`/reader/books/${book.id}`} className="btn btn-secondary">Details</Link>

                    {isPurchased ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => downloadBook(book.id)}
                          disabled={actionLoading}
                        >
                          Download
                        </button>
                        {canContinue && (
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => continueReading(book.id)}
                            disabled={actionLoading}
                          >
                            Continue
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => purchaseBook(book.id)}
                        disabled={actionLoading}
                      >
                        Purchase
                      </button>
                    )}

                    <button
                      type="button"
                      className={`bookmark-toggle ${isBookmarked ? 'active' : ''}`}
                      onClick={() => handleToggleBookmark(book)}
                      disabled={actionLoading}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark book'}
                    >
                      {isBookmarked ? 'Saved' : 'Save'}
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

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    await searchBooks(filters);
  };

  const handleToggleBookmark = async (book) => {
    if (Number(book.is_bookmarked) === 1 && Number(book.bookmark_id) > 0) {
      await removeBookmark(book.bookmark_id);
      return;
    }

    await addBookmark({
      book_id: Number(book.id),
      page_number: Number(book.current_page || 1),
      note: '',
    });
  };

  return (
    <div className="reader-dashboard-page">
      <div className="page-header reader-page-header">
        <div className="page-title">
          <h1>Reader Dashboard</h1>
          <p>Welcome{user?.name ? `, ${user.name}` : ''}. Track purchases, continue reading, and manage bookmarks in one place.</p>
        </div>
      </div>

      <section className="reader-summary-grid" aria-label="Reader summary">
        <article className="reader-summary-card">
          <p className="reader-summary-label">Purchased Books</p>
          <h3>{summary.purchasedCount}</h3>
          <small>Books you own in your library</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Available Catalog</p>
          <h3>{summary.totalBooks}</h3>
          <small>Total books currently visible</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Saved Bookmarks</p>
          <h3>{summary.bookmarkedCount}</h3>
          <small>Quick-return saved positions</small>
        </article>
        <article className="reader-summary-card">
          <p className="reader-summary-label">Average Progress</p>
          <h3>{summary.averageProgress.toFixed(0)}%</h3>
          <small>Across your active reads</small>
        </article>
      </section>

      <section className="reader-section reader-sections-panel">
        <div className="card-header reader-section-header">
          <h3>Reader Sections</h3>
        </div>
        <div className="card-body reader-sections-grid">
          {sectionCards.map((section) => (
            <Link key={section.path} to={section.path} className="reader-summary-card reader-summary-link">
              <p className="reader-summary-label">{section.label}</p>
              <h3>{section.value}</h3>
              <small>{section.description}</small>
            </Link>
          ))}
        </div>
      </section>

      {error && <p className="issue-message issue-error">{error}</p>}

      <section className="card reader-section">
        <div className="card-header reader-section-header"><h3>Purchased Books</h3></div>
        <div className="card-body">
          {purchasedBooks.length === 0 ? (
            <p className="reader-empty">No purchases yet. Browse books below to buy your first title.</p>
          ) : (
            renderBooksTable(purchasedBooks.map((book) => ({ ...book, is_purchased: 1 })))
          )}
        </div>
      </section>

      <section className="reader-mid-grid">
        <article className="card reader-section">
          <div className="card-header reader-section-header"><h3>Reading Progress</h3></div>
          <div className="card-body">
            <ReadingProgressList
              progressRows={readingProgress}
              onContinue={continueReading}
              actionLoading={actionLoading}
            />
          </div>
        </article>

        <article className="card reader-section">
          <div className="card-header reader-section-header"><h3>Recent Reads</h3></div>
          <div className="card-body">
            <RecentReads reads={recentReads} />
          </div>
        </article>
      </section>

      <section className="card reader-section" id="browse-books">
        <div className="card-header reader-section-header"><h3>Books Table</h3></div>
        <div className="card-body">
          <form className="reader-filter-grid" onSubmit={handleFilterSubmit}>
            <input
              type="text"
              placeholder="Search by title or keyword"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by author"
              value={filters.author}
              onChange={(e) => updateFilters({ author: e.target.value })}
            />
            <select
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value === 'All' ? '' : e.target.value })}
            >
              {categories.map((category) => (
                <option key={category} value={category === 'All' ? '' : category}>{category}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" disabled={loading || actionLoading}>Apply</button>
          </form>

          {loading ? (
            <p className="reader-empty">Loading books...</p>
          ) : filteredBooks.length === 0 ? (
            <p className="reader-empty">No books matched your filters.</p>
          ) : (
            renderBooksTable(filteredBooks)
          )}
        </div>
      </section>
    </div>
  );
};

export default ReaderHome;