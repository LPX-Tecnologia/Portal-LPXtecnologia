// ==========================================================
// BARBEARIA RM - ARQUIVO PRINCIPAL
// ==========================================================

// Configurações da loja
const LOJA_CONFIG = {
    nome: 'Barbearia RM',
    slogan: 'Atitude, Estilo e Confiança',
    logo: 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=RM',
    whatsapp: '(11) 99999-9999',
    endereco: 'Rua Augusta, 1234 - São Paulo',
    estrelas: 4.8,
    cortes: 1200,
    distancia: '2.5km'
};

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Barbearia RM iniciando...');
    
    // Carregar configurações da loja
    carregarConfigLoja();
    
    // Carregar dados
    carregarPostsLoja();
    carregarPlanosLoja();
    
    // Verificar live
    verificarLiveAtiva();
    
    // Carregar faturamento se estiver na tela
    if (document.getElementById('faturamentoHoje')) {
        carregarFaturamento();
    }
    
    // Carregar agendamentos se estiver na tela
    if (document.getElementById('agendamentosBarbeiroContainer')) {
        carregarAgendamentosBarbeiro();
    }
    
    console.log('✅ Barbearia RM pronta!');
    console.log('📊 Loja:', LOJA_CONFIG.nome);
});

// ==========================================================
// CONFIGURAÇÃO DA LOJA
// ==========================================================
function carregarConfigLoja() {
    // Atualizar logo no header
    const logoHeader = document.getElementById('lojaLogo');
    if (logoHeader) {
        logoHeader.src = LOJA_CONFIG.logo;
        logoHeader.alt = LOJA_CONFIG.nome;
    }
    
    // Atualizar logo no perfil
    const logoPerfil = document.getElementById('lojaPerfilLogo');
    if (logoPerfil) {
        logoPerfil.src = LOJA_CONFIG.logo;
        logoPerfil.alt = LOJA_CONFIG.nome;
    }
    
    // Atualizar informações de contato
    const contatoWhatsapp = document.getElementById('lojaWhatsapp');
    const contatoEndereco = document.getElementById('lojaEndereco');
    
    if (contatoWhatsapp) contatoWhatsapp.textContent = LOJA_CONFIG.whatsapp;
    if (contatoEndereco) contatoEndereco.textContent = LOJA_CONFIG.endereco;
}

// ==========================================================
// NAVEGAÇÃO ENTRE TELAS
// ==========================================================
function mostrarTela(id) {
    // Esconder todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('active');
        tela.style.display = 'none';
    });
    
    // Mostrar tela selecionada
    const tela = document.getElementById(id);
    if (tela) {
        tela.classList.add('active');
        tela.style.display = 'block';
    }
    
    // Atualizar botões do menu inferior
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navMap = {
        'telaHome': 0,
        'telaPosts': 1,
        'telaExtrato': 2,
        'telaLive': 3,
        'telaPerfil': 4
    };
    
    const navItems = document.querySelectorAll('.nav-item');
    if (navMap[id] !== undefined && navItems[navMap[id]]) {
        navItems[navMap[id]].classList.add('active');
    }
    
    // Carregar dados específicos da tela
    switch (id) {
        case 'telaHome':
            carregarFaturamento();
            carregarAgendamentosBarbeiro();
            break;
        case 'telaPosts':
            carregarPostsLoja();
            break;
        case 'telaExtrato':
            carregarFaturamento();
            break;
        case 'telaLive':
            carregarLive();
            break;
        case 'telaPerfil':
            carregarPerfilLoja();
            break;
    }
    
    // Scroll para o topo
    window.scrollTo(0, 0);
}

// ==========================================================
// PERFIL DA LOJA
// ==========================================================
function carregarPerfilLoja() {
    const perfilNome = document.getElementById('perfilLojaNome');
    const perfilSlogan = document.getElementById('perfilLojaSlogan');
    const perfilLogo = document.getElementById('perfilLojaLogo');
    
    if (perfilNome) perfilNome.textContent = LOJA_CONFIG.nome;
    if (perfilSlogan) perfilSlogan.textContent = LOJA_CONFIG.slogan;
    if (perfilLogo) perfilLogo.src = LOJA_CONFIG.logo;
    
    console.log('👤 Perfil da loja carregado');
}

// ==========================================================
// UTILITÁRIOS
// ==========================================================
function formatarMoeda(valor) {
    return 'R$ ' + (parseFloat(valor) || 0).toFixed(2);
}

function formatarData(data) {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarHora(data) {
    if (!data) return '';
    return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==========================================================
// SAIR DA LOJA
// ==========================================================
function sairLoja() {
    if (confirm('🚪 Tem certeza que deseja sair da loja?')) {
        // Limpar dados locais
        localStorage.removeItem('barbeariaRM_loja');
        localStorage.removeItem('barbeariaRM_usuario');
        
        // Redirecionar para o portal
        window.location.href = '../../portal/index.html';
    }
}

// ==========================================================
// COMPARTILHAR LOJA
// ==========================================================
function compartilharLoja() {
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: LOJA_CONFIG.nome,
            text: LOJA_CONFIG.slogan,
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => {
            mostrarToast('📋 Link copiado!', 'success');
        }).catch(() => {
            prompt('📋 Copie o link:', url);
        });
    }
}

// ==========================================================
// WHATSAPP
// ==========================================================
function abrirWhatsapp() {
    const numero = LOJA_CONFIG.whatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent('Olá! Vim pelo portal LPX Tecnologia e gostaria de agendar um horário.');
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
}

console.log('🏪 Módulo principal da Barbearia RM carregado!');
