import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSZ9EE_2PYo0BqWOk59ZA9mbXE2zYyDZQ",
  authDomain: "adil-ecommerce.firebaseapp.com",
  projectId: "adil-ecommerce",
  storageBucket: "adil-ecommerce.firebasestorage.app",
  messagingSenderId: "867430970207",
  appId: "1:867430970207:web:f037856e52f113e27dbcea",
  measurementId: "G-0C54G069H6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services and export them
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
