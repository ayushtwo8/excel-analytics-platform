import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

const userAuthContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUser(null);
    return signOut(auth);
  }

  function googleSignIn() {
    const Provider = new GoogleAuthProvider();

    return signInWithPopup(auth, Provider);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

 useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Get the Firebase ID Token
          const idToken = await firebaseUser.getIdToken();
          // Store it for other API calls throughout the app
          localStorage.setItem("idToken", idToken);

          // 2. Fetch the user's profile from your backend
          const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.data.success) {
            const backendProfile = response.data.data;
            console.log("backend profile data: ", backendProfile)
            
            // 3. MERGE Firebase auth data with your backend profile
            setUser({
              ...firebaseUser,      // uid, email, etc. from Firebase
              ...backendProfile,    // role, status, etc. from your MongoDB
            });
          } else {
            // Handle case where user exists in Firebase but not your DB
            console.error("User authenticated with Firebase, but no profile found in backend DB.");
            setUser(firebaseUser); // Fallback to just the firebase user
          }
        } catch (error) {
          console.error("Failed to fetch user profile from backend:", error);
          // If the profile fetch fails, log out to prevent inconsistent state
          await logout();
        }

      } else {
        // User is not logged in
        setUser(null);
        localStorage.removeItem("idToken");
      }
      setLoading(false); // Set loading to false after all checks are done
    });

    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array is correct here

  return (
    <userAuthContext.Provider value={{ user, loading, signUp, login, logout, googleSignIn, resetPassword }}>
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
