import React, { useEffect, useMemo, useState } from 'react';
import Table from '../components/Table';
import { bookAPI, readerAPI } from '../services/api';
import '../styles/dashboard.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [booksData, setBooksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [issueForm, setIssueForm] = useState({
    user_id: '',
    due_at: '',
  });

  const defaultDueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  }, []);

  const mapBooksForTable = (rows) => rows.map((book) => ({
    isbn: book.isbn || 'N/A',
    title: book.title,
    author: book.author,
    quantity: book.quantity,
    available: book.available,
    publisher: book.publisher,
  }));

  const fetchBooks = async () => {
    const response = await bookAPI.getAll();
    const rows = response.data?.data || [];
    setBooks(rows);
    setBooksData(mapBooksForTable(rows));
  };

  const fetchReaders = async () => {
    const response = await readerAPI.getAll();
    setReaders(response.data?.data || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError('');

      try {
        await Promise.all([fetchBooks(), fetchReaders()]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load books.');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const openIssueModal = (book) => {
    if (!book || Number(book.available) <= 0) {
      setIssueError('This book is currently unavailable.');
      setShowIssueModal(false);
      return;
    }

    setSelectedBook(book);
    setIssueError('');
    setIssueSuccess('');
    setIssueForm({
      user_id: '',
      due_at: defaultDueDate,
    });
    setShowIssueModal(true);
  };

  const closeIssueModal = () => {
    if (issuing) return;

    setShowIssueModal(false);
    setSelectedBook(null);
    setIssueError('');
  };

  const handleIssueSubmit = async (event) => {
    event.preventDefault();
    setIssueError('');
    setIssueSuccess('');

    if (!selectedBook) {
      setIssueError('Please select a book first.');
      return;
    }

    if (!issueForm.user_id) {
      setIssueError('Please select a reader.');
      return;
    }

    setIssuing(true);

    try {
      const payload = {
        book_id: selectedBook.id,
        user_id: Number(issueForm.user_id),
        due_at: issueForm.due_at || null,
      };

      const response = await bookAPI.issueBook(payload);
      await fetchBooks();

      setIssueSuccess(response.data?.message || 'Book issued successfully.');
      setTimeout(() => {
        setShowIssueModal(false);
        setSelectedBook(null);
        setIssueSuccess('');
      }, 900);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const validationMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : '';

      setIssueError(validationMessage || serverMessage || 'Failed to issue the book.');
    } finally {
      setIssuing(false);
    }
  };

  const actions = [
    {
      label: 'Issue Book',
      type: 'issue',
      onClick: (_row, rowIndex) => openIssueModal(books[rowIndex]),
      isDisabled: (_row, rowIndex) => Number(books[rowIndex]?.available ?? 0) <= 0,
      disabledTitle: 'Book unavailable for issue',
    },
    { label: 'Edit', type: 'edit', onClick: (row) => console.log('Edit', row) },
    { label: 'Delete', type: 'delete', onClick: (row) => console.log('Delete', row) },
  ];

  return (
    <div className="books-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Books Management</h1>
          <p>Manage your library's book collection.</p>
        </div>
        <button className="btn btn-primary" disabled>+ Add New Book</button>
      </div>

      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {issueError && !showIssueModal && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{issueError}</p>
      )}

      {booksData.length > 0 ? (
        <Table
          columns={['ISBN', 'Title', 'Author', 'Quantity', 'Available', 'Publisher']}
          data={booksData}
          actions={actions}
        />
      ) : (
        !loading && <p>No books found in the database.</p>
      )}

      {showIssueModal && selectedBook && (
        <div className="modal-backdrop" onClick={closeIssueModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>Issue Book</h3>
              <button type="button" onClick={closeIssueModal} disabled={issuing}>
                x
              </button>
            </div>

            <p className="issue-book-title">
              {selectedBook.title} by {selectedBook.author}
            </p>

            <form onSubmit={handleIssueSubmit}>
              <div className="form-group">
                <label htmlFor="reader">Select Reader</label>
                <select
                  id="reader"
                  className="form-control"
                  value={issueForm.user_id}
                  onChange={(e) => setIssueForm((prev) => ({ ...prev, user_id: e.target.value }))}
                  disabled={issuing}
                >
                  <option value="">Choose a reader</option>
                  {readers.map((reader) => (
                    <option key={reader.id} value={reader.id}>
                      {reader.name} ({reader.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  className="form-control"
                  value={issueForm.due_at}
                  onChange={(e) => setIssueForm((prev) => ({ ...prev, due_at: e.target.value }))}
                  disabled={issuing}
                />
              </div>

              {issueError && <p className="issue-message issue-error">{issueError}</p>}
              {issueSuccess && <p className="issue-message issue-success">{issueSuccess}</p>}

              <div className="issue-modal-actions">
                <button type="button" className="btn" onClick={closeIssueModal} disabled={issuing}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={issuing}>
                  {issuing ? 'Issuing...' : 'Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
