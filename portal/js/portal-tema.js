// ==========================================================
// TEMA CLARO/ESCURO DO PORTAL
// ==========================================================

function toggleTema() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    salvarLocal('tema', isLight ? 'light' : 'dark');
    atualizarIconeTema();
    mostrarToast(isLight ? '☀️ Modo claro!' : '🌙 Modo escuro!', 'info');
}

function inicializarTema() {
    const tema = carregarLocal('tema');
    if (tema === 'light') {
        document.body.classList.add('light-mode');
    }
    atualizarIconeTema();
}

function atualizarIconeTema() {
    const icone = document.querySelector('.portal-theme-btn i');
    if (icone) {
        icone.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }
}