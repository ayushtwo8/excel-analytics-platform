import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Protected route component
const ProtectedRoute = ({ children }) => {
  let { user } = useUserAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AuthStateTest() {
  const { user } = useUserAuth();
  
  useEffect(() => {
    console.log("Current auth state:", user ? `Logged in as ${user.email}` : "Not logged in");
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
            <Route path="visualize" element={<Visualize />} />
            <Route path="history" element={<History />} />
            <Route path="insights" element={<SmartInsights />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/dashboard/visualize"
            element={
              <ProtectedRoute>
                <Visualize />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/insights"
            element={
              <ProtectedRoute>
                <SmartInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserAuthContextProvider>
  );
};

export default App;
