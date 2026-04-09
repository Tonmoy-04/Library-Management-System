import React, { useMemo, useState } from 'react';

const PREVIEW_COUNT = 4;

const RecentReads = ({ reads }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const previewRows = useMemo(() => reads.slice(0, PREVIEW_COUNT), [reads]);

  const renderRows = (rows) => rows.map((item) => {
    const progress = Math.max(0, Math.min(100, Number(item.progress_percent || 0)));
    const openedAt = item.occurred_at ? new Date(item.occurred_at).toLocaleString() : 'Unknown';

    return (
      <tr key={`${item.book_id}-${item.id}`}>
        <td data-label="Title">{item.title || 'Untitled book'}</td>
        <td data-label="Author">{item.author || 'Unknown author'}</td>
        <td data-label="Progress">
          <div className="reader-table-progress">
            <div className="reader-book-progress-bar">
              <div style={{ width: `${progress}%` }} />
            </div>
            <span>{progress.toFixed(0)}%</span>
          </div>
        </td>
        <td data-label="Last Opened">{openedAt}</td>
      </tr>
    );
  });

  const renderTable = (rows) => (
    <table className="reader-recent-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Progress</th>
          <th>Last Opened</th>
        </tr>
      </thead>
      <tbody>{renderRows(rows)}</tbody>
    </table>
  );

  return (
    <>
      <div className="reader-recent-panel">
        {reads.length === 0 ? (
          <p className="reader-empty">No recent reads yet.</p>
        ) : (
          renderTable(previewRows)
        )}
      </div>

      {reads.length > PREVIEW_COUNT && (
        <div className="reader-recent-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
            Show More
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          className="reader-modal-backdrop"
          role="presentation"
          onClick={() => setIsModalOpen(false)}
        >
          <section
            className="reader-modal"
            role="dialog"
            aria-modal="true"
            aria-label="All recent reads"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="reader-modal-header">
              <h3>All Recent Reads</h3>
              <button type="button" className="reader-modal-close" onClick={() => setIsModalOpen(false)}>
                x
              </button>
            </div>
            <div className="reader-modal-body">
              {renderTable(reads)}
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default RecentReads;
