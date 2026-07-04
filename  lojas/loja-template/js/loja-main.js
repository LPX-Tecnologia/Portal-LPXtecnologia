// ==========================================================
// INICIALIZAÇÃO DA LOJA
// ==========================================================

let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Loja iniciando...');
    
    // Verificar sessão
    const usuario = carregarLocal('usuario');
    const loja = carregarLocal('lojaSelecionada');
    
    if (!usuario || !loja) {
        // Voltar para o portal
        window.location.href = '../../portal/index.html';
        return;
    }
    
    usuarioLogado = usuario;
    
    // Atualizar header com dados da loja
    document.getElementById('lojaHeaderLogo').src = loja.logo || '../../assets/images/default-logo.png';
    document.getElementById('lojaHeaderNome').textContent = loja.nome || 'Loja';
    document.getElementById('lojaHeaderSlogan').textContent = loja.slogan || '';
    
    // Atualizar welcome
    document.getElementById('welcomeNome').textContent = usuario.nome || 'Usuário';
    
    // Inicializar tema
    inicializarTema();
    
    // Carregar dados
    mostrarTela('telaHome');
    
    console.log('✅ Loja pronta!');
});

// Navegação
function mostrarTela(id) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Atualizar bottom nav
    const navMap = {
        'telaHome': 0,
        'telaCriarPost': 1,
        'telaExtrato': 2,
        'telaLive': 3,
        'telaPerfil': 4
    };
    
    document.querySelectorAll('.nav-item').forEach((item, i) => {
        item.classList.toggle('active', i === navMap[id]);
    });
    
    // Carregar dados específicos
    if (id === 'telaHome') {
        carregarAgendamentos();
        carregarPlanos();
        carregarPosts();
        carregarFaturamento();
    }
    if (id === 'telaExtrato') carregarFaturamento();
    if (id === 'telaLive') carregarLive();
    if (id === 'telaPerfil') carregarPerfil();
    
    window.scrollTo(0, 0);
}

// Confirmar saída
function confirmarSaida() {
    mostrarConfirmacao(
        'Sair da Loja',
        'Tem certeza que deseja sair e voltar ao portal?',
        () => {
            removerLocal('usuario');
            window.location.href = '../../portal/index.html';
        }
    );
}