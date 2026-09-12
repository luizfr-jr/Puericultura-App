// A interface pública não depende de uma sessão autenticada.
(() => {
  const acesso = document.getElementById('btnAcessoLogin');
  acesso.textContent = 'Login'; acesso.href = '#view-login';
  document.getElementById('menuDashboard').href = '#view-dashboard';
  document.getElementById('btnSidebarPostos').href = '#postos';
  acesso.insertAdjacentHTML('afterend', '<button id="btnSair" class="btn btn-cancel" hidden>Sair</button>');
  document.querySelector('.main-content').insertAdjacentHTML('beforeend', `
    <section id="view-login" class="page-view inner-view">
      <button class="btn-voltar open-view" data-target="view-dashboard">← Voltar ao Início</button>
      <header class="module-header-text"><h1>Entrar na sua conta</h1><p>Acesse suas ferramentas de acompanhamento.</p></header>
      <div class="auth-card">
        <div id="authStatus" class="notice" role="status" aria-live="polite">Conectando ao serviço de acesso…</div>

        <form id="formLogin">
          <div class="form-group"><label for="loginEmail">E-mail</label><input class="form-control" id="loginEmail" type="email" autocomplete="username" required maxlength="254"></div>
          <div class="form-group"><label for="loginSenha">Senha</label><input class="form-control" id="loginSenha" type="password" autocomplete="current-password" required maxlength="128"></div>
          <button class="btn btn-primary" type="submit">Entrar</button>
          <div class="auth-links"><button type="button" id="abrirRecuperacao">Esqueci minha senha</button><button type="button" id="abrirCadastro">Criar conta</button></div>
        </form>
        <form id="formCadastro" hidden>
          <h2>Criar conta</h2>
          <div class="form-group"><label for="cadastroNome">Nome completo</label><input class="form-control" id="cadastroNome" autocomplete="name" required maxlength="160"></div>
          <div class="form-group"><label for="cadastroEmail">E-mail</label><input class="form-control" id="cadastroEmail" type="email" autocomplete="username" required maxlength="254"></div>
          <div class="form-group"><label for="cadastroSenha">Senha — pelo menos 8 caracteres</label><input class="form-control" id="cadastroSenha" type="password" autocomplete="new-password" required minlength="8" maxlength="128"></div>
          <div class="form-group"><label for="cadastroConfirmacao">Confirme a senha</label><input class="form-control" id="cadastroConfirmacao" type="password" autocomplete="new-password" required minlength="8" maxlength="128"></div>
          <div class="form-group"><label for="cadastroPerfil">Perfil profissional</label><select class="form-control" id="cadastroPerfil" required><option value="">Selecione…</option><option value="enfermeiro">Enfermeiro</option><option value="educador">Educador</option></select></div>
          <div class="form-group" id="campoCoren" hidden><label for="cadastroCoren">COREN e UF</label><input class="form-control" id="cadastroCoren" maxlength="40" placeholder="Número de inscrição e UF"></div>
          <p class="storage-note">O perfil informado fica vinculado à conta e define as ferramentas disponíveis.</p>
          <button class="btn btn-primary" type="submit">Cadastrar</button><button class="auth-back" type="button" data-voltar-login>Já tenho uma conta</button>
        </form>
        <form id="formRecuperacao" hidden><h2>Recuperar senha</h2><p>Informe o e-mail cadastrado para receber as instruções.</p><div class="form-group"><label for="recuperarEmail">E-mail da conta</label><input class="form-control" type="email" id="recuperarEmail" autocomplete="email" required></div><button class="btn btn-primary" type="submit">Enviar instruções</button><button class="auth-back" type="button" data-voltar-login>Voltar ao login</button></form>
        <form id="formPerfil" hidden>
          <h2>Complete seu perfil</h2><p id="perfilEmail"></p>
          <p>Seu login já existe. Complete o cadastro para acessar as ferramentas da sua profissão.</p>
          <div class="form-group"><label for="perfilNome">Nome completo</label><input class="form-control" id="perfilNome" required maxlength="160" autocomplete="name"></div>
          <div class="form-group"><label for="perfilProfissao">Perfil profissional</label><select class="form-control" id="perfilProfissao" required><option value="">Selecione…</option><option value="enfermeiro">Enfermeiro</option><option value="educador">Educador</option></select></div>
          <div class="form-group" id="campoPerfilCoren" hidden><label for="perfilCoren">COREN e UF</label><input class="form-control" id="perfilCoren" maxlength="40" placeholder="Número de inscrição e UF"></div>
          <p class="storage-note">O perfil fica vinculado à sua conta e não poderá ser trocado por este aplicativo.</p>
          <button type="submit" class="btn btn-primary">Salvar meu perfil</button>
        </form>
      </div>
    </section>
    <section id="view-conta" class="page-view inner-view">
      <button class="btn-voltar open-view" data-target="view-dashboard">← Voltar ao Início</button>
      <header class="module-header-text"><h1>Minha conta</h1><p>Suas ferramentas de acompanhamento.</p></header>
      <div class="account-details"><p id="contaNome"></p><p id="contaEmail"></p><p id="contaPerfil"></p></div>
      <div class="account-tools">
        <button class="module-card open-view" data-target="view-nova-consulta"><h2>Nova consulta</h2><p>Registre o atendimento de puericultura.</p></button>
        <button class="module-card open-view" data-target="view-educador"><h2>Formulário do Educador</h2><p>Registre observações e acompanhe o desenvolvimento.</p></button>
        <button class="module-card open-view" data-target="view-documentos"><h2>Documentos de Enfermagem</h2><p>Acesse os documentos e as referências da profissão.</p></button>
        <button class="module-card open-view" data-target="view-receituario"><h2>Receituários</h2><p>Prepare e imprima suas prescrições.</p></button>
        <button class="module-card open-view" data-target="view-caderneta"><h2>Caderneta Digital</h2><p>Acesse os registros salvos na sua conta.</p></button>
      </div>
    </section>`);
  for(const id of ['view-educador','view-documentos','view-receituario','view-nova-consulta','view-caderneta']){
    const botao=document.querySelector('#'+id+' .btn-voltar');
    if(botao){botao.dataset.target='view-conta';botao.textContent='← Voltar à Minha conta';}
  }
  const el=id=>document.getElementById(id);
  const avisar=(texto,erro=false)=>{el('authStatus').textContent=texto;el('authStatus').classList.toggle('warning',erro);};
  const mostrarFormulario=id=>{for(const nome of ['formLogin','formCadastro','formRecuperacao'])el(nome).hidden=nome!==id;avisar('Use seu e-mail e senha para acessar as ferramentas do seu perfil.');};
  el('abrirCadastro').onclick=()=>mostrarFormulario('formCadastro');
  el('abrirRecuperacao').onclick=()=>{mostrarFormulario('formRecuperacao');el('recuperarEmail').value=el('loginEmail').value;};
  document.querySelectorAll('[data-voltar-login]').forEach(b=>b.onclick=()=>mostrarFormulario('formLogin'));
  el('cadastroPerfil').onchange=()=>{const enfermeiro=el('cadastroPerfil').value==='enfermeiro';el('campoCoren').hidden=!enfermeiro;el('cadastroCoren').required=enfermeiro;};
  el('perfilProfissao').onchange=()=>{const enfermeiro=el('perfilProfissao').value==='enfermeiro';el('campoPerfilCoren').hidden=!enfermeiro;el('perfilCoren').required=enfermeiro;};
  el('formPerfil').onsubmit=event=>{event.preventDefault();executar(event.currentTarget,async()=>{await window.Conta.completarPerfil({nome:el('perfilNome').value.trim(),perfil:el('perfilProfissao').value,coren:el('perfilCoren').value.trim()});navegar('view-conta');});};
  let ocupado=false;
  async function executar(form,acao){
    if(ocupado)return;ocupado=true;
    const botoes=[...document.querySelectorAll('#view-login button[type="submit"]')];botoes.forEach(b=>b.disabled=true);
    try{avisar('Aguarde…');await acao();}catch(e){avisar(window.Conta.mensagemErro(e),true);}
    finally{ocupado=false;botoes.forEach(b=>b.disabled=false);form.querySelectorAll('input[type=password]').forEach(i=>i.value='');}
  }
  el('formLogin').onsubmit=event=>{event.preventDefault();executar(event.currentTarget,async()=>{await window.Conta.entrar(el('loginEmail').value.trim(),el('loginSenha').value);avisar(window.Conta.pendente?'Complete seu perfil para liberar as ferramentas da conta.':'Login realizado.');navegar(window.Conta.pendente?'view-login':'view-conta');});};
  el('formCadastro').onsubmit=event=>{
    event.preventDefault();if(el('cadastroSenha').value!==el('cadastroConfirmacao').value){avisar('As senhas não coincidem.',true);return;}
    executar(event.currentTarget,async()=>{await window.Conta.cadastrar({nome:el('cadastroNome').value.trim(),email:el('cadastroEmail').value.trim(),senha:el('cadastroSenha').value,perfil:el('cadastroPerfil').value,coren:el('cadastroCoren').value.trim()});avisar('Conta criada.');navegar('view-conta');});
  };
  el('formRecuperacao').onsubmit=event=>{event.preventDefault();executar(event.currentTarget,async()=>{await window.Conta.recuperar(el('recuperarEmail').value.trim());avisar('Se houver uma conta com esse e-mail, você receberá as instruções de recuperação.');});};
  el('btnSair').onclick=async()=>{try{await window.Conta.sair();navegar('view-dashboard');}catch(e){avisar(window.Conta.mensagemErro(e),true);}};
  window.addEventListener('conta-alterada',()=>{
    const conta=window.Conta.usuario, pendente=window.Conta.pendente;
    el('btnSair').hidden=!(conta||pendente);acesso.textContent=conta?'Minha conta':'Login';acesso.href=conta?'#view-conta':'#view-login';
    acesso.dataset.target=conta?'view-conta':'view-login';
    for(const nome of ['formLogin','formCadastro','formRecuperacao'])el(nome).hidden=!!(conta||pendente)||nome!=='formLogin';
    el('formPerfil').hidden=!pendente;
    for(const id of ['contaNome','contaEmail','contaPerfil'])el(id).textContent='';
    if(conta){el('contaNome').textContent=conta.nome;el('contaEmail').textContent=conta.email;el('contaPerfil').textContent=conta.perfil==='enfermeiro'?'Perfil: Enfermeiro':'Perfil: Educador';avisar('Você está conectado.');}
    else if(pendente){el('perfilNome').value=pendente.nome;el('perfilEmail').textContent=pendente.email;avisar('Complete seu perfil para liberar as ferramentas da conta.');}
    else {el('formPerfil').reset();el('campoPerfilCoren').hidden=true;el('perfilCoren').required=false;el('perfilEmail').textContent='';avisar(window.Conta.erro||'Use seu e-mail e senha para acessar as ferramentas do seu perfil.',!!window.Conta.erro);}
  });
})();

