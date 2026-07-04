// ==========================================================
// BARBEARIA RM - AGENDAMENTOS
// ==========================================================

// Mostrar toast
function mostrarToast(mensagem, tipo) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.className = 'toast toast-' + (tipo || 'info');
    toast.style.display = 'block';
    setTimeout(function() {
        toast.style.display = 'none';
    }, 3000);
}

// Agendar serviço
async function agendar() {
    const data = document.getElementById('agendamentoData')?.value;
    const horario = document.getElementById('agendamentoHorario')?.value || '10:00';
    const tipo = document.getElementById('agendamentoTipo')?.value || 'Corte';
    const nome = document.getElementById('agendamentoNome')?.value || 'Cliente';
    const telefone = document.getElementById('agendamentoTelefone')?.value || '';
    
    if (!data) {
        mostrarToast('❌ Selecione uma data!', 'error');
        return;
    }
    
    if (!nome || nome === 'Cliente') {
        mostrarToast('❌ Digite seu nome!', 'error');
        return;
    }
    
    try {
        const id = Date.now().toString();
        await db.collection('agendamentos').doc(id).set({
            id: id,
            clienteNome: nome,
            clienteTelefone: telefone,
            data: data,
            horario: horario,
            tipo: tipo,
            status: 'pendente',
            valor: 0,
            dataCriacao: new Date().toISOString()
        });
        
        mostrarToast('✅ Agendamento realizado com sucesso!', 'success');
        
        // Limpar campos
        document.getElementById('agendamentoData').value = '';
        document.getElementById('agendamentoNome').value = '';
        document.getElementById('agendamentoTelefone').value = '';
        
        // Recarregar agendamentos se estiver na tela do barbeiro
        if (typeof carregarAgendamentosBarbeiro === 'function') {
            carregarAgendamentosBarbeiro();
        }
        
    } catch (error) {
        console.error('Erro ao agendar:', error);
        mostrarToast('❌ Erro ao agendar. Tente novamente!', 'error');
    }
}

// Carregar agendamentos (visão do barbeiro)
async function carregarAgendamentosBarbeiro() {
    const container = document.getElementById('agendamentosBarbeiroContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('agendamentos')
            .orderBy('data', 'desc')
            .orderBy('horario', 'desc')
            .get();
        
        const agendamentos = [];
        snapshot.forEach(doc => {
            agendamentos.push({ id: doc.id, ...doc.data() });
        });
        
        if (agendamentos.length === 0) {
            container.innerHTML = '<p class="empty-state">📅 Nenhum agendamento</p>';
            return;
        }
        
        container.innerHTML = agendamentos.map(a => {
            const statusClass = {
                pendente: 'status-pendente',
                confirmado: 'status-confirmado',
                concluido: 'status-concluido',
                cancelado: 'status-cancelado'
            }[a.status] || 'status-pendente';
            
            const statusTexto = {
                pendente: '⏳ Pendente',
                confirmado: '✅ Confirmado',
                concluido: '💰 Concluído R$' + (a.valor || '0'),
                cancelado: '❌ Cancelado'
            }[a.status] || '⏳ Pendente';
            
            let botoes = '';
            if (a.status === 'pendente') {
                botoes = `
                    <button class="btn-sm btn-success" onclick="confirmarAgendamento('${a.id}')" title="Confirmar">✅</button>
                    <button class="btn-sm btn-danger" onclick="cancelarAgendamento('${a.id}')" title="Cancelar">❌</button>
                `;
            } else if (a.status === 'confirmado') {
                botoes = `
                    <button class="btn-sm btn-primary" onclick="concluirAgendamento('${a.id}')" title="Concluir">💰</button>
                    <button class="btn-sm btn-danger" onclick="cancelarAgendamento('${a.id}')" title="Cancelar">❌</button>
                `;
            }
            
            return `
                <div class="agendamento-item">
                    <div class="agendamento-info">
                        <div class="agendamento-cliente">👤 ${a.clienteNome || 'Cliente'}</div>
                        <div class="agendamento-detalhes">
                            📅 ${a.data || ''} • ⏰ ${a.horario || ''} • ✂️ ${a.tipo || 'Serviço'}
                        </div>
                        ${a.clienteTelefone ? `<div class="agendamento-telefone">📱 ${a.clienteTelefone}</div>` : ''}
                    </div>
                    <div class="agendamento-actions">
                        <span class="agendamento-status ${statusClass}">${statusTexto}</span>
                        ${botoes}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        container.innerHTML = '<p class="empty-state">❌ Erro ao carregar</p>';
    }
}

// Confirmar agendamento
async function confirmarAgendamento(id) {
    if (!confirm('Confirmar este agendamento?')) return;
    
    try {
        await db.collection('agendamentos').doc(id).update({
            status: 'confirmado',
            dataConfirmacao: new Date().toISOString()
        });
        mostrarToast('✅ Agendamento confirmado!', 'success');
        carregarAgendamentosBarbeiro();
    } catch (error) {
        mostrarToast('❌ Erro ao confirmar!', 'error');
    }
}

// Cancelar agendamento
async function cancelarAgendamento(id) {
    const motivo = prompt('Motivo do cancelamento (opcional):', 'Cancelado pelo estabelecimento');
    
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
        await db.collection('agendamentos').doc(id).update({
            status: 'cancelado',
            motivoCancelamento: motivo || 'Cancelado',
            dataCancelamento: new Date().toISOString()
        });
        mostrarToast('❌ Agendamento cancelado!', 'info');
        carregarAgendamentosBarbeiro();
    } catch (error) {
        mostrarToast('❌ Erro ao cancelar!', 'error');
    }
}

// Concluir agendamento (com valor)
async function concluirAgendamento(id) {
    const valor = prompt('💰 Digite o valor do serviço (R$):', '35.00');
    
    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
        mostrarToast('❌ Valor inválido!', 'error');
        return;
    }
    
    try {
        await db.collection('agendamentos').doc(id).update({
            status: 'concluido',
            valor: parseFloat(valor),
            dataConclusao: new Date().toISOString()
        });
        mostrarToast('✅ Serviço concluído! R$ ' + parseFloat(valor).toFixed(2), 'success');
        carregarAgendamentosBarbeiro();
        
        // Atualizar faturamento
        if (typeof carregarFaturamento === 'function') {
            carregarFaturamento();
        }
    } catch (error) {
        mostrarToast('❌ Erro ao concluir!', 'error');
    }
}

// Carregar meus agendamentos (visão do cliente)
async function carregarMeusAgendamentos(clienteId) {
    const container = document.getElementById('meusAgendamentosContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('agendamentos')
            .where('clienteId', '==', clienteId)
            .orderBy('data', 'desc')
            .get();
        
        const agendamentos = [];
        snapshot.forEach(doc => {
            agendamentos.push({ id: doc.id, ...doc.data() });
        });
        
        if (agendamentos.length === 0) {
            container.innerHTML = '<p class="empty-state">📅 Você não tem agendamentos</p>';
            return;
        }
        
        container.innerHTML = agendamentos.map(a => {
            const statusEmoji = {
                pendente: '⏳',
                confirmado: '✅',
                concluido: '💰',
                cancelado: '❌'
            }[a.status] || '⏳';
            
            return `
                <div class="agendamento-item">
                    <div class="agendamento-info">
                        <div class="agendamento-cliente">${statusEmoji} ${a.tipo || 'Serviço'}</div>
                        <div class="agendamento-detalhes">
                            📅 ${a.data || ''} • ⏰ ${a.horario || ''}
                        </div>
                        <div class="agendamento-status-text">
                            ${a.status === 'concluido' ? 'Valor: R$' + (a.valor || '0') : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
    }
}

console.log('📅 Módulo de agendamentos carregado!');
