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
    ['Teste do pezinho', 'Triagem biológica de doenças metabólicas, genéticas e infecciosas.', 'Após completar 48 horas de vida e até o 5º dia, preferencialmente entre o 3º e o 5º dia.'],
    ['Teste do coraçãozinho', 'Oximetria de pulso para cardiopatias congênitas críticas.', 'Entre 24 e 48 horas de vida, antes da alta hospitalar.'],
    ['Teste da orelhinha', 'Triagem auditiva neonatal.', 'Preferencialmente na maternidade, antes da alta; quando não realizado, assegurar a triagem no primeiro mês.'],
    ['Teste do olhinho', 'Teste do reflexo vermelho, para alterações oculares congênitas.', 'Na maternidade, antes da alta, com acompanhamento na puericultura.'],
    ['Teste da linguinha', 'Avaliação do frênulo lingual (Lei nº 13.002/2014).', 'Na maternidade, antes da alta, por profissional capacitado.']
  ];

  // Calendário mínimo de consultas de puericultura (Ministério da Saúde).
  const ACOMPANHAMENTO = [
    ['Recém-nascido', 'Nascimento até 27 dias completos', 'Primeira consulta na <strong>primeira semana de vida</strong>, além dos retornos necessários.'],
    ['Primeiro semestre', '1 a 5 meses', 'Consultas aos <strong>1, 2 e 4 meses</strong>.'],
    ['Segundo semestre', '6 a 11 meses', 'Consultas aos <strong>6 e 9 meses</strong>.'],
    ['Segundo ano de vida', '12 a 23 meses', 'Consultas aos <strong>12 e 18 meses</strong>.'],
    ['A partir dos 2 anos', '24 meses', 'Consulta aos <strong>24 meses</strong>, seguida de acompanhamento, no mínimo, anual.']
  ];

  // Modelo de Promoção da Saúde (Nola Pender): o modelo não define comportamentos fixos por idade.
  // Aplicação proposta pela equipe por faixa etária (revisão clínica de nov/2026).
  const FAIXAS_PENDER = [
    ['Recém-nascido e lactente', 'Trabalhar a confiança e as dificuldades dos cuidadores para realizar os cuidados e acompanhar a criança.'],
    ['1–2 anos', 'Pactuar pequenas metas com os cuidadores e favorecer a participação da criança nas rotinas.']
  ];
  // Faixa de cada consulta (índice em FAIXAS_PENDER), na ordem de dados.consultas.
  const FAIXA_CONSULTA = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
  // Exemplos de temas para pactuar em cada consulta (a comparar com a proposta por faixa).
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

  // Situações frequentes para o julgamento diagnóstico. Os rótulos não são listados:
  // devem ser registrados com rótulo exato, código e classificação de origem da edição consultada.
  const DIAGNOSTICOS = [
    ['Amamentação', 'Pega, posição, transferência de leite, dor mamilar, confiança da mãe e apoio da família.', 'Observar a mamada, corrigir pega e posição, apoiar a rede familiar e agendar retorno precoce.'],
    ['Crescimento e nutrição', 'Trajetória nas curvas de peso, comprimento e IMC; alimentação conforme a idade.', 'Interpretar as curvas com a família, orientar alimentação adequada à idade e reavaliar a trajetória.'],
    ['Desenvolvimento', 'Marcos da Caderneta da Criança, fatores de risco e preocupações da família.', 'Orientar estímulos, registrar marcos e encaminhar quando houver alerta ou provável atraso.'],
    ['Imunização', 'Doses registradas na caderneta, atrasos e motivos de atraso.', 'Vacinar no mesmo dia quando possível e combinar a data das próximas doses.'],
    ['Segurança', 'Riscos do domicílio, transporte e supervisão da criança.', 'Identificar riscos com a família e definir uma adaptação prioritária.'],
    ['Família e cuidado', 'Rede de apoio, sobrecarga do cuidador e vínculo com a criança.', 'Reconhecer o que a família já faz bem, fortalecer a rede de apoio e acolher sobrecarga.']
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
      <p class="storage-note">Esses prazos orientam a conferência na consulta. Considere situações especiais e o fluxo assistencial do seu município.</p>
    </section>
    <section class="module-panel" aria-labelledby="acompTitulo">
      <h2 id="acompTitulo">Acompanhamento da puericultura em todas as fases</h2>
      <p>Calendário mínimo de consultas do Ministério da Saúde.</p>
      <div class="tabela-rolagem" tabindex="0" role="region" aria-label="Calendário mínimo de consultas"><table class="dx-tabela acomp-tabela"><thead><tr><th scope="col">Fase do acompanhamento</th><th scope="col">Idade ou momento</th><th scope="col">Consultas de rotina</th></tr></thead><tbody>${ACOMPANHAMENTO.map(([f, i, c]) => `<tr><th scope="row">${f}</th><td data-label="Idade ou momento">${i}</td><td data-label="Consultas de rotina">${c}</td></tr>`).join('')}</tbody></table></div>
      <button type="button" class="btn btn-cancel open-view-extra" data-ir="view-consultas">Abrir roteiros por idade</button>
    </section>
    <section class="module-panel" aria-labelledby="vacinaNeoTitulo">
      <h2 id="vacinaNeoTitulo">Vacinas ao nascer</h2>
      ${lista(['<strong>BCG</strong> — dose única, ainda na maternidade ou na primeira ida à UBS.', '<strong>Hepatite B</strong> — dose ao nascer. Filhos de mãe com HBsAg reagente recebem também imunoglobulina.'])}
      <button type="button" class="btn btn-cancel open-view-extra" data-ir="view-imunizacao">Ver calendário completo</button>
    </section>`;
    if (fonte) fonte.insertAdjacentHTML('beforebegin', bloco); else neo.insertAdjacentHTML('beforeend', bloco);
    if (fonte) fonte.insertAdjacentHTML('beforeend', ` Triagem neonatal e acompanhamento: ${link('https://www.gov.br/saude/pt-br/composicao/saes/triagem-neonatal/perguntas-frequentes-faq/quando-deve-ser-realizada-a-coleta-do-teste-do-pezinho', 'Ministério da Saúde · Quando deve ser realizada a coleta do teste do pezinho?')} · ${link('https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/cuidado-neonatal/cuidado-neonatal', 'Ministério da Saúde · Cuidado neonatal')} · ${link('https://linhasdecuidado.saude.gov.br/portal/puericultura/unidade-hospitalar/planejamento-terapeutico/', 'Ministério da Saúde · Linhas de cuidado: puericultura')}.`);
  }

  /* ------------------------------------------------------------------ */
  /* 4. Nova tela: Promoção da Saúde (Nola Pender) e Processo de Enfermagem */
  /* ------------------------------------------------------------------ */
  const main = document.querySelector('.main-content');
  const promocao = `<section id="view-promocao" class="page-view inner-view">
    <button type="button" class="btn-voltar open-view-extra" data-ir="view-dashboard">← Início</button>
    <header class="module-header-text"><h1 tabindex="-1">Promoção da Saúde e Processo de Enfermagem</h1><p>Fundamentação teórica do portal: Modelo de Promoção da Saúde de Nola Pender, Processo de Enfermagem e linguagens padronizadas (CIPE® e NANDA-I).</p></header>
    <img class="promocao-banner" src="assets/modulos/promocao-saude.jpg" alt="Enfermeira conversa com avó, mãe e criança sobre promoção da saúde">
    <div class="notice success">O portal usa o Modelo de Promoção da Saúde de Nola Pender para orientar a consulta: em vez de apenas prescrever cuidados, o profissional busca entender o que a família pensa, sente e consegue fazer, e combina com ela um plano de ação possível.</div>

    <section class="module-panel" aria-labelledby="penderTitulo">
      <h2 id="penderTitulo">Modelo de Promoção da Saúde (Nola Pender)</h2>
      <ol class="pender-fluxo">
        <li><h3>1. Características e experiências individuais</h3>${lista(['Comportamento anterior: o que a família já fez antes (ex.: amamentou outro filho).', 'Fatores pessoais: biológicos, psicológicos e socioculturais (idade, escolaridade, trabalho, cultura).'])}</li>
        <li><h3>2. Sentimentos e conhecimentos sobre o comportamento</h3>${lista(['Benefícios percebidos e barreiras percebidas.', 'Autoeficácia: quanto a família se sente capaz de agir.', 'Sentimentos ligados à atividade.', 'Influências interpessoais (família, amigos, profissionais) e situacionais (ambiente, acesso ao serviço).'])}</li>
        <li><h3>3. Resultado do comportamento</h3>${lista(['Compromisso com um plano de ação.', 'Demandas e preferências imediatas que competem com o plano.', 'Comportamento de promoção da saúde adotado.'])}</li>
      </ol>
    </section>

    <section class="module-panel" aria-labelledby="penderFaixaTitulo">
      <h2 id="penderFaixaTitulo">Aplicação por faixa etária</h2>
      <p>O modelo de Pender não estabelece uma lista fixa de comportamentos para cada idade. Ele orienta a avaliação de benefícios percebidos, barreiras, autoeficácia, apoio familiar e compromisso com um plano de ação. Esta é a proposta de aplicação adotada no portal:</p>
      <div class="tabela-rolagem" tabindex="0" role="region" aria-label="Aplicação do modelo por faixa etária"><table class="dx-tabela faixa-tabela"><thead><tr><th scope="col">Faixa etária</th><th scope="col">Aplicação proposta</th></tr></thead><tbody>${FAIXAS_PENDER.map(([f, t]) => `<tr><th scope="row">${f}</th><td data-label="Aplicação proposta">${t}</td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="module-panel" aria-labelledby="penderPraticaTitulo">
      <h2 id="penderPraticaTitulo">Como aplicar na consulta de puericultura</h2>
      <ol class="flow-list">
        <li>Escolha com a família <strong>um comportamento de saúde</strong> para a fase da criança. Cada roteiro em ${'<button type="button" class="link-inline open-view-extra" data-ir="view-consultas">Consultas de Rotina</button>'} traz um exemplo de tema.</li>
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
      <h2 id="dxTitulo">Diagnósticos de enfermagem com CIPE® e NANDA-I</h2>
      <p>O diagnóstico depende da avaliação de cada criança e família. Ao registrar, use o <strong>rótulo exato</strong>, o <strong>código</strong> e a <strong>classificação de origem</strong> da edição consultada:</p>
      ${lista(['<strong>NANDA-I:</strong> edição 2024–2026 (13ª edição).', '<strong>CIPE®:</strong> informe a versão consultada. O navegador público do Conselho Internacional de Enfermeiros contém termos até 2019; o conteúdo atual é mantido no âmbito do SNOMED CT, por isso o navegador não confirma a terminologia vigente.'])}
      <p>A tabela indica o que avaliar em situações frequentes da puericultura para chegar ao diagnóstico e quais intervenções de promoção da saúde considerar.</p>
      <div class="tabela-rolagem" tabindex="0" role="region" aria-label="Tabela de situações para o diagnóstico de enfermagem"><table class="dx-tabela"><thead><tr><th scope="col">Situação</th><th scope="col">O que avaliar</th><th scope="col">Intervenções de promoção da saúde</th></tr></thead><tbody>${DIAGNOSTICOS.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td data-label="O que avaliar">${b}</td><td data-label="Intervenções de promoção da saúde">${c}</td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="module-panel referencias" aria-labelledby="refTitulo">
      <h2 id="refTitulo">Referências</h2>
      <ul>
        <li>CONSELHO FEDERAL DE ENFERMAGEM. ${link('https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/', 'Resolução Cofen nº 736, de 17 de janeiro de 2024')}. Dispõe sobre a implementação do Processo de Enfermagem.</li>
        <li>HERDMAN, T. Heather; KAMITSURU, Shigemi; LOPES, Camila Takáo (org.). <strong>Diagnósticos de enfermagem da NANDA-I: definições e classificação 2024–2026</strong>. 13. ed. Porto Alegre: Artmed, 2024.</li>
        <li>INTERNATIONAL COUNCIL OF NURSES. <strong>ICNP browser</strong>. Geneva: ICN, [s. d.]. Disponível em: ${link('https://www.icn.ch/icnp-browser', 'https://www.icn.ch/icnp-browser')}. Acesso em: 16 nov. 2026.</li>
        <li>PENDER, Nola J. <strong>Health Promotion Model Manual</strong>. Ann Arbor: University of Michigan, 2011. Disponível em: ${link('https://deepblue.lib.umich.edu', 'deepblue.lib.umich.edu')}.</li>
        <li>PENDER, Nola J.; MURDAUGH, Carolyn L.; PARSONS, Mary Ann. <strong>Health promotion in nursing practice</strong>. 8. ed. New York: Pearson, 2019.</li>
      </ul>
    </section>
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
    const [comportamento] = PROMOCAO[i];
    const [faixaBase, foco] = FAIXAS_PENDER[FAIXA_CONSULTA[i]];
    // A proposta da equipe cobre até 2 anos; aos 3 anos aplica-se a mesma orientação.
    const faixa = IDADES_CONSULTA[i] > 24 ? `${faixaBase} (orientação mantida após os 2 anos)` : faixaBase;
    painel.querySelector('.storage-note')?.remove();
    painel.insertAdjacentHTML('beforeend', `<div class="consulta-extra">
      <section><h3>Vacinas até a próxima consulta</h3>${vacinas}<button type="button" class="link-inline open-view-extra" data-ir="view-imunizacao">Ver calendário completo</button></section>
      <section class="pender-box"><h3>Promoção da saúde (Nola Pender)</h3>
        <p><strong>${esc(faixa)}:</strong> ${esc(foco)}</p>
        <p><strong>Exemplo de tema nesta consulta:</strong> ${esc(comportamento)}</p>
        <dl>
          <dt>Benefícios percebidos</dt><dd>O que a família espera ganhar com esse cuidado?</dd>
          <dt>Barreiras</dt><dd>O que dificulta fazer isso no dia a dia?</dd>
          <dt>Autoeficácia</dt><dd>"De 0 a 10, quanto vocês se sentem capazes de fazer isso nas próximas semanas?"</dd>
          <dt>Apoio familiar</dt><dd>Quem pode ajudar em casa?</dd>
          <dt>Plano de ação</dt><dd>Combinar uma meta simples, registrar na consulta e retomar no retorno.</dd>
        </dl>
        <button type="button" class="link-inline open-view-extra" data-ir="view-promocao">Ver modelo e Processo de Enfermagem</button>
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
    </section>`);
    const secao = dash.querySelector('.modules-section-header');
    if (secao) secao.innerHTML = '<h2>Módulos</h2><p>Cada módulo indica o público a que se destina.</p>';
    dash.querySelector('.puericultura-grid')?.insertAdjacentHTML('beforeend', `<div class="puericultura-item open-view-extra modulo-teoria" data-ir="view-promocao" role="button" tabindex="0"><div class="puericultura-item-img"><img src="assets/modulos/promocao-saude.jpg" alt="Enfermeira conversa com avó, mãe e criança sobre promoção da saúde" loading="lazy"></div><div class="puericultura-item-info"><h3>Promoção da Saúde</h3><p>Nola Pender, Processo de Enfermagem e CIPE/NANDA-I</p></div></div>`);
    const PUBLICO = {
      'view-neonatais': ['Profissional', 'Família'], 'view-crescimento': ['Profissional', 'Educador'],
      'view-imunizacao': ['Profissional', 'Família'], 'view-consultas': ['Profissional'],
      'view-amamentacao': ['Profissional', 'Família'], 'view-educacao': ['Educador', 'Família'],
      'view-promocao': ['Profissional']
    };
    dash.querySelectorAll('.puericultura-item').forEach(item => {
      const alvo = item.dataset.target || item.dataset.ir;
      const tags = PUBLICO[alvo];
      if (tags) item.querySelector('.puericultura-item-info').insertAdjacentHTML('beforeend', `<p class="publico-tags"><span class="sr-only">Para: </span>${tags.map(t => `<span class="publico-tag">${t}</span>`).join('')}</p>`);
    });
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
    ['view-consultas', 'Consultas por idade', 'consultas'],
    ['view-imunizacao', 'Imunização', 'imunizacao'],
    ['view-educacao', 'Educação Familiar', 'educacao'],
    ['view-promocao', 'Promoção da Saúde', 'promocao']
  ];
  itens.forEach(([alvo, texto, ic]) => {
    if (menu.querySelector(`[data-target="${alvo}"]`)) return;
    menu.insertAdjacentHTML('beforeend', `<li><a href="#${alvo}" class="nav-link nav-extra" data-ir="${alvo}" data-target="${alvo}">${texto}</a></li>`);
  });
  // Ícones ilustrados da equipe (pasta Mestrado Francisco/Icones), sem o rótulo de texto.
  const ICONE_DA_TELA = {
    'view-dashboard': 'visao-geral', 'view-neonatais': 'neonatais', 'view-consultas': 'consultas',
    'view-imunizacao': 'imunizacao', 'view-crescimento': 'crescimento', 'view-amamentacao': 'amamentacao',
    'view-educacao': 'educacao', 'view-promocao': 'promocao', 'view-nova-consulta': 'nova-consulta',
    'view-caderneta': 'caderneta', 'view-documentos': 'documentos', 'view-receituario': 'receituario',
    'view-noticias': 'noticias', 'view-educador': 'educador', 'view-login': 'conta'
  };
  const imgIcone = (nome, cls = 'nav-ico') => `<img class="${cls}" src="assets/icones/${nome}.png" alt="" aria-hidden="true" width="28" height="28">`;
  const trocarIcone = (el, nome) => {
    if (!el || el.querySelector('img.nav-ico')) return;
    el.querySelectorAll(':scope > svg, :scope > span[aria-hidden="true"]').forEach(n => n.remove());
    el.insertAdjacentHTML('afterbegin', imgIcone(nome));
  };
  const aplicarIcones = () => {
    document.querySelectorAll('.nav-menu .nav-link[data-target]').forEach(a => {
      const nome = ICONE_DA_TELA[a.dataset.target];
      if (nome) trocarIcone(a, nome);
    });
    trocarIcone($('btnSidebarPostos'), 'postos');
    trocarIcone($('btnSair'), 'sair');
  };
  // Cartões da tela Minha conta
  document.querySelectorAll('#view-conta .module-card[data-target]').forEach(card => {
    const nome = ICONE_DA_TELA[card.dataset.target];
    if (nome && !card.querySelector('img')) card.insertAdjacentHTML('afterbegin', imgIcone(nome, 'card-ico'));
  });
  aplicarIcones();
  // login.js reescreve o texto de Login/Minha conta a cada mudança de conta.
  window.addEventListener('conta-alterada', aplicarIcones);
  const acessoConta = $('btnAcessoLogin');
  if (acessoConta) new MutationObserver(() => trocarIcone(acessoConta, 'conta')).observe(acessoConta, { childList: true });

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
  });

})();
