import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext'

import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'
import DashboardLayout from './components/DashboardLayout'
import Visualize from './pages/Visualize'
import History from './pages/History'
import Insights from './pages/Insights'
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
          <Route path="visualize" element={<Visualize />} />
          <Route path="history" element={<History />} />
          <Route path="insights" element={<Insights />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
