// ==========================================================
// CONFIGURAÇÃO FIREBASE (COMPARTILHADA)
// ==========================================================
const firebaseConfig = {
    apiKey: "AIzaSyAqN0DZ3fyV-Ns2kXNdwBMAXQgWLy1_jE0",
    authDomain: "barbearia-rm.firebaseapp.com",
    projectId: "barbearia-rm",
    storageBucket: "barbearia-rm.firebasestorage.app",
    messagingSenderId: "512819922057",
    appId: "1:512819922057:web:6a913791cb6435e4f63258",
    measurementId: "G-TKVLVLPBJH"
};

// Inicializar Firebase (evitar múltiplas inicializações)
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

console.log('🔥 Firebase inicializado com sucesso!');

// Exportar para uso global
window.db = db;
window.auth = auth;
window.firebase = firebase;