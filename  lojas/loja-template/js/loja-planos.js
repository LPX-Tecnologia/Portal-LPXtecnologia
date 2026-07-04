async function carregarPlanos() {
    const container = document.getElementById('planosContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('planos').orderBy('dataCriacao', 'desc').get();
        const planos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (planos.length === 0) {
            container.innerHTML = '<p class="empty-state">👑 Nenhum plano</p>';
            return;
        }
        
        container.innerHTML = planos.map(p => `
            <div class="plano-item">
                <div>
                    <h4>${p.nome}</h4>
                    <p>📅 ${p.periodo}</p>
                    <p class="plano-preco">R$ ${(p.preco || 0).toFixed(2)}</p>
                </div>
                <button class="btn btn-sm" style="background:var(--danger);color:white;" onclick="excluirPlano('${p.id}')">🗑</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Erro:', e);
    }
}

async function criarPlano() {
    const nome = document.getElementById('planoNome')?.value.trim();
    const periodo = document.getElementById('planoPeriodo')?.value;
    const preco = parseFloat(document.getElementById('planoPreco')?.value);
    
    if (!nome || !preco || preco <= 0) {
        mostrarToast('❌ Nome e preço obrigatórios!', 'error');
        return;
    }
    
    await db.collection('planos').doc(gerarId()).set({
        id: gerarId(), barbeiroId: usuarioLogado.id,
        nome, periodo, preco,
        dataCriacao: new Date().toISOString()
    });
    
    mostrarToast('✅ Plano criado!', 'success');
    document.getElementById('planoNome').value = '';
    document.getElementById('planoPreco').value = '';
    mostrarTela('telaHome');
}

function excluirPlano(id) {
    mostrarConfirmacao('Excluir', 'Excluir este plano?', async () => {
        await db.collection('planos').doc(id).delete();
        mostrarToast('🗑 Excluído!', 'success');
        carregarPlanos();
    });
}