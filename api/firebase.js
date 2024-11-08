// firebase/config.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';  // Add this line

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

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();  // Add this line

export { auth, firestore, storage };  // Export storage