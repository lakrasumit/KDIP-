import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DocumentHub from './pages/DocumentHub';
import KnowledgeSearch from './pages/KnowledgeSearch';
import ComplianceTracker from './pages/ComplianceTracker';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout userRole={userRole} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
          <Route path="/documents" element={<DocumentHub userRole={userRole} />} />
          <Route path="/search" element={<KnowledgeSearch userRole={userRole} />} />
          <Route path="/compliance" element={<ComplianceTracker userRole={userRole} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
