import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import Login from './pages/Login';
import './styles/global.css';
import './styles/dashboard.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="dashboard-layout">
          <Sidebar />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
