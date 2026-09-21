const test = require('node:test');
const assert = require('node:assert/strict');
const notificacoes = require('../notificacoes.js');

test('relatório comum gera mensagem para a coordenação', () => {
  const link = notificacoes.criarLinkEmail({
    edCoordenacaoEmail: 'coordenacao@example.org',
    edNome: 'Criança de teste',
    edVacinacao: 'Sim'
  });
  assert.equal(link.destinatario, 'coordenacaoesf.urg@gmail.com');
  assert.equal(link.alerta, false);
  assert.match(link.href, /^mailto:/);
  assert.match(decodeURIComponent(link.href), /Relatório do educador/);
});

test('unidade de saúde consta no relatório enviado', () => {
  const mensagem = notificacoes.criarMensagem({
    edNome: 'Criança de teste',
    edVacinacao: 'Sim',
    edUnidadeSaude: 'ESF 21 – CENTRO'
  });
  assert.match(mensagem.corpo, /ESF\/UBS de referência: ESF 21 – CENTRO/);
});

test('vacinação pendente destaca o alerta na mensagem', () => {
  const mensagem = notificacoes.criarMensagem({ edNome: 'Criança de teste', edVacinacao: 'Faltam vacinas para a idade' });
  assert.equal(mensagem.alerta, true);
  assert.match(mensagem.assunto, /Alerta de vacinação/);
  assert.match(mensagem.corpo, /ATENÇÃO/);
});

test('destinatário antigo ou adulterado não redireciona dados da criança', () => {
  const link = notificacoes.criarLinkEmail({ edCoordenacaoEmail: 'terceiro@example.org' });
  assert.equal(link.destinatario, notificacoes.EMAIL_COORDENACAO);
  assert.doesNotMatch(decodeURIComponent(link.href), /terceiro@example/);
});
