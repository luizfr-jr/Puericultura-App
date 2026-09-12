'use strict';
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function mostrarAviso(mensagem,tipo='success') {
  const container = $('toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  container.append(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.remove(), 6000);
}

const CHAVES = {
  criancas: 'criancas_puericultura',
  consultas: 'consultas_puericultura',
  educadores: 'educadores_puericultura'
};

let perfil = null;
try { perfil = localStorage.getItem('perfil_puericultura'); } catch {}

let usuarioLogado = null;

function lerRegistros(chave) {
  try {
    const raw = localStorage.getItem(chave);
    const value = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(value)) throw Error();
    return value;
  } catch {
    mostrarAviso('Não foi possível ler os registros salvos. Os dados originais foram preservados.', 'error');
    throw new Error('Armazenamento inválido: ' + chave);
  }
}

function salvarRegistros(chave, valor, item = null, acao = 'salvar') {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    // Sincronização em segundo plano com Firestore quando logado
    if (window.PUERICULTURA_FIREBASE && window.PUERICULTURA_FIREBASE.usuarioAtual()) {
      const tipo = Object.keys(CHAVES).find(k => CHAVES[k] === chave);
      if (tipo && item) {
        if (acao === 'excluir' && item.id) {
          window.PUERICULTURA_FIREBASE.excluirDocumento(tipo, item.id).catch(err => {
            console.warn('Erro ao excluir no Firestore:', err);
          });
        } else {
          window.PUERICULTURA_FIREBASE.salvarDocumento(tipo, item).catch(err => {
            console.warn('Erro ao salvar no Firestore:', err);
          });
        }
      }
    }
    return true;
  } catch {
    mostrarAviso('Não foi possível salvar. Verifique o espaço/permissão do navegador e exporte seus registros.', 'error');
    return false;
  }
}

async function recarregarDadosFirestore() {
  if (!window.PUERICULTURA_FIREBASE || !window.PUERICULTURA_FIREBASE.usuarioAtual()) return;
  try {
    for (const [tipo, chave] of Object.entries(CHAVES)) {
      const itensNuvem = await window.PUERICULTURA_FIREBASE.carregarColecao(tipo);
      if (itensNuvem && itensNuvem.length > 0) {
        localStorage.setItem(chave, JSON.stringify(itensNuvem));
      }
    }
    atualizarCadernetaDigital();
    atualizarSelecaoCriancas();
  } catch (e) {
    console.warn('Erro ao carregar dados do Firestore:', e);
  }
}

function navegar(id) {
  const alvo = $(id);
  if (!alvo || !alvo.classList.contains('page-view')) return;
  document.querySelectorAll('.page-view').forEach(el => el.style.display = 'none');
  alvo.style.display = 'flex';
  document.querySelectorAll('.nav-link').forEach(el => {
    const active = el.dataset.target === id;
    el.classList.toggle('active', active);
    if (active) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
  if (id === 'view-caderneta') atualizarCadernetaDigital();
  if (id === 'view-nova-consulta') atualizarSelecaoCriancas();
  const heading = alvo.querySelector('h1');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.querySelectorAll('.open-view, .nav-link').forEach(el => {
  if (!['A','BUTTON'].includes(el.tagName)) {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', event => {
      if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        el.click();
      }
    });
  }
  el.addEventListener('click', event => {
    event.preventDefault();
    if (el.dataset.target) navegar(el.dataset.target);
  });
});

$('btnAcessoPerfis')?.addEventListener('click', event => {
  event.preventDefault();
  navegar('view-perfis');
});

$('btnAcessoLogin')?.addEventListener('click', event => {
  event.preventDefault();
  navegar('view-login');
});

document.querySelectorAll('[data-perfil]').forEach(el => el.addEventListener('click', async () => {
  perfil = el.dataset.perfil;
  try { localStorage.setItem('perfil_puericultura', perfil); } catch {}
  if (window.PUERICULTURA_FIREBASE && window.PUERICULTURA_FIREBASE.usuarioAtual()) {
    await window.PUERICULTURA_FIREBASE.salvarPerfil(window.PUERICULTURA_FIREBASE.usuarioAtual().uid, { perfil });
  }
  atualizarPerfil();
  atualizarUIAutenticacao(usuarioLogado);
  navegar(perfil === 'educador' ? 'view-educador' : 'view-dashboard');
}));

function atualizarPerfil() {
  const el = $('perfilAtual');
  if (el) {
    el.textContent = perfil === 'educador' ? 'Perfil: Educador' : perfil === 'saude' ? 'Perfil: Profissional de Saúde' : 'Perfil não selecionado';
  }
}

// ----------------------------------------------------
// INTEGRAÇÃO DA INTERFACE DE AUTENTICAÇÃO
// ----------------------------------------------------

function atualizarUIAutenticacao(user) {
  usuarioLogado = user;
  const sidebarBox = $('sidebarUserBox');
  const headerStatus = $('userStatusHeader');
  const cloudNote = $('cloudStatusNote');
  const labelAcesso = $('labelAcessoMenu');
  const btnLoginHeader = $('btnLoginHeader');

  if (user) {
    const nomeExibicao = user.displayName || user.email;
    const roleText = perfil === 'educador' ? 'Educador' : 'Prof. Saúde';
    const roleClass = perfil === 'educador' ? 'educador' : '';

    if (sidebarBox) {
      sidebarBox.innerHTML = `
        <span class="user-email" title="${escapeHTML(user.email)}">👤 ${escapeHTML(nomeExibicao)}</span>
        <span class="user-role ${roleClass}">${roleText}</span>
        <button type="button" class="btn-logout" id="btnSidebarLogout">Sair da Conta</button>
      `;
      $('btnSidebarLogout')?.addEventListener('click', fazerLogout);
    }
    if (headerStatus) {
      headerStatus.className = 'user-status-tag online';
      headerStatus.textContent = `● Conectado (${roleText})`;
    }
    if (cloudNote) {
      cloudNote.textContent = '☁ Conectado ao Firebase: seus dados estão sincronizados na nuvem em tempo real.';
    }
    if (labelAcesso) labelAcesso.textContent = 'Minha Conta';
    if (btnLoginHeader) btnLoginHeader.textContent = 'Minha Conta';
  } else {
    if (sidebarBox) {
      sidebarBox.innerHTML = `
        <span class="user-email">Modo Visitante</span>
        <p style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Conecte-se para salvar na nuvem.</p>
        <button type="button" class="btn btn-primary" style="width: 100%; font-size: 11px; padding: 6px;" id="btnSidebarLogin">Fazer Login</button>
      `;
      $('btnSidebarLogin')?.addEventListener('click', () => navegar('view-login'));
    }
    if (headerStatus) {
      headerStatus.className = 'user-status-tag';
      headerStatus.textContent = 'Modo Visitante (Offline)';
    }
    if (cloudNote) {
      cloudNote.textContent = '⚡ Modo Visitante: os registros ficam apenas neste navegador. Faça login para sincronizar na nuvem.';
    }
    if (labelAcesso) labelAcesso.textContent = 'Login / Conta';
    if (btnLoginHeader) btnLoginHeader.textContent = 'Entrar / Conta';
  }
}

async function fazerLogout() {
  if (!confirm('Deseja realmente sair da sua conta?')) return;
  try {
    if (window.PUERICULTURA_FIREBASE) {
      await window.PUERICULTURA_FIREBASE.logout();
    }
    mostrarAviso('Você saiu da sua conta.');
    navegar('view-dashboard');
  } catch (err) {
    mostrarAviso('Erro ao encerrar sessão: ' + err.message, 'error');
  }
}

// Abas da tela de autenticação
document.querySelectorAll('[data-auth-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.authTab;
    document.querySelectorAll('[data-auth-tab]').forEach(b => b.classList.toggle('active', b === btn));
    if ($('formAuthLogin')) $('formAuthLogin').hidden = (tab !== 'login');
    if ($('formAuthCadastro')) $('formAuthCadastro').hidden = (tab !== 'cadastro');
    if ($('formAuthRecuperar')) $('formAuthRecuperar').hidden = (tab !== 'recuperar');
  });
});

$('btnIrRecuperar')?.addEventListener('click', () => document.querySelector('[data-auth-tab="recuperar"]')?.click());
$('btnIrLogin')?.addEventListener('click', () => document.querySelector('[data-auth-tab="login"]')?.click());
$('btnVoltarLogin')?.addEventListener('click', () => document.querySelector('[data-auth-tab="login"]')?.click());

// Envio do formulário de login
$('formAuthLogin')?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = $('loginEmail').value;
  const senha = $('loginSenha').value;
  const btn = $('btnSubmitLogin');
  btn.disabled = true;
  btn.textContent = 'Entrando…';
  try {
    await window.PUERICULTURA_FIREBASE.login(email, senha);
    mostrarAviso('Login realizado com sucesso! Sincronizando com a nuvem…');
    $('formAuthLogin').reset();
    navegar(perfil === 'educador' ? 'view-educador' : 'view-dashboard');
  } catch (err) {
    mostrarAviso(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar na Plataforma';
  }
});

// Envio do formulário de cadastro
$('formAuthCadastro')?.addEventListener('submit', async event => {
  event.preventDefault();
  const nome = $('cadNome').value;
  const email = $('cadEmail').value;
  const senha = $('cadSenha').value;
  const novoPerfil = $('cadPerfil').value;
  const btn = $('btnSubmitCadastro');
  btn.disabled = true;
  btn.textContent = 'Criando conta…';
  try {
    await window.PUERICULTURA_FIREBASE.cadastrar(email, senha, nome, novoPerfil);
    perfil = novoPerfil;
    try { localStorage.setItem('perfil_puericultura', perfil); } catch {}
    mostrarAviso('Conta criada com sucesso! Seus dados agora estão na nuvem.');
    $('formAuthCadastro').reset();
    atualizarPerfil();
    navegar(perfil === 'educador' ? 'view-educador' : 'view-dashboard');
  } catch (err) {
    mostrarAviso(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar Minha Conta';
  }
});

// Envio de recuperação de senha
$('formAuthRecuperar')?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = $('recEmail').value;
  const btn = $('btnSubmitRecuperar');
  btn.disabled = true;
  btn.textContent = 'Enviando link…';
  try {
    await window.PUERICULTURA_FIREBASE.recuperarSenha(email);
    mostrarAviso('Link de redefinição enviado com sucesso para seu e-mail.');
    $('formAuthRecuperar').reset();
    document.querySelector('[data-auth-tab="login"]')?.click();
  } catch (err) {
    mostrarAviso(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar Link de Recuperação';
  }
});

// Observer de estado de autenticação do Firebase
if (window.PUERICULTURA_FIREBASE) {
  window.PUERICULTURA_FIREBASE.observarAuth(async user => {
    atualizarUIAutenticacao(user);
    if (user) {
      try {
        const perfilDoc = await window.PUERICULTURA_FIREBASE.obterPerfil(user.uid);
        if (perfilDoc && perfilDoc.perfil) {
          perfil = perfilDoc.perfil;
          try { localStorage.setItem('perfil_puericultura', perfil); } catch {}
        }
        atualizarPerfil();
        // Migração transparente de registros locais anteriores para o Firestore
        await window.PUERICULTURA_FIREBASE.sincronizarLocais(CHAVES);
        // Atualiza o cache local com os dados remotos
        await recarregarDadosFirestore();
      } catch (err) {
        console.warn('Erro na sincronização inicial do usuário:', err);
      }
    } else {
      atualizarCadernetaDigital();
    }
  });
}

// ----------------------------------------------------
// DEMAIS MÓDULOS (POSTOS, CONSULTAS, EDUCADOR, CADERNETA)
// ----------------------------------------------------

$('btnSidebarPostos')?.addEventListener('click', () => $('modalPostos').classList.add('active'));
$('fecharModalPostos')?.addEventListener('click', () => $('modalPostos').classList.remove('active'));
$('modalPostos')?.addEventListener('click', event => { if (event.target === $('modalPostos')) $('modalPostos').classList.remove('active'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') $('modalPostos')?.classList.remove('active'); });
$('toast-container')?.setAttribute('role', 'status');
$('toast-container')?.setAttribute('aria-live', 'polite');

document.querySelectorAll('[data-periodo]').forEach(el => el.addEventListener('click', () => {
  const [titulo, descricao, itens] = window.PUERICULTURA_CONTEUDO.consultas[Number(el.dataset.periodo)];
  $('detalheConsulta').innerHTML = `<h2>Consulta: ${escapeHTML(titulo)}</h2><p>${escapeHTML(descricao)}</p><ul class="module-list check">${itens.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul><p class="storage-note">Conferir vacinação no calendário vigente e registrar os achados na Caderneta da Criança.</p>`;
  document.querySelectorAll('[data-periodo]').forEach(b => b.setAttribute('aria-pressed', String(b === el)));
}));

document.querySelectorAll('[data-aba]').forEach(el => el.addEventListener('click', () => {
  const form = el.dataset.aba === 'formulario';
  $('painelFormulario').hidden = !form;
  $('painelEstudo').hidden = form;
  document.querySelectorAll('[data-aba]').forEach(b => {
    b.classList.toggle('active', b === el);
    b.setAttribute('aria-pressed', String(b === el));
  });
}));

function atualizarEducador() {
  const meses = idadeMeses($('edNascimento').value, $('edData').value || dataHoje());
  $('edNascimento').setCustomValidity($('edNascimento').value && (meses === null || meses > 36) ? 'Informe uma data válida para uma criança de até 36 meses na data do registro.' : '');
  $('edIdade').textContent = meses === null ? '' : `Idade no registro: ${Math.floor(meses / 12)} ano(s) e ${meses % 12} mês(es).`;
  $('edVacinaAlerta').hidden = !['Não', 'Faltam vacinas para a idade'].includes($('edVacinacao').value);
}

['edNascimento', 'edData', 'edVacinacao'].forEach(id => $(id)?.addEventListener('change', atualizarEducador));
$('formEducador')?.addEventListener('reset', () => setTimeout(() => {
  $('edId').value = '';
  $('edData').value = dataHoje();
  atualizarEducador();
}, 0));

$('formEducador')?.addEventListener('submit', event => {
  event.preventDefault();
  atualizarEducador();
  if (!$('formEducador').reportValidity()) return;
  const fd = new FormData(event.currentTarget);
  const item = Object.fromEntries(fd);
  for (const name of ['edDesenvolvimento', 'edSinais', 'edEncaminhamentos']) item[name] = fd.getAll(name);
  item.id = item.edId || crypto.randomUUID();
  item.edId = item.id;
  try {
    const registros = lerRegistros(CHAVES.educadores);
    const i = registros.findIndex(r => r.id === item.id);
    if (i < 0) registros.push(item);
    else registros[i] = item;
    if (salvarRegistros(CHAVES.educadores, registros, item, 'salvar')) {
      $('edId').value = item.id;
      mostrarAviso(usuarioLogado ? 'Formulário salvo e sincronizado na nuvem!' : 'Formulário salvo neste navegador.');
    }
  } catch {}
});

$('formObservacao')?.addEventListener('change', () => {
  const values = [...new FormData($('formObservacao')).values()];
  const sim = values.filter(v => v === 'Sim').length;
  const preenchidos = values.filter(Boolean).length;
  $('observacaoResumo').textContent = `${preenchidos} de ${values.length} itens preenchidos; ${sim} observação(ões) presente(s). Este total não classifica risco. Siga o fluxo da rede de proteção.`;
});

function imprimirHTML(html) {
  $('print-root').innerHTML = html;
  document.body.classList.add('printing');
  window.print();
}

window.addEventListener('afterprint', () => document.body.classList.remove('printing'));

$('imprimirObservacao')?.addEventListener('click', () => {
  const fd = new FormData($('formObservacao'));
  imprimirHTML(`<article class="print-page"><h1>Roteiro de observação — Educador</h1><p>Data: ${dataHoje()}</p>${window.PUERICULTURA_CONTEUDO.observacao.map((t, i) => `<p><strong>${escapeHTML(t)}:</strong> ${escapeHTML(fd.get('obs' + i) || 'Não informado')}</p>`).join('')}<p>${escapeHTML($('observacaoResumo').textContent)}</p></article>`);
});

function atualizarSelecaoCriancas() {
  try {
    const select = $('selectCrianca');
    if (!select) return;
    const current = select.value;
    const criancas = lerRegistros(CHAVES.criancas);
    select.innerHTML = '<option value="">Selecione uma criança cadastrada…</option>' + criancas.map(c => `<option value="${escapeHTML(c.id)}">${escapeHTML(c.nome)} · ${escapeHTML(c.nascimento)}</option>`).join('');
    select.value = current;
  } catch {}
}

function limparConsulta() {
  $('formNovaConsulta').reset();
  $('consultaId').value = '';
  $('dataConsulta').value = dataHoje();
}

$('formNovaConsulta')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const fd = new FormData(form);
  try {
    const crianca = lerRegistros(CHAVES.criancas).find(c => c.id === fd.get('crianca'));
    if (!crianca) {
      mostrarAviso('Cadastre ou selecione uma criança na Caderneta Digital.', 'error');
      return;
    }
    if (fd.get('data') < crianca.nascimento || fd.get('data') > dataHoje()) {
      mostrarAviso('A data da consulta deve estar entre o nascimento e hoje.', 'error');
      return;
    }
    if (fd.get('retorno') && fd.get('retorno') < fd.get('data')) {
      mostrarAviso('O retorno não pode ser anterior à consulta.', 'error');
      return;
    }
    const registros = lerRegistros(CHAVES.consultas);
    const item = {
      ...Object.fromEntries(fd),
      id: fd.get('consultaId') || crypto.randomUUID(),
      nome: crianca.nome,
      profissional: fd.get('nomeProfissional')
    };
    const i = registros.findIndex(r => r.id === item.id);
    if (i < 0) registros.push(item);
    else registros[i] = item;
    if (salvarRegistros(CHAVES.consultas, registros, item, 'salvar')) {
      mostrarAviso(usuarioLogado ? 'Consulta salva e sincronizada na nuvem!' : 'Consulta completa salva neste navegador.');
      limparConsulta();
      navegar('view-caderneta');
    }
  } catch {}
});

$('novaCrianca')?.addEventListener('click', () => {
  $('formCrianca').reset();
  $('criancaId').value = '';
  $('cadastroCrianca').hidden = false;
  $('criancaNome').focus();
});

$('formCrianca')?.addEventListener('reset', () => setTimeout(() => $('criancaId').value = '', 0));

$('formCrianca')?.addEventListener('submit', event => {
  event.preventDefault();
  const fd = new FormData(event.currentTarget);
  if (idadeMeses(fd.get('criancaNascimento')) === null) {
    mostrarAviso('Confira a data de nascimento.', 'error');
    return;
  }
  try {
    const registros = lerRegistros(CHAVES.criancas);
    const item = {
      id: fd.get('criancaId') || crypto.randomUUID(),
      nome: fd.get('criancaNome').trim(),
      nascimento: fd.get('criancaNascimento'),
      responsavel: fd.get('criancaResponsavel').trim(),
      profissional: fd.get('criancaProfissional').trim()
    };
    if (!item.nome || !item.responsavel) {
      mostrarAviso('Informe o nome da criança e do responsável.', 'error');
      return;
    }
    const i = registros.findIndex(r => r.id === item.id);
    if (i < 0) registros.push(item);
    else registros[i] = item;
    if (salvarRegistros(CHAVES.criancas, registros, item, 'salvar')) {
      $('cadastroCrianca').hidden = true;
      event.currentTarget.reset();
      atualizarCadernetaDigital();
      mostrarAviso(usuarioLogado ? 'Criança cadastrada e sincronizada na nuvem!' : 'Registro da criança salvo.');
    }
  } catch {}
});

function botoesRegistro(tipo, index) {
  return `<div class="child-actions"><button class="btn btn-cancel" data-action="ver" data-tipo="${tipo}" data-index="${index}">Ver</button><button class="btn btn-cancel" data-action="editar" data-tipo="${tipo}" data-index="${index}">Editar</button><button class="btn btn-cancel" data-action="excluir" data-tipo="${tipo}" data-index="${index}">Excluir</button></div>`;
}

function atualizarCadernetaDigital() {
  try {
    const criancas = lerRegistros(CHAVES.criancas);
    const consultas = lerRegistros(CHAVES.consultas);
    const educadores = lerRegistros(CHAVES.educadores);

    const containerCriancas = $('listaCriancasCadastradas');
    if (containerCriancas) {
      containerCriancas.innerHTML = criancas.length
        ? criancas.map((c, i) => `<article class="child-row"><div><h3>${escapeHTML(c.nome)}</h3><p>Nascimento: ${escapeHTML(c.nascimento)} · Responsável: ${escapeHTML(c.responsavel)}</p></div>${botoesRegistro('criancas', i)}</article>`).join('')
        : '<p>Nenhuma criança cadastrada. Use “Novo registro” para começar.</p>';
    }

    const containerAtendimentos = $('listaAtendimentos');
    if (containerAtendimentos) {
      containerAtendimentos.innerHTML = [
        ...consultas.map((c, i) => `<article class="child-row"><div><span class="tag">Consulta</span><h3>${escapeHTML(c.nome)}</h3><p>${escapeHTML(c.data)} · ${escapeHTML(c.profissional || 'Profissional não informado')}</p></div>${botoesRegistro('consultas', i)}</article>`),
        ...educadores.map((c, i) => `<article class="child-row"><div><span class="tag">Educador</span><h3>${escapeHTML(c.edNome)}</h3><p>${escapeHTML(c.edData)} · ${escapeHTML(c.edResponsavel)}</p>${['Não', 'Faltam vacinas para a idade'].includes(c.edVacinacao) ? '<span class="vaccination-badge">⚠ Vacinação pendente</span>' : ''}</div>${botoesRegistro('educadores', i)}</article>`)
      ].join('') || '<p>Nenhum atendimento registrado.</p>';
    }

    atualizarSelecaoCriancas();
  } catch {}
}

const rotulos = {
  nome: 'Criança',
  nascimento: 'Data de nascimento',
  responsavel: 'Responsável',
  profissional: 'Profissional',
  data: 'Data da consulta',
  retorno: 'Retorno',
  queixa: 'Queixa principal',
  exame: 'Exame físico e antropometria',
  diagnostico: 'Diagnóstico de enfermagem',
  intervencoes: 'Intervenções',
  orientacoes: 'Orientações',
  edNome: 'Criança',
  edNascimento: 'Nascimento',
  edTurma: 'Turma',
  edResponsavel: 'Educador',
  edData: 'Data do preenchimento',
  edEscola: 'Escola/creche',
  edVacinacao: 'Vacinação',
  edVacinasFaltantes: 'Vacinas pendentes',
  edConsultas: 'Consultas de puericultura',
  edDesenvolvimento: 'Observações de desenvolvimento',
  edSinais: 'Sinais gerais',
  edObservacoes: 'Observações',
  edEncaminhamentos: 'Próximos passos',
  protocolo: 'Tipo de protocolo'
};

function detalhesRegistro(item) {
  return `<dl class="record-details">${Object.entries(rotulos).filter(([k]) => Object.hasOwn(item, k)).map(([k, label]) => `<dt>${label}</dt><dd>${escapeHTML(Array.isArray(item[k]) ? item[k].join('\n') : item[k] || 'Não informado')}</dd>`).join('')}</dl>`;
}

document.querySelector('#view-caderneta')?.addEventListener('click', event => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  try {
    const registros = lerRegistros(CHAVES[b.dataset.tipo]);
    const i = Number(b.dataset.index);
    const item = registros[i];
    if (!item) return;

    if (b.dataset.action === 'ver') {
      $('registroDetalhes').innerHTML = detalhesRegistro(item);
      $('registroDialog').showModal();
    }
    if (b.dataset.action === 'excluir') {
      if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return;
      if (b.dataset.tipo === 'criancas' && lerRegistros(CHAVES.consultas).some(c => c.crianca === item.id)) {
        mostrarAviso('Esta criança possui consultas vinculadas. Preserve o cadastro enquanto existirem atendimentos.', 'error');
        return;
      }
      registros.splice(i, 1);
      if (salvarRegistros(CHAVES[b.dataset.tipo], registros, item, 'excluir')) {
        atualizarCadernetaDigital();
        mostrarAviso('Registro excluído com sucesso.');
      }
    }
    if (b.dataset.action === 'editar') {
      if (b.dataset.tipo === 'criancas') {
        $('cadastroCrianca').hidden = false;
        for (const [field, key] of Object.entries({ criancaId: 'id', criancaNome: 'nome', criancaNascimento: 'nascimento', criancaResponsavel: 'responsavel', criancaProfissional: 'profissional' })) {
          $(field).value = item[key] || '';
        }
        $('criancaNome').focus();
      }
      if (b.dataset.tipo === 'educadores') {
        $('formEducador').reset();
        setTimeout(() => {
          for (const el of $('formEducador').elements) {
            if (!el.name) continue;
            const value = item[el.name];
            if (el.type === 'checkbox') el.checked = Array.isArray(value) && value.includes(el.value);
            else el.value = value || '';
          }
          $('edId').value = item.id;
          atualizarEducador();
        }, 0);
        document.querySelector('[data-aba="formulario"]').click();
        navegar('view-educador');
      }
      if (b.dataset.tipo === 'consultas') {
        if (!item.id) {
          item.id = crypto.randomUUID();
          if (!salvarRegistros(CHAVES.consultas, registros, item, 'salvar')) return;
        }
        navegar('view-nova-consulta');
        for (const el of $('formNovaConsulta').elements) {
          if (el.name) el.value = item[el.name] || '';
        }
        $('consultaId').value = item.id;
        $('nomeProfissional').value = item.profissional || '';
      }
    }
  } catch {}
});

$('fecharRegistro')?.addEventListener('click', () => $('registroDialog').close());
$('imprimirRegistro')?.addEventListener('click', () => {
  const html = $('registroDetalhes').innerHTML;
  $('registroDialog').close();
  imprimirHTML(`<article class="print-page"><h1>Mundo da Puericultura</h1>${html}</article>`);
});

$('exportarRegistros')?.addEventListener('click', () => {
  try {
    const data = { versao: 2, exportadoEm: new Date().toISOString(), usuario: usuarioLogado ? usuarioLogado.email : 'visitante' };
    for (const [tipo, chave] of Object.entries(CHAVES)) data[tipo] = lerRegistros(chave);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `puericultura-registros-${dataHoje()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {}
});

document.querySelectorAll('input[type="date"]').forEach(el => {
  if (!el.id.toLowerCase().includes('retorno')) el.max = dataHoje();
});

if ($('edData')) $('edData').value = dataHoje();
if ($('dataConsulta')) $('dataConsulta').value = dataHoje();
atualizarPerfil();
atualizarSelecaoCriancas();
atualizarUIAutenticacao(null);

navegar(perfil === 'educador' ? 'view-educador' : perfil === 'saude' ? 'view-dashboard' : 'view-perfis');
