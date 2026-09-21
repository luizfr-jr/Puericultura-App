const test = require('node:test');
const assert = require('node:assert/strict');
const { avaliarObservacao } = require('../avaliacao-risco.js');

test('não interpreta um instrumento incompleto', () => {
  const resultado = avaliarObservacao(['Não', '', 'Não'], 3);
  assert.equal(resultado.estado, 'incompleta');
  assert.match(resultado.mensagem, /2 de 3/);
});

test('sinal presente orienta o fluxo sem criar uma escala de risco', () => {
  const resultado = avaliarObservacao(['Não', 'Sim', 'Não'], 3);
  assert.equal(resultado.estado, 'atencao');
  assert.equal(resultado.presentes, 1);
  assert.match(resultado.mensagem, /não mede o grau de risco/i);
});

test('item não observado impede descartar risco', () => {
  const resultado = avaliarObservacao(['Não', 'Não observado'], 2);
  assert.equal(resultado.estado, 'indeterminado');
  assert.match(resultado.mensagem, /não permite descartar risco/i);
});

test('todas as respostas negativas não excluem risco', () => {
  const resultado = avaliarObservacao(['Não', 'Não', 'Não'], 3);
  assert.equal(resultado.estado, 'sem-sinais-observados');
  assert.match(resultado.mensagem, /não exclui uma situação de risco/i);
});
