import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext'

import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './components/Home'
import DashboardLayout from './pages/DashboardLayout'
import Visualize from './pages/Visualize'
import History from './pages/History'
import SmartInsights from './pages/SmartInsights'
import Profile from './pages/Profile'

// protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()

  return currentUser ? children : <Navigate to="/login" />
}

// redirect if logged in
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth()

  return !currentUser ? children : <Navigate to="/dashboard" />
}

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={ <PublicRoute><Login /></PublicRoute> } />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="visualize" element={<ProtectedRoute><Visualize /></ProtectedRoute>} />
          <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="insights" element={<ProtectedRoute><SmartInsights /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
