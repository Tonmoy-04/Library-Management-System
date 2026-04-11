import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import { bookAPI, readerAPI } from '../services/api';
import '../styles/dashboard.css';
import '../styles/form.css';

const CATEGORY_OPTIONS = [
  'Fiction',
  'Science Fiction',
  'Documentary',
  'Story',
  'Biography',
  'Autobiography',
  'Fantasy',
  'Mystery',
  'Romance',
  'History',
  'Self Help',
  'Education',
  'Technology',
];

const Books = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [booksData, setBooksData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    publisher: '',
    category: '',
    price: '',
    quantity: '1',
    free_to_read: false,
    pdf: null,
    pdf_url: '',
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
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    category: book.category || 'General',
    price: Number(book.price || 0) === 0 ? 'Free' : `$${Number(book.price || 0).toFixed(2)}`,
  }));

  const fetchBooks = async () => {
    const response = await bookAPI.getAll();
    const rows = response.data?.data || [];
    setBooks(rows);
    setBooksData(mapBooksForTable(rows));
  };

  const filteredBooks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return books;
    }

    return books.filter((book) => {
      const haystack = [
        book.title,
        book.author,
        book.publisher,
        book.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [books, searchTerm]);

  const filteredBooksData = useMemo(() => mapBooksForTable(filteredBooks), [filteredBooks]);

  const fetchReaders = async () => {
    const response = await readerAPI.getAll();
    setReaders(response.data?.data || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError('');

      try {
        await fetchBooks();
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

  const openIssueModal = async (book) => {
    if (!book || Number(book.available) <= 0) {
      setIssueError('This book is currently unavailable.');
      setShowIssueModal(false);
      return;
    }

    if (readers.length === 0) {
      try {
        await fetchReaders();
      } catch (err) {
        setIssueError('Failed to load readers list.');
        return;
      }
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
      publisher: '',
      category: '',
      price: '',
      quantity: '1',
      free_to_read: false,
      pdf: null,
      pdf_url: '',
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
      publisher: book.publisher === 'N/A' ? '' : (book.publisher || ''),
      category: book.category === 'General' ? '' : (book.category || ''),
      price: Number(book.price || 0) === 0 ? '' : String(book.price ?? ''),
      quantity: String(book.quantity ?? 1),
      free_to_read: Number(book.price || 0) === 0,
      pdf: null,
      pdf_url: book.pdf_url || '',
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

    if (!bookForm.category.trim()) {
      setAddError('Category is required.');
      return;
    }

    if (!bookForm.free_to_read && !bookForm.price) {
      setAddError('Price is required unless the book is free to read.');
      return;
    }

    if (!editingBook && !bookForm.pdf) {
      setAddError('PDF file is required for new books.');
      return;
    }

    setAddingBook(true);

    try {
      const payload = new FormData();
      payload.append('title', bookForm.title.trim());
      payload.append('author', bookForm.author.trim());
      payload.append('publisher', bookForm.publisher.trim() || '');
      payload.append('category', bookForm.category.trim());
      payload.append('price', String(bookForm.free_to_read ? 0 : Number(bookForm.price)));
      payload.append('quantity', String(Number(bookForm.quantity || 1)));
      payload.append('free_to_read', bookForm.free_to_read ? '1' : '0');

      if (bookForm.pdf) {
        payload.append('pdf', bookForm.pdf);
      }

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
        setBookForm({
          title: '',
          author: '',
          publisher: '',
          category: '',
          price: '',
          quantity: '1',
          free_to_read: false,
          pdf: null,
          pdf_url: '',
        });
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
      onClick: (_row, rowIndex) => openIssueModal(filteredBooks[rowIndex]),
    },
    { label: 'Edit', type: 'edit', onClick: (_row, rowIndex) => openEditModal(filteredBooks[rowIndex]) },
    { label: 'Delete', type: 'delete', onClick: (_row, rowIndex) => openDeleteModal(filteredBooks[rowIndex]) },
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

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search books by title, author, publisher, category"
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

      {filteredBooksData.length > 0 ? (
        <Table
          columns={['Title', 'Author', 'Publisher', 'Category', 'Price']}
          data={filteredBooksData}
          actions={actions}
        />
      ) : (
        !loading && <p>No books found.</p>
      )}

      {showAddModal && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="issue-modal add-book-modal" onClick={(e) => e.stopPropagation()}>
            <div className="issue-modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button type="button" onClick={closeAddModal} disabled={addingBook}>
                x
              </button>
            </div>

            <form onSubmit={handleAddBookSubmit} className="add-book-form">
              <div className="add-book-grid">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    className="form-control"
                    value={bookForm.title}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={addingBook}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input
                    id="author"
                    className="form-control"
                    value={bookForm.author}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, author: e.target.value }))}
                    disabled={addingBook}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="publisher">Publisher *</label>
                  <input
                    id="publisher"
                    className="form-control"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, publisher: e.target.value }))}
                    disabled={addingBook}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    className="form-control"
                    value={bookForm.category}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, category: e.target.value }))}
                    disabled={addingBook}
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    {bookForm.category && !CATEGORY_OPTIONS.includes(bookForm.category) && (
                      <option value={bookForm.category}>{bookForm.category}</option>
                    )}
                  </select>
                </div>

                <div className="form-group form-group-span-1">
                  <label htmlFor="price">Price (BDT) *</label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={bookForm.price}
                    onChange={(e) => setBookForm((prev) => ({ ...prev, price: e.target.value }))}
                    disabled={addingBook || bookForm.free_to_read}
                    required={!bookForm.free_to_read}
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

                <div className="form-group form-group-check">
                  <label htmlFor="free_to_read" className="check-label">
                    <input
                      id="free_to_read"
                      type="checkbox"
                      checked={bookForm.free_to_read}
                      onChange={(e) => setBookForm((prev) => ({
                        ...prev,
                        free_to_read: e.target.checked,
                        price: e.target.checked ? '0' : '',
                      }))}
                      disabled={addingBook}
                    />
                    <span>Free to read</span>
                  </label>
                </div>

                <div className="form-group form-group-span-2">
                  <label htmlFor="pdf">PDF Upload {!editingBook ? '*' : ''}</label>
                  <input
                    id="pdf"
                    name="pdf"
                    type="file"
                    accept=".pdf"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setBookForm((prev) => ({ ...prev, pdf: file }));
                    }}
                    disabled={addingBook}
                    required={!editingBook}
                  />
                  {bookForm.pdf && (
                    <p style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>Selected: {bookForm.pdf.name}</p>
                  )}
                  {!bookForm.pdf && editingBook && bookForm.pdf_url && (
                    <p style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>Current PDF is already attached.</p>
                  )}
                </div>
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
