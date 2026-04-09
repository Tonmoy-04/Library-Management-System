import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { readerPortalAPI } from '../../services/api';
import '../../styles/reader.css';

const ReaderBookDetails = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const progressPayload = useMemo(() => ({
    progress_percent: Math.min(100, Math.max(0, Number(book?.progress_percent || 0))),
    current_page: Number(book?.current_page || 0),
    total_pages: Number(book?.total_pages || 0) || null,
  }), [book?.current_page, book?.progress_percent, book?.total_pages]);

  const fetchBook = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await readerPortalAPI.getBookDetails(bookId);
      setBook(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load book details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const runAction = async (action, successMessage) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(successMessage);
      await fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const addBookmark = () => runAction(
    () => readerPortalAPI.addBookmark({ book_id: Number(bookId), page_number: progressPayload.current_page || 1 }),
    'Bookmark saved.'
  );

  const purchase = () => runAction(() => readerPortalAPI.purchaseBook(bookId), 'Book purchased.');
  const download = () => runAction(() => readerPortalAPI.downloadBook(bookId), 'Download prepared.');
  const continueReading = () => runAction(() => readerPortalAPI.continueReading(bookId), 'Continue reading started.');

  const saveProgress = () => runAction(
    () => readerPortalAPI.saveProgress(bookId, progressPayload),
    'Progress updated.'
  );

  if (loading) {
    return <div className="card"><div className="card-body">Loading book details...</div></div>;
  }

  if (!book) {
    return (
      <div className="card">
        <div className="card-body">
          <p>Book details are unavailable.</p>
          <Link to="/reader/home" className="btn btn-secondary">Back to Reader Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-details-page">
      <div className="page-header">
        <div className="page-title">
          <h1>{book.title}</h1>
          <p>{book.author || 'Unknown author'} • {book.category || 'General'} • Rating {Number(book.rating || 0).toFixed(1)}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/reader/home')}>
          Back
        </button>
      </div>

      {error && <p className="issue-message issue-error">{error}</p>}
      {message && <p className="issue-message issue-success">{message}</p>}

      <section className="reader-details-grid">
        <div className="card">
          <div className="card-body">
            <div className="reader-book-cover reader-details-cover" aria-hidden="true">
              {book.cover_image_url ? <img src={book.cover_image_url} alt={book.title} /> : <span>{book.title?.slice(0, 1) || 'B'}</span>}
            </div>
            <p className="mt-2">{book.description || 'No description available for this book yet.'}</p>
            <p className="mt-2"><strong>Price:</strong> ${Number(book.price || 0).toFixed(2)}</p>
            <p className="mt-2"><strong>Publisher:</strong> {book.publisher || 'N/A'}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Reader Actions</h3></div>
          <div className="card-body reader-detail-actions">
            {Number(book.is_purchased) === 1 ? (
              <>
                <button type="button" className="btn btn-primary" onClick={download} disabled={saving}>Download</button>
                <button type="button" className="btn btn-success" onClick={continueReading} disabled={saving}>Continue Reading</button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={purchase} disabled={saving}>Purchase</button>
            )}

            <button type="button" className="btn btn-secondary" onClick={addBookmark} disabled={saving}>Bookmark</button>
            <button type="button" className="btn btn-secondary" onClick={saveProgress} disabled={saving}>Save Progress</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReaderBookDetails;
