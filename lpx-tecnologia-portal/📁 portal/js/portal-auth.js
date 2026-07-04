// ==========================================================
// AUTENTICAÇÃO DO PORTAL
// ==========================================================

// Mostrar/esconder formulários
function switchTab(tipo) {
    document.querySelectorAll('.portal-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('formCliente').style.display = tipo === 'cliente' ? 'block' : 'none';
    document.getElementById('formBarbeiro').style.display = tipo === 'barbeiro' ? 'block' : 'none';
    document.querySelector(`.portal-tab:nth-child(${tipo === 'cliente' ? 1 : 2})`).classList.add('active');
}

// Login cliente
async function loginCliente() {
    const email = document.getElementById('loginEmailCliente').value.trim();
    const senha = document.getElementById('loginSenhaCliente').value;
    
    if (!email || !senha) {
        mostrarToast('❌ Preencha todos os campos!', 'error');
        return;
    }
    
    try {
        const snapshot = await db.collection('clientes')
            .where('email', '==', email)
            .where('senha', '==', senha)
            .get();
        
        if (snapshot.empty) {
            mostrarToast('❌ Email ou senha inválidos!', 'error');
            return;
        }
        
        const cliente = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        salvarLocal('usuario', { tipo: 'cliente', ...cliente });
        salvarLocal('lojaSelecionada', lojaSelecionada);
        
        mostrarToast('✅ Bem-vindo, ' + cliente.nome + '!', 'success');
        window.location.href = `../lojas/${lojaSelecionada.id}/index.html`;
        
    } catch (error) {
        mostrarToast('❌ Erro ao fazer login!', 'error');
    }
}

// Login barbeiro
async function loginBarbeiro() {
    const email = document.getElementById('loginEmailBarbeiro').value.trim();
    const senha = document.getElementById('loginSenhaBarbeiro').value;
    
    if (!email || !senha) {
        mostrarToast('❌ Preencha todos os campos!', 'error');
        return;
    }
    
    try {
        const snapshot = await db.collection('barbeiros')
            .where('email', '==', email)
            .where('senha', '==', senha)
            .get();
        
        if (snapshot.empty) {
            mostrarToast('❌ Email ou senha inválidos!', 'error');
            return;
        }
        
        const barbeiro = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        salvarLocal('usuario', { tipo: 'barbeiro', ...barbeiro });
        salvarLocal('lojaSelecionada', lojaSelecionada);
        
        mostrarToast('✅ Bem-vindo, ' + barbeiro.nome + '!', 'success');
        window.location.href = `../lojas/${lojaSelecionada.id}/index.html`;
        
    } catch (error) {
        mostrarToast('❌ Erro ao fazer login!', 'error');
    }
}

// Mostrar seção de login
function mostrarLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('loginSection').scrollIntoView({ behavior: 'smooth' });
}