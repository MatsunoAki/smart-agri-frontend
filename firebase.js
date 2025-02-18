import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyCiCadn4yWKCEeWGCMgMFRXf8Ka8kgGT4s",
    authDomain: "smart-agri-irrigation.firebaseapp.com",
    projectId: "smart-agri-irrigation",
    storageBucket: "smart-agri-irrigation.appspot.com",
    messagingSenderId: "496188879553",
    appId: "1:496188879553:web:060a27c295694adc3a5a40",
    measurementId: "G-HRG4SNCV1J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
