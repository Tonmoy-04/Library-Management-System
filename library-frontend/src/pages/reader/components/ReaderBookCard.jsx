import React from 'react';
import { Link } from 'react-router-dom';

const ReaderBookCard = ({
  book,
  onPurchase,
  onDownload,
  onToggleBookmark,
  onContinue,
  actionLoading,
}) => {
  const canContinue = Number(book.progress_percent || 0) > 0;

  return (
    <article className="reader-book-card">
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
          <button
            type="button"
            className={`bookmark-toggle ${Number(book.is_bookmarked) === 1 ? 'active' : ''}`}
            onClick={() => onToggleBookmark(book)}
            disabled={actionLoading}
            title={Number(book.is_bookmarked) === 1 ? 'Remove bookmark' : 'Bookmark book'}
          >
            {Number(book.is_bookmarked) === 1 ? 'Saved' : 'Save'}
          </button>
        </div>

        <p className="reader-book-meta">
          <span>{book.author || 'Unknown author'}</span>
          <span>{book.category || 'General'}</span>
          <span>${Number(book.price || 0).toFixed(2)}</span>
          <span>Rating {Number(book.rating || 0).toFixed(1)}</span>
        </p>

        <div className="reader-book-progress-row">
          <div className="reader-book-progress-bar">
            <div style={{ width: `${Math.max(0, Math.min(100, Number(book.progress_percent || 0)))}%` }} />
          </div>
          <span>{Number(book.progress_percent || 0).toFixed(0)}%</span>
        </div>

        <div className="reader-book-actions">
          <Link to={`/reader/books/${book.id}`} className="btn btn-secondary">Details</Link>

          {Number(book.is_purchased) === 1 ? (
            <>
              <button type="button" className="btn btn-primary" onClick={() => onDownload(book.id)} disabled={actionLoading}>
                Download
              </button>
              {canContinue && (
                <button type="button" className="btn btn-success" onClick={() => onContinue(book.id)} disabled={actionLoading}>
                  Continue Reading
                </button>
              )}
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => onPurchase(book.id)} disabled={actionLoading}>
              Purchase
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ReaderBookCard;
