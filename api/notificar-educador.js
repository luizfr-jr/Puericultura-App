'use strict';
const { createHash } = require('node:crypto');
const { EMAIL_COORDENACAO, criarMensagem } = require('../notificacoes');
const PROJECT = 'puericultura-app';
const PUBLIC_KEY = 'AIzaSyA8buadckhZcvZHOuq4vuGfhWpTkJGqqAo';

function decodificar(valor) {
  if (valor.stringValue !== undefined) return valor.stringValue;
  if (valor.arrayValue) return (valor.arrayValue.values || []).map(decodificar);
  if (valor.mapValue) return Object.fromEntries(Object.entries(valor.mapValue.fields || {}).map(([k, v]) => [k, decodificar(v)]));
  return null;
}

// Usa o token do próprio educador. As regras do Firestore continuam aplicadas;
// não há conta administrativa, destinatário livre ou relatório recebido do navegador.
function criarHandler({ fetchImpl = fetch, env = process.env } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const configurado = Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
    if (req.method === 'GET') return res.status(200).json({ configurado });
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ erro: 'Método não permitido.' }); }
    if (!configurado) return res.status(503).json({ erro: 'O envio direto ainda não foi configurado. Use o aplicativo de e-mail.' });
    const bearer = req.headers.authorization;
    if (typeof bearer !== 'string' || !/^Bearer \S+$/.test(bearer)) return res.status(401).json({ erro: 'Entre novamente com sua conta de educador.' });
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({ erro: 'Pedido inválido.' }); }
    if (!body || Object.keys(body).some(k => !['id', 'assinatura'].includes(k)) || !/^[a-zA-Z0-9-]{1,80}$/.test(body.id || '') || !/^[a-f0-9]{64}$/.test(body.assinatura || '')) return res.status(400).json({ erro: 'Salve e revise o relatório antes de enviar.' });
    const request = (url, options = {}) => fetchImpl(url, { ...options, signal: AbortSignal.timeout(10000) });
    try {
      const login = await request(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${PUBLIC_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: bearer.slice(7) }) });
      if (!login.ok) return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' });
      const user = (await login.json()).users?.[0];
      if (!user?.localId || user.disabled) return res.status(401).json({ erro: 'Conta indisponível.' });
      const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
      const headers = { Authorization: bearer };
      const profile = await request(`${base}/perfis/${encodeURIComponent(user.localId)}`, { headers });
      if (!profile.ok || (await profile.json()).fields?.perfil?.stringValue !== 'educador') return res.status(403).json({ erro: 'Apenas educadores podem enviar este relatório.' });
      const response = await request(`${base}/usuarios/${encodeURIComponent(user.localId)}/registros/educadores`, { headers });
      if (!response.ok) return res.status(403).json({ erro: 'Não foi possível acessar seu relatório salvo.' });
      const registros = decodificar((await response.json()).fields?.itens || { arrayValue: {} });
      const registro = registros.find(item => item?.id === body.id);
      if (!registro) return res.status(404).json({ erro: 'Relatório não encontrado na sua conta.' });
      const mensagem = criarMensagem(registro);
      const assinatura = createHash('sha256').update(JSON.stringify(mensagem)).digest('hex');
      if (assinatura !== body.assinatura) return res.status(409).json({ erro: 'O relatório mudou. Salve e revise a mensagem novamente.' });
      if (mensagem.corpo.length > 40000) return res.status(400).json({ erro: 'O relatório excede o tamanho permitido para envio.' });
      const payload = { from: env.EMAIL_FROM, to: [EMAIL_COORDENACAO], subject: mensagem.assunto.replace(/[\r\n]/g, ' '), text: mensagem.corpo };
      const chave = createHash('sha256').update(JSON.stringify([user.localId, body.id, payload])).digest('hex');
      const envio = await request('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `educador/${chave}` }, body: JSON.stringify(payload) });
      const resultado = await envio.json();
      if (!envio.ok || !resultado.id) return res.status(502).json({ erro: 'O serviço não confirmou o envio. Tente novamente mais tarde.' });
      return res.status(200).json({ aceito: true, id: resultado.id });
    } catch {
      return res.status(502).json({ erro: 'Não foi possível confirmar o envio. Tente novamente; tentativas idênticas em 24 horas não duplicam a mensagem.' });
    }
  };
}

module.exports = criarHandler();
module.exports.criarHandler = criarHandler;
