
 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";

export const firebaseConfig = {
     apiKey: "AIzaSyB-TiK2UGaWi2NiNuatGjYvq0vuGu4O6Dw",
    authDomain: "agfilms-923af.firebaseapp.com",
    projectId: "agfilms-923af",
    storageBucket: "agfilms-923af.firebasestorage.app",
    messagingSenderId: "931017616449",
    appId: "1:931017616449:web:fa68489ab48437d16c2ac0",
    measurementId: "G-F3YXMQB85B"
};

 // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);