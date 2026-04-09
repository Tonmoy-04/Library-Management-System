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
    description: '',
    price: 0,
    pdf: null,
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
          book.author?.toLowerCase().includes(query)
      );
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

    if (!editingBook && !bookForm.pdf) {
      setFormError('Book PDF is required');
      return;
    }

    setSavingBook(true);
    try {
      if (editingBook) {
        const payload = {
          title: bookForm.title,
          author: bookForm.author,
          description: bookForm.description,
          price: bookForm.price,
          publisher_id: publisherId,
        };
        await publisherAPI.updateBook(publisherId, editingBook.id, payload);
        setFormSuccess('Book updated successfully!');
      } else {
        const formData = new FormData();
        formData.append('title', bookForm.title);
        formData.append('author', bookForm.author);
        formData.append('description', bookForm.description);
        formData.append('price', bookForm.price);
        formData.append('publisher_id', publisherId);
        if (bookForm.pdf) {
          formData.append('pdf', bookForm.pdf);
        }
        await publisherAPI.createBook(publisherId, formData);
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
      await publisherAPI.deleteBook(publisherId, bookId);
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
      description: book.description || '',
      price: book.price || 0,
      pdf: null,
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
      description: '',
      price: 0,
      pdf: null,
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
            placeholder="🔍 Search by title or author..."
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
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id} className="book-row">
                  <td className="book-title-cell">{book.title}</td>
                  <td className="book-author-cell">{book.author || 'Unknown'}</td>
                  <td className="book-price-cell">${parseFloat(book.price || 0).toFixed(2)}</td>
                  <td className="book-status-cell">
                    <span className="book-status published">
                      ✓ Published
                    </span>
                  </td>
                  <td className="book-actions-cell">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <label>Price ($) *</label>
                <input
                  type="number"
                  value={bookForm.price === 0 ? '' : bookForm.price}
                  onChange={(e) => setBookForm({ ...bookForm, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter price"
                  step="0.01"
                  min="0"
                  required
                />
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

              <div className="form-group">
                <label>Book PDF *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBookForm({ ...bookForm, pdf: e.target.files[0] || null })}
                  placeholder="Select PDF file"
                  required
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
