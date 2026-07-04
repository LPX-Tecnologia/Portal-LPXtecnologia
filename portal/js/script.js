

// ==========================================================
// ===== FEED DO PORTAL =====
// ==========================================================

// Carregar todos os posts de todas as lojas
async function carregarFeedPortal() {
    const container = document.getElementById('portalFeedContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('posts')
            .orderBy('dataCriacao', 'desc')
            .limit(20)
            .get();
        
        const posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        
        if (posts.length === 0) {
            container.innerHTML = '<p class="empty-state">📸 Nenhum post ainda. As lojas ainda não publicaram.</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="portal-feed-card" onclick="verDetalhesPost('${post.id}')">
                ${post.imagem ? 
                    `<img src="${post.imagem}" class="portal-feed-card-image" alt="${post.titulo}" onerror="this.style.display='none'">` :
                    `<div class="portal-feed-card-no-image">✂️</div>`
                }
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
        
    } catch (error) {
        console.error('Erro ao carregar feed:', error);
        container.innerHTML = '<p class="empty-state">❌ Erro ao carregar posts</p>';
    }
}

// Ver detalhes do post
function verDetalhesPost(postId) {
    // Buscar post completo
    db.collection('posts').doc(postId).get().then(doc => {
        if (!doc.exists) {
            mostrarToast('❌ Post não encontrado!', 'error');
            return;
        }
        
        const post = doc.data();
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'modal-modern portal-post-modal active';
        modal.innerHTML = `
            <div class="modal-content-modern">
                <div class="modal-header-modern">
                    <h3>${post.titulo}</h3>
                    <button onclick="this.closest('.modal-modern').remove()">✕</button>
                </div>
                <div class="modal-body-modern">
                    ${post.imagem ? `<img src="${post.imagem}" class="portal-post-modal-image" alt="${post.titulo}">` : ''}
                    <div class="portal-post-modal-loja">
                        <div class="portal-post-modal-logo" style="background:var(--gold-gradient);display:flex;align-items:center;justify-content:center;font-size:20px;">🏪</div>
                        <div>
                            <strong>${post.barbeiroNome || 'Loja'}</strong>
                            <p style="font-size:12px;color:var(--text-muted);">${new Date(post.dataCriacao).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <p>${post.descricao || 'Sem descrição'}</p>
                    <div class="portal-post-modal-preco">R$ ${(post.preco || 0).toFixed(2)}</div>
                    
                    <div style="background:rgba(212,168,75,0.1);padding:12px;border-radius:8px;margin:12px 0;text-align:center;">
                        <p style="font-size:13px;color:var(--text-secondary);">
                            👤 <strong>Faça login</strong> para agendar este serviço
                        </p>
                    </div>
                    
                    <button class="portal-btn portal-btn-primary" onclick="this.closest('.modal-modern').remove(); mostrarLoginPortal();">
                        <i class="fas fa-sign-in-alt"></i> FAZER LOGIN PARA AGENDAR
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
        
    }).catch(error => {
        console.error('Erro:', error);
        mostrarToast('❌ Erro ao carregar detalhes!', 'error');
    });
}

// Mostrar login do portal
function mostrarLoginPortal() {
    const container = document.getElementById('loginFormsContainer');
    if (container) {
        container.style.display = 'block';
        document.getElementById('loginFormCliente').style.display = 'block';
        document.getElementById('loginFormBarbeiro').style.display = 'none';
        document.querySelectorAll('.login-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
        setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
}

// Atualizar imagem de perfil do portal
function atualizarImagemPortal() {
    const lojaSalva = localStorage.getItem('barbeariaRM_loja');
    
    // Logo do header
    const headerLogo = document.getElementById('headerLogoImg');
    if (headerLogo) {
        if (lojaSalva) {
            try {
                const loja = JSON.parse(lojaSalva);
                headerLogo.src = loja.logo || 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX';
            } catch (e) {
                headerLogo.src = 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX';
            }
        } else {
            headerLogo.src = 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX';
        }
    }
    
    // Logo do portal (avatar grande)
    const portalLogo = document.getElementById('portalLogo');
    if (portalLogo) {
        if (lojaSalva) {
            try {
                const loja = JSON.parse(lojaSalva);
                portalLogo.src = loja.logo || 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX';
            } catch (e) {
                portalLogo.src = 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX';
            }
        } else {
            portalLogo.src = 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=LPX';
        }
    }
}

// Atualizar nome e slogan do portal
function atualizarInfoPortal() {
    const lojaSalva = localStorage.getItem('barbeariaRM_loja');
    
    if (lojaSalva) {
        try {
            const loja = JSON.parse(lojaSalva);
            const nomeEl = document.getElementById('portalNomeLoja');
            const sloganEl = document.getElementById('portalSloganLoja');
            if (nomeEl) nomeEl.textContent = loja.nome || 'LPX Tecnologia';
            if (sloganEl) sloganEl.textContent = loja.slogan || 'Inovação que transforma';
        } catch (e) {}
    }
}
