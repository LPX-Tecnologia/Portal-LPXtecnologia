async function carregarFaturamento() {
    try {
        const snapshot = await db.collection('agendamentos').where('status', '==', 'concluido').get();
        const agendamentos = snapshot.docs.map(d => d.data());
        
        const hoje = new Date().toISOString().split('T')[0];
        let totalHoje = 0, totalSemana = 0, totalMes = 0, totalAno = 0;
        const agora = new Date();
        
        agendamentos.forEach(a => {
            const v = a.valor || 0;
            if (a.data === hoje) totalHoje += v;
            
            const dataAg = new Date(a.dataConclusao || a.data);
            const dias = (agora - dataAg) / 86400000;
            if (dias <= 7) totalSemana += v;
            if (dias <= 30) totalMes += v;
            if (dias <= 365) totalAno += v;
        });
        
        document.getElementById('faturamentoHoje').textContent = formatarMoeda(totalHoje);
        document.getElementById('faturamentoSemana').textContent = formatarMoeda(totalSemana);
        document.getElementById('faturamentoMes').textContent = formatarMoeda(totalMes);
        document.getElementById('faturamentoAno').textContent = formatarMoeda(totalAno);
        
        // Extrato
        if (document.getElementById('extratoHoje')) {
            document.getElementById('extratoHoje').textContent = formatarMoeda(totalHoje);
            document.getElementById('extratoSemana').textContent = formatarMoeda(totalSemana);
            document.getElementById('extratoMes').textContent = formatarMoeda(totalMes);
            document.getElementById('extratoAno').textContent = formatarMoeda(totalAno);
        }
    } catch (e) {
        console.error('Erro:', e);
    }
}