function toggleTema() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    salvarLocal('tema', isLight ? 'light' : 'dark');
    const icone = document.querySelector('.loja-theme-btn i');
    if (icone) icone.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    mostrarToast(isLight ? '☀️ Modo claro!' : '🌙 Modo escuro!', 'info');
}

function inicializarTema() {
    if (carregarLocal('tema') === 'light') {
        document.body.classList.add('light-mode');
    }
}