import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Assuming firebase config is in src/firebase.js
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword as firebaseSignIn } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await firebaseSignIn(auth, email, password);
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Login error:", error);
      // Handle login errors (e.g., show message to user)
      throw error; // Re-throw error to be caught by the caller if needed
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      console.error("Logout error:", error);
      // Handle logout errors
    }
  };

  const value = {
    user, // Provide the user object (contains uid, email, etc.)
    isAuthenticated: !!user, // Boolean flag for authentication status
    loading, // Loading state for initial auth check
    login,   // Login function
    logout,  // Logout function
  };

  // Don't render children until initial auth state check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 