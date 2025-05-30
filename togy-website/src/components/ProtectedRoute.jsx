import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth } from '../firebase'; // Adjust the path as necessary

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: loading, true: authenticated, false: not authenticated
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true); // Start loading
      if (user) {
        // User is signed in, check if they are an admin
        const db = getFirestore();
        const adminDocRef = doc(db, "adminUid", user.uid);
        try {
          const docSnap = await getDoc(adminDocRef);
          if (docSnap.exists()) {
            // Document exists, user is an admin
            setIsAuthenticated(true);
          } else {
            // Document does not exist, user is not an admin
            console.warn("User is logged in but not found in adminUid collection.");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error checking admin status: ", error);
          setIsAuthenticated(false); // Treat error as not authenticated
        }
      } else {
        // User is signed out.
        setIsAuthenticated(false);
      }
      setIsLoading(false); // Finish loading
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) { // Check loading state first
    // Show a loading indicator while checking auth and admin status
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedRoute; 