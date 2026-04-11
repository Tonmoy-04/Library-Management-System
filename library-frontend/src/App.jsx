import React, { Suspense, lazy, useMemo, useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Books = lazy(() => import('./pages/Books'));
const Readers = lazy(() => import('./pages/Readers'));
const Publishers = lazy(() => import('./pages/Publishers'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ReaderHome = lazy(() => import('./pages/reader/Home'));
const ReaderLibrary = lazy(() => import('./pages/reader/Library'));
const ReaderMyLibrary = lazy(() => import('./pages/reader/MyLibrary'));
const ReaderHistory = lazy(() => import('./pages/reader/History'));
const ReaderBookDetails = lazy(() => import('./pages/reader/BookDetails'));
const ReaderPortalLayout = lazy(() => import('./pages/reader/ReaderPortalLayout'));
const ReaderSettings = lazy(() => import('./pages/reader/Settings'));
const PublisherPortal = lazy(() => import('./pages/publishers/PublisherPortal'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
import './styles/global.css';
import './styles/dashboard.css';
import './pages/publishers/PublisherPortal.css';

function App() {
  const { isAuthenticated, initializing, isReader, isPublisher } = useAuth();

  const withSuspense = (node) => (
    <Suspense fallback={<div style={{ padding: '1.5rem', textAlign: 'center' }}>Loading page...</div>}>
      {node}
    </Suspense>
  );

  if (initializing) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading application...
      </div>
    );
  }

  const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            {withSuspense(<Dashboard />)}
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/books',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            {withSuspense(<Books />)}
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/readers',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            {withSuspense(<Readers />)}
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/publishers',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            {withSuspense(<Publishers />)}
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/transactions',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            {withSuspense(<Transactions />)}
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/settings',
        element: isAuthenticated && !isReader ? (
          <DashboardLayout>
            {withSuspense(<Settings />)}
          </DashboardLayout>
        ) : (
          <Navigate to={isAuthenticated ? '/reader/home' : '/login'} replace />
        ),
      },
      {
        path: '/reader/home',
        element: isAuthenticated && isReader ? (
          withSuspense(
            <ReaderLayout>
              <ReaderHome />
            </ReaderLayout>
          )
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/library',
        element: isAuthenticated && isReader ? (
          withSuspense(
            <ReaderLayout>
              <ReaderLibrary />
            </ReaderLayout>
          )
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/my-library',
        element: isAuthenticated && isReader ? (
          withSuspense(
            <ReaderLayout>
              <ReaderMyLibrary />
            </ReaderLayout>
          )
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/history',
        element: isAuthenticated && isReader ? (
          withSuspense(
            <ReaderLayout>
              <ReaderHistory />
            </ReaderLayout>
          )
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/books/:bookId',
        element: isAuthenticated && isReader ? (
          withSuspense(
            <ReaderLayout>
              <ReaderBookDetails />
            </ReaderLayout>
          )
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/reader/settings',
        element: isAuthenticated && isReader ? (
          withSuspense(
            <ReaderLayout>
              <ReaderSettings />
            </ReaderLayout>
          )
        ) : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/publisher/portal',
        element: isAuthenticated && isPublisher
          ? withSuspense(<PublisherPortal />)
          : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
      },
      {
        path: '/profile',
        element: isAuthenticated ? withSuspense(<Profile />) : <Navigate to="/login" replace />,
      },
      {
        path: '/login',
        element: isAuthenticated
          ? <Navigate to={isReader ? '/reader/home' : isPublisher ? '/publisher/portal' : '/'} replace />
          : withSuspense(<Login />),
      },
      {
        path: '/register',
        element: isAuthenticated
          ? <Navigate to={isReader ? '/reader/home' : '/'} replace />
          : withSuspense(<Register />),
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
