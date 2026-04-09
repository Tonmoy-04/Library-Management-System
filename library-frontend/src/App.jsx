import React from 'react';
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
import ReaderBookDetails from './pages/reader/BookDetails';
import PublisherPortal from './pages/publishers/PublisherPortal';
import './styles/global.css';
import './styles/dashboard.css';

function App() {
  const { isAuthenticated, initializing, isReader, isPublisher } = useAuth();

  if (initializing) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading application...
      </div>
    );
  }

  const DashboardLayout = ({ children }) => (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );

  const readerNavItems = [
    { path: '/reader/home', label: 'Dashboard', icon: '📚' },
  ];

  const ReaderLayout = ({ children }) => (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar navItems={readerNavItems} logoutRedirectPath="/login" />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );

  const router = createBrowserRouter(
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
        path: '/reader/home',
        element: isAuthenticated && isReader ? (
          <ReaderLayout>
            <ReaderHome />
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
        path: '/publisher/portal',
        element: isAuthenticated && isPublisher ? <PublisherPortal /> : <Navigate to={isAuthenticated ? '/' : '/login'} replace />,
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
  );

  return <RouterProvider router={router} />;
}

export default App;
