// Firebase Auth cuida das credenciais. O perfil e os dados são protegidos no Firestore.
(() => {
  let usuario = null, pendente = null, erro = '', geracao = 0, cadastroEmAndamento = false;
  let sdkAuth, sdkDb, auth, db;
  const registros = {}, versoes = {}, ouvintes = [];
  const tipos = ['criancas', 'consultas', 'educadores'];
  const emitir = nome => window.dispatchEvent(new Event(nome));
  const mensagemErro = e => ({
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Não foi possível criar a conta. Tente entrar ou recuperar sua senha.',
    'auth/invalid-email': 'Confira o endereço de e-mail.',
    'auth/weak-password': 'Use uma senha mais forte, com pelo menos 8 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    'auth/network-request-failed': 'Não foi possível conectar. Confira sua internet.',
    'permission-denied': 'Sua conta não tem permissão para esta operação.',
    'unavailable': 'O serviço está temporariamente indisponível. Tente novamente.'
  }[e?.code] || (e?.mensagemPublica ? e.message : 'Não foi possível concluir. Confira sua conexão e tente novamente.'));
  function falha(mensagem) { const e = new Error(mensagem); e.mensagemPublica = true; return e; }
  function limpar() {
    geracao++; usuario = null; pendente = null; ouvintes.splice(0).forEach(fn => fn());
    tipos.forEach(t => {registros[t] = []; versoes[t] = 0;});
    emitir('conta-alterada'); emitir('registros-alterados');
  }
  function referencia(uid, tipo) { return sdkDb.doc(db, 'usuarios', uid, 'registros', tipo); }
  async function carregar(user) {
    limpar(); erro = ''; const atual = geracao;
    if (!user) return;
    try {
      const profile = await sdkDb.getDocFromServer(sdkDb.doc(db, 'perfis', user.uid));
      if (atual !== geracao) return;
      if (!profile.exists()) {
        pendente = Object.freeze({uid: user.uid, email: user.email, nome: user.displayName || ''});
        emitir('conta-alterada');
        return;
      }
      const dados = profile.data();
      if (!['enfermeiro', 'educador'].includes(dados.perfil)) throw falha('Perfil da conta não reconhecido.');
      const permitidos = tipos.filter(t => PuericulturaPermissoes.podeUsarRegistros(t, dados.perfil));
      const respostas = await Promise.all(permitidos.map(t => sdkDb.getDocFromServer(referencia(user.uid, t))));
      if (atual !== geracao) return;
      respostas.forEach((s, i) => { const value = s.data(); registros[permitidos[i]] = value?.itens || []; versoes[permitidos[i]] = value?.versao || 0; });
      usuario = Object.freeze({uid: user.uid, email: user.email, nome: dados.nome, perfil: dados.perfil, coren: dados.coren || ''});
      emitir('conta-alterada'); emitir('registros-alterados');
      permitidos.forEach(tipo => ouvintes.push(sdkDb.onSnapshot(referencia(user.uid,tipo), snapshot => {
        if (atual !== geracao || snapshot.metadata.hasPendingWrites) return;
        const value = snapshot.data(); registros[tipo] = value?.itens || []; versoes[tipo] = value?.versao || 0; emitir('registros-alterados');
      }, e => { if (atual === geracao) {erro = mensagemErro(e); limpar(); emitir('conta-alterada');} })));
    } catch(e) { if (atual === geracao) { erro = mensagemErro(e); emitir('conta-alterada'); } throw e; }
  }
  const pronto = (async () => {
    try {
      const [appSdk, a, d] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
      ]);
      sdkAuth = a; sdkDb = d;
      const app = appSdk.initializeApp(window.FIREBASE_CONFIG);
      auth = a.getAuth(app); auth.languageCode = 'pt-BR'; db = d.getFirestore(app);
      await a.setPersistence(auth, a.browserSessionPersistence);
      a.onAuthStateChanged(auth, user => { if (!cadastroEmAndamento) carregar(user).catch(() => {}); });
    } catch(e) { erro = 'O serviço de login não está disponível. Recarregue a página ou tente novamente mais tarde.'; emitir('conta-alterada'); throw e; }
  })();
  pronto.catch(() => {});
  window.Conta = Object.freeze({
    get usuario() { return usuario; }, get pendente() { return pendente; }, get erro() { return erro; }, mensagemErro,
    async entrar(email, senha) {
      await pronto; cadastroEmAndamento = true;
      try { const result = await sdkAuth.signInWithEmailAndPassword(auth,email,senha); await carregar(result.user); }
      finally { cadastroEmAndamento = false; }
    },
    async cadastrar({nome,email,senha,perfil,coren}) {
      await pronto;
      if (!nome || !['enfermeiro','educador'].includes(perfil) || senha.length < 8 || (perfil==='enfermeiro'&&!coren)) throw falha('Preencha os dados do cadastro e confira o perfil.');
      cadastroEmAndamento = true; let created = null;
      try {
        const result = await sdkAuth.createUserWithEmailAndPassword(auth,email,senha); created = result.user;
        try { await sdkDb.setDoc(sdkDb.doc(db,'perfis',created.uid),{nome,email:created.email,perfil,coren:perfil==='enfermeiro'?coren:'',criadoEm:sdkDb.serverTimestamp()}); }
        catch(e) { await sdkAuth.deleteUser(created).catch(()=>{}); throw e; }
        await carregar(created);
      } finally { cadastroEmAndamento = false; }
    },
    async completarPerfil({nome,perfil,coren}) {
      await pronto; const user = auth.currentUser;
      if (!user || user.uid !== pendente?.uid) throw falha('Entre na sua conta para completar o perfil.');
      if (!nome || !['enfermeiro','educador'].includes(perfil) || (perfil==='enfermeiro'&&!coren)) throw falha('Preencha seu nome, perfil e inscrição profissional.');
      await sdkDb.setDoc(sdkDb.doc(db,'perfis',user.uid),{nome,email:user.email,perfil,coren:perfil==='enfermeiro'?coren:'',criadoEm:sdkDb.serverTimestamp()});
      await carregar(user);
    },
    async recuperar(email) { await pronto; try {await sdkAuth.sendPasswordResetEmail(auth,email);} catch(e) {if(e.code!=='auth/user-not-found')throw e;} },
    async sair() { await pronto; await sdkAuth.signOut(auth); erro='';limpar(); },
    ler(tipo) {
      if (!usuario || !PuericulturaPermissoes.podeUsarRegistros(tipo,usuario.perfil)) return [];
      return structuredClone(registros[tipo] || []);
    },
    async salvar(tipo, itens) {
      await pronto; const atual = usuario, numero = geracao;
      if (!atual || !PuericulturaPermissoes.podeUsarRegistros(tipo,atual.perfil)) throw falha('Faça login com o perfil autorizado para salvar.');
      const versaoEsperada = versoes[tipo], ref = referencia(atual.uid,tipo);
      await sdkDb.runTransaction(db,async transaction => {
        const snapshot = await transaction.get(ref);
        if (numero !== geracao) throw falha('A sessão mudou. Faça login novamente.');
        if ((snapshot.data()?.versao || 0) !== versaoEsperada) throw falha('Os registros foram atualizados em outra sessão. Confira os dados e tente salvar novamente.');
        transaction.set(ref,{itens,versao:versaoEsperada+1,atualizadoEm:sdkDb.serverTimestamp()});
      });
      if (numero !== geracao) return false;
      registros[tipo] = structuredClone(itens); versoes[tipo] = versaoEsperada+1;emitir('registros-alterados');return true;
    }
  });
})();

