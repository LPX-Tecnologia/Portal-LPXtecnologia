// ==========================================================
// BARBEARIA RM - PERFIL DA LOJA
// ==========================================================

// Configurações do perfil
const PERFIL_CONFIG = {
    nome: 'Barbearia RM',
    slogan: 'Atitude, Estilo e Confiança',
    logo: 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=RM',
    capa: 'https://via.placeholder.com/800x200/1a1a1a/D4A84B?text=Barbearia+RM',
    whatsapp: '(11) 99999-9999',
    telefone: '(11) 3333-4444',
    email: 'contato@barbeariarm.com.br',
    endereco: 'Rua Augusta, 1234 - São Paulo, SP',
    horarioFuncionamento: 'Seg a Sáb: 09h - 20h',
    descricao: 'Barbearia tradicional com os melhores profissionais. Oferecemos cortes modernos, barba, hidratação e muito mais. Venha nos visitar!',
    redesSociais: {
        instagram: '@barbeariarm',
        facebook: '/barbeariarm',
        tiktok: '@barbeariarm'
    },
    stats: {
        estrelas: 4.8,
        avaliacoes: 256,
        cortes: 1200,
        clientes: 890
    }
};

// ==========================================================
// CARREGAR PERFIL
// ==========================================================
function carregarPerfil() {
    console.log('👤 Carregando perfil da loja...');
    
    // Atualizar elementos do perfil
    const elementos = {
        'perfilNome': PERFIL_CONFIG.nome,
        'perfilSlogan': PERFIL_CONFIG.slogan,
        'perfilDescricao': PERFIL_CONFIG.descricao,
        'perfilWhatsapp': PERFIL_CONFIG.whatsapp,
        'perfilTelefone': PERFIL_CONFIG.telefone,
        'perfilEmail': PERFIL_CONFIG.email,
        'perfilEndereco': PERFIL_CONFIG.endereco,
        'perfilHorario': PERFIL_CONFIG.horarioFuncionamento,
        'perfilInstagram': PERFIL_CONFIG.redesSociais.instagram,
        'perfilFacebook': PERFIL_CONFIG.redesSociais.facebook,
        'perfilTiktok': PERFIL_CONFIG.redesSociais.tiktok
    };
    
    // Atualizar textos
    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elementos[id];
    });
    
    // Atualizar imagens
    const logoEl = document.getElementById('perfilLogo') || document.getElementById('lojaPerfilLogo');
    const capaEl = document.getElementById('perfilCapa');
    
    if (logoEl) {
        logoEl.src = PERFIL_CONFIG.logo;
        logoEl.alt = PERFIL_CONFIG.nome;
        logoEl.onerror = function() {
            this.src = 'https://via.placeholder.com/100x100/1a1a1a/D4A84B?text=RM';
        };
    }
    
    if (capaEl) {
        capaEl.src = PERFIL_CONFIG.capa;
        capaEl.alt = PERFIL_CONFIG.nome;
        capaEl.onerror = function() {
            this.style.display = 'none';
        };
    }
    
    // Atualizar stats
    const statsEl = document.getElementById('perfilStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="perfil-stat">
                <i class="fas fa-star"></i>
                <strong>${PERFIL_CONFIG.stats.estrelas}</strong>
                <span>(${PERFIL_CONFIG.stats.avaliacoes} avaliações)</span>
            </div>
            <div class="perfil-stat">
                <i class="fas fa-cut"></i>
                <strong>${PERFIL_CONFIG.stats.cortes}+</strong>
                <span>cortes</span>
            </div>
            <div class="perfil-stat">
                <i class="fas fa-users"></i>
                <strong>${PERFIL_CONFIG.stats.clientes}+</strong>
                <span>clientes</span>
            </div>
        `;
    }
    
    console.log('✅ Perfil carregado!');
}

// ==========================================================
// EDITAR PERFIL (BARBEIRO LOGADO)
// ==========================================================
function abrirEdicaoPerfil() {
    const modal = document.getElementById('modalEditarPerfil');
    if (!modal) return;
    
    // Preencher formulário com dados atuais
    document.getElementById('editPerfilNome').value = PERFIL_CONFIG.nome;
    document.getElementById('editPerfilSlogan').value = PERFIL_CONFIG.slogan;
    document.getElementById('editPerfilWhatsapp').value = PERFIL_CONFIG.whatsapp;
    document.getElementById('editPerfilEmail').value = PERFIL_CONFIG.email;
    document.getElementById('editPerfilEndereco').value = PERFIL_CONFIG.endereco;
    document.getElementById('editPerfilDescricao').value = PERFIL_CONFIG.descricao;
    
    modal.style.display = 'flex';
    modal.classList.add('active');
}

function fecharEdicaoPerfil() {
    const modal = document.getElementById('modalEditarPerfil');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

async function salvarPerfil() {
    const dados = {
        nome: document.getElementById('editPerfilNome')?.value || PERFIL_CONFIG.nome,
        slogan: document.getElementById('editPerfilSlogan')?.value || PERFIL_CONFIG.slogan,
        whatsapp: document.getElementById('editPerfilWhatsapp')?.value || PERFIL_CONFIG.whatsapp,
        email: document.getElementById('editPerfilEmail')?.value || PERFIL_CONFIG.email,
        endereco: document.getElementById('editPerfilEndereco')?.value || PERFIL_CONFIG.endereco,
        descricao: document.getElementById('editPerfilDescricao')?.value || PERFIL_CONFIG.descricao
    };
    
    try {
        // Salvar no Firebase
        await db.collection('lojas').doc('barbearia-rm').update({
            nome: dados.nome,
            slogan: dados.slogan,
            whatsapp: dados.whatsapp,
            email: dados.email,
            endereco: dados.endereco,
            descricao: dados.descricao,
            dataAtualizacao: new Date().toISOString()
        });
        
        // Atualizar configuração local
        Object.assign(PERFIL_CONFIG, dados);
        
        // Recarregar perfil
        carregarPerfil();
        fecharEdicaoPerfil();
        
        mostrarToast('✅ Perfil atualizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        mostrarToast('❌ Erro ao salvar!', 'error');
    }
}

// ==========================================================
// UPLOAD DE IMAGEM
// ==========================================================
function uploadLogo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        PERFIL_CONFIG.logo = e.target.result;
        
        // Atualizar preview
        const preview = document.getElementById('logoPreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        // Atualizar logo no perfil
        const logoEl = document.getElementById('perfilLogo') || document.getElementById('lojaPerfilLogo');
        if (logoEl) logoEl.src = e.target.result;
        
        mostrarToast('🖼️ Logo atualizado!', 'success');
    };
    reader.readAsDataURL(file);
}

function uploadCapa(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        PERFIL_CONFIG.capa = e.target.result;
        
        // Atualizar preview
        const preview = document.getElementById('capaPreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        // Atualizar capa no perfil
        const capaEl = document.getElementById('perfilCapa');
        if (capaEl) capaEl.src = e.target.result;
        
        mostrarToast('🖼️ Capa atualizada!', 'success');
    };
    reader.readAsDataURL(file);
}

// ==========================================================
// REDES SOCIAIS
// ==========================================================
function abrirInstagram() {
    const instagram = PERFIL_CONFIG.redesSociais.instagram.replace('@', '');
    window.open(`https://instagram.com/${instagram}`, '_blank');
}

function abrirFacebook() {
    const facebook = PERFIL_CONFIG.redesSociais.facebook;
    window.open(`https://facebook.com${facebook}`, '_blank');
}

function abrirTiktok() {
    const tiktok = PERFIL_CONFIG.redesSociais.tiktok.replace('@', '');
    window.open(`https://tiktok.com/${tiktok}`, '_blank');
}

function abrirWhatsappPerfil() {
    const numero = PERFIL_CONFIG.whatsapp.replace(/\D/g, '');
    const mensagem = encodeURIComponent('Olá! Vim pelo perfil da Barbearia RM e gostaria de mais informações.');
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
}

// ==========================================================
// AVALIAÇÕES
// ==========================================================
async function carregarAvaliacoes() {
    const container = document.getElementById('avaliacoesContainer');
    if (!container) return;
    
    try {
        const snapshot = await db.collection('avaliacoes')
            .where('lojaId', '==', 'barbearia-rm')
            .orderBy('data', 'desc')
            .limit(10)
            .get();
        
        const avaliacoes = [];
        snapshot.forEach(doc => {
            avaliacoes.push({ id: doc.id, ...doc.data() });
        });
        
        if (avaliacoes.length === 0) {
            container.innerHTML = '<p class="empty-state">⭐ Nenhuma avaliação ainda</p>';
            return;
        }
        
        container.innerHTML = avaliacoes.map(a => `
            <div class="avaliacao-item">
                <div class="avaliacao-header">
                    <strong>${a.clienteNome || 'Cliente'}</strong>
                    <span>${'⭐'.repeat(a.estrelas || 5)}</span>
                </div>
                <p>${a.comentario || ''}</p>
                <small>${formatarData(a.data)}</small>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
    }
}

async function enviarAvaliacao() {
    const estrelas = parseInt(document.getElementById('avaliacaoEstrelas')?.value || 5);
    const comentario = document.getElementById('avaliacaoComentario')?.value.trim();
    const nome = document.getElementById('avaliacaoNome')?.value.trim() || 'Cliente';
    
    if (!comentario) {
        mostrarToast('❌ Escreva um comentário!', 'error');
        return;
    }
    
    try {
        await db.collection('avaliacoes').doc(Date.now().toString()).set({
            lojaId: 'barbearia-rm',
            clienteNome: nome,
            estrelas: estrelas,
            comentario: comentario,
            data: new Date().toISOString()
        });
        
        mostrarToast('⭐ Avaliação enviada! Obrigado!', 'success');
        
        // Limpar formulário
        document.getElementById('avaliacaoComentario').value = '';
        document.getElementById('avaliacaoNome').value = '';
        
        // Recarregar avaliações
        carregarAvaliacoes();
        
    } catch (error) {
        mostrarToast('❌ Erro ao enviar!', 'error');
    }
}

// ==========================================================
// INICIALIZAR
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    // Carregar perfil se estiver na página
    if (document.getElementById('perfilNome') || document.getElementById('lojaPerfilLogo')) {
        carregarPerfil();
    }
    
    // Carregar avaliações
    if (document.getElementById('avaliacoesContainer')) {
        carregarAvaliacoes();
    }
});

console.log('👤 Módulo de perfil carregado!');
