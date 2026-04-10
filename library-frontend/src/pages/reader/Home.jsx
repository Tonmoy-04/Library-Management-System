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
    dashboard,
    books,
    actionLoading,
    error,
    continueReading,
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

    </div>
  );
};

export default ReaderHome;