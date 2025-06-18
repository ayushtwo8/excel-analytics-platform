import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import {
  useUserAuth,
  UserAuthContextProvider,
} from "./context/userAuthContext";

// Page imports
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./components/Home";
import DashboardLayout from "./pages/DashboardLayout";
import Visualize from "./pages/Visualize";
import History from "./pages/History";
import SmartInsights from "./pages/SmartInsights";
import Profile from "./pages/Profile";
import ResetPassword from "./components/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminRoute from "./routes/adminRoutes";
import { FaSpinner } from "react-icons/fa";

// Protected route component
const ProtectedRoute = ({ children }) => {
  let { user, loading } = useUserAuth();

  if (loading) {
    // If we are loading, show a full-screen spinner and do NOT make a decision yet.
    // This gives onAuthStateChanged time to finish.
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  if (user) {
    // If a user exists, render the children that were passed in.
    return children; // <-- THE ONLY CHANGE
  } else {
    // Redirect if no user.
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AuthStateTest() {
  const { user } = useUserAuth();

  useEffect(() => {
    console.log(
      "Current auth state:",
      user ? `Logged in as ${user.email}` : "Not logged in"
    );
  }, [user]);

  return null;
}

const App = () => {
  return (
    <UserAuthContextProvider>
      <BrowserRouter>
        <AuthStateTest />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Index route for dashboard */}
            <Route index element={<Navigate to="visualize" replace />} />

            {/* Dashboard child routes */}
            <Route path="visualize/:dbFileId" element={<Visualize />} />
            <Route path="visualize" element={<Visualize />} />
            <Route path="history" element={<History />} />
            <Route path="insights" element={<SmartInsights />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              {/* <Route path="files" element={<AdminFileManagement />} /> */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserAuthContextProvider>
  );
};

export default App;
