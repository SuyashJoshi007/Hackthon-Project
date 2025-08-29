// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6oVI-sFfbM78a3p-5Sz19JxdEqQCj9g0",
  authDomain: "rentalapp-abf21.firebaseapp.com",
  projectId: "rentalapp-abf21",
  storageBucket: "rentalapp-abf21.appspot.com", // ✅ fixed
  messagingSenderId: "37240048690",
  appId: "1:37240048690:web:ebf1023b5e3db9986b402b",
  measurementId: "G-P7KVGDJXE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firestore DB
export const auth = getAuth(app);
export const db = getFirestore(app);
