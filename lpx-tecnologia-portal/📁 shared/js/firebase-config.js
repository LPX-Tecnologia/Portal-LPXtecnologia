// ==========================================================
// CONFIGURAÇÃO FIREBASE - PORTAL LPX TECNOLOGIA
// ==========================================================
const firebaseConfig = {
  apiKey: "AIzaSyAkJDVFY1cKpkLOi6cFT7e9dvxYCXl-Zj4",
  authDomain: "portal-lpxtecnologia.firebaseapp.com",
  projectId: "portal-lpxtecnologia",
  storageBucket: "portal-lpxtecnologia.firebasestorage.app",
  messagingSenderId: "260877708533",
  appId: "1:260877708533:web:3beb78ca4ac3042be329bc",
  measurementId: "G-5SNTWZET2X"
};

// Inicializar Firebase (versão compat)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Configurações do Firestore
db.settings({
    ignoreUndefinedProperties: true,
    merge: true
});

console.log('🔥 Firebase conectado: portal-lpxtecnologia');

// Disponibilizar globalmente
window.db = db;
window.auth = auth;
