// ==========================================================
// GERENCIAMENTO DE LOJAS DO PORTAL
// ==========================================================

let lojas = [];
let lojaSelecionada = null;

// Carregar lojas do Firebase
async function carregarLojas() {
    const carousel = document.getElementById('lojasCarousel');
    if (!carousel) return;
    
    try {
        const snapshot = await db.collection('lojas').orderBy('dataCriacao', 'desc').get();
        lojas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (lojas.length === 0) {
            lojas = [{
                id: 'default',
                nome: 'LPX Tecnologia',
                slogan: 'Inovação que transforma',
                categoria: 'tecnologia',
                logo: '../assets/images/logo-lpx-tecnologia.jpg'
            }];
        }
        
        carousel.innerHTML = lojas.map((loja, i) => `
            <div class="portal-loja-card ${i === 0 ? 'selecionada' : ''}" 
                 onclick="selecionarLoja(${i})" id="lojaCard${i}">
                ${loja.logo ? `<img src="${loja.logo}" alt="${loja.nome}">` : '<div>🏪</div>'}
                <h4>${loja.nome}</h4>
                <span>${loja.categoria || 'Loja'}</span>
            </div>
        `).join('');
        
        selecionarLoja(0);
    } catch (error) {
        console.error('Erro ao carregar lojas:', error);
    }
}

// Selecionar loja
function selecionarLoja(index) {
    if (index < 0 || index >= lojas.length) return;
    
    lojaSelecionada = lojas[index];
    
    // Atualizar card de destaque
    document.getElementById('featuredLogo').src = lojaSelecionada.logo || '../assets/images/logo-lpx-tecnologia.jpg';
    document.getElementById('featuredNome').textContent = lojaSelecionada.nome;
    document.getElementById('featuredSlogan').textContent = lojaSelecionada.slogan || '';
    
    // Atualizar cards do carrossel
    document.querySelectorAll('.portal-loja-card').forEach((card, i) => {
        card.classList.toggle('selecionada', i === index);
    });
    
    // Scroll para o card selecionado
    const card = document.getElementById(`lojaCard${index}`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// Entrar na loja
function entrarNaLoja() {
    if (!lojaSelecionada) {
        mostrarToast('❌ Selecione uma loja!', 'error');
        return;
    }
    
    // Salvar loja selecionada
    salvarLocal('lojaSelecionada', lojaSelecionada);
    
    // Redirecionar para a loja
    window.location.href = `../lojas/${lojaSelecionada.id}/index.html`;
}