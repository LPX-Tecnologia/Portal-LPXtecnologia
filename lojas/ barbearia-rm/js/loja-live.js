// ==========================================================
// BARBEARIA RM - LIVE STREAMING
// ==========================================================

var liveAtiva = false;
var liveChatMessages = [];
var liveChatInterval = null;
var liveViewerId = null;

// ==========================================================
// INICIAR LIVE
// ==========================================================
async function iniciarLive() {
    const titulo = document.getElementById('liveTitulo')?.value.trim() || '🔴 Live - Barbearia RM';
    
    try {
        await db.collection('lives').doc('live_atual').set({
            id: 'live_atual',
            barbeiroId: 'barbearia-rm',
            barbeiroNome: 'Barbearia RM',
            titulo: titulo,
            ativa: true,
            chat: [],
            viewers: 0,
            totalViews: 0,
            likes: 0,
            telaAtiva: 1,
            dataInicio: new Date().toISOString()
        });
        
        liveAtiva = true;
        liveChatMessages = [];
        
        // Atualizar interface
        const placeholder = document.getElementById('livePlaceholder');
        const player = document.getElementById('livePlayer');
        const status = document.getElementById('liveStatus');
        const controls = document.getElementById('liveControls');
        
        if (placeholder) placeholder.style.display = 'none';
        if (player) player.style.display = 'block';
        if (status) status.style.display = 'block';
        if (controls) controls.style.display = 'none';
        
        // Atualizar informações
        const statusTitulo = document.getElementById('liveStatusTitulo');
        const statusBarbeiro = document.getElementById('liveStatusBarbeiro');
        const viewerCount = document.getElementById('liveViewerCount');
        
        if (statusTitulo) statusTitulo.textContent = titulo;
        if (statusBarbeiro) statusBarbeiro.textContent = '👤 Barbearia RM';
        if (viewerCount) viewerCount.textContent = '👥 0';
        
        // Iniciar chat
        iniciarChatListener();
        
        mostrarToast('🔴 Live iniciada com sucesso!', 'success');
        console.log('🔴 Live iniciada:', titulo);
        
    } catch (error) {
        console.error('Erro ao iniciar live:', error);
        mostrarToast('❌ Erro ao iniciar live!', 'error');
    }
}

// ==========================================================
// ENCERRAR LIVE
// ==========================================================
async function encerrarLive() {
    if (!confirm('📴 Tem certeza que deseja encerrar a transmissão?')) return;
    
    try {
        await db.collection('lives').doc('live_atual').update({
            ativa: false,
            dataFim: new Date().toISOString()
        });
        
        liveAtiva = false;
        liveChatMessages = [];
        
        // Parar chat
        pararChatListener();
        
        // Atualizar interface
        const placeholder = document.getElementById('livePlaceholder');
        const player = document.getElementById('livePlayer');
        const status = document.getElementById('liveStatus');
        const controls = document.getElementById('liveControls');
        
        if (placeholder) placeholder.style.display = 'block';
        if (player) player.style.display = 'none';
        if (status) status.style.display = 'none';
        if (controls) controls.style.display = 'block';
        
        // Limpar chat
        atualizarChat();
        
        mostrarToast('⏹ Live encerrada!', 'info');
        console.log('⏹ Live encerrada');
        
    } catch (error) {
        console.error('Erro ao encerrar live:', error);
        mostrarToast('❌ Erro ao encerrar!', 'error');
    }
}

// ==========================================================
// CARREGAR LIVE
// ==========================================================
async function carregarLive() {
    try {
        const doc = await db.collection('lives').doc('live_atual').get();
        
        if (doc.exists && doc.data().ativa) {
            liveAtiva = true;
            const live = doc.data();
            
            // Mostrar player
            const placeholder = document.getElementById('livePlaceholder');
            const player = document.getElementById('livePlayer');
            const status = document.getElementById('liveStatus');
            
            if (placeholder) placeholder.style.display = 'none';
            if (player) player.style.display = 'block';
            if (status) status.style.display = 'block';
            
            // Atualizar info
            const statusTitulo = document.getElementById('liveStatusTitulo');
            const statusBarbeiro = document.getElementById('liveStatusBarbeiro');
            
            if (statusTitulo) statusTitulo.textContent = live.titulo || '🔴 Live';
            if (statusBarbeiro) statusBarbeiro.textContent = '👤 ' + (live.barbeiroNome || 'Barbearia RM');
            
            // Carregar chat
            liveChatMessages = live.chat || [];
            atualizarChat();
            
            // Iniciar listener
            iniciarChatListener();
            
            console.log('📡 Live carregada');
        } else {
            liveAtiva = false;
            
            const placeholder = document.getElementById('livePlaceholder');
            const player = document.getElementById('livePlayer');
            const status = document.getElementById('liveStatus');
            
            if (placeholder) placeholder.style.display = 'block';
            if (player) player.style.display = 'none';
            if (status) status.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao carregar live:', error);
        liveAtiva = false;
    }
}

// ==========================================================
// CHAT
// ==========================================================
function iniciarChatListener() {
    pararChatListener();
    
    liveChatInterval = setInterval(async () => {
        try {
            const doc = await db.collection('lives').doc('live_atual').get();
            
            if (doc.exists && doc.data().ativa) {
                const novasMensagens = doc.data().chat || [];
                
                // Atualizar chat se houver novas mensagens
                if (novasMensagens.length !== liveChatMessages.length) {
                    liveChatMessages = novasMensagens;
                    atualizarChat();
                }
                
                // Atualizar contagem de viewers
                const viewersAtivos = doc.data().viewersAtivos || {};
                const count = Object.keys(viewersAtivos).length;
                const viewerCount = document.getElementById('liveViewerCount');
                if (viewerCount) {
                    viewerCount.textContent = '👥 ' + count + ' • 👁 ' + (doc.data().totalViews || 0);
                }
            } else {
                // Live foi encerrada
                liveAtiva = false;
                pararChatListener();
                
                const placeholder = document.getElementById('livePlaceholder');
                const player = document.getElementById('livePlayer');
                const status = document.getElementById('liveStatus');
                
                if (placeholder) placeholder.style.display = 'block';
                if (player) player.style.display = 'none';
                if (status) status.style.display = 'none';
            }
        } catch (e) {
            // Silencioso
        }
    }, 2000);
}

function pararChatListener() {
    if (liveChatInterval) {
        clearInterval(liveChatInterval);
        liveChatInterval = null;
    }
}

async function enviarMensagemLive() {
    const input = document.getElementById('liveChatInput');
    if (!input || !liveAtiva) return;
    
    const texto = input.value.trim();
    if (!texto) return;
    
    const autor = '👤 Visitante';
    
    try {
        const doc = await db.collection('lives').doc('live_atual').get();
        
        if (!doc.exists || !doc.data().ativa) {
            mostrarToast('❌ Live não está ativa!', 'error');
            return;
        }
        
        const chat = doc.data().chat || [];
        chat.push({
            autor: autor,
            texto: texto,
            data: new Date().toISOString()
        });
        
        // Manter apenas últimas 100 mensagens
        const chatAtualizado = chat.length > 100 ? chat.slice(-100) : chat;
        
        await db.collection('lives').doc('live_atual').update({
            chat: chatAtualizado
        });
        
        liveChatMessages = chatAtualizado;
        atualizarChat();
        input.value = '';
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    }
}

function atualizarChat() {
    const container = document.getElementById('liveChatContainer');
    if (!container) return;
    
    if (!liveChatMessages || liveChatMessages.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">💬 Nenhuma mensagem ainda</p>';
        return;
    }
    
    container.innerHTML = liveChatMessages.map(msg => {
        const hora = new Date(msg.data).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="chat-message">
                <span class="chat-autor">${msg.autor}</span>
                <span class="chat-hora">${hora}</span>
                <div class="chat-texto">${msg.texto}</div>
            </div>
        `;
    }).join('');
    
    // Scroll para o final
    container.scrollTop = container.scrollHeight;
}

// ==========================================================
// AÇÕES DA LIVE
// ==========================================================
async function curtirLive() {
    if (!liveAtiva) {
        mostrarToast('❌ Nenhuma live ativa!', 'error');
        return;
    }
    
    try {
        await db.collection('lives').doc('live_atual').update({
            likes: firebase.firestore.FieldValue.increment(1)
        });
        
        mostrarToast('❤️ Curtido!', 'success');
    } catch (error) {
        console.error('Erro ao curtir:', error);
    }
}

function compartilharLive() {
    if (!liveAtiva) {
        mostrarToast('❌ Nenhuma live ativa!', 'error');
        return;
    }
    
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: '🔴 Live - Barbearia RM',
            text: 'Assista ao vivo!',
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
// VERIFICAR LIVE ATIVA AO CARREGAR
// ==========================================================
async function verificarLiveAtiva() {
    try {
        const doc = await db.collection('lives').doc('live_atual').get();
        const ativa = doc.exists && doc.data().ativa;
        
        // Badge de live no menu
        const badge = document.getElementById('liveBadge');
        if (badge) {
            badge.style.display = ativa ? 'inline-block' : 'none';
        }
        
        return ativa;
    } catch (error) {
        return false;
    }
}

// ==========================================================
// INICIALIZAR
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    verificarLiveAtiva();
    
    // Se estiver na tela de live, carregar automaticamente
    if (document.getElementById('livePlaceholder')) {
        carregarLive();
    }
});

console.log('🔴 Módulo de live carregado!');
