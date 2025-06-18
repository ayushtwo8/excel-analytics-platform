// In src/routes/AdminRoute.jsx
import React, { useEffect } from 'react'; // Add useEffect
import { useUserAuth } from '@/context/userAuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const AdminRoute = () => {
  const { login ,user, loading } = useUserAuth();

  console.log("Admin route")

  // --- ADD THIS CONSOLE LOG ---
  useEffect(() => {
    if (!loading) {
      console.log("AdminRoute Check:", {
        loading: loading,
        user: user,
        isAdmin: user ? user.role === 'admin' : 'No user object'
      });
    }
  }, [login,user, loading]);
  // -----------------------------

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl"/></div>;
  }

  if (user && user.role === 'admin') {
    return <Outlet />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default AdminRoute;