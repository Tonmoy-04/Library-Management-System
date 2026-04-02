import React, { useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
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
import './styles/global.css';
import './styles/dashboard.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const ProtectedRoute = ({ component: Component }) => {
    return isAuthenticated ? (
      <DashboardLayout>
        <Component />
      </DashboardLayout>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: isAuthenticated ? (
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        ) : (
          <Navigate to="/login" replace />
        ),
      },
      {
        path: '/books',
        element: isAuthenticated ? (
          <DashboardLayout>
            <Books />
          </DashboardLayout>
        ) : (
          <Navigate to="/login" replace />
        ),
      },
      {
        path: '/readers',
        element: isAuthenticated ? (
          <DashboardLayout>
            <Readers />
          </DashboardLayout>
        ) : (
          <Navigate to="/login" replace />
        ),
      },
      {
        path: '/publishers',
        element: isAuthenticated ? (
          <DashboardLayout>
            <Publishers />
          </DashboardLayout>
        ) : (
          <Navigate to="/login" replace />
        ),
      },
      {
        path: '/transactions',
        element: isAuthenticated ? (
          <DashboardLayout>
            <Transactions />
          </DashboardLayout>
        ) : (
          <Navigate to="/login" replace />
        ),
      },
      {
        path: '/login',
        element: <Login onLogin={() => setIsAuthenticated(true)} />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
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
