import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Sync user with backend and get profile data
  const syncUserWithBackend = async (user) => {
    if(!user) {
      return;
    }

    try {
      setProfileLoading(true);
      const token = await user.getIdToken(true);
      setIdToken(token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(`${backendUrl}/api/v1/user/profile`);
      setUserProfile(response.data);
      console.log("User profile loaded:", response.data);
    }
    catch (error) {
      console.error("Error syncing user with backend:", error.response?.data?.message || error.message);
      
      // If profile not found (404), we might want to create it
      if (error.response?.status === 404) {
        await createUserProfile(user);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Create initial user profile
  const createUserProfile = async (user) => {
    try {
      // Create basic profile with data from Firebase Auth
      const initialProfile = {
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL || '',
      };
      
      const response = await axios.post(`${backendUrl}/api/v1/user/profile`, initialProfile);
      setUserProfile(response.data);
      console.log("Initial profile created:", response.data);
    } catch (error) {
      console.error("Error creating user profile:", error.response?.data?.message || error.message);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!currentUser) return;
    
    try {
      setProfileLoading(true);
      const response = await axios.put(`${backendUrl}/api/v1/user/profile`, profileData);
      setUserProfile(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error.response?.data?.message || error.message);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if(user){
        await syncUserWithBackend(user);
      } else{
        setIdToken(null);
        setUserProfile(null);
        delete axios.defaults.headers.common["Authorization"];
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    idToken,
    loading,
    userProfile,
    profileLoading,
    updateProfile,
    refreshProfile: () => syncUserWithBackend(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}