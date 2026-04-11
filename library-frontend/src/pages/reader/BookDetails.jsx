import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { readerPortalAPI } from '../../services/api';
import '../../styles/reader.css';

const ReaderBookDetails = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [feedbackSaving, setFeedbackSaving] = useState(false);

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

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const response = await readerPortalAPI.getBookFeedback(bookId);
      const data = response.data?.data || {};
      setFeedbackItems(data.items || []);

      if (data.my_feedback) {
        setFeedbackForm({
          rating: Number(data.my_feedback.rating || 5),
          comment: data.my_feedback.comment || '',
        });
      }
    } catch (err) {
      // Keep page usable even when feedback API is unavailable.
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [bookId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenPdf = params.get('openPdf') === '1';

    if (shouldOpenPdf && Number(book?.is_purchased) === 1 && book?.pdf_url) {
      setShowPdfViewer(true);
    }
  }, [location.search, book]);

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
  const download = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await readerPortalAPI.downloadBook(bookId);
      const downloadUrl = response.data?.data?.download_url || book?.pdf_url;

      if (!downloadUrl) {
        setError('No downloadable PDF is available for this book.');
        return;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${(book?.title || 'book').replace(/[^a-z0-9]+/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage('Download started.');
      await fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed.');
    } finally {
      setSaving(false);
    }
  };
  const continueReading = () => runAction(() => readerPortalAPI.continueReading(bookId), 'Continue reading started.');

  const saveProgress = () => runAction(
    () => readerPortalAPI.saveProgress(bookId, progressPayload),
    'Progress updated.'
  );

  const submitFeedback = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (Number(book?.is_purchased) !== 1) {
      setError('Please purchase the book before submitting rating and feedback.');
      return;
    }

    if (!feedbackForm.comment.trim()) {
      setError('Please write feedback before submitting.');
      return;
    }

    setFeedbackSaving(true);
    try {
      await readerPortalAPI.submitBookFeedback(bookId, {
        rating: Number(feedbackForm.rating || 5),
        comment: feedbackForm.comment.trim(),
      });
      setMessage('Thanks! Your rating and feedback were submitted.');
      await Promise.all([fetchBook(), fetchFeedback()]);
    } catch (err) {
      const validationMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : '';
      setError(validationMessage || err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSaving(false);
    }
  };

  if (loading) {
    return <div className="card"><div className="card-body">Loading book details...</div></div>;
  }

  if (!book) {
    return (
      <div className="card">
        <div className="card-body">
          <p>Book details are unavailable.</p>
          <Link to="/reader/home" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-details-page">
      <div className="page-header reader-page-header">
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
        <div className="card reader-detail-card">
          <div className="card-body reader-detail-summary">
            <div className="reader-book-cover reader-details-cover" aria-hidden="true">
              {book.cover_image_url ? <img src={book.cover_image_url} alt={book.title} /> : <span>{book.title?.slice(0, 1) || 'B'}</span>}
            </div>
            <div className="reader-detail-copy">
              <div className="reader-status-pills reader-detail-pills">
                <span className="reader-status-pill active">{book.is_purchased ? 'Purchased' : 'Preview Only'}</span>
                {book.pdf_url && <span className="reader-status-pill">PDF Ready</span>}
                <span className="reader-status-pill">{book.category || 'General'}</span>
              </div>
              <p className="reader-library-description">{book.description || 'No description available for this book yet.'}</p>
              <div className="reader-detail-metadata">
                <div>
                  <span>Price</span>
                  <strong>${Number(book.price || 0).toFixed(2)}</strong>
                </div>
                <div>
                  <span>Publisher</span>
                  <strong>{book.publisher || 'N/A'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card reader-detail-actions-card">
          <div className="card-header"><h3>Reader Actions</h3></div>
          <div className="card-body reader-detail-actions">
            {Number(book.is_purchased) === 1 ? (
              <>
                <button type="button" className="btn btn-primary" onClick={download} disabled={saving}>Download</button>
                <button type="button" className="btn btn-success" onClick={continueReading} disabled={saving}>Continue Reading</button>
                {book.pdf_url && (
                  <button type="button" className="btn btn-info reader-pdf-button" onClick={() => setShowPdfViewer(true)}>Read PDF</button>
                )}
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={purchase} disabled={saving}>Purchase</button>
            )}

            <button type="button" className="btn btn-secondary" onClick={addBookmark} disabled={saving}>Bookmark</button>
            <button type="button" className="btn btn-secondary" onClick={saveProgress} disabled={saving}>Save Progress</button>
          </div>
        </div>
      </section>

      <section className="reader-feedback-grid">
        <div className="card reader-feedback-card">
          <div className="card-header"><h3>Rate & Share Feedback</h3></div>
          <div className="card-body">
            <form className="reader-feedback-form" onSubmit={submitFeedback}>
              <div className="form-group">
                <label htmlFor="reader_rating">Your Rating</label>
                <select
                  id="reader_rating"
                  className="form-control"
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                  disabled={feedbackSaving || Number(book?.is_purchased) !== 1}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reader_comment">Your Feedback</label>
                <textarea
                  id="reader_comment"
                  rows={4}
                  className="form-control"
                  placeholder="Share what you liked or what can be improved..."
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                  disabled={feedbackSaving || Number(book?.is_purchased) !== 1}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={feedbackSaving || Number(book?.is_purchased) !== 1}
              >
                {feedbackSaving ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        <div className="card reader-feedback-list-card">
          <div className="card-header"><h3>Reader Feedback</h3></div>
          <div className="card-body reader-feedback-list">
            {feedbackLoading ? (
              <p className="reader-empty">Loading feedback...</p>
            ) : feedbackItems.length === 0 ? (
              <p className="reader-empty">No feedback yet for this book.</p>
            ) : (
              feedbackItems.map((item) => (
                <article key={item.id} className="reader-feedback-item">
                  <div className="reader-feedback-head">
                    <strong>{item.reader_name || 'Reader'}</strong>
                    <span>{'★'.repeat(Math.max(1, Math.min(5, Number(item.rating || 0))))}</span>
                  </div>
                  <p>{item.comment}</p>
                  {item.reply && (
                    <div className="reader-feedback-reply">
                      <strong>Publisher Reply</strong>
                      <p>{item.reply}</p>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {showPdfViewer && book.pdf_url && (
        <div className="pdf-viewer-modal" onClick={() => setShowPdfViewer(false)}>
          <div className="pdf-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h3>{book.title}</h3>
              <button type="button" className="pdf-viewer-close" onClick={() => setShowPdfViewer(false)}>✕</button>
            </div>
            <div className="pdf-viewer-body">
              <iframe
                src={`${book.pdf_url}#toolbar=1&navpanes=0&scrollbar=1`}
                title={book.title}
                className="pdf-iframe"
              />
            </div>
            <div className="pdf-viewer-footer">
              <a href={book.pdf_url} download className="btn btn-primary">Download Copy</a>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPdfViewer(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderBookDetails;
