import React, { useEffect, useState } from 'react';
import '../styles/Feedback.css';
import { publisherAPI } from '../../../services/api';

const Feedback = ({ publisherId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedbacks();
  }, [publisherId, filterStatus]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await publisherAPI.getFeedback(publisherId, { status: filterStatus });
      setFeedbacks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      setReplyError('Please enter a reply message');
      return;
    }

    if (!selectedFeedback) {
      setReplyError('No feedback selected');
      return;
    }

    setSendingReply(true);
    setReplyError('');
    setReplySuccess('');

    try {
      await publisherAPI.replyToFeedback(selectedFeedback.id, {
        reply: replyText,
      });

      setReplySuccess('Reply sent successfully!');
      setReplyText('');

      // Update the selected feedback
      setSelectedFeedback({
        ...selectedFeedback,
        reply: replyText,
        replied_at: new Date(),
      });

      // Refresh feedbacks
      setTimeout(() => {
        fetchFeedbacks();
        setSelectedFeedback(null);
      }, 1500);
    } catch (err) {
      setReplyError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleMarkAsResolved = async (feedbackId) => {
    try {
      await publisherAPI.updateFeedbackStatus(feedbackId, { status: 'resolved' });
      fetchFeedbacks();
      setSelectedFeedback(null);
    } catch (err) {
      setError('Failed to update feedback status');
    }
  };

  const getSortedFeedbacks = () => {
    const sorted = [...feedbacks];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'rating-high':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating-low':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      default:
        return sorted;
    }
  };

  if (loading) {
    return <div className="feedback-loading">Loading feedback...</div>;
  }

  const sortedFeedbacks = getSortedFeedbacks();

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2>💬 Reader Feedback</h2>
        <p>Engage with your readers and respond to their feedback</p>
      </div>

      <div className="feedback-controls">
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Feedback</option>
            <option value="pending">Pending Reply</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={fetchFeedbacks}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="feedback-layout">
        <div className="feedback-list">
          {sortedFeedbacks.length === 0 ? (
            <div className="empty-state">
              <p>📭 No feedback available yet</p>
            </div>
          ) : (
            sortedFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className={`feedback-item ${selectedFeedback?.id === feedback.id ? 'active' : ''}`}
                onClick={() => setSelectedFeedback(feedback)}
              >
                <div className="feedback-item-header">
                  <h4>{feedback.reader_name}</h4>
                  <div className="rating">
                    {'⭐'.repeat(feedback.rating || 0)}
                    {'☆'.repeat(5 - (feedback.rating || 0))}
                  </div>
                </div>

                <p className="feedback-book">{feedback.book_title}</p>
                <p className="feedback-text">{feedback.comment?.substring(0, 100)}...</p>

                <div className="feedback-item-footer">
                  <span className={`status-badge ${feedback.status}`}>
                    {feedback.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}
                  </span>
                  <span className="feedback-date">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedFeedback && (
          <div className="feedback-detail">
            <div className="detail-header">
              <h3>Feedback Detail</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedFeedback(null)}
              >
                ✕
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h4>Reader</h4>
                <p>{selectedFeedback.reader_name}</p>
              </div>

              <div className="detail-section">
                <h4>Book</h4>
                <p>{selectedFeedback.book_title}</p>
              </div>

              <div className="detail-section">
                <h4>Rating</h4>
                <div className="rating-display">
                  {'⭐'.repeat(selectedFeedback.rating || 0)}
                  {'☆'.repeat(5 - (selectedFeedback.rating || 0))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Feedback</h4>
                <p className="feedback-text-full">{selectedFeedback.comment}</p>
              </div>

              <div className="detail-section">
                <h4>Date</h4>
                <p>{new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>

              {selectedFeedback.reply && (
                <div className="detail-section reply-section">
                  <h4>Your Reply</h4>
                  <p className="reply-text">{selectedFeedback.reply}</p>
                  <p className="reply-date">Replied: {new Date(selectedFeedback.replied_at).toLocaleString()}</p>
                </div>
              )}

              {!selectedFeedback.reply && selectedFeedback.status !== 'resolved' && (
                <div className="reply-box">
                  <h4>Send a Reply</h4>
                  {replyError && <div className="error-message">{replyError}</div>}
                  {replySuccess && <div className="success-message">{replySuccess}</div>}

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply here..."
                    rows="4"
                    disabled={sendingReply}
                  />

                  <div className="reply-actions">
                    <button
                      className="btn-reply"
                      onClick={handleReply}
                      disabled={sendingReply}
                    >
                      {sendingReply ? 'Sending...' : '💬 Send Reply'}
                    </button>

                    <button
                      className="btn-resolve"
                      onClick={() => handleMarkAsResolved(selectedFeedback.id)}
                      disabled={sendingReply}
                    >
                      ✅ Mark as Resolved
                    </button>
                  </div>
                </div>
              )}

              {selectedFeedback.status === 'resolved' && (
                <div className="resolved-badge">
                  ✅ This feedback has been resolved
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
