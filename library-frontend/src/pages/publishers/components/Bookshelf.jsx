import React, { useEffect, useState } from 'react';
import '../styles/Bookshelf.css';
import { publisherAPI } from '../../../services/api';

const Bookshelf = ({ publisherId }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    quantity: 0,
    price: 0,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [savingBook, setSavingBook] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [publisherId]);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, statusFilter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await publisherAPI.getBooks(publisherId);
      setBooks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query) ||
          book.isbn?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((book) => {
        if (statusFilter === 'published') return book.available_quantity > 0;
        if (statusFilter === 'out-of-stock') return book.available_quantity === 0;
        return true;
      });
    }

    setFilteredBooks(filtered);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!bookForm.title || !bookForm.author) {
      setFormError('Title and Author are required');
      return;
    }

    setSavingBook(true);
    try {
      const payload = {
        ...bookForm,
        publisher_id: publisherId,
        available_quantity: bookForm.quantity,
      };

      if (editingBook) {
        await bookAPI.update(editingBook.id, payload);
        setFormSuccess('Book updated successfully!');
      } else {
        await bookAPI.create(payload);
        setFormSuccess('Book added successfully!');
      }

      await fetchBooks();
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSavingBook(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await bookAPI.remove(bookId);
      setFormSuccess('Book deleted successfully!');
      await fetchBooks();
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  const openEditModal = (book) => {
    setFormError('');
    setFormSuccess('');
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      quantity: book.quantity,
      price: book.price || 0,
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setFormError('');
    setFormSuccess('');
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      description: '',
      quantity: 0,
      price: 0,
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setFormError('');
    setFormSuccess('');
    setEditingBook(null);
  };

  if (loading) {
    return <div className="bookshelf-loading">Loading your books...</div>;
  }

  return (
    <div className="bookshelf">
      <div className="page-header">
        <div className="page-title">
          <h1>📚 Bookshelf</h1>
          <p>Manage your published books</p>
        </div>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="bookshelf-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Books</option>
            <option value="published">Published</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        <button className="add-book-btn" onClick={openAddModal}>
          ➕ Add New Book
        </button>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="empty-state">
          <p>📚 {books.length === 0 ? "You haven't published any books yet." : "No books match your search."}</p>
          {books.length === 0 && (
            <button className="add-book-btn" onClick={openAddModal}>
              ➕ Add Your First Book
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="results-info">
            Showing {filteredBooks.length} of {books.length} books
          </div>
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-card-header">
                  <h3 className="book-title">{book.title}</h3>
                  <span className={`book-status ${book.available_quantity > 0 ? 'published' : 'out-of-stock'}`}>
                    {book.available_quantity > 0 ? '✓ Published' : '✗ Out of Stock'}
                  </span>
                </div>

                <div className="book-card-body">
                  <p className="book-author">by {book.author || 'Unknown'}</p>
                  {book.isbn && <p className="book-isbn">ISBN: {book.isbn}</p>}
                  {book.description && <p className="book-description">{book.description.substring(0, 120)}...</p>}
                </div>

                <div className="book-card-stats">
                  <div className="stat">
                    <span className="label">Quantity</span>
                    <span className="value">{book.quantity}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Available</span>
                    <span className="value">{book.available_quantity}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Price</span>
                    <span className="value">${parseFloat(book.price || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="book-card-actions">
                  <button 
                    className="action-btn edit-btn" 
                    onClick={() => openEditModal(book)}
                    title="Edit book"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDeleteBook(book.id)}
                    title="Delete book"
                  >
                    🗑️ Delete
                  </button>
                  <button 
                    className="action-btn view-btn" 
                    title="View details"
                  >
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleAddBook} className="book-form">
              {formError && <div className="form-error">{formError}</div>}
              {formSuccess && <div className="form-success">{formSuccess}</div>}

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="Enter ISBN"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={bookForm.quantity}
                    onChange={(e) => setBookForm({ ...bookForm, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={bookForm.price}
                    onChange={(e) => setBookForm({ ...bookForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="Enter book description"
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={savingBook}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={savingBook}>
                  {savingBook ? 'Saving...' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookshelf;
