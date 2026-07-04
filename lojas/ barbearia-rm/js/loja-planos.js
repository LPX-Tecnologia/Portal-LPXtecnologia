// ==========================================================
// BARBEARIA RM - PLANOS
// ==========================================================

// Planos padrão da barbearia
const PLANOS_DEFAULT = [
    {
        nome: 'Plano Mensal',
        periodo: 'mensal',
        preco: 29.90,
        beneficios: ['1 corte por mês', 'Desconto em produtos', 'Agendamento prioritário'],
        destaque: false
    },
    {
        nome: 'Plano Trimestral',
        periodo: 'trimestral',
        preco: 79.90,
        beneficios: ['3 cortes (1 por mês)', 'Barba inclusa', 'Desconto 20% em produtos', 'Agendamento prioritário'],
        destaque: true
    },
    {
        nome: 'Plano Anual',
        periodo: 'anual',
        preco: 249.90,
        beneficios: ['12 cortes (1 por mês)', 'Barba inclusa sempre', 'Desconto 30% em produtos', 'Agendamento VIP', '1 hidratação grátis'],
        destaque: false
    }
];

// ==========================================================
// CARREGAR PLANOS
// ==========================================================
async function carregarPlanosLoja() {
    const container = document.getElementById('lojaPlanosContainer');
    if (!container) return;
    
    console.log('👑 Carregando planos...');
    
    try {
        // Buscar planos do Firebase
        const snapshot = await db.collection('planos')
            .where('lojaId', '==', 'barbearia-rm')
            .orderBy('preco', 'asc')
            .get();
        
        let planos = [];
        snapshot.forEach(doc => {
            planos.push({ id: doc.id, ...doc.data() });
        });
        
        // Se não houver planos no Firebase, usar os padrões
        if (planos.length === 0) {
            planos = PLANOS_DEFAULT;
            
            // Salvar planos padrão no Firebase
            planos.forEach(async (plano) => {
                await db.collection('planos').doc(Date.now().toString()).set({
                    ...plano,
                    lojaId: 'barbearia-rm',
                    lojaNome: 'Barbearia RM',
                    dataCriacao: new Date().toISOString()
                });
            });
        }
        
        // Renderizar planos
        container.innerHTML = planos.map((plano, index) => `
            <div class="plano-card ${plano.destaque ? 'plano-destaque' : ''}">
                ${plano.destaque ? '<div class="plano-badge">🔥 MAIS POPULAR</div>' : ''}
                
                <div class="plano-header">
                    <h4>${plano.nome}</h4>
                    <p class="plano-periodo">📅 ${plano.periodo}</p>
                </div>
                
                <div class="plano-preco-area">
                    <span class="plano-moeda">R$</span>
                    <span class="plano-valor">${(plano.preco || 0).toFixed(2)}</span>
                    <span class="plano-periodo-text">/${plano.periodo}</span>
                </div>
                
                ${plano.beneficios ? `
                    <ul class="plano-beneficios">
                        ${plano.beneficios.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('')}
                    </ul>
                ` : ''}
                
                <button class="btn btn-primary btn-block" onclick="contratarPlano('${plano.nome}', ${plano.preco})">
                    <i class="fas fa-shopping-cart"></i> CONTRATAR
                </button>
            </div>
        `).join('');
        
        console.log(`✅ ${planos.length} planos carregados`);
        
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
        container.innerHTML = '<p class="empty-state">❌ Erro ao carregar planos</p>';
    }
}

// ==========================================================
// CONTRATAR PLANO
// ==========================================================
function contratarPlano(nomePlano, preco) {
    const numero = '11999999999'; // WhatsApp da barbearia
    const mensagem = encodeURIComponent(
        `Olá! Tenho interesse no ${nomePlano} no valor de R$ ${preco.toFixed(2)}. ` +
        `Gostaria de mais informações sobre como contratar.`
    );
    
    // Abrir WhatsApp
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
    
    // Também salvar interesse no Firebase
    salvarInteressePlano(nomePlano, preco);
    
    mostrarToast('📱 Redirecionando para o WhatsApp...', 'success');
}

async function salvarInteressePlano(nomePlano, preco) {
    try {
        await db.collection('interesses_planos').add({
            lojaId: 'barbearia-rm',
            lojaNome: 'Barbearia RM',
            plano: nomePlano,
            preco: preco,
            data: new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao salvar interesse:', error);
    }
}

// ==========================================================
// CRIAR NOVO PLANO (BARBEIRO)
// ==========================================================
function mostrarFormCriarPlano() {
    const form = document.getElementById('formCriarPlano');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

async function criarNovoPlano() {
    const nome = document.getElementById('novoPlanoNome')?.value.trim();
    const periodo = document.getElementById('novoPlanoPeriodo')?.value || 'mensal';
    const preco = parseFloat(document.getElementById('novoPlanoPreco')?.value);
    const beneficios = document.getElementById('novoPlanoBeneficios')?.value
        .split('\n')
        .filter(b => b.trim());
    
    if (!nome || !preco || preco <= 0) {
        mostrarToast('❌ Preencha nome e preço!', 'error');
        return;
    }
    
    try {
        await db.collection('planos').add({
            lojaId: 'barbearia-rm',
            lojaNome: 'Barbearia RM',
            nome: nome,
            periodo: periodo,
            preco: preco,
            beneficios: beneficios,
            destaque: false,
            dataCriacao: new Date().toISOString()
        });
        
        mostrarToast('✅ Plano criado com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('novoPlanoNome').value = '';
        document.getElementById('novoPlanoPreco').value = '';
        document.getElementById('novoPlanoBeneficios').value = '';
        
        // Esconder formulário
        document.getElementById('formCriarPlano').style.display = 'none';
        
        // Recarregar planos
        carregarPlanosLoja();
        
    } catch (error) {
        console.error('Erro ao criar plano:', error);
        mostrarToast('❌ Erro ao criar plano!', 'error');
    }
}

// ==========================================================
// EXCLUIR PLANO
// ==========================================================
async function excluirPlano(planoId) {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    
    try {
        await db.collection('planos').doc(planoId).delete();
        mostrarToast('🗑 Plano excluído!', 'success');
        carregarPlanosLoja();
    } catch (error) {
        console.error('Erro ao excluir plano:', error);
        mostrarToast('❌ Erro ao excluir!', 'error');
    }
}

// ==========================================================
// COMPARAR PLANOS
// ==========================================================
function compararPlanos() {
    const container = document.getElementById('planosComparacao');
    if (!container) return;
    
    container.innerHTML = `
        <div class="comparacao-table">
            <h4>📊 Comparativo de Planos</h4>
            <table>
                <thead>
                    <tr>
                        <th>Plano</th>
                        <th>Preço</th>
                        <th>Cortes</th>
                        <th>Barba</th>
                        <th>Desconto</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Mensal</td>
                        <td>R$ 29,90</td>
                        <td>1</td>
                        <td>❌</td>
                        <td>10%</td>
                    </tr>
                    <tr>
                        <td>Trimestral</td>
                        <td>R$ 79,90</td>
                        <td>3</td>
                        <td>✅</td>
                        <td>20%</td>
                    </tr>
                    <tr>
                        <td>Anual</td>
                        <td>R$ 249,90</td>
                        <td>12</td>
                        <td>✅</td>
                        <td>30%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    container.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================
// INICIALIZAR
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('lojaPlanosContainer')) {
        carregarPlanosLoja();
    }
});

console.log('👑 Módulo de planos carregado!');
