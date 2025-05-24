import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LandingPage from './components/landing/LandingPage'
import AuthPage from './components/auth/AuthPage'
import HomePage from './components/pages/HomePage'
import FacultyHomePage from './components/pages/FacultyHomePage'
import AdminHomePage from './components/pages/AdminHomePage'
import SharePortfolio from './components/pages/SharePortfolio'
import MyPortfolio from './components/pages/MyPortfolio'
import Profile from './components/pages/Profile'

// Protected Route Component with role check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'FACULTY') {
      return <Navigate to="/faculty/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<AuthPage mode="login" />} />
        <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
        
        {/* Student Dashboard and related routes */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <HomePage />
          </ProtectedRoute>
        } />

        {/* Faculty Dashboard */}
        <Route path="/faculty/dashboard/*" element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyHomePage />
          </ProtectedRoute>
        } />

        {/* Admin Dashboard and related routes */}
        <Route path="/admin/dashboard/*" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminHomePage />
          </ProtectedRoute>
        } />

        {/* Redirect based on role */}
        <Route path="*" element={
          isAuthenticated ? (
            userRole === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : userRole === 'FACULTY' ? (
              <Navigate to="/faculty/dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
