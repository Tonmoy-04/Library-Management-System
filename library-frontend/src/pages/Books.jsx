import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import { bookAPI, readerAPI } from '../services/api';
import '../styles/dashboard.css';

const Books = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [booksData, setBooksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [addingBook, setAddingBook] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deletingBook, setDeletingBook] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [deleteNoHover, setDeleteNoHover] = useState(false);
  const [deleteYesHover, setDeleteYesHover] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    quantity: 1,
  });
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

  useEffect(() => {
    const issueContext = location.state?.issueContext;

    if (!issueContext || !books.length || showIssueModal) {
      return;
    }

    const matchedBook = books.find((book) => {
      const titleMatches = (book.title || '').toLowerCase() === (issueContext.bookTitle || '').toLowerCase();
      const idMatches = String(book.id) === String(issueContext.bookId || '');
      return titleMatches || idMatches;
    });

    if (matchedBook) {
      openIssueModal(matchedBook);
      navigate('/books', { replace: true, state: {} });
    }
  }, [books, location.state, showIssueModal]);

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

  const openAddModal = () => {
    setAddError('');
    setAddSuccess('');
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      quantity: 1,
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (addingBook) return;

    setShowAddModal(false);
    setAddError('');
    setEditingBook(null);
  };

  const openEditModal = (book) => {
    if (!book) return;

    setAddError('');
    setAddSuccess('');
    setEditingBook(book);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn === 'N/A' ? '' : (book.isbn || ''),
      publisher: book.publisher === 'N/A' ? '' : (book.publisher || ''),
      quantity: book.quantity || 1,
    });
    setShowAddModal(true);
  };

  const openDeleteModal = (book) => {
    if (!book) return;

    setDeleteError('');
    setDeleteSuccess('');
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingBook) return;

    setShowDeleteModal(false);
    setBookToDelete(null);
    setDeleteError('');
    setDeleteNoHover(false);
    setDeleteYesHover(false);
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

  const handleAddBookSubmit = async (event) => {
    event.preventDefault();
    setAddError('');
    setAddSuccess('');

    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      setAddError('Title and author are required.');
      return;
    }

    setAddingBook(true);

    try {
      const payload = {
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        isbn: bookForm.isbn.trim() || null,
        publisher: bookForm.publisher.trim() || null,
        quantity: Number(bookForm.quantity) || 1,
      };

      const response = editingBook
        ? await bookAPI.update(editingBook.id, payload)
        : await bookAPI.create(payload);

      await fetchBooks();

      setAddSuccess(
        response.data?.message || (editingBook ? 'Book updated successfully.' : 'Book added successfully.')
      );
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess('');
        setEditingBook(null);
      }, 900);
    } catch (err) {
      const validationMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : '';

      setAddError(validationMessage || err.response?.data?.message || 'Failed to add the book.');
    } finally {
      setAddingBook(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    setDeleteError('');
    setDeleteSuccess('');
    setDeletingBook(true);

    try {
      const response = await bookAPI.remove(bookToDelete.id);
      await fetchBooks();
      setDeleteSuccess(response.data?.message || 'Book deleted successfully.');

      setTimeout(() => {
        setShowDeleteModal(false);
        setBookToDelete(null);
        setDeleteSuccess('');
      }, 800);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete the book.');
    } finally {
      setDeletingBook(false);
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
    { label: 'Edit', type: 'edit', onClick: (_row, rowIndex) => openEditModal(books[rowIndex]) },
    { label: 'Delete', type: 'delete', onClick: (_row, rowIndex) => openDeleteModal(books[rowIndex]) },
  ];

  return (
    <div className="books-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Books Management</h1>
          <p>Manage your library's book collection.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add New Book</button>
      </div>

      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {issueError && !showIssueModal && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{issueError}</p>
      )}
      {deleteError && !showDeleteModal && (
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{deleteError}</p>
      )}
      {deleteSuccess && !showDeleteModal && (
        <p style={{ color: '#166534', marginBottom: '1rem' }}>{deleteSuccess}</p>
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

      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button type="button" onClick={closeAddModal} disabled={addingBook}>
                x
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  className="form-control"
                  value={bookForm.title}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={addingBook}
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  id="author"
                  className="form-control"
                  value={bookForm.author}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, author: e.target.value }))}
                  disabled={addingBook}
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  id="isbn"
                  className="form-control"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, isbn: e.target.value }))}
                  disabled={addingBook}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publisher">Publisher</label>
                <input
                  id="publisher"
                  className="form-control"
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, publisher: e.target.value }))}
                  disabled={addingBook}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  className="form-control"
                  value={bookForm.quantity}
                  onChange={(e) => setBookForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  disabled={addingBook}
                />
              </div>

              {addError && <p className="issue-message issue-error">{addError}</p>}
              {addSuccess && <p className="issue-message issue-success">{addSuccess}</p>}

              <div className="issue-modal-actions">
                <button type="button" className="btn" onClick={closeAddModal} disabled={addingBook}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={addingBook}>
                  {addingBook ? 'Saving...' : (editingBook ? 'Update Book' : 'Save Book')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && bookToDelete && (
        <div className="modal-backdrop" onClick={closeDeleteModal}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>Delete Book</h3>
              <button type="button" onClick={closeDeleteModal} disabled={deletingBook}>
                x
              </button>
            </div>

            <p className="issue-book-title" style={{ marginBottom: '1rem' }}>
              Do you want to delete "{bookToDelete.title}"?
            </p>

            {deleteError && <p className="issue-message issue-error">{deleteError}</p>}
            {deleteSuccess && <p className="issue-message issue-success">{deleteSuccess}</p>}

            <div className="issue-modal-actions">
              <button
                type="button"
                className="btn"
                onClick={closeDeleteModal}
                disabled={deletingBook}
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
                onClick={handleDeleteBook}
                disabled={deletingBook}
                onMouseEnter={() => setDeleteYesHover(true)}
                onMouseLeave={() => setDeleteYesHover(false)}
                style={{
                  backgroundColor: deleteYesHover ? '#b91c1c' : '#ef4444',
                  color: '#fff',
                }}
              >
                {deletingBook ? 'Deleting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
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
