function toggleTema() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('barbeariaRM_tema', isLight ? 'light' : 'dark');
    const icone = document.querySelector('.loja-header-btn i.fa-moon, .loja-header-btn i.fa-sun');
    if (icone) icone.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
}

if (localStorage.getItem('barbeariaRM_tema') === 'light') {
    document.body.classList.add('light-mode');
}
