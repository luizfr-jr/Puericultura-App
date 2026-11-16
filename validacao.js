// Revisão pós-validação por juízes especialistas (novembro de 2026)
// e melhorias de experiência orientadas pelo design centrado no ser humano.
// Carregado depois de app.js: reutiliza a navegação existente (.open-view / .nav-link).
(() => {
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lista = (items, cls = 'check') => `<ul class="module-list ${cls}">${items.map(t => `<li>${t}</li>`).join('')}</ul>`;
  const link = (url, texto) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${texto}</a>`;
  const dados = window.PUERICULTURA_CONTEUDO;
  const irPara = id => {
    if (typeof window.navegar === 'function') { window.navegar(id); return; }
    document.querySelector(`.open-view[data-target="${id}"], .nav-link[data-target="${id}"]`)?.click();
  };

  /* ------------------------------------------------------------------ */
  /* 1. Dados clínicos                                                   */
  /* ------------------------------------------------------------------ */

  // Calendário Nacional de Vacinação 2026 — criança (rotina até 4 anos).
  // Fonte: Ministério da Saúde/DPNI, calendário técnico 2026, e Nota Técnica nº 64/2026
  // (2º reforço da VIP aos 4 anos a partir de 03/08/2026). Idade em meses.
  const VACINAS = [
    [0, 'Ao nascer', [['BCG', 'dose única'], ['Hepatite B', 'dose ao nascer']]],
    [2, '2 meses', [['Penta (DTP/Hib/Hepatite B)', '1ª dose'], ['VIP (poliomielite inativada)', '1ª dose'], ['Pneumocócica 10-valente', '1ª dose'], ['Rotavírus humano', '1ª dose']]],
    [3, '3 meses', [['Meningocócica C', '1ª dose']]],
    [4, '4 meses', [['Penta (DTP/Hib/Hepatite B)', '2ª dose'], ['VIP (poliomielite inativada)', '2ª dose'], ['Pneumocócica 10-valente', '2ª dose'], ['Rotavírus humano', '2ª dose']]],
    [5, '5 meses', [['Meningocócica C', '2ª dose']]],
    [6, '6 meses', [['Penta (DTP/Hib/Hepatite B)', '3ª dose'], ['VIP (poliomielite inativada)', '3ª dose'], ['COVID-19', '1ª dose'], ['Influenza', 'a partir dos 6 meses, conforme a campanha anual']]],
    [7, '7 meses', [['COVID-19', '2ª dose']]],
    [9, '9 meses', [['Febre amarela', '1ª dose'], ['COVID-19', '3ª dose (conforme o imunizante)']]],
    [12, '12 meses', [['Tríplice viral (sarampo, caxumba, rubéola)', '1ª dose'], ['Pneumocócica 10-valente', 'reforço'], ['Meningocócica ACWY', 'reforço']]],
    [15, '15 meses', [['DTP', '1º reforço'], ['VIP (poliomielite inativada)', '1º reforço'], ['Tríplice viral', '2ª dose'], ['Varicela', '1ª dose'], ['Hepatite A', 'dose única']]],
    [48, '4 anos', [['DTP', '2º reforço'], ['VIP (poliomielite inativada)', '2º reforço'], ['Febre amarela', 'reforço'], ['Varicela', '2ª dose']]]
  ];
  const FONTES_VACINA = `${link('https://www.gov.br/saude/pt-br/composicao/svsa/pni/calendario-tecnico/calendario-tecnico-nacional-de-vacinacao-crianca', 'Ministério da Saúde · Calendário Nacional de Vacinação 2026 — Criança')} · ${link('https://www.gov.br/saude/pt-br/vacinacao', 'Ministério da Saúde · Vacinação')}`;

  // Idades (em meses) das consultas, na mesma ordem de dados.consultas.
  const IDADES_CONSULTA = [0, 1, 2, 4, 6, 9, 12, 18, 24, 36];

  // Triagem neonatal (Programa Nacional de Triagem Neonatal).
  const TRIAGENS = [
    ['Teste do pezinho', 'Triagem biológica de doenças metabólicas, genéticas e infecciosas.', 'Coleta preferencialmente entre o 3º e o 5º dia de vida, na maternidade ou na UBS.'],
    ['Teste do olhinho', 'Teste do reflexo vermelho, para alterações oculares congênitas.', 'Antes da alta da maternidade e repetido nas consultas de rotina, conforme protocolo.'],
    ['Teste da orelhinha', 'Triagem auditiva neonatal.', 'Preferencialmente nas primeiras semanas, até o fim do 1º mês de vida.'],
    ['Teste do coraçãozinho', 'Oximetria de pulso para cardiopatias congênitas críticas.', 'Entre 24 e 48 horas de vida, antes da alta da maternidade.'],
    ['Teste da linguinha', 'Avaliação do frênulo lingual (Lei nº 13.002/2014).', 'Na maternidade, antes da alta, por profissional capacitado.']
  ];

  // Modelo de Promoção da Saúde (Nola Pender) aplicado a cada consulta.
  // [comportamento de saúde a promover, pergunta sobre benefícios, barreira frequente]
  const PROMOCAO = [
    ['Amamentação exclusiva', 'O que vocês já ouviram sobre os benefícios do leite materno?', 'Dor ao amamentar, cansaço e insegurança sobre a quantidade de leite.'],
    ['Amamentação e sono seguro', 'Como a amamentação tem ajudado o bebê e a mãe?', 'Pressão de familiares para oferecer chás, água ou fórmula.'],
    ['Vacinação em dia', 'Por que vocês acham importante vacinar o bebê agora?', 'Medo de reações, horário da sala de vacina e notícias falsas.'],
    ['Brincar no chão e saúde bucal', 'Que mudanças vocês notam quando o bebê brinca de bruços?', 'Pouco tempo em casa e insegurança para estimular o bebê.'],
    ['Alimentação complementar saudável', 'Quais alimentos da família podem fazer parte do prato do bebê?', 'Oferta de ultraprocessados e açúcar por familiares.'],
    ['Prevenção de acidentes em casa', 'Que riscos vocês já identificaram na casa?', 'Custo de adaptações e cuidado dividido entre várias pessoas.'],
    ['Alimentação da família e vacinas de 1 ano', 'Como está a participação da criança nas refeições da família?', 'Recusa alimentar e esquecimento das doses de 12 e 15 meses.'],
    ['Leitura e conversa diária', 'O que muda quando vocês leem ou conversam com a criança?', 'Tempo de tela e rotina corrida dos cuidadores.'],
    ['Rotina, sono e limite de telas', 'Como uma rotina previsível ajuda a criança?', 'Horários irregulares e uso de telas para acalmar.'],
    ['Atividade física, sono e convivência', 'Quais brincadeiras ativas a criança mais gosta?', 'Falta de espaço seguro e adaptação à escola.']
  ];

  // Exemplos de enunciados diagnósticos por situação comum na puericultura.
  // Rótulos devem ser conferidos na edição vigente da NANDA-I e da CIPE®.
  const DIAGNOSTICOS = [
    ['Amamentação', 'Amamentação eficaz; Amamentação ineficaz; Amamentação interrompida', 'Observar a mamada, corrigir pega e posição, apoiar a rede familiar e agendar retorno precoce.'],
    ['Crescimento e nutrição', 'Disposição para nutrição melhorada; Nutrição desequilibrada (risco ou presença)', 'Interpretar as curvas com a família, orientar alimentação adequada à idade e reavaliar a trajetória.'],
    ['Desenvolvimento', 'Desenvolvimento infantil adequado; Risco de desenvolvimento infantil atrasado', 'Registrar marcos na Caderneta, orientar estímulos e encaminhar quando houver alerta ou provável atraso.'],
    ['Imunização', 'Esquema vacinal completo; Esquema vacinal atrasado', 'Conferir a caderneta, vacinar no mesmo dia quando possível e combinar a data das próximas doses.'],
    ['Segurança', 'Risco de lesão; Risco de queda', 'Identificar riscos da casa com a família e definir uma adaptação prioritária.'],
    ['Família e cuidado', 'Disposição para paternidade ou maternidade melhorada; Tensão do papel de cuidador', 'Reconhecer o que a família já faz bem, fortalecer a rede de apoio e acolher sobrecarga.']
  ];

  /* ------------------------------------------------------------------ */
  /* 2. Imunização: calendário 2026                                      */
  /* ------------------------------------------------------------------ */
  const imun = document.querySelector('#view-imunizacao .module-wrapper');
  if (imun) {
    const grades = imun.querySelectorAll(':scope > .module-grid');
    if (grades[0]) {
      grades[0].outerHTML = `<section class="module-panel vacina-calendario" aria-labelledby="calendarioTitulo">
        <h2 id="calendarioTitulo">Calendário de rotina da criança — 2026</h2>
        <p>Doses previstas pelo Programa Nacional de Imunizações. Situações especiais, atrasos e intervalos mínimos seguem o calendário técnico.</p>
        <ol class="vacina-linha">${VACINAS.map(([, idade, itens]) => `<li><h3>${esc(idade)}</h3><ul>${itens.map(([v, d]) => `<li><strong>${esc(v)}</strong><span>${esc(d)}</span></li>`).join('')}</ul></li>`).join('')}</ol>
        <div class="notice">Influenza: primovacinação com 2 doses (intervalo de 30 dias) e depois 1 dose por ano, conforme a campanha. COVID-19: o número de doses depende do imunizante disponível. Febre amarela e tríplice viral não devem ser feitas no mesmo dia em menores de 2 anos.</div>
        <p class="source-note">Fonte: ${FONTES_VACINA}. O 2º reforço da VIP aos 4 anos vale a partir de 03/08/2026 (Nota Técnica nº 64/2026). Confira sempre o calendário vigente antes de orientar.</p>
      </section>`;
    }
    imun.querySelectorAll('.module-grid').forEach(g => g.removeAttribute('style'));
    imun.querySelector('.module-header-text p')?.replaceChildren('Proteção por meio da vacinação — Calendário Nacional de Vacinação 2026');
  }

  /* ------------------------------------------------------------------ */
  /* 3. Cuidados neonatais: triagens e vacinas ao nascer                 */
  /* ------------------------------------------------------------------ */
  const neo = document.querySelector('#view-neonatais .module-wrapper');
  if (neo) {
    neo.querySelectorAll('.module-grid').forEach(g => g.removeAttribute('style'));
    const fonte = neo.querySelector('.source-note');
    const bloco = `<section class="module-panel" aria-labelledby="triagemTitulo">
      <h2 id="triagemTitulo">Triagem neonatal: testes e prazos</h2>
      <p>Na primeira consulta, confira na Caderneta da Criança se cada teste foi feito e se o resultado foi entregue. Teste pendente ou alterado deve ser encaminhado sem esperar a próxima consulta.</p>
      <div class="triagem-grid">${TRIAGENS.map(([t, o, q]) => `<article class="triagem-card"><h3>${t}</h3><p>${o}</p><p class="prazo"><span>Quando:</span> ${q}</p></article>`).join('')}</div>
    </section>
    <section class="module-panel" aria-labelledby="vacinaNeoTitulo">
      <h2 id="vacinaNeoTitulo">Vacinas ao nascer</h2>
      ${lista(['<strong>BCG</strong> — dose única, ainda na maternidade ou na primeira ida à UBS.', '<strong>Hepatite B</strong> — dose ao nascer. Filhos de mãe com HBsAg reagente recebem também imunoglobulina.'])}
      <button type="button" class="btn btn-cancel open-view-extra" data-ir="view-imunizacao">Ver calendário completo</button>
    </section>`;
    if (fonte) fonte.insertAdjacentHTML('beforebegin', bloco); else neo.insertAdjacentHTML('beforeend', bloco);
    if (fonte) fonte.insertAdjacentHTML('beforeend', ` Triagem neonatal: ${link('https://portaldeboaspraticas.iff.fiocruz.br/atencao-crianca/principais-questoes-sobre-o-papel-da-aps-no-acompanhamento-dos-testes-neonatais', 'Fiocruz · Papel da APS nos testes neonatais')}.`);
  }

  /* ------------------------------------------------------------------ */
  /* 4. Nova tela: Promoção da Saúde (Nola Pender) e Processo de Enfermagem */
  /* ------------------------------------------------------------------ */
  const main = document.querySelector('.main-content');
  const promocao = `<section id="view-promocao" class="page-view inner-view">
    <button class="btn-voltar open-view" data-target="view-dashboard">← Início</button>
    <header class="module-header-text"><h1 tabindex="-1">Promoção da Saúde e Processo de Enfermagem</h1><p>Fundamentação teórica do portal: Modelo de Promoção da Saúde de Nola Pender, Processo de Enfermagem e linguagens padronizadas (CIPE® e NANDA-I).</p></header>
    <div class="notice success">O portal usa o Modelo de Promoção da Saúde de Nola Pender para orientar a consulta: em vez de apenas prescrever cuidados, o profissional busca entender o que a família pensa, sente e consegue fazer, e combina com ela um plano de ação possível.</div>

    <section class="module-panel" aria-labelledby="penderTitulo">
      <h2 id="penderTitulo">Modelo de Promoção da Saúde (Nola Pender)</h2>
      <ol class="pender-fluxo">
        <li><h3>1. Características e experiências individuais</h3>${lista(['Comportamento anterior: o que a família já fez antes (ex.: amamentou outro filho).', 'Fatores pessoais: biológicos, psicológicos e socioculturais (idade, escolaridade, trabalho, cultura).'])}</li>
        <li><h3>2. Sentimentos e conhecimentos sobre o comportamento</h3>${lista(['Benefícios percebidos e barreiras percebidas.', 'Autoeficácia: quanto a família se sente capaz de agir.', 'Sentimentos ligados à atividade.', 'Influências interpessoais (família, amigos, profissionais) e situacionais (ambiente, acesso ao serviço).'])}</li>
        <li><h3>3. Resultado do comportamento</h3>${lista(['Compromisso com um plano de ação.', 'Demandas e preferências imediatas que competem com o plano.', 'Comportamento de promoção da saúde adotado.'])}</li>
      </ol>
    </section>

    <section class="module-panel" aria-labelledby="penderPraticaTitulo">
      <h2 id="penderPraticaTitulo">Como aplicar na consulta de puericultura</h2>
      <ol class="flow-list">
        <li>Escolha com a família <strong>um comportamento de saúde</strong> para a fase da criança. Cada roteiro em ${'<button type="button" class="link-inline open-view-extra" data-ir="view-consultas">Consultas de Rotina</button>'} traz uma sugestão.</li>
        <li>Pergunte sobre <strong>experiências anteriores</strong> e sobre o que a família sabe e pensa do assunto.</li>
        <li>Explore <strong>benefícios e barreiras</strong> com perguntas abertas, sem julgamento.</li>
        <li>Avalie a <strong>autoeficácia</strong>: "De 0 a 10, quanto vocês se sentem capazes de fazer isso?". Notas baixas indicam necessidade de apoio prático.</li>
        <li>Identifique quem ajuda ou dificulta (<strong>influências interpessoais e situacionais</strong>) e acione a rede de apoio.</li>
        <li>Combine um <strong>plano de ação</strong> simples, com prazo, registre na consulta e retome no retorno.</li>
      </ol>
    </section>

    <section class="module-panel" aria-labelledby="peTitulo">
      <h2 id="peTitulo">Processo de Enfermagem (Resolução COFEN nº 736/2024)</h2>
      <div class="pe-grid">
        <article><h3>Avaliação de Enfermagem</h3><p>Anamnese, exame físico, antropometria, marcos do desenvolvimento, vacinas e contexto familiar, incluindo os fatores do modelo de Pender.</p></article>
        <article><h3>Diagnóstico de Enfermagem</h3><p>Julgamento clínico com linguagem padronizada (CIPE® ou NANDA-I), incluindo diagnósticos de promoção da saúde.</p></article>
        <article><h3>Planejamento de Enfermagem</h3><p>Resultados esperados e intervenções definidos com a família, a partir do plano de ação combinado.</p></article>
        <article><h3>Implementação de Enfermagem</h3><p>Orientações, demonstrações, vacinação, encaminhamentos e articulação com a rede.</p></article>
        <article><h3>Evolução de Enfermagem</h3><p>Reavaliação no retorno: o comportamento foi adotado? O que mudou? Ajustar o plano.</p></article>
      </div>
    </section>

    <section class="module-panel" aria-labelledby="dxTitulo">
      <h2 id="dxTitulo">Exemplos de diagnósticos de enfermagem (CIPE® e NANDA-I)</h2>
      <p>Exemplos de enunciados para situações frequentes na puericultura. O diagnóstico depende da avaliação de cada criança e família.</p>
      <div class="tabela-rolagem" tabindex="0" role="region" aria-label="Tabela de exemplos de diagnósticos"><table class="dx-tabela"><thead><tr><th scope="col">Situação</th><th scope="col">Exemplos de enunciados</th><th scope="col">Intervenções de promoção da saúde</th></tr></thead><tbody>${DIAGNOSTICOS.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div>
      <p class="storage-note">Os rótulos mudam entre edições. Confira o enunciado e a definição na edição vigente da NANDA-I (2024–2026) e na CIPE® (hoje distribuída pelo SNOMED International; a versão 2019 está no ${link('https://www.icn.ch/icnp-browser', 'navegador do ICN')}) antes de registrar.</p>
    </section>

    <p class="source-note">Referências: Pender NJ, Murdaugh CL, Parsons MA. <em>Health Promotion in Nursing Practice</em>. 8. ed. Pearson; ${link('https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/', 'Resolução COFEN nº 736/2024')}; Herdman TH, Kamitsuru S, Lopes CT. <em>Diagnósticos de enfermagem da NANDA-I: definições e classificação 2024–2026</em>. Artmed; Conselho Internacional de Enfermeiros. Classificação Internacional para a Prática de Enfermagem (CIPE®).</p>
  </section>`;
  main.insertAdjacentHTML('beforeend', promocao);

  /* ------------------------------------------------------------------ */
  /* 5. Consultas: vacinas da fase e roteiro de Pender em cada período   */
  /* ------------------------------------------------------------------ */
  const vacinasDaFase = i => {
    const inicio = IDADES_CONSULTA[i];
    const fim = IDADES_CONSULTA[i + 1] ?? Infinity;
    return VACINAS.filter(([m]) => m >= inicio && m < fim || (fim === Infinity && m >= inicio));
  };
  document.querySelectorAll('[data-periodo]').forEach(el => el.addEventListener('click', () => {
    const i = Number(el.dataset.periodo);
    const painel = $('detalheConsulta');
    if (!painel || !dados.consultas[i]) return;
    const fases = vacinasDaFase(i);
    const vacinas = fases.length
      ? `<ul class="vacina-mini">${fases.map(([, idade, itens]) => `<li><strong>${esc(idade)}:</strong> ${itens.map(([v, d]) => `${esc(v)} (${esc(d)})`).join('; ')}</li>`).join('')}</ul>`
      : '<p>Nenhuma vacina de rotina prevista até a próxima consulta. Confira se há doses atrasadas.</p>';
    const [comportamento, pergunta, barreira] = PROMOCAO[i];
    painel.querySelector('.storage-note')?.remove();
    painel.insertAdjacentHTML('beforeend', `<div class="consulta-extra">
      <section><h3>Vacinas até a próxima consulta</h3>${vacinas}<button type="button" class="link-inline open-view-extra" data-ir="view-imunizacao">Ver calendário completo</button></section>
      <section class="pender-box"><h3>Promoção da saúde (Nola Pender)</h3>
        <p><strong>Comportamento a promover:</strong> ${esc(comportamento)}</p>
        <dl>
          <dt>Benefícios percebidos</dt><dd>${esc(pergunta)}</dd>
          <dt>Barreiras frequentes</dt><dd>${esc(barreira)}</dd>
          <dt>Autoeficácia</dt><dd>"De 0 a 10, quanto vocês se sentem capazes de fazer isso nas próximas semanas?"</dd>
          <dt>Plano de ação</dt><dd>Combinar uma meta simples, registrar na consulta e retomar no retorno.</dd>
        </dl>
        <button type="button" class="link-inline open-view-extra" data-ir="view-promocao">Ver modelo e diagnósticos de enfermagem</button>
      </section>
    </div><p class="storage-note">Registre os achados na Caderneta da Criança.</p>`);
  }));

  /* ------------------------------------------------------------------ */
  /* 6. Início: propósito claro, entrada por perfil e por idade          */
  /* ------------------------------------------------------------------ */
  const dash = $('view-dashboard');
  const topo = dash?.querySelector('.header-title-box');
  if (topo) {
    topo.innerHTML = `<h1>Puericultura de 0 a 3 anos</h1><p>Apoio à consulta de puericultura na Atenção Primária, da primeira semana aos 3 anos, para profissionais, educadores e famílias.</p>`;
    dash.querySelector('.top-stats-bar').insertAdjacentHTML('afterend', `<section class="inicio-rapido" aria-labelledby="inicioIdadeTitulo">
      <h2 id="inicioIdadeTitulo">Qual a idade da criança?</h2>
      <p>Abra o roteiro da consulta com exame, desenvolvimento, orientações, vacinas e promoção da saúde.</p>
      <div class="idade-chips">${dados.consultas.map(([label], i) => `<button type="button" class="idade-chip" data-abrir-periodo="${i}">${esc(label)}</button>`).join('')}</div>
    </section>
    <section class="perfis" aria-label="Atalhos por perfil">
      <article class="perfil-card"><h3>Sou profissional de saúde</h3><ul>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-consultas">Roteiros de consulta por idade</button></li>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-imunizacao">Calendário de vacinação 2026</button></li>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-promocao">Nola Pender e diagnósticos de enfermagem</button></li></ul></article>
      <article class="perfil-card"><h3>Sou educador(a) de creche</h3><ul>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-crescimento">Marcos do desenvolvimento</button></li>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-educacao">Educação familiar</button></li>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-login">Entrar para preencher o formulário</button></li></ul></article>
      <article class="perfil-card"><h3>Sou mãe, pai ou cuidador(a)</h3><ul>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-amamentacao">Guia de amamentação</button></li>
        <li><button type="button" class="link-inline open-view-extra" data-ir="view-neonatais">Primeiros dias do bebê e testes</button></li>
        <li><button type="button" class="link-inline" id="atalhoPostos">Encontrar uma unidade de saúde</button></li></ul></article>
    </section>`);
    const secao = dash.querySelector('.modules-section-header');
    if (secao) secao.innerHTML = '<h2>Todos os módulos</h2><p>Conteúdos revisados após validação por juízes especialistas.</p>';
    dash.querySelector('.puericultura-grid')?.insertAdjacentHTML('beforeend', `<div class="puericultura-item open-view-extra modulo-teoria" data-ir="view-promocao" role="button" tabindex="0"><div class="puericultura-item-img"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="22" r="10"/><path d="M14 54c2-11 9-17 18-17s16 6 18 17"/><path d="M44 12l8-4M48 22h8M44 32l8 4"/></svg></div><div class="puericultura-item-info"><h3>Promoção da Saúde</h3><p>Nola Pender, Processo de Enfermagem e CIPE/NANDA-I</p></div></div>`);
    dash.insertAdjacentHTML('beforeend', '<footer class="rodape-validacao">Conteúdo revisado em novembro de 2026 a partir da validação por 15 juízes especialistas. As orientações apoiam, mas não substituem, a avaliação profissional e os protocolos do serviço.</footer>');
  }

  // Módulos do início também acessíveis por teclado.
  document.querySelectorAll('.puericultura-item:not(.open-view)').forEach(item => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); item.click(); } });
  });

  /* ------------------------------------------------------------------ */
  /* 7. Navegação consistente                                            */
  /* ------------------------------------------------------------------ */
  const menu = document.querySelector('.nav-menu');
  const itens = [
    ['view-consultas', 'Consultas por idade'],
    ['view-imunizacao', 'Imunização'],
    ['view-educacao', 'Educação Familiar'],
    ['view-promocao', 'Promoção da Saúde']
  ];
  itens.forEach(([alvo, texto]) => {
    if (menu.querySelector(`[data-target="${alvo}"]`)) return;
    menu.insertAdjacentHTML('beforeend', `<li><a href="#${alvo}" class="nav-link nav-extra" data-ir="${alvo}" data-target="${alvo}"><span class="nav-dot" aria-hidden="true"></span>${texto}</a></li>`);
  });
  // Ordem segue a jornada da criança: nascimento → consultas → vacinas → crescimento → família.
  const ordem = ['view-dashboard', 'view-neonatais', 'view-consultas', 'view-imunizacao', 'view-crescimento', 'view-amamentacao', 'view-educacao', 'view-promocao'];
  ordem.forEach(alvo => {
    const li = menu.querySelector(`[data-target="${alvo}"], [data-ir="${alvo}"]`)?.closest('li');
    if (li) menu.append(li);
  });
  // Itens restritos por perfil (nova consulta, caderneta etc.) ficam após os módulos públicos.
  [...menu.children].filter(li => !ordem.some(a => li.querySelector(`[data-target="${a}"], [data-ir="${a}"]`))).forEach(li => menu.append(li));

  document.querySelectorAll('.btn-voltar').forEach(b => { b.textContent = '← Início'; });

  // Atalhos que reutilizam a navegação existente.
  document.addEventListener('click', ev => {
    const alvo = ev.target.closest('[data-ir]');
    if (alvo) {
      ev.preventDefault();
      const destino = alvo.dataset.ir;
      irPara(destino);
      return;
    }
    const chip = ev.target.closest('[data-abrir-periodo]');
    if (chip) {
      irPara('view-consultas');
      document.querySelector(`[data-periodo="${chip.dataset.abrirPeriodo}"]`)?.click();
      $('detalheConsulta')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (ev.target.closest('#atalhoPostos')) $('btnSidebarPostos')?.click();
  });

})();
