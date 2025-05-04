import React from 'react'
import { BrowserRouter, Router, Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext'

import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'
import Dashboard from './components/Dashboard'

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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
