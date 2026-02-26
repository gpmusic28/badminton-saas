import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TournamentCreatePage from './pages/TournamentCreatePage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import RegistrationsPage from './pages/RegistrationsPage';
import BracketPage from './pages/BracketPage';
import PublicTournamentsPage from './pages/PublicTournamentsPage';
import PublicRegisterPage from './pages/PublicRegisterPage';
import UmpirePortalPage from './pages/UmpirePortalPage';
import TeamManagementPage from './pages/TeamManagementPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const isUmpirePage = window.location.pathname === '/umpire';
  const isPublicRegister = window.location.pathname.includes('/tournaments/') && window.location.pathname.includes('/register');
const isPublicAuthPage =
  ['/login', '/signup', '/register', '/forgot-password'].includes(window.location.pathname) || isPublicRegister;

  return (
    <>
      {!isUmpirePage && !isPublicAuthPage && user && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tournaments/public" element={<PublicTournamentsPage />} />
        <Route path="/tournaments/:id/register" element={<PublicRegisterPage />} />
        <Route path="/umpire" element={<UmpirePortalPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/tournaments/create" element={<PrivateRoute><TournamentCreatePage /></PrivateRoute>} />
        <Route path="/tournaments/:id" element={<PrivateRoute><TournamentDetailPage /></PrivateRoute>} />
        <Route path="/tournaments/:id/registrations" element={<PrivateRoute><RegistrationsPage /></PrivateRoute>} />
        <Route path="/tournaments/:id/bracket/:categoryId" element={<PrivateRoute><BracketPage /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><TeamManagementPage /></PrivateRoute>} />

        {/* Default */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
