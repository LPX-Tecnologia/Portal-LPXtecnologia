// ==========================================================
// BARBEARIA RM - AUTENTICAÇÃO
// ==========================================================

// Dados do usuário logado
var usuarioLogado = null;

// ==========================================================
// LOGIN
// ==========================================================
async function loginUsuario(tipo) {
    const email = document.getElementById(`loginEmail${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`)?.value.trim();
    const senha = document.getElementById(`loginSenha${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`)?.value;
    
    if (!email || !senha) {
        mostrarToast('❌ Preencha email e senha!', 'error');
        return;
    }
    
    const colecao = tipo === 'cliente' ? 'clientes' : 'barbeiros';
    
    try {
        const snapshot = await db.collection(colecao)
            .where('email', '==', email)
            .where('senha', '==', senha)
            .get();
        
        if (snapshot.empty) {
            mostrarToast('❌ Email ou senha inválidos!', 'error');
            return;
        }
        
        const usuario = { id: snapshot.docs[0].id, ...snapshot.docs[0].data(), tipo: tipo };
        usuarioLogado = usuario;
        
        // Salvar sessão
        salvarSessao(usuario);
        
        // Atualizar interface
        atualizarInterfaceLogado(usuario);
        
        mostrarToast(`✅ Bem-vindo, ${usuario.nome}!`, 'success');
        
        // Mostrar tela correta
        if (tipo === 'cliente') {
            mostrarTela('telaHome');
        } else {
            mostrarTela('telaHome');
            carregarAgendamentosBarbeiro();
            carregarFaturamento();
        }
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        mostrarToast('❌ Erro ao fazer login!', 'error');
    }
}

// ==========================================================
// CADASTRO
// ==========================================================
async function cadastrarUsuario(tipo) {
    const nome = document.getElementById(`cadNome${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`)?.value.trim();
    const email = document.getElementById(`cadEmail${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`)?.value.trim();
    const celular = document.getElementById(`cadCelular${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`)?.value.trim();
    const senha = document.getElementById(`cadSenha${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`)?.value;
    
    if (!nome || !email || !celular || !senha) {
        mostrarToast('❌ Preencha todos os campos!', 'error');
        return;
    }
    
    if (senha.length < 6) {
        mostrarToast('❌ Senha deve ter no mínimo 6 caracteres!', 'error');
        return;
    }
    
    const colecao = tipo === 'cliente' ? 'clientes' : 'barbeiros';
    
    try {
        // Verificar se email já existe
        const snapshot = await db.collection(colecao).where('email', '==', email).get();
        
        if (!snapshot.empty) {
            mostrarToast('❌ Este email já está cadastrado!', 'error');
            return;
        }
        
        const id = Date.now().toString();
        const usuario = {
            id: id,
            nome: nome,
            email: email,
            celular: celular,
            senha: senha,
            fotoPerfil: '',
            lojaId: 'barbearia-rm',
            dataCriacao: new Date().toISOString()
        };
        
        await db.collection(colecao).doc(id).set(usuario);
        
        usuarioLogado = { ...usuario, tipo: tipo };
        salvarSessao(usuarioLogado);
        atualizarInterfaceLogado(usuarioLogado);
        
        mostrarToast('✅ Cadastro realizado com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById(`cadNome${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`).value = '';
        document.getElementById(`cadEmail${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`).value = '';
        document.getElementById(`cadCelular${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`).value = '';
        document.getElementById(`cadSenha${tipo === 'cliente' ? 'Cliente' : 'Barbeiro'}`).value = '';
        
        mostrarTela('telaHome');
        
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        mostrarToast('❌ Erro ao cadastrar!', 'error');
    }
}

// ==========================================================
// LOGOUT
// ==========================================================
function sairLoja() {
    if (confirm('🚪 Tem certeza que deseja sair?')) {
        usuarioLogado = null;
        limparSessao();
        window.location.href = '../../portal/index.html';
    }
}

// ==========================================================
// SESSÃO
// ==========================================================
function salvarSessao(usuario) {
    const sessao = {
        tipo: usuario.tipo,
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        celular: usuario.celular || '',
        timestamp: Date.now()
    };
    localStorage.setItem('barbeariaRM_sessao', JSON.stringify(sessao));
}

function carregarSessao() {
    const sessao = localStorage.getItem('barbeariaRM_sessao');
    if (!sessao) return null;
    
    try {
        const dados = JSON.parse(sessao);
        
        // Sessão expira em 7 dias
        if ((Date.now() - dados.timestamp) / 86400000 > 7) {
            limparSessao();
            return null;
        }
        
        return dados;
    } catch (e) {
        limparSessao();
        return null;
    }
}

function limparSessao() {
    localStorage.removeItem('barbeariaRM_sessao');
    localStorage.removeItem('barbeariaRM_loja');
}

// ==========================================================
// RESTAURAR SESSÃO
// ==========================================================
async function restaurarSessao() {
    const sessao = carregarSessao();
    if (!sessao) return false;
    
    try {
        const colecao = sessao.tipo === 'cliente' ? 'clientes' : 'barbeiros';
        const doc = await db.collection(colecao).doc(sessao.id).get();
        
        if (doc.exists) {
            usuarioLogado = { id: doc.id, ...doc.data(), tipo: sessao.tipo };
            atualizarInterfaceLogado(usuarioLogado);
            return true;
        }
    } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
    }
    
    limparSessao();
    return false;
}

// ==========================================================
// ATUALIZAR INTERFACE
// ==========================================================
function atualizarInterfaceLogado(usuario) {
    // Nome do usuário
    const nomeEl = document.getElementById('welcomeNome') || document.getElementById('usuarioNome');
    if (nomeEl) nomeEl.textContent = usuario.nome;
    
    // Foto do perfil
    const fotoEl = document.getElementById('usuarioFoto') || document.getElementById('perfilFoto');
    if (fotoEl && usuario.fotoPerfil) {
        fotoEl.src = usuario.fotoPerfil;
    }
    
    // Mostrar botões de admin se for barbeiro
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        el.style.display = usuario.tipo === 'barbeiro' ? 'block' : 'none';
    });
    
    // Mostrar nome no header
    const headerNome = document.getElementById('headerUsuarioNome');
    if (headerNome) headerNome.textContent = usuario.nome;
    
    console.log('👤 Interface atualizada para:', usuario.nome);
}

// ==========================================================
// VERIFICAR LOGIN
// ==========================================================
function verificarLogin() {
    if (!usuarioLogado) {
        mostrarToast('❌ Faça login para continuar!', 'error');
        mostrarTela('telaLogin');
        return false;
    }
    return true;
}

// ==========================================================
// RECUPERAR SENHA
// ==========================================================
async function recuperarSenha(tipo) {
    const email = prompt('📧 Digite seu email para recuperar a senha:');
    
    if (!email) return;
    
    const colecao = tipo === 'cliente' ? 'clientes' : 'barbeiros';
    
    try {
        const snapshot = await db.collection(colecao).where('email', '==', email).get();
        
        if (snapshot.empty) {
            mostrarToast('❌ Email não encontrado!', 'error');
            return;
        }
        
        const usuario = snapshot.docs[0].data();
        
        // Mostrar senha (em produção, enviaria por email)
        alert(`🔑 Sua senha é: ${usuario.senha}\n\nRecomendamos trocar após o login.`);
        
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        mostrarToast('❌ Erro ao recuperar!', 'error');
    }
}

// ==========================================================
// PERMISSÕES
// ==========================================================
function isBarbeiro() {
    return usuarioLogado && usuarioLogado.tipo === 'barbeiro';
}

function isCliente() {
    return usuarioLogado && usuarioLogado.tipo === 'cliente';
}

function isLogado() {
    return usuarioLogado !== null;
}

// ==========================================================
// INICIALIZAR
// ==========================================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔐 Verificando autenticação...');
    
    const restaurado = await restaurarSessao();
    
    if (restaurado) {
        console.log('✅ Sessão restaurada:', usuarioLogado.nome);
    } else {
        console.log('👤 Nenhuma sessão ativa');
    }
});

console.log('🔐 Módulo de autenticação carregado!');
