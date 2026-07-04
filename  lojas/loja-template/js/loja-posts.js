async function carregarPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('posts')
            .where('barbeiroId', '==', usuarioLogado.id)
            .get();
        
        const posts = [];
        snapshot.forEach(d => posts.push({ id: d.id, ...d.data() }));
        posts.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
        
        if (posts.length === 0) {
            container.innerHTML = '<p class="empty-state">📸 Nenhum post</p>';
            return;
        }
        
        container.innerHTML = posts.map(post => `
            <div class="post-item">
                ${post.imagem ? `<img src="${post.imagem}" class="post-thumb" onerror="this.style.display='none'">` : ''}
                <div class="post-info">
                    <h4>${post.titulo}</h4>
                    <p class="post-preco">R$ ${(post.preco || 0).toFixed(2)}</p>
                </div>
                <button class="btn btn-sm" style="background:var(--danger);color:white;" onclick="excluirPost('${post.id}')">🗑</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Erro:', e);
    }
}

async function criarPost() {
    const titulo = document.getElementById('postTitulo')?.value.trim();
    const preco = parseFloat(document.getElementById('postPreco')?.value);
    const descricao = document.getElementById('postDescricao')?.value.trim();
    const imagem = document.getElementById('postImagem')?.value || '';
    
    if (!titulo || !preco || preco <= 0) {
        mostrarToast('❌ Título e preço obrigatórios!', 'error');
        return;
    }
    
    await db.collection('posts').doc(gerarId()).set({
        id: gerarId(),
        barbeiroId: usuarioLogado.id,
        barbeiroNome: usuarioLogado.nome,
        titulo, preco, descricao, imagem,
        likes: 0, comentarios: [],
        dataCriacao: new Date().toISOString()
    });
    
    mostrarToast('✅ Post publicado!', 'success');
    document.getElementById('postTitulo').value = '';
    document.getElementById('postPreco').value = '';
    document.getElementById('postDescricao').value = '';
    document.getElementById('postImagem').value = '';
    document.getElementById('postImagemPreview').style.display = 'none';
    mostrarTela('telaHome');
}

function excluirPost(id) {
    mostrarConfirmacao('Excluir', 'Excluir este post?', async () => {
        await db.collection('posts').doc(id).delete();
        mostrarToast('🗑 Excluído!', 'success');
        carregarPosts();
    });
}

function previewImagemPost(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = function(ev) {
        document.getElementById('postImagem').value = ev.target.result;
        document.getElementById('postImagemPreview').src = ev.target.result;
        document.getElementById('postImagemPreview').style.display = 'block';
    };
    r.readAsDataURL(f);
}