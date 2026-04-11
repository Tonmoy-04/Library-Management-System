import React, { useMemo, useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Readers from './pages/Readers';
import Publishers from './pages/Publishers';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';
import ReaderHome from './pages/reader/Home';
import ReaderLibrary from './pages/reader/Library';
import ReaderMyLibrary from './pages/reader/MyLibrary';
import ReaderHistory from './pages/reader/History';
import ReaderBookDetails from './pages/reader/BookDetails';
import ReaderPortalLayout from './pages/reader/ReaderPortalLayout';
import ReaderSettings from './pages/reader/Settings';
import PublisherPortal from './pages/publishers/PublisherPortal';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles/global.css';
import './styles/dashboard.css';
import './pages/publishers/PublisherPortal.css';

function App() {
  const { isAuthenticated, initializing, isReader, isPublisher } = useAuth();

  if (initializing) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading application...
      </div>
    );
  }

  const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 768);

    return (
      <div className="app-container publisher-portal">
        <Navbar
          showMenuToggle
          isMenuOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div
            className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    );
  };

  const ReaderLayout = ({ children }) => (
    <ReaderPortalLayout>{children}</ReaderPortalLayout>
  );

  const router = useMemo(() => createBrowserRouter(
    [
      {
        path: '/',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/books',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            <Books />
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/readers',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            <Readers />
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/publishers',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            <Publishers />
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/transactions',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            <Transactions />
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/settings',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/reader/home',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderHome />
          </ReaderLayout>
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/library',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderLibrary />
          </ReaderLayout>
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/my-library',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderMyLibrary />
          </ReaderLayout>
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/history',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderHistory />
          </ReaderLayout>
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/books/:bookId',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderBookDetails />
          </ReaderLayout>
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/settings',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderSettings />
          </ReaderLayout>
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/publisher/portal',
        element: isAuthenticated && isPublisher ? <PublisherPortal /> : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/profile',
        element: isAuthenticated ? <Profile /> : <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: isAuthenticated ? <Navigate to={isReader ? '/reader/home' : isPublisher ? '/publisher/portal' : '/'} replace /> : <Login />,
      },
      {
        path: '/register',
        element: isAuthenticated ? <Navigate to={isReader ? '/reader/home' : '/'} replace /> : <Register />,
      },
      {
        path: '*',
        element: isAuthenticated ? <Navigate to={isReader ? '/reader/home' : isPublisher ? '/publisher/portal' : '/'} replace /> : <Navigate to="/login" replace />,
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  ), [isAuthenticated, isReader, isPublisher]);

  return <RouterProvider router={router} />;
}

export default App;
