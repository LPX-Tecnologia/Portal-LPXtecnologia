// ==========================================================
// FUNÇÕES UTILITÁRIAS COMPARTILHADAS
// ==========================================================

// Toast de notificação
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = mensagem;
    toast.className = `toast toast-${tipo}`;
    toast.style.display = 'block';
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Formatar data
function formatarData(data) {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
}

// Formatar hora
function formatarHora(data) {
    if (!data) return '';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Formatar moeda
function formatarMoeda(valor) {
    return 'R$ ' + (parseFloat(valor) || 0).toFixed(2);
}

// Gerar ID único
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Modal de confirmação
function mostrarConfirmacao(titulo, mensagem, callback) {
    const modal = document.getElementById('modalConfirmacao');
    if (!modal) return;
    
    document.getElementById('modalConfirmacaoTitulo').textContent = titulo;
    document.getElementById('modalConfirmacaoMensagem').textContent = mensagem;
    
    document.getElementById('modalConfirmacaoBtnSim').onclick = () => {
        fecharModal('modalConfirmacao');
        if (callback) callback();
    };
    
    modal.classList.add('active');
}

// Modal de input
function mostrarModalInput(titulo, placeholder, valorPadrao, callback) {
    const modal = document.getElementById('modalInput');
    if (!modal) return;
    
    document.getElementById('modalInputTitulo').textContent = titulo;
    document.getElementById('modalInputField').placeholder = placeholder || '';
    document.getElementById('modalInputField').value = valorPadrao || '';
    
    document.getElementById('modalInputBtnConfirmar').onclick = () => {
        const valor = document.getElementById('modalInputField').value;
        fecharModal('modalInput');
        if (callback) callback(valor);
    };
    
    modal.classList.add('active');
    setTimeout(() => document.getElementById('modalInputField').focus(), 300);
}

// Fechar modal
function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-modern')) {
        e.target.classList.remove('active');
    }
});

// Salvar no localStorage
function salvarLocal(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

// Carregar do localStorage
function carregarLocal(chave) {
    const item = localStorage.getItem(chave);
    return item ? JSON.parse(item) : null;
}

// Remover do localStorage
function removerLocal(chave) {
    localStorage.removeItem(chave);
}

// Debounce para performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('✅ Utilitários carregados!');