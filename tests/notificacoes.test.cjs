const test = require('node:test');
const assert = require('node:assert/strict');
const notificacoes = require('../notificacoes.js');

test('relatório comum gera mensagem para a coordenação', () => {
  const link = notificacoes.criarLinkEmail({
    edCoordenacaoEmail: 'coordenacao@example.org',
    edNome: 'Criança de teste',
    edVacinacao: 'Sim'
  });
  assert.equal(link.destinatario, 'coordenacao@example.org');
  assert.equal(link.alerta, false);
  assert.match(link.href, /^mailto:/);
  assert.match(decodeURIComponent(link.href), /Relatório do educador/);
});

test('vacinação pendente destaca o alerta na mensagem', () => {
  const mensagem = notificacoes.criarMensagem({ edNome: 'Criança de teste', edVacinacao: 'Faltam vacinas para a idade' });
  assert.equal(mensagem.alerta, true);
  assert.match(mensagem.assunto, /Alerta de vacinação/);
  assert.match(mensagem.corpo, /ATENÇÃO/);
});

test('destinatário inválido não gera link', () => {
  assert.throws(() => notificacoes.criarLinkEmail({ edCoordenacaoEmail: 'invalido' }), /e-mail válido/);
});
