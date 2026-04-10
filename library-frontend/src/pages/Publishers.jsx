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
  const [statusFilter, setStatusFilter] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

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

  useEffect(() => {
    fetchQueue(statusFilter);
  }, [statusFilter]);

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
    return submissions.map((row) => {
      const style = statusStyles[row.status] || statusStyles.pending;
      return {
        title: row.title,
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
  }, [submissions]);

  const tableActions = [
    {
      label: 'Accept',
      type: 'issue',
      isDisabled: (_row, index) => submissions[index]?.status !== 'pending' || processingId === submissions[index]?.id,
      disabledTitle: 'Only pending submissions can be accepted',
      onClick: (_row, index) => handleAction(submissions[index], 'accepted'),
    },
    {
      label: 'Decline',
      type: 'delete',
      isDisabled: (_row, index) => submissions[index]?.status !== 'pending' || processingId === submissions[index]?.id,
      disabledTitle: 'Only pending submissions can be declined',
      onClick: (_row, index) => handleAction(submissions[index], 'declined'),
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
    </div>
  );
};

export default Publishers;