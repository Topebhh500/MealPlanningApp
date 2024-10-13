// firebase/config.js
import firebase from 'firebase/compat/app';  // Correct import for Firebase JS SDK
import 'firebase/compat/auth';               // Import Firebase Auth
import 'firebase/compat/firestore';          // Import Firestore

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0_EvTlSrp4z12DUgu8J5NQsJXqiOsRcc",
  authDomain: "my-meal-planning-b09b8.firebaseapp.com",
  projectId: "my-meal-planning-b09b8",
  storageBucket: "my-meal-planning-b09b8.appspot.com",
  messagingSenderId: "926443553913",
  appId: "1:926443553913:web:0b2c37f0746a65857100a8",
  measurementId: "G-XEJ0MZ0TKW"
};

// Initialize Firebase only if it hasn't been initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();  // <-- Use firebase.auth() function to get the auth instance
const firestore = firebase.firestore();

export { auth, firestore };
