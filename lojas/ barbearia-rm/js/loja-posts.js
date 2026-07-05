// ==========================================================
// BARBEARIA RM - POSTS E FEED
// ==========================================================

// ==========================================================
// CARREGAR POSTS DA LOJA
// ==========================================================
async function carregarPostsLoja() {
    const container = document.getElementById('lojaFeedContainer');
    if (!container) return;
    
    console.log('📸 Carregando posts...');
    
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
            container.innerHTML = `
                <div class="empty-state">
                    <p>📸 Nenhum trabalho publicado ainda</p>
                    <p style="font-size:12px;margin-top:8px;">Os melhores cortes estão por vir!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="feed-card" onclick="verDetalhesPostLoja('${post.id}')">
                ${post.imagem ? 
                    `<img src="${post.imagem}" class="feed-card-image" alt="${post.titulo}" loading="lazy" onerror="this.style.display='none'">` :
                    `<div class="feed-card-no-image">
                        <i class="fas fa-cut"></i>
                    </div>`
                }
                <div class="feed-card-info">
                    <h4>${post.titulo}</h4>
                    <p class="feed-card-desc">${post.descricao ? post.descricao.substring(0, 50) + '...' : ''}</p>
                    <div class="feed-card-preco">R$ ${(post.preco || 0).toFixed(2)}</div>
                    <div class="feed-card-meta">
                        <span><i class="far fa-heart"></i> ${post.likes || 0}</span>
                        <span><i class="far fa-comment"></i> ${(post.comentarios || []).length}</span>
                        <span><i class="far fa-clock"></i> ${formatarDataRelativa(post.dataCriacao)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log(`✅ ${posts.length} posts carregados`);
        
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        container.innerHTML = '<p class="empty-state">❌ Erro ao carregar posts</p>';
    }
}

// ==========================================================
// VER DETALHES DO POST
// ==========================================================
async function verDetalhesPostLoja(postId) {
    try {
        const doc = await db.collection('posts').doc(postId).get();
        
        if (!doc.exists) {
            mostrarToast('❌ Post não encontrado!', 'error');
            return;
        }
        
        const post = doc.data();
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content post-modal">
                <div class="modal-header">
                    <h3>${post.titulo}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    ${post.imagem ? `
                        <img src="${post.imagem}" class="post-modal-image" alt="${post.titulo}" onerror="this.style.display='none'">
                    ` : ''}
                    
                    <div class="post-modal-info">
                        <div class="post-modal-barbeiro">
                            <div class="barbeiro-avatar">
                                <i class="fas fa-cut"></i>
                            </div>
                            <div>
                                <strong>${post.barbeiroNome || 'Barbearia RM'}</strong>
                                <p>${formatarData(post.dataCriacao)}</p>
                            </div>
                        </div>
                        
                        ${post.descricao ? `<p class="post-modal-descricao">${post.descricao}</p>` : ''}
                        
                        <div class="post-modal-preco">
                            R$ ${(post.preco || 0).toFixed(2)}
                        </div>
                        
                        <div class="post-modal-actions">
                            <button class="btn-like" onclick="curtirPost('${post.id}', this)">
                                <i class="far fa-heart"></i>
                                <span>${post.likes || 0}</span>
                            </button>
                            <button class="btn-comentar" onclick="mostrarComentarios('${post.id}')">
                                <i class="far fa-comment"></i>
                                <span>${(post.comentarios || []).length}</span>
                            </button>
                            <button class="btn-share" onclick="compartilharPost('${post.id}')">
                                <i class="far fa-share-square"></i>
                            </button>
                        </div>
                        
                        <button class="btn btn-primary btn-block" onclick="agendarServicoPost('${post.titulo}', ${post.preco})">
                            <i class="fas fa-calendar-check"></i> AGENDAR ESTE SERVIÇO
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar ao clicar fora
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
        
        // Scroll para o modal
        setTimeout(() => modal.scrollIntoView({ behavior: 'smooth' }), 100);
        
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        mostrarToast('❌ Erro ao carregar detalhes!', 'error');
    }
}

// ==========================================================
// CRIAR NOVO POST (BARBEIRO)
// ==========================================================
function mostrarFormCriarPost() {
    const form = document.getElementById('formCriarPost');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

async function criarPost() {
    const titulo = document.getElementById('postTitulo')?.value.trim();
    const preco = parseFloat(document.getElementById('postPreco')?.value);
    const descricao = document.getElementById('postDescricao')?.value.trim();
    const imagemInput = document.getElementById('postImagem');
    const imagem = document.getElementById('postImagemPreview')?.src || '';
    
    if (!titulo) {
        mostrarToast('❌ Digite um título!', 'error');
        return;
    }
    
    if (!preco || preco <= 0) {
        mostrarToast('❌ Digite um preço válido!', 'error');
        return;
    }
    
    try {
        const postData = {
            id: Date.now().toString(),
            barbeiroId: 'barbearia-rm',
            barbeiroNome: 'Barbearia RM',
            lojaId: 'barbearia-rm',
            titulo: titulo,
            preco: preco,
            descricao: descricao || '',
            imagem: imagem,
            likes: 0,
            comentarios: [],
            dataCriacao: new Date().toISOString()
        };
        
        await db.collection('posts').doc(postData.id).set(postData);
        
        mostrarToast('✅ Post publicado com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('postTitulo').value = '';
        document.getElementById('postPreco').value = '';
        document.getElementById('postDescricao').value = '';
        if (imagemInput) imagemInput.value = '';
        const preview = document.getElementById('postImagemPreview');
        if (preview) preview.style.display = 'none';
        
        // Esconder formulário
        const form = document.getElementById('formCriarPost');
        if (form) form.style.display = 'none';
        
        // Recarregar posts
        carregarPostsLoja();
        
    } catch (error) {
        console.error('Erro ao criar post:', error);
        mostrarToast('❌ Erro ao publicar!', 'error');
    }
}

// ==========================================================
// EXCLUIR POST
// ==========================================================
async function excluirPost(postId) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    
    try {
        await db.collection('posts').doc(postId).delete();
        mostrarToast('🗑 Post excluído!', 'success');
        carregarPostsLoja();
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        mostrarToast('❌ Erro ao excluir!', 'error');
    }
}

// ==========================================================
// CURTIR POST
// ==========================================================
async function curtirPost(postId, button) {
    try {
        const doc = await db.collection('posts').doc(postId).get();
        const likes = (doc.data().likes || 0) + 1;
        
        await db.collection('posts').doc(postId).update({
            likes: likes
        });
        
        // Atualizar botão
        const icon = button.querySelector('i');
        const span = button.querySelector('span');
        
        if (icon) icon.className = 'fas fa-heart';
        if (span) span.textContent = likes;
        
        button.classList.add('liked');
        button.disabled = true;
        
        mostrarToast('❤️ Curtido!', 'success');
        
    } catch (error) {
        console.error('Erro ao curtir:', error);
    }
}

// ==========================================================
// COMENTÁRIOS
// ==========================================================
async function mostrarComentarios(postId) {
    try {
        const doc = await db.collection('posts').doc(postId).get();
        const post = doc.data();
        const comentarios = post.comentarios || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content comentarios-modal">
                <div class="modal-header">
                    <h3>💬 Comentários</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="comentarios-lista">
                        ${comentarios.length === 0 ? 
                            '<p class="empty-state">Seja o primeiro a comentar!</p>' :
                            comentarios.map(c => `
                                <div class="comentario-item">
                                    <strong>${c.autor || 'Cliente'}</strong>
                                    <p>${c.texto}</p>
                                    <small>${formatarDataRelativa(c.data)}</small>
                                </div>
                            `).join('')
                        }
                    </div>
                    
                    <div class="comentario-form">
                        <input type="text" id="comentarioNome" placeholder="Seu nome" class="input-comentario">
                        <textarea id="comentarioTexto" placeholder="Escreva um comentário..." rows="2" class="input-comentario"></textarea>
                        <button class="btn btn-primary btn-block" onclick="enviarComentario('${postId}')">
                            <i class="fas fa-paper-plane"></i> ENVIAR
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
        
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
    }
}

async function enviarComentario(postId) {
    const nome = document.getElementById('comentarioNome')?.value.trim() || 'Cliente';
    const texto = document.getElementById('comentarioTexto')?.value.trim();
    
    if (!texto) {
        mostrarToast('❌ Escreva um comentário!', 'error');
        return;
    }
    
    try {
        const doc = await db.collection('posts').doc(postId).get();
        const comentarios = doc.data().comentarios || [];
        
        comentarios.push({
            autor: nome,
            texto: texto,
            data: new Date().toISOString()
        });
        
        await db.collection('posts').doc(postId).update({
            comentarios: comentarios
        });
        
        mostrarToast('💬 Comentário enviado!', 'success');
        
        // Fechar modal e recarregar
        document.querySelector('.modal-overlay')?.remove();
        carregarPostsLoja();
        
    } catch (error) {
        console.error('Erro ao comentar:', error);
        mostrarToast('❌ Erro ao enviar!', 'error');
    }
}

// ==========================================================
// COMPARTILHAR POST
// ==========================================================
function compartilharPost(postId) {
    const url = `${window.location.href}?post=${postId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Barbearia RM',
            text: 'Confira este serviço!',
            url: url
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => {
            mostrarToast('📋 Link copiado!', 'success');
        }).catch(() => {
            prompt('📋 Copie o link:', url);
        });
    }
}

// ==========================================================
// AGENDAR PELO POST
// ==========================================================
function agendarServicoPost(titulo, preco) {
    // Preencher formulário de agendamento
    const tipoSelect = document.getElementById('agendamentoTipo');
    if (tipoSelect) {
        // Procurar opção correspondente
        for (let option of tipoSelect.options) {
            if (option.value === titulo) {
                option.selected = true;
                break;
            }
        }
    }
    
    // Scroll para o formulário de agendamento
    const agendamentoSection = document.querySelector('.loja-agendar');
    if (agendamentoSection) {
        agendamentoSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Fechar modal
    document.querySelector('.modal-overlay')?.remove();
    
    mostrarToast(`📅 Agende seu ${titulo} por R$ ${preco.toFixed(2)}!`, 'info');
}

// ==========================================================
// UPLOAD DE IMAGEM DO POST
// ==========================================================
function previewImagemPost(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        mostrarToast('❌ Imagem muito grande! Máximo 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('postImagemPreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        // Salvar base64 no campo hidden
        const hiddenInput = document.getElementById('postImagemBase64');
        if (hiddenInput) {
            hiddenInput.value = e.target.result;
        }
    };
    reader.readAsDataURL(file);
}

// ==========================================================
// FORMATAR DATA RELATIVA
// ==========================================================
function formatarDataRelativa(data) {
    if (!data) return '';
    
    const agora = new Date();
    const dataPost = new Date(data);
    const diffMs = agora - dataPost;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} min`;
    if (diffHoras < 24) return `Há ${diffHoras}h`;
    if (diffDias < 7) return `Há ${diffDias}d`;
    if (diffDias < 30) return `Há ${Math.floor(diffDias / 7)}sem`;
    
    return formatarData(data);
}

function formatarData(data) {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
}

// ==========================================================
// FILTRAR POSTS
// ==========================================================
function filtrarPosts(categoria) {
    const cards = document.querySelectorAll('.feed-card');
    
    cards.forEach(card => {
        const titulo = card.querySelector('h4')?.textContent.toLowerCase() || '';
        
        if (categoria === 'todos' || titulo.includes(categoria.toLowerCase())) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==========================================================
// INICIALIZAR
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('lojaFeedContainer')) {
        carregarPostsLoja();
    }
});

console.log('📸 Módulo de posts carregado!');
