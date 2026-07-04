function carregarPerfil() {
    if (!usuarioLogado) return;
    
    document.getElementById('perfilNome').textContent = usuarioLogado.nome || '';
    document.getElementById('perfilEmail').textContent = usuarioLogado.email || '';
    document.getElementById('editNome').value = usuarioLogado.nome || '';
    document.getElementById('editCelular').value = usuarioLogado.celular || '';
}

async function salvarPerfil() {
    const nome = document.getElementById('editNome')?.value.trim();
    const celular = document.getElementById('editCelular')?.value.trim();
    
    if (!nome) {
        mostrarToast('❌ Nome obrigatório!', 'error');
        return;
    }
    
    const colecao = usuarioLogado.tipo === 'barbeiro' ? 'barbeiros' : 'clientes';
    await db.collection(colecao).doc(usuarioLogado.id).update({ nome, celular });
    
    usuarioLogado.nome = nome;
    usuarioLogado.celular = celular;
    salvarLocal('usuario', usuarioLogado);
    
    document.getElementById('welcomeNome').textContent = nome;
    mostrarToast('✅ Perfil atualizado!', 'success');
}