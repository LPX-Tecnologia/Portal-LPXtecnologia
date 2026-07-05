// ==========================================================
// ===== CONFIGURAÇÃO FIREBASE =====
// ==========================================================
const firebaseConfig = {
    apiKey: "AIzaSyAqN0DZ3fyV-Ns2kXNdwBMAXQgWLy1_jE0",
    authDomain: "barbearia-rm.firebaseapp.com",
    projectId: "barbearia-rm",
    storageBucket: "barbearia-rm.firebasestorage.app",
    messagingSenderId: "512819922057",
    appId: "1:512819922057:web:6a913791cb6435e4f63258",
    measurementId: "G-TKVLVLPBJH"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true });
console.log('🔥 Firebase OK');

// ==========================================================
// ===== VARIÁVEIS =====
// ==========================================================
var clienteLogado = null;
var barbeiroLogado = null;
var lojasCadastradas = [];
var lojaSelecionada = null;
var lojaAtualIndex = 0;

const PORTAL_CONFIG = {
    nome: 'LPX Tecnologia',
    slogan: 'Inovação que transforma',
    logo: 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX'
};

// ==========================================================
// ===== TEMA =====
// ==========================================================
function toggleModoEscuro() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('barbeariaRM_tema', isLight ? 'light' : 'dark');
    const icone = document.querySelector('#btnTema i');
    if (icone) icone.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
}

function inicializarTema() {
    if (localStorage.getItem('barbeariaRM_tema') === 'light') {
        document.body.classList.add('light-mode');
    }
}

// ==========================================================
// ===== TOAST =====
// ==========================================================
function mostrarToast(m, t) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = m;
    toast.className = 'toast-modern ' + (t || 'info');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ==========================================================
// ===== MODAL =====
// ==========================================================
function fecharModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ==========================================================
// ===== HEADER =====
// ==========================================================
function mostrarHeaderPortal() {
    document.getElementById('headerLogoImg').src = PORTAL_CONFIG.logo;
    document.getElementById('headerTitle').textContent = PORTAL_CONFIG.nome;
    document.getElementById('headerSlogan').textContent = PORTAL_CONFIG.slogan;
}

// ==========================================================
// ===== PORTAL DE LOJAS =====
// ==========================================================
async function carregarLojasPortal() {
    const carrossel = document.getElementById('portalCarrossel');
    if (!carrossel) return;
    
    try {
        const sn = await db.collection('lojas').orderBy('dataCriacao', 'desc').get();
        lojasCadastradas = sn.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (lojasCadastradas.length === 0) {
            lojasCadastradas = [{
                id: 'default', nome: 'LPX Tecnologia', slogan: 'Inovação que transforma',
                categoria: 'tecnologia', logo: 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX',
                stats: { estrelas: 5.0, cortes: 0, distancia: 0 }
            }];
        }
        
        carrossel.innerHTML = lojasCadastradas.map((loja, i) => {
            const icones = { barbearia: '💈', salao: '💇', estetica: '✨', tatuagem: '🎨', petshop: '🐾', tecnologia: '💻', outro: '📦' };
            const icone = icones[loja.categoria] || '🏪';
            return `<div class="portal-loja-card" onclick="selecionarLojaPortal(${i})">
                ${loja.logo ? `<img src="${loja.logo}" class="portal-loja-card-logo">` : `<div class="portal-loja-card-icone">${icone}</div>`}
                <div class="portal-loja-card-nome">${loja.nome}</div>
                <div class="portal-loja-card-categoria">${loja.categoria || 'Loja'}</div>
            </div>`;
        }).join('');
        
        if (lojasCadastradas.length > 0) selecionarLojaPortal(0, false);
    } catch (e) { console.error('Erro:', e); }
}

function selecionarLojaPortal(index) {
    if (index < 0 || index >= lojasCadastradas.length) return;
    lojaSelecionada = lojasCadastradas[index];
    lojaAtualIndex = index;
    
    document.getElementById('portalNomeLoja').textContent = lojaSelecionada.nome;
    document.getElementById('portalSloganLoja').textContent = lojaSelecionada.slogan || '';
    document.getElementById('portalLogo').src = lojaSelecionada.logo || PORTAL_CONFIG.logo;
    
    document.querySelectorAll('.portal-loja-card').forEach((c, i) => c.classList.toggle('ativa', i === index));
}

function entrarNaLoja() {
    if (!lojaSelecionada) { mostrarToast('❌ Selecione uma loja!', 'error'); return; }
    
    localStorage.setItem('barbeariaRM_loja', JSON.stringify({
        id: lojaSelecionada.id, nome: lojaSelecionada.nome,
        logo: lojaSelecionada.logo || PORTAL_CONFIG.logo,
        slogan: lojaSelecionada.slogan || ''
    }));
    
    mostrarToast('🏪 ' + lojaSelecionada.nome + ' - Faça login!', 'success');
    
    const container = document.getElementById('loginFormsContainer');
    if (container) {
        container.style.display = 'block';
        document.getElementById('loginFormCliente').style.display = 'block';
        document.getElementById('loginFormBarbeiro').style.display = 'none';
        document.querySelectorAll('.login-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    }
}

function switchLoginTab(tipo) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('loginFormCliente').style.display = tipo === 'cliente' ? 'block' : 'none';
    document.getElementById('loginFormBarbeiro').style.display = tipo === 'barbeiro' ? 'block' : 'none';
    document.querySelector(`.login-tab:nth-child(${tipo === 'cliente' ? 1 : 2})`).classList.add('active');
}

// ==========================================================
// ===== FEED DO PORTAL =====
// ==========================================================
async function carregarFeedPortal() {
    const container = document.getElementById('portalFeedContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('posts').orderBy('dataCriacao', 'desc').limit(20).get();
        const posts = [];
        snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
        
        if (posts.length === 0) {
            container.innerHTML = '<p class="empty-state">📸 Nenhum post ainda</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="portal-feed-card" onclick="verDetalhesPost('${post.id}')">
                ${post.imagem ? `<img src="${post.imagem}" class="portal-feed-card-image">` : `<div class="portal-feed-card-no-image">✂️</div>`}
                <div class="portal-feed-card-info">
                    <div class="portal-feed-card-loja">
                        <div class="portal-feed-card-logo-placeholder">🏪</div>
                        <span class="portal-feed-card-loja-nome">${post.barbeiroNome || 'Loja'}</span>
                    </div>
                    <div class="portal-feed-card-titulo">${post.titulo}</div>
                    <div class="portal-feed-card-preco">R$ ${(post.preco || 0).toFixed(2)}</div>
                </div>
                <div class="portal-feed-card-footer">
                    <span>❤️ ${post.likes || 0}</span>
                    <span>💬 ${(post.comentarios || []).length}</span>
                </div>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = '<p class="empty-state">❌ Erro ao carregar</p>'; }
}

function verDetalhesPost(postId) {
    db.collection('posts').doc(postId).get().then(doc => {
        if (!doc.exists) return;
        const post = doc.data();
        
        const modal = document.createElement('div');
        modal.className = 'modal-modern portal-post-modal active';
        modal.innerHTML = `
            <div class="modal-content-modern">
                <div class="modal-header-modern"><h3>${post.titulo}</h3><button onclick="this.closest('.modal-modern').remove()">✕</button></div>
                <div class="modal-body-modern">
                    ${post.imagem ? `<img src="${post.imagem}" class="portal-post-modal-image">` : ''}
                    <div class="portal-post-modal-loja">
                        <div class="portal-post-modal-logo" style="background:var(--gold-gradient);display:flex;align-items:center;justify-content:center;">🏪</div>
                        <div><strong>${post.barbeiroNome || 'Loja'}</strong><p style="font-size:12px;color:var(--text-muted);">${new Date(post.dataCriacao).toLocaleDateString('pt-BR')}</p></div>
                    </div>
                    <p>${post.descricao || ''}</p>
                    <div class="portal-post-modal-preco">R$ ${(post.preco || 0).toFixed(2)}</div>
                    <div style="background:rgba(212,168,75,0.1);padding:12px;border-radius:8px;margin:12px 0;text-align:center;">
                        <p>👤 <strong>Faça login</strong> para agendar</p>
                    </div>
                    <button class="portal-btn portal-btn-primary" onclick="this.closest('.modal-modern').remove(); document.getElementById('loginFormsContainer').style.display='block';">
                        <i class="fas fa-sign-in-alt"></i> FAZER LOGIN
                    </button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    });
}

// ==========================================================
// ===== ATUALIZAR IMAGENS =====
// ==========================================================
function atualizarImagemPortal() {
    const lojaSalva = localStorage.getItem('barbeariaRM_loja');
    const headerLogo = document.getElementById('headerLogoImg');
    const portalLogo = document.getElementById('portalLogo');
    
    if (lojaSalva) {
        try {
            const loja = JSON.parse(lojaSalva);
            if (headerLogo) headerLogo.src = loja.logo || PORTAL_CONFIG.logo;
            if (portalLogo) portalLogo.src = loja.logo || PORTAL_CONFIG.logo;
        } catch (e) {}
    }
}

// ==========================================================
// ===== NAVEGAÇÃO =====
// ==========================================================
function mostrarTela(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
}

// ==========================================================
// ===== SUBSTITUA AS FUNÇÕES ABAIXO NO SEU SCRIPT.JS =====
// ==========================================================

// ... (todo o código anterior permanece igual) ...

// ==========================================================
// ===== PORTAL DE LOJAS (ATUALIZADO) =====
// ==========================================================
async function carregarLojasPortal() {
    const carrossel = document.getElementById('portalCarrossel');
    if (!carrossel) return;
    
    try {
        const sn = await db.collection('lojas').orderBy('dataCriacao', 'desc').get();
        lojasCadastradas = sn.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (lojasCadastradas.length === 0) {
            // Dados de exemplo se não houver lojas
            lojasCadastradas = [{
                id: 'default', nome: 'LPX Tecnologia', slogan: 'Inovação que transforma',
                categoria: 'tecnologia', logo: 'assets/images/logo-lpx-tecnologia.jpg', dono: 'Admin',
                stats: { estrelas: 5.0, cortes: 1200, distancia: 0 }
            }];
        }
        
        carrossel.innerHTML = lojasCadastradas.map((loja, i) => {
            const icones = { barbearia: '💈', salao: '💇', estetica: '✨', tatuagem: '🎨', petshop: '🐾', tecnologia: '💻', outro: '📦' };
            const icone = icones[loja.categoria] || '🏪';
            const ativa = i === lojaAtualIndex ? ' ativa' : '';
            return `<div class="portal-loja-card${ativa}" onclick="selecionarLojaPortal(${i})" id="lojaCard${i}">
                ${loja.logo ? `<img src="${loja.logo}" class="portal-loja-card-logo" onerror="this.parentElement.innerHTML='<div class=\'portal-loja-card-icone\'>${icone}</div>'">` : `<div class="portal-loja-card-icone">${icone}</div>`}
                <div class="portal-loja-card-nome">${loja.nome}</div>
                <div class="portal-loja-card-categoria">${icone} ${loja.categoria || 'Loja'}</div>
            </div>`;
        }).join('');
        
        selecionarLojaPortal(lojaAtualIndex, false);
    } catch (e) { console.error('Erro:', e); }
}

function selecionarLojaPortal(index, scrollTo) {
    if (index < 0 || index >= lojasCadastradas.length) return;
    lojaAtualIndex = index;
    lojaSelecionada = lojasCadastradas[index];
    
    console.log('🏪 Loja selecionada:', lojaSelecionada.nome); // Debug

    // Atualizar informações no card do portal
    const nomeLojaEl = document.getElementById('portalNomeLoja');
    const sloganLojaEl = document.getElementById('portalSloganLoja');
    const logoEl = document.getElementById('portalLogo');
    const statsEl = document.getElementById('portalStats');
    
    if (nomeLojaEl) nomeLojaEl.textContent = lojaSelecionada.nome;
    if (sloganLojaEl) sloganLojaEl.textContent = lojaSelecionada.slogan || '';
    if (logoEl) logoEl.src = lojaSelecionada.logo || 'assets/images/default-logo.png'; // Força a troca da imagem
    if (statsEl) statsEl.innerHTML = `⭐ ${lojaSelecionada.stats?.estrelas || '5.0'} • ✂️ ${lojaSelecionada.stats?.cortes || '0'} serviços • 📍 ${lojaSelecionada.stats?.distancia || '0'}km`;
    
    // Atualizar cards visuais no carrossel
    document.querySelectorAll('.portal-loja-card').forEach((c, i) => c.classList.toggle('ativa', i === index));
    
    // Scroll suave
    if (scrollTo !== false) {
        const carr = document.getElementById('portalCarrossel');
        const card = document.getElementById('lojaCard' + index);
        if (carr && card) carr.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
    }
}

function entrarNaLoja() {
    if (!lojaSelecionada) {
        mostrarToast('❌ Selecione uma loja primeiro!', 'error');
        return;
    }
    
    mostrarToast('🏪 Entrando em ' + lojaSelecionada.nome + '...', 'success');
    
    // Salvar loja no localStorage
    localStorage.setItem('barbeariaRM_loja', JSON.stringify({
        id: lojaSelecionada.id,
        nome: lojaSelecionada.nome,
        logo: lojaSelecionada.logo || 'assets/images/default-logo.png',
        slogan: lojaSelecionada.slogan || ''
    }));
    
    // Mostrar formulários de login
    var loginContainer = document.getElementById('loginFormsContainer');
    if (loginContainer) {
        loginContainer.style.display = 'block';
        document.getElementById('loginFormCliente').style.display = 'block';
        document.getElementById('loginFormBarbeiro').style.display = 'none';
        
        // Resetar tabs
        document.querySelectorAll('.login-tab').forEach(function(tab, index) {
            tab.classList.toggle('active', index === 0);
        });
        
        // Scroll até o formulário
        setTimeout(function() {
            loginContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

function switchLoginTab(tipo) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('loginFormCliente').style.display = tipo === 'cliente' ? 'block' : 'none';
    document.getElementById('loginFormBarbeiro').style.display = tipo === 'barbeiro' ? 'block' : 'none';
    document.querySelector(`.login-tab:nth-child(${tipo === 'cliente' ? 1 : 2})`).classList.add('active');
}

// ... (o resto do código continua igual) ...

// ==========================================================
// ===== INICIALIZAÇÃO =====
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LPX Tecnologia iniciando...');
    inicializarTema();
    mostrarHeaderPortal();
    atualizarImagemPortal();
    carregarLojasPortal();
    carregarFeedPortal();
    console.log('✅ Pronto!');
});
