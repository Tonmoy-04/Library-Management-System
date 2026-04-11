import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useReaderDashboard from '../../hooks/useReaderDashboard';
import { Link } from 'react-router-dom';
import RecentReads from './components/RecentReads';
import '../../styles/reader.css';
import { Library, BookOpen, Bookmark, Clock, ArrowRight, Compass } from 'lucide-react';

const ReaderHome = () => {
  const { user } = useAuth();
  const {
    dashboard,
    books,
    error,
  } = useReaderDashboard();

  const purchasedBooks = dashboard?.purchased_books || [];
  const recentReads = dashboard?.recent_reads || [];
  const activityCount = dashboard?.activity?.length || 0;

  const purchasedById = useMemo(() => {
    const map = new Map();
    purchasedBooks.forEach((book) => map.set(Number(book.id), book));
    return map;
  }, [purchasedBooks]);

  const mergedBooks = useMemo(() => books.map((book) => {
    const purchased = purchasedById.get(Number(book.id));
    if (!purchased) {
      return book;
    }
    return {
      ...book,
      ...purchased,
      is_purchased: 1,
    };
  }), [books, purchasedById]);

  const summary = useMemo(() => {
    const bookmarkedCount = mergedBooks.filter((book) => Number(book.is_bookmarked) === 1).length;

    return {
      purchasedCount: purchasedBooks.length,
      totalBooks: mergedBooks.length,
      bookmarkedCount,
    };
  }, [mergedBooks, purchasedBooks]);

  const sectionCards = useMemo(() => ([
    {
      path: '/reader/library',
      label: 'Main Catalog',
      value: summary.totalBooks,
      description: 'Discover the full collection, explore categories, and acquire new titles.',
    },
    {
      path: '/reader/my-library',
      label: 'Personal Library',
      value: summary.purchasedCount + summary.bookmarkedCount,
      description: 'Access the books you own and revisit your saved bookmarks smoothly.',
    },
    {
      path: '/reader/history',
      label: 'Activity History',
      value: activityCount,
      description: 'Review your recent transactions and reading milestones securely.',
    },
  ]), [activityCount, summary.bookmarkedCount, summary.purchasedCount, summary.totalBooks]);

  return (
    <div className="reader-dashboard-page" style={{ padding: '0 0 2rem 0', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div className="page-header" style={{ marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="page-title" style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Reader <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-color, #64748b)', fontSize: '1.05rem', marginTop: '0.5rem', opacity: 0.8 }}>Welcome back{user?.name ? `, ${user.name}` : ''}. Let's jump back directly into your next adventure.</p>
        </div>
        <Link to="/reader/library" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
          Explore Books <BookOpen size={18} />
        </Link>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <article style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 25px -5px rgba(59, 130, 246, 0.5)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 25px -5px rgba(59, 130, 246, 0.4)'}}>
          <Library style={{ position: 'absolute', right: '-15px', top: '15px', opacity: 0.15, width: '120px', height: '120px', transform: 'rotate(-10deg)' }} />
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Your Collection</p>
          <h3 style={{ fontSize: '3.5rem', margin: '0.25rem 0', fontWeight: '800', lineHeight: 1 }}>{summary.purchasedCount}</h3>
          <small style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '500' }}>Owned titles in library</small>
        </article>

        <article style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 25px -5px rgba(139, 92, 246, 0.5)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 25px -5px rgba(139, 92, 246, 0.4)'}}>
          <BookOpen style={{ position: 'absolute', right: '-15px', top: '15px', opacity: 0.15, width: '120px', height: '120px', transform: 'rotate(-10deg)' }} />
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Available Catalog</p>
          <h3 style={{ fontSize: '3.5rem', margin: '0.25rem 0', fontWeight: '800', lineHeight: 1 }}>{summary.totalBooks}</h3>
          <small style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '500' }}>Total books ready to read</small>
        </article>

        <article style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 25px -5px rgba(236, 72, 153, 0.5)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 25px -5px rgba(236, 72, 153, 0.4)'}}>
          <Bookmark style={{ position: 'absolute', right: '-15px', top: '15px', opacity: 0.15, width: '120px', height: '120px', transform: 'rotate(-10deg)' }} />
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Saved Bookmarks</p>
          <h3 style={{ fontSize: '3.5rem', margin: '0.25rem 0', fontWeight: '800', lineHeight: 1 }}>{summary.bookmarkedCount}</h3>
          <small style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '500' }}>Active reading checkpoints</small>
        </article>
      </section>

      {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.25rem', borderRadius: '16px', color: '#ef4444', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
        <section style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-color, #f8fafc)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '0.65rem', borderRadius: '14px', color: '#3b82f6', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.1)' }}>
              <Compass size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-color, #0f172a)' }}>Quick Portals</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {sectionCards.map((section) => (
              <Link key={section.path} to={section.path} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-color, #f8fafc)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid transparent', boxShadow: '0 2px 4px transparent' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--card-bg, #ffffff)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-color, #f8fafc)'; e.currentTarget.style.boxShadow = '0 2px 4px transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{maxWidth: '85%'}}>
                  <h4 style={{ margin: '0 0 0.45rem 0', color: 'var(--text-color, #1e293b)', fontSize: '1.15rem', fontWeight: '700' }}>{section.label}</h4>
                  <p style={{ margin: 0, color: 'var(--text-color, #64748b)', fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.5 }}>{section.description}</p>
                </div>
                <div style={{ background: 'white', minWidth: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                  <ArrowRight size={20} strokeWidth={2.5} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border-color, #f8fafc)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', padding: '0.65rem', borderRadius: '14px', color: '#ef4444', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.1)' }}>
            <Clock size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-color, #0f172a)' }}>Recent Reads</h3>
        </div>
        <div style={{ background: 'var(--bg-color, #f8fafc)', borderRadius: '16px', overflow: 'hidden' }}>
          <RecentReads reads={recentReads} />
        </div>
      </section>

    </div>
  );
};

export default ReaderHome;