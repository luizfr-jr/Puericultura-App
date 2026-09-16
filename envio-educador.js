(() => {
  const form = document.getElementById('formEducador');
  const botao = document.getElementById('edEnviarDireto');
  const status = document.getElementById('edEnvioStatus');
  const preview = document.getElementById('edEmailPreview');
  let preparado = null, geracao = 0, enviando = false;
  const configuracao = fetch('/api/notificar-educador', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : { configurado: false }).catch(() => ({ configurado: false }));
  function invalidar() {
    geracao++; preparado = null; botao.hidden = true;
    document.getElementById('edNotificacao').hidden = true;
    document.getElementById('edEmailLink').href = '#';
    status.textContent = ''; preview.textContent = '';
  }
  form.addEventListener('input', invalidar);
  form.addEventListener('change', invalidar);
  form.addEventListener('reset', invalidar);
  window.addEventListener('conta-alterada', invalidar);
  window.prepararNotificacaoEducador = async registro => {
    const atual = ++geracao;
    preparado = null; botao.hidden = true; status.textContent = '';
    const mensagem = window.PuericulturaNotificacoes.criarMensagem(registro);
    preview.textContent = `Assunto: ${mensagem.assunto}\n\n${mensagem.corpo}`;
    try {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(mensagem)));
      const assinatura = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
      const config = await configuracao;
      if (atual !== geracao) return;
      preparado = { id: registro.id, assinatura };
      botao.hidden = !config.configurado; botao.disabled = enviando;
      status.textContent = config.configurado ? 'Relatório pronto para envio.' : 'Envio direto ainda indisponível. Você pode enviar pelo seu aplicativo de e-mail.';
    } catch {
      if (atual === geracao) status.textContent = 'Use o aplicativo de e-mail para enviar o relatório revisado.';
    }
  };
  botao.addEventListener('click', async () => {
    if (!preparado || enviando) return;
    const atual = geracao, pedido = preparado;
    enviando = true; botao.disabled = true; status.textContent = 'Enviando para a coordenação…';
    try {
      const token = await window.Conta.tokenNotificacao();
      if (atual !== geracao) return;
      const resposta = await fetch('/api/notificar-educador', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(pedido), signal: AbortSignal.timeout(45000) });
      const resultado = await resposta.json();
      if (!resposta.ok || !resultado.aceito) throw new Error(resultado.erro || 'Não foi possível confirmar o envio.');
      if (atual !== geracao) return;
      preparado = null; botao.hidden = true;
      document.getElementById('edEmailLink').hidden = true;
      status.textContent = 'O serviço de e-mail aceitou o relatório para envio à coordenação. Isso ainda não confirma a entrega na caixa de entrada.';
    } catch (erro) {
      if (atual === geracao) status.textContent = erro.name === 'TimeoutError' ? 'O envio não foi confirmado a tempo. Tente novamente para verificar, sem duplicar a mensagem.' : (erro.message || 'Não foi possível confirmar o envio.');
    } finally {
      enviando = false; botao.disabled = false;
    }
  });
  form.addEventListener('submit', () => { document.getElementById('edEmailLink').hidden = false; });
})();
