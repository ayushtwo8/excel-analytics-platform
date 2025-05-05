import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Page imports
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './components/Home';
import DashboardLayout from './pages/DashboardLayout';
import Visualize from './pages/Visualize';
import History from './pages/History';
import SmartInsights from './pages/SmartInsights';
import Profile from './pages/Profile';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  return currentUser ? children : <Navigate to="/login" />;
};

// Redirect if already logged in
const PublicRoute = ({ children }) => {
  const { currentUser, authLoading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Redirect to dashboard if already authenticated
  return !currentUser ? children : <Navigate to="/dashboard" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        
        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Index route for dashboard */}
          <Route index element={<Navigate to="visualize" replace />} />
          
          {/* Dashboard child routes */}
          <Route path="visualize" element={<Visualize />} />
          <Route path="history" element={<History />} />
          <Route path="insights" element={<SmartInsights />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;