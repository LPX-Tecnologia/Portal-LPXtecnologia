// ==========================================================
// BARBEARIA RM - FATURAMENTO
// ==========================================================

// Calcular faturamento total
async function carregarFaturamento() {
    try {
        const snapshot = await db.collection('agendamentos')
            .where('status', '==', 'concluido')
            .get();
        
        const agendamentos = [];
        snapshot.forEach(doc => {
            agendamentos.push({ id: doc.id, ...doc.data() });
        });
        
        const hoje = new Date().toISOString().split('T')[0];
        const agora = new Date();
        
        let totalHoje = 0;
        let totalSemana = 0;
        let totalMes = 0;
        let totalAno = 0;
        let totalGeral = 0;
        let quantidadeHoje = 0;
        let quantidadeSemana = 0;
        let quantidadeMes = 0;
        let quantidadeAno = 0;
        let quantidadeTotal = 0;
        
        agendamentos.forEach(a => {
            const valor = a.valor || 0;
            const dataConclusao = a.dataConclusao || a.data;
            const dataAg = new Date(dataConclusao);
            const dias = (agora - dataAg) / (1000 * 60 * 60 * 24);
            
            totalGeral += valor;
            quantidadeTotal++;
            
            // Hoje
            if (a.data === hoje || (dataConclusao && dataConclusao.split('T')[0] === hoje)) {
                totalHoje += valor;
                quantidadeHoje++;
            }
            
            // Esta semana (7 dias)
            if (dias <= 7) {
                totalSemana += valor;
                quantidadeSemana++;
            }
            
            // Este mês (30 dias)
            if (dias <= 30) {
                totalMes += valor;
                quantidadeMes++;
            }
            
            // Este ano (365 dias)
            if (dias <= 365) {
                totalAno += valor;
                quantidadeAno++;
            }
        });
        
        // Atualizar cards de faturamento
        const formatar = (v) => 'R$ ' + (v || 0).toFixed(2);
        
        const elHoje = document.getElementById('faturamentoHoje');
        const elSemana = document.getElementById('faturamentoSemana');
        const elMes = document.getElementById('faturamentoMes');
        const elAno = document.getElementById('faturamentoAno');
        
        if (elHoje) elHoje.textContent = formatar(totalHoje);
        if (elSemana) elSemana.textContent = formatar(totalSemana);
        if (elMes) elMes.textContent = formatar(totalMes);
        if (elAno) elAno.textContent = formatar(totalAno);
        
        // Atualizar tela de extrato (se existir)
        const elExtratoHoje = document.getElementById('extratoHoje');
        const elExtratoSemana = document.getElementById('extratoSemana');
        const elExtratoMes = document.getElementById('extratoMes');
        const elExtratoAno = document.getElementById('extratoAno');
        
        if (elExtratoHoje) elExtratoHoje.textContent = formatar(totalHoje);
        if (elExtratoSemana) elExtratoSemana.textContent = formatar(totalSemana);
        if (elExtratoMes) elExtratoMes.textContent = formatar(totalMes);
        if (elExtratoAno) elExtratoAno.textContent = formatar(totalAno);
        
        // Atualizar resumo na tela de extrato
        const elResumo = document.getElementById('extratoResumo');
        if (elResumo) {
            elResumo.innerHTML = `
                <div class="extrato-resumo-item">
                    <span>📅 Hoje</span>
                    <strong>${quantidadeHoje} serviços</strong>
                </div>
                <div class="extrato-resumo-item">
                    <span>📅 Semana</span>
                    <strong>${quantidadeSemana} serviços</strong>
                </div>
                <div class="extrato-resumo-item">
                    <span>📅 Mês</span>
                    <strong>${quantidadeMes} serviços</strong>
                </div>
                <div class="extrato-resumo-item">
                    <span>📅 Ano</span>
                    <strong>${quantidadeAno} serviços</strong>
                </div>
                <div class="extrato-resumo-item">
                    <span>📊 Total</span>
                    <strong>${quantidadeTotal} serviços</strong>
                </div>
                <div class="extrato-resumo-total">
                    <span>💰 Faturamento Total</span>
                    <strong>${formatar(totalGeral)}</strong>
                </div>
            `;
        }
        
        // Carregar lista de serviços concluídos
        await carregarListaConcluidos(agendamentos);
        
        console.log('📊 Faturamento calculado:', {
            hoje: formatar(totalHoje),
            semana: formatar(totalSemana),
            mes: formatar(totalMes),
            ano: formatar(totalAno),
            total: formatar(totalGeral)
        });
        
    } catch (error) {
        console.error('Erro ao calcular faturamento:', error);
    }
}

// Carregar lista de serviços concluídos
async function carregarListaConcluidos(agendamentos) {
    const container = document.getElementById('extratoLista');
    if (!container) return;
    
    // Ordenar por data (mais recente primeiro)
    const concluidos = agendamentos
        .filter(a => a.status === 'concluido')
        .sort((a, b) => new Date(b.dataConclusao || b.data) - new Date(a.dataConclusao || a.data));
    
    if (concluidos.length === 0) {
        container.innerHTML = '<p class="empty-state">📅 Nenhum serviço concluído</p>';
        return;
    }
    
    container.innerHTML = `
        <h4 style="margin:16px 0 8px;">📋 Últimos Serviços Concluídos</h4>
        ${concluidos.slice(0, 20).map(a => `
            <div class="extrato-item">
                <div>
                    <strong>👤 ${a.clienteNome || 'Cliente'}</strong>
                    <p style="font-size:12px;color:var(--text-secondary);">
                        📅 ${a.data || ''} • ✂️ ${a.tipo || 'Serviço'}
                    </p>
                </div>
                <strong style="color:var(--success);">R$ ${(a.valor || 0).toFixed(2)}</strong>
            </div>
        `).join('')}
    `;
}

// Filtrar faturamento por período
async function filtrarFaturamento(periodo) {
    const agora = new Date();
    let dataInicio;
    
    switch (periodo) {
        case 'hoje':
            dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
            break;
        case 'semana':
            dataInicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'mes':
            dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
            break;
        case 'ano':
            dataInicio = new Date(agora.getFullYear(), 0, 1);
            break;
        default:
            dataInicio = new Date(0); // tudo
    }
    
    try {
        const snapshot = await db.collection('agendamentos')
            .where('status', '==', 'concluido')
            .get();
        
        let total = 0;
        let quantidade = 0;
        
        snapshot.forEach(doc => {
            const a = doc.data();
            const dataAg = new Date(a.dataConclusao || a.data);
            if (dataAg >= dataInicio) {
                total += (a.valor || 0);
                quantidade++;
            }
        });
        
        const elResultado = document.getElementById('extratoResultado');
        if (elResultado) {
            elResultado.innerHTML = `
                <div class="extrato-resultado-card">
                    <h4>📊 Resultado - ${periodo}</h4>
                    <p>Serviços: <strong>${quantidade}</strong></p>
                    <p>Total: <strong style="color:var(--success);font-size:20px;">R$ ${total.toFixed(2)}</strong></p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erro ao filtrar:', error);
    }
}

// Carregar faturamento ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Só carrega se estiver na tela correta
    if (document.getElementById('faturamentoHoje')) {
        carregarFaturamento();
    }
});

console.log('📊 Módulo de faturamento carregado!');
