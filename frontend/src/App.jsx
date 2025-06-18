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
import About from "./pages/About";
import Contact from "./pages/Contact";

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
        </Routes>
      </BrowserRouter>
    </UserAuthContextProvider>
  );
};

export default App;
