import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import CryptoJS from 'crypto-js';

const firebaseConfig = {
  apiKey: "AIzaSyBQhlKHBMGKuT95pM6kP6AH7Mv-xhJelBo",
  authDomain: "togy-web.firebaseapp.com",
  projectId: "togy-web",
  storageBucket: "togy-web.appspot.com",
  messagingSenderId: "61696764840",
  appId: "1:61696764840:web:53096a4fe0ae1622e9cb9d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const hashPassword = (password) => {
  const salt = process.env.REACT_APP_PASSWORD_SALT;
  return CryptoJS.SHA256(password + salt).toString();
};

export const verifyPassword = (password) => {
  const hashedInput = hashPassword(password);
  return hashedInput === process.env.REACT_APP_ADMIN_PASSWORD_HASH;
}; 