import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { publisherAPI } from '../services/api';
import '../styles/dashboard.css';

const Publishers = () => {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [publisherForm, setPublisherForm] = useState({
    name: '',
    email: '',
    website: '',
    location: '',
  });
  const [savingPublisher, setSavingPublisher] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publisherToDelete, setPublisherToDelete] = useState(null);
  const [deletingPublisher, setDeletingPublisher] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [deleteNoHover, setDeleteNoHover] = useState(false);
  const [deleteYesHover, setDeleteYesHover] = useState(false);

  const mapPublishersForTable = (rows) => rows.map((publisher) => ({
    id: publisher.id,
    name: publisher.name,
    email: publisher.email || 'N/A',
    website: publisher.website || 'N/A',
    location: publisher.location || 'N/A',
  }));

  const fetchPublishers = async () => {
    const response = await publisherAPI.getAll();
    const rows = response.data?.data || [];
    setPublishers(rows);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError('');

      try {
        await fetchPublishers();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load publishers.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const actions = [
    { label: 'Edit', type: 'edit', onClick: (_row, rowIndex) => openEditModal(publishers[rowIndex]) },
    { label: 'Delete', type: 'delete', onClick: (_row, rowIndex) => openDeleteModal(publishers[rowIndex]) },
  ];

  const openAddModal = () => {
    setFormError('');
    setFormSuccess('');
    setEditingPublisher(null);
    setPublisherForm({
      name: '',
      email: '',
      website: '',
      location: '',
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (savingPublisher) return;

    setShowAddModal(false);
    setFormError('');
    setEditingPublisher(null);
  };

  const openEditModal = (publisher) => {
    if (!publisher) return;

    setFormError('');
    setFormSuccess('');
    setEditingPublisher(publisher);
    setPublisherForm({
      name: publisher.name || '',
      email: publisher.email || '',
      website: publisher.website || '',
      location: publisher.location || '',
    });
    setShowAddModal(true);
  };

  const openDeleteModal = (publisher) => {
    if (!publisher) return;

    setDeleteError('');
    setDeleteSuccess('');
    setPublisherToDelete(publisher);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingPublisher) return;

    setShowDeleteModal(false);
    setPublisherToDelete(null);
    setDeleteError('');
    setDeleteNoHover(false);
    setDeleteYesHover(false);
  };

  const handleAddPublisher = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!publisherForm.name.trim()) {
      setFormError('Publisher name is required.');
      return;
    }

    setSavingPublisher(true);

    try {
      const payload = {
        name: publisherForm.name.trim(),
        email: publisherForm.email.trim() || null,
        website: publisherForm.website.trim() || null,
        location: publisherForm.location.trim() || null,
      };

      const response = editingPublisher
        ? await publisherAPI.update(editingPublisher.id, payload)
        : await publisherAPI.create(payload);

      await fetchPublishers();
      setFormSuccess(response.data?.message || (editingPublisher ? 'Publisher updated.' : 'Publisher added.'));

      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
        setEditingPublisher(null);
      }, 700);
    } catch (err) {
      const validationMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : '';
      const backendMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      setFormError(validationMessage || backendMessage || 'Failed to save publisher.');
    } finally {
      setSavingPublisher(false);
    }
  };

  const handleDeletePublisher = async () => {
    if (!publisherToDelete) return;

    setDeleteError('');
    setDeleteSuccess('');
    setDeletingPublisher(true);

    try {
      const response = await publisherAPI.remove(publisherToDelete.id);
      await fetchPublishers();
      setDeleteSuccess(response.data?.message || 'Publisher deleted successfully.');

      setTimeout(() => {
        setShowDeleteModal(false);
        setPublisherToDelete(null);
        setDeleteSuccess('');
      }, 700);
    } catch (err) {
      setDeleteError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete publisher.');
    } finally {
      setDeletingPublisher(false);
    }
  };

  return (
    <div className="publishers-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Publishers Management</h1>
          <p>Maintain information about book publishers.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Publisher</button>
      </div>

      {loading && <p>Loading publishers...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {deleteError && !showDeleteModal && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{deleteError}</p>
      )}
      {deleteSuccess && !showDeleteModal && (
        <p style={{ color: '#166534', marginBottom: '1rem' }}>{deleteSuccess}</p>
      )}

      {publishers.length > 0 ? (
        <Table
          columns={['ID', 'Name', 'Email', 'Website', 'Location']}
          data={mapPublishersForTable(publishers)}
          actions={actions}
        />
      ) : (
        !loading && <p>No publishers found in the database.</p>
      )}

      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>{editingPublisher ? 'Edit Publisher' : 'Add Publisher'}</h3>
              <button type="button" onClick={closeAddModal} disabled={savingPublisher}>x</button>
            </div>

            <form onSubmit={handleAddPublisher}>
              <div className="form-group">
                <label htmlFor="publisherName">Name *</label>
                <input
                  id="publisherName"
                  className="form-control"
                  value={publisherForm.name}
                  onChange={(e) => setPublisherForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Publisher name"
                  disabled={savingPublisher}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publisherEmail">Email</label>
                <input
                  id="publisherEmail"
                  type="email"
                  className="form-control"
                  value={publisherForm.email}
                  onChange={(e) => setPublisherForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="publisher@email.com"
                  disabled={savingPublisher}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publisherWebsite">Website</label>
                <input
                  id="publisherWebsite"
                  type="url"
                  className="form-control"
                  value={publisherForm.website}
                  onChange={(e) => setPublisherForm((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://website.com"
                  disabled={savingPublisher}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publisherLocation">Location</label>
                <input
                  id="publisherLocation"
                  className="form-control"
                  value={publisherForm.location}
                  onChange={(e) => setPublisherForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Location"
                  disabled={savingPublisher}
                />
              </div>

              {formError && <p className="issue-message issue-error">{formError}</p>}
              {formSuccess && <p className="issue-message issue-success">{formSuccess}</p>}

              <div className="issue-modal-actions">
                <button type="button" className="btn" onClick={closeAddModal} disabled={savingPublisher}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={savingPublisher}>
                  {savingPublisher ? 'Saving...' : (editingPublisher ? 'Update Publisher' : 'Save Publisher')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && publisherToDelete && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>Delete Publisher</h3>
              <button type="button" onClick={closeDeleteModal} disabled={deletingPublisher}>x</button>
            </div>

            <p className="issue-book-title" style={{ marginBottom: '1rem' }}>
              Do you want to delete "{publisherToDelete.name}"?
            </p>

            {deleteError && <p className="issue-message issue-error">{deleteError}</p>}
            {deleteSuccess && <p className="issue-message issue-success">{deleteSuccess}</p>}

            <div className="issue-modal-actions">
              <button
                type="button"
                className="btn"
                onClick={closeDeleteModal}
                disabled={deletingPublisher}
                onMouseEnter={() => setDeleteNoHover(true)}
                onMouseLeave={() => setDeleteNoHover(false)}
                style={{
                  backgroundColor: deleteNoHover ? '#374151' : '#6b7280',
                  color: '#fff',
                }}
              >
                No
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleDeletePublisher}
                disabled={deletingPublisher}
                onMouseEnter={() => setDeleteYesHover(true)}
                onMouseLeave={() => setDeleteYesHover(false)}
                style={{
                  backgroundColor: deleteYesHover ? '#b91c1c' : '#ef4444',
                  color: '#fff',
                }}
              >
                {deletingPublisher ? 'Deleting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publishers;