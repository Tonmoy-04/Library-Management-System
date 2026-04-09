import React from 'react';

const ReadingProgressList = ({ progressRows, onContinue, actionLoading }) => (
  <div className="reader-progress-list">
    {progressRows.length === 0 ? (
      <p className="reader-empty">No reading progress yet. Start a book to see it here.</p>
    ) : (
      progressRows.map((item) => (
        <div className="reader-progress-item" key={`${item.book_id}-${item.id}`}>
          <div className="reader-progress-header">
            <div>
              <h4>{item.title}</h4>
              <p>{item.author || 'Unknown author'}</p>
            </div>
            <span>{Number(item.progress_percent || 0).toFixed(0)}%</span>
          </div>

          <div className="reader-progress-bar">
            <div style={{ width: `${Math.max(0, Math.min(100, Number(item.progress_percent || 0)))}%` }} />
          </div>

          <button
            type="button"
            className="btn btn-success"
            onClick={() => onContinue(item.book_id)}
            disabled={actionLoading}
          >
            Continue Reading
          </button>
        </div>
      ))
    )}
  </div>
);

export default ReadingProgressList;
