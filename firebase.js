import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD1QnKPohCoYQ8h3RvenvrrX8PilmmpN08",
    authDomain: "wallora-bb207.firebaseapp.com",
    projectId: "wallora-bb207",
    storageBucket: "wallora-bb207.firebasestorage.app",
    messagingSenderId: "11032501438",
    appId: "1:11032501438:web:27dad2fa92ed8a3d8dd2ef"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export {
    app,
    auth,
    db
};