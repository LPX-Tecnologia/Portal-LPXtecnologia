async function carregarAgendamentos() {
    const container = document.getElementById('agendamentosContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('agendamentos').orderBy('data', 'desc').get();
        const agendamentos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (agendamentos.length === 0) {
            container.innerHTML = '<p class="empty-state">📅 Nenhum agendamento</p>';
            return;
        }
        
        container.innerHTML = agendamentos.map(a => {
            const statusClass = a.status || 'pendente';
            const statusTexto = {
                pendente: '⏳ Pendente',
                confirmado: '✅ Confirmado',
                concluido: '💰 Concluído R$' + (a.valor || '0'),
                cancelado: '❌ Cancelado'
            }[a.status] || '⏳ Pendente';
            
            let botoes = '';
            if (a.status === 'pendente') {
                botoes = `<button class="btn btn-sm" style="background:var(--success);color:white;" onclick="confirmarAgendamento('${a.id}')">✓</button>
                         <button class="btn btn-sm" style="background:var(--danger);color:white;" onclick="cancelarAgendamento('${a.id}')">✕</button>`;
            } else if (a.status === 'confirmado') {
                botoes = `<button class="btn btn-sm btn-primary" onclick="concluirServico('${a.id}')">💰</button>`;
            }
            
            return `<div class="agenda-item">
                <div class="agenda-info">
                    <h4>👤 ${a.clienteNome || 'Cliente'}</h4>
                    <p>📅 ${a.data || ''} • ⏰ ${a.horario || ''} - ${a.tipo || 'Serviço'}</p>
                </div>
                <div class="agenda-actions">
                    <span class="agenda-status ${statusClass}">${statusTexto}</span>
                    ${botoes}
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Erro ao carregar agendamentos:', e);
    }
}

async function confirmarAgendamento(id) {
    await db.collection('agendamentos').doc(id).update({ status: 'confirmado' });
    mostrarToast('✅ Confirmado!', 'success');
    carregarAgendamentos();
}

function cancelarAgendamento(id) {
    mostrarConfirmacao('Cancelar', 'Deseja cancelar este agendamento?', async () => {
        await db.collection('agendamentos').doc(id).update({ status: 'cancelado' });
        mostrarToast('❌ Cancelado!', 'info');
        carregarAgendamentos();
    });
}

function concluirServico(id) {
    mostrarConfirmacao('Concluir Serviço', 'Deseja concluir este serviço?', () => {
        mostrarModalInput('💰 Valor do Serviço', 'Digite o valor', '35.00', async (valor) => {
            if (!valor || parseFloat(valor) <= 0) {
                mostrarToast('❌ Valor inválido!', 'error');
                return;
            }
            await db.collection('agendamentos').doc(id).update({
                status: 'concluido',
                valor: parseFloat(valor),
                dataConclusao: new Date().toISOString()
            });
            mostrarToast('✅ Concluído! R$ ' + parseFloat(valor).toFixed(2), 'success');
            carregarAgendamentos();
            carregarFaturamento();
        });
    });
}