// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmcUv3wMgQgWeMgSFiQAAvKpFVGCuJLyM",
    authDomain: "job-hub-7d847.firebaseapp.com",
    projectId: "job-hub-7d847",
    storageBucket: "job-hub-7d847.firebasestorage.app",
    messagingSenderId: "963315391897",
    appId: "1:963315391897:web:3c5e9f7d512a9ad49e0708"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app; 