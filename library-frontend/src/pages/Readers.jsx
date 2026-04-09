import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import { readerAPI } from '../services/api';
import '../styles/dashboard.css';

const Readers = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReader, setEditingReader] = useState(null);
  const [readerForm, setReaderForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [savingReader, setSavingReader] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readerToDelete, setReaderToDelete] = useState(null);
  const [deletingReader, setDeletingReader] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [deleteNoHover, setDeleteNoHover] = useState(false);
  const [deleteYesHover, setDeleteYesHover] = useState(false);

  const mapReadersForTable = (rows) => rows.map((reader) => ({
    id: reader.id,
    name: reader.name,
    email: reader.email || 'N/A',
    phone: reader.phone || 'N/A',
    address: reader.address || 'N/A',
  }));

  const fetchReaders = async () => {
    const response = await readerAPI.getAll();
    const rows = response.data?.data || [];
    setReaders(rows);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError('');

      try {
        await fetchReaders();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load readers.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const actions = [
    { label: 'Edit', type: 'edit', onClick: (_row, rowIndex) => openEditModal(readers[rowIndex]) },
    { label: 'Delete', type: 'delete', onClick: (_row, rowIndex) => openDeleteModal(readers[rowIndex]) },
  ];

  const openAddModal = () => {
    setFormError('');
    setFormSuccess('');
    setEditingReader(null);
    setReaderForm({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (savingReader) return;

    setShowAddModal(false);
    setFormError('');
    setEditingReader(null);
  };

  const openEditModal = (reader) => {
    if (!reader) return;

    setFormError('');
    setFormSuccess('');
    setEditingReader(reader);
    setReaderForm({
      name: reader.name || '',
      email: reader.email || '',
      phone: reader.phone || '',
      address: reader.address || '',
    });
    setShowAddModal(true);
  };

  const openDeleteModal = (reader) => {
    if (!reader) return;

    setDeleteError('');
    setDeleteSuccess('');
    setReaderToDelete(reader);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingReader) return;

    setShowDeleteModal(false);
    setReaderToDelete(null);
    setDeleteError('');
    setDeleteNoHover(false);
    setDeleteYesHover(false);
  };

  const handleAddReader = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!readerForm.name.trim()) {
      setFormError('Reader name is required.');
      return;
    }

    setSavingReader(true);

    try {
      const payload = {
        name: readerForm.name.trim(),
        email: readerForm.email.trim() || null,
        phone: readerForm.phone.trim() || null,
        address: readerForm.address.trim() || null,
      };

      const response = editingReader
        ? await readerAPI.update(editingReader.id, payload)
        : await readerAPI.create(payload);

      await fetchReaders();
      setFormSuccess(response.data?.message || (editingReader ? 'Reader updated.' : 'Reader added.'));

      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
        setEditingReader(null);
      }, 700);
    } catch (err) {
      const validationMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : '';
      setFormError(validationMessage || err.response?.data?.message || 'Failed to save reader.');
    } finally {
      setSavingReader(false);
    }
  };

  const handleDeleteReader = async () => {
    if (!readerToDelete) return;

    setDeleteError('');
    setDeleteSuccess('');
    setDeletingReader(true);

    try {
      const response = await readerAPI.remove(readerToDelete.id);
      await fetchReaders();
      setDeleteSuccess(response.data?.message || 'Reader deleted successfully.');

      setTimeout(() => {
        setShowDeleteModal(false);
        setReaderToDelete(null);
        setDeleteSuccess('');
      }, 700);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete reader.');
    } finally {
      setDeletingReader(false);
    }
  };

  return (
    <div className="readers-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Readers Management</h1>
          <p>Manage library members and their information.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Reader</button>
      </div>

      {loading && <p>Loading readers...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {deleteError && !showDeleteModal && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{deleteError}</p>
      )}
      {deleteSuccess && !showDeleteModal && (
        <p style={{ color: '#166534', marginBottom: '1rem' }}>{deleteSuccess}</p>
      )}

      {readers.length > 0 ? (
        <Table
          columns={['ID', 'Name', 'Email', 'Phone', 'Address']}
          data={mapReadersForTable(readers)}
          actions={actions}
        />
      ) : (
        !loading && <p>No readers found in the database.</p>
      )}

      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>{editingReader ? 'Edit Reader' : 'Add Reader'}</h3>
              <button type="button" onClick={closeAddModal} disabled={savingReader}>x</button>
            </div>

            <form onSubmit={handleAddReader}>
              <div className="form-group">
                <label htmlFor="readerName">Name *</label>
                <input
                  id="readerName"
                  className="form-control"
                  value={readerForm.name}
                  onChange={(e) => setReaderForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Reader name"
                  disabled={savingReader}
                />
              </div>

              <div className="form-group">
                <label htmlFor="readerEmail">Email</label>
                <input
                  id="readerEmail"
                  type="email"
                  className="form-control"
                  value={readerForm.email}
                  onChange={(e) => setReaderForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="reader@email.com"
                  disabled={savingReader}
                />
              </div>

              <div className="form-group">
                <label htmlFor="readerPhone">Phone</label>
                <input
                  id="readerPhone"
                  className="form-control"
                  value={readerForm.phone}
                  onChange={(e) => setReaderForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  disabled={savingReader}
                />
              </div>

              <div className="form-group">
                <label htmlFor="readerAddress">Address</label>
                <input
                  id="readerAddress"
                  className="form-control"
                  value={readerForm.address}
                  onChange={(e) => setReaderForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Address"
                  disabled={savingReader}
                />
              </div>

              {formError && <p className="issue-message issue-error">{formError}</p>}
              {formSuccess && <p className="issue-message issue-success">{formSuccess}</p>}

              <div className="issue-modal-actions">
                <button type="button" className="btn" onClick={closeAddModal} disabled={savingReader}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={savingReader}>
                  {savingReader ? 'Saving...' : (editingReader ? 'Update Reader' : 'Save Reader')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && readerToDelete && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>Delete Reader</h3>
              <button type="button" onClick={closeDeleteModal} disabled={deletingReader}>x</button>
            </div>

            <p className="issue-book-title" style={{ marginBottom: '1rem' }}>
              Do you want to delete "{readerToDelete.name}"?
            </p>

            {deleteError && <p className="issue-message issue-error">{deleteError}</p>}
            {deleteSuccess && <p className="issue-message issue-success">{deleteSuccess}</p>}

            <div className="issue-modal-actions">
              <button
                type="button"
                className="btn"
                onClick={closeDeleteModal}
                disabled={deletingReader}
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
                onClick={handleDeleteReader}
                disabled={deletingReader}
                onMouseEnter={() => setDeleteYesHover(true)}
                onMouseLeave={() => setDeleteYesHover(false)}
                style={{
                  backgroundColor: deleteYesHover ? '#b91c1c' : '#ef4444',
                  color: '#fff',
                }}
              >
                {deletingReader ? 'Deleting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Readers;