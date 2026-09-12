// firebase-service.js
// Integração do Firebase (Authentication e Cloud Firestore) para o Mundo da Puericultura

const firebaseConfig = {
  apiKey: "AIzaSyA8buadckhZcvZHOuq4vuGfhWpTkJGqqAo",
  authDomain: "puericultura-app.firebaseapp.com",
  projectId: "puericultura-app",
  storageBucket: "puericultura-app.firebasestorage.app",
  messagingSenderId: "10616870274",
  appId: "1:10616870274:web:78de3fb908771b0562eb9b"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseDisponivel = false;

try {
  if (typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();
    // Habilitar persistência offline se suportado pelo navegador
    firebaseDb.enablePersistence({ synchronizeTabs: true }).catch(() => {
      // Falha esperada caso múltiplas abas estejam abertas ou não suportado
    });
    firebaseDisponivel = true;
  }
} catch (error) {
  console.warn('Aviso: Não foi possível inicializar o Firebase:', error);
}

// Utilitário para mensagens amigáveis de erro do Firebase
function tratarErroFirebase(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/user-not-found':
      return 'Nenhum usuário encontrado com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Faça login ou recupere a senha.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/popup-closed-by-user':
      return 'A autenticação foi cancelada.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas sem sucesso. Aguarde alguns minutos e tente novamente.';
    case 'permission-denied':
      return 'Permissão negada no banco de dados. Verifique as regras de segurança no Firebase Console.';
    default:
      return 'Ocorreu um erro ao comunicar com o servidor. Tente novamente.';
  }
}

// ----------------------------------------------------
// SERVIÇOS DE AUTENTICAÇÃO
// ----------------------------------------------------

async function fbLogin(email, senha) {
  if (!firebaseDisponivel) throw new Error('Firebase indisponível.');
  try {
    const cred = await firebaseAuth.signInWithEmailAndPassword(email.trim(), senha);
    return cred.user;
  } catch (err) {
    throw new Error(tratarErroFirebase(err.code));
  }
}

async function fbCadastrar(email, senha, nome, perfil) {
  if (!firebaseDisponivel) throw new Error('Firebase indisponível.');
  try {
    const cred = await firebaseAuth.createUserWithEmailAndPassword(email.trim(), senha);
    const user = cred.user;
    if (nome) {
      await user.updateProfile({ displayName: nome.trim() });
    }
    // Salvar informações adicionais de perfil no Firestore
    await fbSalvarPerfil(user.uid, {
      nome: nome.trim(),
      email: email.trim(),
      perfil: perfil || 'saude',
      criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });
    return user;
  } catch (err) {
    throw new Error(tratarErroFirebase(err.code));
  }
}

async function fbLogout() {
  if (!firebaseDisponivel) return;
  await firebaseAuth.signOut();
}

async function fbRecuperarSenha(email) {
  if (!firebaseDisponivel) throw new Error('Firebase indisponível.');
  try {
    await firebaseAuth.sendPasswordResetEmail(email.trim());
    return true;
  } catch (err) {
    throw new Error(tratarErroFirebase(err.code));
  }
}

function fbObservarAuth(callback) {
  if (!firebaseDisponivel) {
    callback(null);
    return () => {};
  }
  return firebaseAuth.onAuthStateChanged(callback);
}

function fbUsuarioAtual() {
  return firebaseDisponivel ? firebaseAuth.currentUser : null;
}

// ----------------------------------------------------
// SERVIÇOS DE BANCO DE DADOS (FIRESTORE)
// ----------------------------------------------------

async function fbSalvarPerfil(uid, dados) {
  if (!firebaseDisponivel) return;
  await firebaseDb.collection('usuarios').doc(uid).set(dados, { merge: true });
}

async function fbObterPerfil(uid) {
  if (!firebaseDisponivel) return null;
  const doc = await firebaseDb.collection('usuarios').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// Caminho de coleção isolada por usuário: usuarios/{uid}/{tipo}
// onde tipo pode ser 'criancas', 'consultas', 'educadores'
async function fbCarregarColecao(tipo) {
  const user = fbUsuarioAtual();
  if (!user || !firebaseDisponivel) return [];
  const snapshot = await firebaseDb
    .collection('usuarios')
    .doc(user.uid)
    .collection(tipo)
    .get();

  const lista = [];
  snapshot.forEach(doc => {
    lista.push({ ...doc.data(), id: doc.id });
  });
  return lista;
}

async function fbSalvarDocumento(tipo, item) {
  const user = fbUsuarioAtual();
  if (!user || !firebaseDisponivel) return false;
  const docId = item.id || crypto.randomUUID();
  const dados = { ...item, id: docId, atualizadoEm: firebase.firestore.FieldValue.serverTimestamp() };
  await firebaseDb
    .collection('usuarios')
    .doc(user.uid)
    .collection(tipo)
    .doc(docId)
    .set(dados, { merge: true });
  return true;
}

async function fbExcluirDocumento(tipo, docId) {
  const user = fbUsuarioAtual();
  if (!user || !firebaseDisponivel) return false;
  await firebaseDb
    .collection('usuarios')
    .doc(user.uid)
    .collection(tipo)
    .doc(docId)
    .delete();
  return true;
}

// Sincronização em lote: importa registros locais para o Firestore
async function fbSincronizarRegistrosLocais(chavesLocais) {
  const user = fbUsuarioAtual();
  if (!user || !firebaseDisponivel) return;

  const batch = firebaseDb.batch();
  let alteracoes = 0;

  for (const [tipo, chaveStorage] of Object.entries(chavesLocais)) {
    try {
      const raw = localStorage.getItem(chaveStorage);
      const itens = raw ? JSON.parse(raw) : [];
      if (Array.isArray(itens) && itens.length > 0) {
        for (const item of itens) {
          const docId = item.id || crypto.randomUUID();
          const docRef = firebaseDb
            .collection('usuarios')
            .doc(user.uid)
            .collection(tipo)
            .doc(docId);
          batch.set(docRef, { ...item, id: docId, sincronizadoEm: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
          alteracoes++;
        }
      }
    } catch (e) {
      console.warn(`Erro ao ler ${chaveStorage} para sincronização:`, e);
    }
  }

  if (alteracoes > 0) {
    await batch.commit();
    console.log(`Sincronizados ${alteracoes} registros com o Firestore.`);
  }
}

window.PUERICULTURA_FIREBASE = {
  disponivel: firebaseDisponivel,
  login: fbLogin,
  cadastrar: fbCadastrar,
  logout: fbLogout,
  recuperarSenha: fbRecuperarSenha,
  observarAuth: fbObservarAuth,
  usuarioAtual: fbUsuarioAtual,
  obterPerfil: fbObterPerfil,
  salvarPerfil: fbSalvarPerfil,
  carregarColecao: fbCarregarColecao,
  salvarDocumento: fbSalvarDocumento,
  excluirDocumento: fbExcluirDocumento,
  sincronizarLocais: fbSincronizarRegistrosLocais
};
