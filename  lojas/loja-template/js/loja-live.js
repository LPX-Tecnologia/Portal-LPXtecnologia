let liveAtiva = false;
let liveInterval = null;

async function carregarLive() {
    try {
        const doc = await db.collection('lives').doc('live_atual').get();
        if (doc.exists && doc.data().ativa) {
            liveAtiva = true;
            document.getElementById('livePlaceholder').style.display = 'none';
            document.getElementById('livePlayer').style.display = 'block';
            document.getElementById('liveControls').style.display = 'none';
            iniciarChatListener();
        } else {
            liveAtiva = false;
            document.getElementById('livePlaceholder').style.display = 'block';
            document.getElementById('livePlayer').style.display = 'none';
            document.getElementById('liveControls').style.display = 'block';
        }
    } catch (e) {}
}

async function iniciarLive() {
    const titulo = document.getElementById('liveTitulo')?.value || '🔴 Live';
    
    await db.collection('lives').doc('live_atual').set({
        id: 'live_atual', barbeiroId: usuarioLogado.id,
        barbeiroNome: usuarioLogado.nome,
        titulo, ativa: true, chat: [],
        viewers: 0, likes: 0,
        dataInicio: new Date().toISOString()
    });
    
    liveAtiva = true;
    document.getElementById('livePlaceholder').style.display = 'none';
    document.getElementById('livePlayer').style.display = 'block';
    document.getElementById('liveControls').style.display = 'none';
    iniciarChatListener();
    mostrarToast('🔴 Live iniciada!', 'success');
}

async function encerrarLive() {
    mostrarConfirmacao('Encerrar', 'Encerrar a live?', async () => {
        await db.collection('lives').doc('live_atual').update({
            ativa: false,
            dataFim: new Date().toISOString()
        });
        liveAtiva = false;
        pararChatListener();
        document.getElementById('livePlaceholder').style.display = 'block';
        document.getElementById('livePlayer').style.display = 'none';
        document.getElementById('liveControls').style.display = 'block';
        mostrarToast('⏹ Live encerrada!', 'info');
    });
}

function iniciarChatListener() {
    pararChatListener();
    liveInterval = setInterval(async () => {
        const doc = await db.collection('lives').doc('live_atual').get();
        if (doc.exists && doc.data().ativa) {
            const chat = doc.data().chat || [];
            atualizarChat(chat);
            document.getElementById('liveViewerCount').textContent = 
                '👥 ' + Object.keys(doc.data().viewersAtivos || {}).length;
        }
    }, 2000);
}

function pararChatListener() {
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }
}

function atualizarChat(chat) {
    const container = document.getElementById('liveChatContainer');
    if (!container) return;
    if (!chat || chat.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Chat vazio</p>';
        return;
    }
    container.innerHTML = chat.map(msg => `
        <div class="chat-msg"><strong>${msg.autor}:</strong> ${msg.texto}</div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

async function enviarMensagemLive() {
    const input = document.getElementById('liveChatInput');
    if (!input || !liveAtiva) return;
    const texto = input.value.trim();
    if (!texto) return;
    
    const doc = await db.collection('lives').doc('live_atual').get();
    const chat = doc.data().chat || [];
    chat.push({ autor: usuarioLogado.nome, texto, data: new Date().toISOString() });
    await db.collection('lives').doc('live_atual').update({ chat: chat.slice(-100) });
    input.value = '';
}