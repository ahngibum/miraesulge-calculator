import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ★ 여기에 아까 메모해둔 키 값을 붙여넣으세요! ★
const firebaseConfig = {
apiKey: "AIzaSyBJJshV9s_0wTNK_KM4moBC2qG_E8xErKo",
  authDomain: "nojunge-9ebbb.firebaseapp.com",
  projectId: "nojunge-9ebbb",
  storageBucket: "nojunge-9ebbb.firebasestorage.app",
  messagingSenderId: "817970933502",
  appId: "1:817970933502:web:c1cebcaf10cdc681bb3faf"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, getDocs, query, where, orderBy };