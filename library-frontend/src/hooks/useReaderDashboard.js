import { useCallback, useEffect, useMemo, useState } from 'react';
import { readerPortalAPI } from '../services/api';

const DEFAULT_FILTERS = {
  search: '',
  author: '',
  category: '',
};

export const useReaderDashboard = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [dashboard, setDashboard] = useState({
    purchased_books: [],
    reading_progress: [],
    recent_reads: [],
    activity: [],
  });
  const [books, setBooks] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    const response = await readerPortalAPI.getDashboard();
    setDashboard(response.data?.data || {
      purchased_books: [],
      reading_progress: [],
      recent_reads: [],
      activity: [],
    });
  }, []);

  const fetchBooks = useCallback(async (activeFilters = filters) => {
    const params = {
      search: activeFilters.search || undefined,
      author: activeFilters.author || undefined,
      category: activeFilters.category || undefined,
    };

    const response = await readerPortalAPI.getBooks(params);
    setBooks(response.data?.data || []);
  }, [filters]);

  const refreshAll = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchDashboard(),
        fetchBooks(activeFilters),
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reader dashboard.');
    } finally {
      setLoading(false);
    }
  }, [fetchBooks, fetchDashboard, filters]);

  useEffect(() => {
    refreshAll(filters);
  }, []);

  const updateFilters = useCallback((nextFilters) => {
    setFilters((prev) => ({ ...prev, ...nextFilters }));
  }, []);

  const searchBooks = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      await fetchBooks(nextFilters);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load books.');
    } finally {
      setLoading(false);
    }
  }, [fetchBooks, filters]);

  const runAction = useCallback(async (action) => {
    setActionLoading(true);
    setError('');
    try {
      await action();
      await refreshAll(filters);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [filters, refreshAll]);

  const purchaseBook = useCallback((bookId) => runAction(() => readerPortalAPI.purchaseBook(bookId)), [runAction]);
  const downloadBook = useCallback((bookId) => runAction(() => readerPortalAPI.downloadBook(bookId)), [runAction]);
  const continueReading = useCallback((bookId) => runAction(() => readerPortalAPI.continueReading(bookId)), [runAction]);
  const saveProgress = useCallback((bookId, payload) => runAction(() => readerPortalAPI.saveProgress(bookId, payload)), [runAction]);

  const addBookmark = useCallback((payload) => runAction(() => readerPortalAPI.addBookmark(payload)), [runAction]);
  const removeBookmark = useCallback((bookmarkId) => runAction(() => readerPortalAPI.removeBookmark(bookmarkId)), [runAction]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    books.forEach((book) => {
      if (book.category) {
        set.add(book.category);
      }
    });
    return Array.from(set);
  }, [books]);

  return {
    filters,
    updateFilters,
    searchBooks,
    dashboard,
    books,
    bookmarks,
    categories,
    loading,
    actionLoading,
    error,
    refreshAll,
    purchaseBook,
    downloadBook,
    continueReading,
    saveProgress,
    addBookmark,
    removeBookmark,
  };
};

export default useReaderDashboard;
