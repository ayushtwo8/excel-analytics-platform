import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Check token validity early to avoid unnecessary API calls
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // You could add JWT expiry checking here if your tokens contain expiry data
    // For Firebase tokens, you might need to validate on the server
    return true;
  };
  
  // Helper to handle auth failures consistently
  const handleAuthFailure = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Refresh user profile from backend
  // Define this BEFORE the useEffect that uses it
  const refreshProfile = async () => {
    // Don't fetch profile if we don't have a valid token
    if (!isTokenValid()) {
      handleAuthFailure();
      return;
    }
    
    setProfileLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/v1/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      
      // If we get an auth error, clear the tokens
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleAuthFailure();
      }
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Handle authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // User is signed in
          const token = await user.getIdToken();
          localStorage.setItem('token', token);
          localStorage.setItem('uid', user.uid);
          setCurrentUser(user);
          
          // Only fetch profile if we have a valid user and token
          await refreshProfile();
        } catch (error) {
          console.error("Error setting user:", error);
          handleAuthFailure();
        }
      } else {
        // User is signed out
        handleAuthFailure();
      }
      setAuthLoading(false);
    });

    // If there's no auth state change but we have a token, try to use it
    if (!auth.currentUser && localStorage.getItem('token')) {
      refreshProfile().catch(handleAuthFailure);
    }
    
    return () => unsubscribe();
  }, []);

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!isTokenValid()) {
      throw new Error("Not authenticated");
    }
    
    setProfileLoading(true);
    try {
      const response = await axios.put(`${backendUrl}/api/v1/user/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUserProfile(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error.response?.data?.message || error.message);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('uid');
      localStorage.clear();
      setCurrentUser(null);
      setUserProfile(null);
      
      // Force navigate to login
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      authLoading,
      profileLoading,
      refreshProfile,
      updateProfile,
      logout,
      isAuthenticated: !!currentUser || isTokenValid()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);