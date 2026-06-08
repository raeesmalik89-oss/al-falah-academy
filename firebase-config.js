const firebaseConfig = {
  apiKey: "AIzaSyA2to0KiZjK6xxjHv1V69RwCrxLrMjLnTo",
  authDomain: "al-falah-academy-d6bec.firebaseapp.com",
  projectId: "al-falah-academy-d6bec",
  storageBucket: "al-falah-academy-d6bec.firebasestorage.app",
  messagingSenderId: "719524751780",
  appId: "1:719524751780:web:a6ec62fa5019f41ef47931",
  measurementId: "G-9KM8FWM46X"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
