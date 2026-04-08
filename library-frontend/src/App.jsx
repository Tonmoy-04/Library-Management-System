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
import './styles/global.css';
import './styles/dashboard.css';

function App() {
  const { isAuthenticated, initializing, isAdmin, isReader } = useAuth();

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

  const ReaderLayout = ({ children }) => (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-layout">
        <main className="main-content" style={{ marginLeft: 0 }}>
          {children}
        </main>
      </div>
      <Footer offsetLeft={0} />
    </div>
  );

  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (isReader) {
      return <Navigate to="/reader/home" replace />;
    }

    return <DashboardLayout>{children}</DashboardLayout>;
  };

  const ReaderRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/dashboard',
        element: <AdminRoute><Dashboard /></AdminRoute>,
      },
      {
        path: '/books',
        element: <AdminRoute><Books /></AdminRoute>,
      },
      {
        path: '/readers',
        element: <AdminRoute><Readers /></AdminRoute>,
      },
      {
        path: '/publishers',
        element: <AdminRoute><Publishers /></AdminRoute>,
      },
      {
        path: '/transactions',
        element: <AdminRoute><Transactions /></AdminRoute>,
      },
      {
        path: '/reader/home',
        element: <ReaderRoute><ReaderLayout><ReaderHome /></ReaderLayout></ReaderRoute>,
      },
      {
        path: '/login',
        element: isAuthenticated ? (isReader ? <Navigate to="/reader/home" replace /> : <Navigate to="/dashboard" replace />) : <Login />,
      },
      {
        path: '/register',
        element: isAuthenticated ? (isReader ? <Navigate to="/reader/home" replace /> : <Navigate to="/dashboard" replace />) : <Register />,
      },
      {
        path: '*',
        element: isAuthenticated ? (isReader ? <Navigate to="/reader/home" replace /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />,
      },
    ],
    {
      future: {
        v7_relativeSplatPath: true,
      },
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
