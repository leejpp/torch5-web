import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmtm_smKIAut-hX72UoAOCBXor3USdPmU",
  authDomain: "togy-website.firebaseapp.com",
  projectId: "togy-website",
  storageBucket: "togy-website.appspot.com", // Use the correct storage bucket URL format
  messagingSenderId: "446250862937",
  appId: "1:446250862937:web:63b1b73356d58e8352a448",
  measurementId: "G-C7VEXDEB0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the services for use in other parts of the application
export { app, auth, db, storage }; 