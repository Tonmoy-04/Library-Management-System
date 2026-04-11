import React, { useEffect, useMemo, useState } from 'react';
import Table from '../components/Table';
import { publisherAPI } from '../services/api';
import '../styles/dashboard.css';

const statusStyles = {
  pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7' },
  accepted: { label: 'Accepted', color: '#166534', bg: '#dcfce7' },
  declined: { label: 'Declined', color: '#991b1b', bg: '#fee2e2' },
};

const Publishers = () => {
  const [viewMode, setViewMode] = useState('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [publisherList, setPublisherList] = useState([]);
  const [publisherStatusHints, setPublisherStatusHints] = useState({});
  const [publisherListLoading, setPublisherListLoading] = useState(true);
  const [publisherActionId, setPublisherActionId] = useState(null);
  const [publisherError, setPublisherError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const fetchQueue = async (status = statusFilter) => {
    try {
      setLoading(true);
      setError('');
      const response = await publisherAPI.getPublisherReviewQueue(status);
      setSubmissions(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load publisher queue.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishers = async () => {
    try {
      setPublisherListLoading(true);
      setPublisherError('');
      const response = await publisherAPI.getAll();
      setPublisherList(response.data?.data || []);
    } catch (err) {
      setPublisherError(err.response?.data?.message || 'Failed to load publishers list.');
    } finally {
      setPublisherListLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (viewMode === 'list' && publisherList.length === 0) {
      fetchPublishers();
    }
  }, [viewMode]);

  const handlePublisherSuspension = async (publisher, suspended) => {
    if (!publisher?.id) {
      return;
    }

    const confirmationText = suspended
      ? `Suspend ${publisher.name}? This publisher will not be able to login.`
      : `Unsuspend ${publisher.name}? This publisher will be able to login again.`;

    if (!window.confirm(confirmationText)) {
      return;
    }

    try {
      setPublisherActionId(publisher.id);
      setPublisherError('');
      await publisherAPI.setSuspension(publisher.id, suspended);
      setPublisherStatusHints((prev) => ({
        ...prev,
        [publisher.id]: suspended ? 'suspended' : 'unsuspended',
      }));
      await fetchPublishers();
    } catch (err) {
      setPublisherError(err.response?.data?.message || 'Failed to update publisher suspension.');
    } finally {
      setPublisherActionId(null);
    }
  };

  const handleAction = async (submission, action) => {
    if (!submission?.id) {
      return;
    }

    const actionLabel = action === 'accepted' ? 'accept' : 'decline';
    if (!window.confirm(`Are you sure you want to ${actionLabel} "${submission.title}"?`)) {
      return;
    }

    try {
      setProcessingId(submission.id);
      setError('');
      await publisherAPI.reviewBookSubmission(submission.id, action);
      await fetchQueue(statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process this submission.');
    } finally {
      setProcessingId(null);
    }
  };

  const tableData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredSubmissions = submissions.filter((row) => {
      if (!normalizedSearch) {
        return true;
      }

      const title = String(row.title || '').toLowerCase();
      const author = String(row.author || '').toLowerCase();
      const publisherId = String(row.publisher_id || '').toLowerCase();

      return (
        title.includes(normalizedSearch)
        || author.includes(normalizedSearch)
        || publisherId.includes(normalizedSearch)
      );
    });

    return filteredSubmissions.map((row) => {
      const style = statusStyles[row.status] || statusStyles.pending;
      return {
        title: row.pdf_url ? (
          <button
            type="button"
            className="link-button"
            onClick={() => setSelectedPdf({ title: row.title, url: row.pdf_url })}
            title="Preview submission PDF"
          >
            {row.title}
          </button>
        ) : (
          row.title
        ),
        author: row.author,
        publisher_id: row.publisher_id,
        price: `$${Number(row.price || 0).toFixed(2)}`,
        status: (
          <span
            className="status-badge"
            style={{ backgroundColor: style.bg, color: style.color }}
          >
            {style.label}
          </span>
        ),
      };
    });
  }, [submissions, searchTerm]);

  const filteredSubmissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return submissions.filter((row) => {
      if (!normalizedSearch) {
        return true;
      }

      const title = String(row.title || '').toLowerCase();
      const author = String(row.author || '').toLowerCase();
      const publisherId = String(row.publisher_id || '').toLowerCase();

      return (
        title.includes(normalizedSearch)
        || author.includes(normalizedSearch)
        || publisherId.includes(normalizedSearch)
      );
    });
  }, [submissions, searchTerm]);

  const tableActions = [
    {
      label: 'Accept',
      type: 'issue',
      isDisabled: (_row, index) => filteredSubmissions[index]?.status !== 'pending' || processingId === filteredSubmissions[index]?.id,
      disabledTitle: 'Only pending submissions can be accepted',
      onClick: (_row, index) => handleAction(filteredSubmissions[index], 'accepted'),
    },
    {
      label: 'Decline',
      type: 'delete',
      isDisabled: (_row, index) => filteredSubmissions[index]?.status !== 'pending' || processingId === filteredSubmissions[index]?.id,
      disabledTitle: 'Only pending submissions can be declined',
      onClick: (_row, index) => handleAction(filteredSubmissions[index], 'declined'),
    },
  ];

  const filteredPublisherList = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return publisherList.filter((publisher) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        publisher.name,
        publisher.email,
        publisher.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [publisherList, searchTerm]);

  const publisherListRows = useMemo(() => {
    return filteredPublisherList.map((publisher) => ({
      name: publisher.name,
      email: publisher.email || 'N/A',
      location: publisher.location || 'N/A',
      status: publisherStatusHints[publisher.id] === 'unsuspended' ? (
        <span className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
          Unsuspended
        </span>
      ) : publisher.is_suspended ? (
        <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
          Suspended
        </span>
      ) : (
        <span className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
          Active
        </span>
      ),
    }));
  }, [filteredPublisherList, publisherStatusHints]);

  const publisherActions = [
    {
      label: (_row, rowIndex) => {
        const target = filteredPublisherList[rowIndex];

        if (!target) {
          return 'Suspend';
        }

        if (publisherStatusHints[target.id] === 'suspended') {
          return 'Suspended';
        }

        if (publisherStatusHints[target.id] === 'unsuspended') {
          return 'Unsuspended';
        }

        return target.is_suspended ? 'Suspended' : 'Suspend';
      },
      type: 'edit',
      isDisabled: (_row, rowIndex) => {
        const target = filteredPublisherList[rowIndex];
        return !target?.id || publisherActionId === target.id;
      },
      disabledTitle: 'Updating suspension status...',
      onClick: (_row, rowIndex) => {
        const target = filteredPublisherList[rowIndex];

        if (!target?.id) {
          return;
        }

        const shouldSuspend = publisherStatusHints[target.id] === 'unsuspended'
          ? true
          : !target.is_suspended;

        handlePublisherSuspension(target, shouldSuspend);
      },
    },
  ];

  return (
    <div className="publishers-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Publisher Management</h1>
          <p>Review publisher bookshelf submissions and approve or decline them.</p>
        </div>
      </div>

      <div className="publishers-filter-tabs" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`publishers-filter-btn ${viewMode === 'queue' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('queue');
            setSearchTerm('');
          }}
        >
          Submission Queue
        </button>
        <button
          type="button"
          className={`publishers-filter-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('list');
            setSearchTerm('');
          }}
        >
          Publisher List
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={viewMode === 'queue' ? 'Search queue by title, author, publisher id' : 'Search publisher by name, email, location'}
          style={{
            width: '100%',
            maxWidth: '520px',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.95rem',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {viewMode === 'list' && (
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Publisher List</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Admin can suspend or unsuspend publisher accounts from here.
        </p>
        {publisherError && <p className="publishers-error">{publisherError}</p>}
        {publisherListLoading ? (
          <p>Loading publishers list...</p>
        ) : publisherListRows.length === 0 ? (
          <p>No publishers found.</p>
        ) : (
          <Table
            columns={['Name', 'Email', 'Location', 'Status']}
            data={publisherListRows}
            actions={publisherActions}
          />
        )}
      </div>
      )}

      {viewMode === 'queue' && (
      <>
      <h2 style={{ marginBottom: '0.5rem' }}>Publisher Submission Queue</h2>

      <div className="publishers-filter-tabs">
        {['pending', 'accepted', 'declined'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`publishers-filter-btn ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p>Loading submission queue...</p>}
      {error && <p className="publishers-error">{error}</p>}

      {!loading && tableData.length === 0 ? (
        <p>No submissions found for this filter.</p>
      ) : (
        <Table
          columns={['Title', 'Author', 'Publisher ID', 'Price', 'Status']}
          data={tableData}
          actions={tableActions}
        />
      )}
      </>
      )}

      {selectedPdf && (
        <div className="admin-pdf-modal" onClick={() => setSelectedPdf(null)}>
          <div className="admin-pdf-content" onClick={(event) => event.stopPropagation()}>
            <div className="admin-pdf-header">
              <h3>{selectedPdf.title}</h3>
              <button type="button" className="admin-pdf-close" onClick={() => setSelectedPdf(null)}>X</button>
            </div>
            <div className="admin-pdf-body">
              <iframe
                src={`${selectedPdf.url}#toolbar=1&navpanes=0&scrollbar=1`}
                title={selectedPdf.title}
                className="admin-pdf-iframe"
              />
            </div>
            <div className="admin-pdf-footer">
              <a href={selectedPdf.url} target="_blank" rel="noreferrer" className="btn btn-primary">Open PDF</a>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPdf(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publishers;