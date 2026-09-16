const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { criarHandler } = require('../api/notificar-educador');
const { criarMensagem } = require('../notificacoes');
const registro = { id: 'registro-1', edNome: 'Criança fictícia', edVacinacao: 'Não', edVacinasFaltantes: 'Vacina informada no teste' };
const assinatura = item => createHash('sha256').update(JSON.stringify(criarMensagem(item))).digest('hex');
const fields = item => Object.fromEntries(Object.entries(item).map(([key, value]) => [key, { stringValue: value }]));
async function executar({ perfil = 'educador', tokenOk = true, item = registro, body = { id: registro.id, assinatura: assinatura(registro) }, env = { RESEND_API_KEY: 'fake', EMAIL_FROM: 'Teste <teste@example.org>' }, method = 'POST', authorization = 'Bearer fake', envioOk = true } = {}) {
  const chamadas = [];
  const fetchImpl = async (url, options) => {
    chamadas.push({ url, options });
    const dados = url.includes('accounts:lookup') ? { users: [{ localId: 'educador-teste' }] }
      : url.includes('/perfis/') ? { fields: { perfil: { stringValue: perfil } } }
      : url.includes('/registros/') ? { fields: { itens: { arrayValue: { values: [{ mapValue: { fields: fields(item) } }] } } } }
      : envioOk ? { id: 'email-teste' } : { message: 'erro privado do provedor' };
    return { ok: url.includes('accounts:lookup') ? tokenOk : url.includes('api.resend.com') ? envioOk : true, json: async () => dados };
  };
  const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await criarHandler({ fetchImpl, env })({ method, headers: { authorization }, body }, res);
  return { ...res, chamadas };
}
test('envio lê somente o relatório da conta autenticada e usa destinatário fixo', async () => {
  const r = await executar();
  assert.equal(r.code, 200);
  assert.equal(r.data.aceito, true);
  assert.match(r.chamadas[2].url, /usuarios\/educador-teste\/registros\/educadores$/);
  assert.equal(r.chamadas[2].options.headers.Authorization, 'Bearer fake');
  const email = JSON.parse(r.chamadas[3].options.body);
  assert.deepEqual(email.to, ['coordenacaoesf.urg@gmail.com']);
  assert.match(email.subject, /Alerta de vacinação/);
});
test('requisições repetidas geram a mesma chave no provedor', async () => {
  const a = await executar(), b = await executar();
  assert.equal(a.chamadas[3].options.headers['Idempotency-Key'], b.chamadas[3].options.headers['Idempotency-Key']);
});
test('visitante, token inválido e enfermeiro não enviam e-mail', async () => {
  for (const options of [{ authorization: '' }, { tokenOk: false }, { perfil: 'enfermeiro' }]) {
    const r = await executar(options);
    assert.ok([401, 403].includes(r.code));
    assert.ok(!r.chamadas.some(c => c.url.includes('resend')));
  }
});
test('relatório de outra conta ou alterado após a revisão não é enviado', async () => {
  assert.equal((await executar({ item: { ...registro, id: 'outro' } })).code, 404);
  const r = await executar({ item: { ...registro, edObservacoes: 'alteração concorrente' } });
  assert.equal(r.code, 409);
  assert.ok(!r.chamadas.some(c => c.url.includes('resend')));
});
test('cliente não pode fornecer destinatário ou conteúdo arbitrário', async () => {
  const r = await executar({ body: { id: registro.id, assinatura: assinatura(registro), to: 'outro@example.org' } });
  assert.equal(r.code, 400);
  assert.equal(r.chamadas.length, 0);
});
test('sem configuração não há envio nem falsa confirmação', async () => {
  const r = await executar({ env: {} });
  assert.equal(r.code, 503);
  assert.equal(r.chamadas.length, 0);
  assert.deepEqual((await executar({ method: 'GET', env: {} })).data, { configurado: false });
});
test('falha do provedor mantém estado não confirmado e não expõe detalhes privados', async () => {
  const r = await executar({ envioOk: false });
  assert.equal(r.code, 502);
  assert.equal(r.data.aceito, undefined);
  assert.doesNotMatch(r.data.erro, /privado/);
});
