(function (root) {
  'use strict';

  const pendenciaVacinal = valor => ['Não', 'Faltam vacinas para a idade'].includes(valor);
  const linha = (rotulo, valor) => `${rotulo}: ${Array.isArray(valor) ? valor.join('; ') : (valor || 'Não informado')}`;

  function criarMensagem(registro) {
    const alerta = pendenciaVacinal(registro.edVacinacao);
    const assunto = alerta
      ? `Alerta de vacinação — ${registro.edNome || 'criança acompanhada'}`
      : `Relatório do educador — ${registro.edNome || 'criança acompanhada'}`;
    const corpo = [
      'Relatório de acompanhamento — Mundo da Puericultura',
      '',
      linha('Criança', registro.edNome),
      linha('Data de nascimento', registro.edNascimento),
      linha('Turma', registro.edTurma),
      linha('Escola/creche', registro.edEscola),
      linha('Educador responsável', registro.edResponsavel),
      linha('Data do preenchimento', registro.edData),
      '',
      linha('Situação da vacinação', registro.edVacinacao),
      linha('Vacinas pendentes informadas', registro.edVacinasFaltantes),
      linha('Consultas de puericultura', registro.edConsultas),
      linha('Indicadores observados', registro.edDesenvolvimento),
      linha('Sinais gerais de alerta', registro.edSinais),
      linha('Observações', registro.edObservacoes),
      linha('Próximos passos', registro.edEncaminhamentos)
    ];
    if (alerta) corpo.splice(2, 0, 'ATENÇÃO: o formulário registra vacinação pendente.', '');
    return { assunto, corpo: corpo.join('\n'), alerta };
  }

  function criarLinkEmail(registro) {
    const destinatario = String(registro.edCoordenacaoEmail || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinatario)) throw new Error('Informe um e-mail válido da coordenação.');
    const mensagem = criarMensagem(registro);
    return {
      ...mensagem,
      destinatario,
      href: `mailto:${encodeURIComponent(destinatario)}?subject=${encodeURIComponent(mensagem.assunto)}&body=${encodeURIComponent(mensagem.corpo)}`
    };
  }

  const api = Object.freeze({ pendenciaVacinal, criarMensagem, criarLinkEmail });
  if (typeof module !== 'undefined') module.exports = api;
  else root.PuericulturaNotificacoes = api;
})(typeof window !== 'undefined' ? window : this);
