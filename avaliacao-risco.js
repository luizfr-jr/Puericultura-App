(function (root) {
  'use strict';

  function avaliarObservacao(respostas = [], totalEsperado = respostas.length) {
    const valores = Array.from(respostas || []);
    const preenchidos = valores.filter(Boolean).length;
    const presentes = valores.filter(valor => valor === 'Sim').length;
    const naoObservados = valores.filter(valor => valor === 'Não observado').length;

    if (preenchidos < totalEsperado) {
      return {
        estado: 'incompleta',
        preenchidos,
        presentes,
        naoObservados,
        mensagem: `Avaliação incompleta: ${preenchidos} de ${totalEsperado} itens respondidos. Preencha todos os itens antes de interpretar o roteiro.`
      };
    }

    if (presentes > 0) {
      const descricao = presentes === 1 ? '1 sinal marcado como presente.' : `${presentes} sinais marcados como presentes.`;
      return {
        estado: 'atencao',
        preenchidos,
        presentes,
        naoObservados,
        mensagem: `${descricao} Este roteiro não mede o grau de risco. Registre os fatos e siga o fluxo de proteção da instituição.`
      };
    }

    if (naoObservados > 0) {
      const descricao = naoObservados === 1 ? '1 item não foi observado' : `${naoObservados} itens não foram observados`;
      return {
        estado: 'indeterminado',
        preenchidos,
        presentes,
        naoObservados,
        mensagem: `Nenhum sinal foi marcado como presente, mas ${descricao}. O roteiro não permite descartar risco.`
      };
    }

    return {
      estado: 'sem-sinais-observados',
      preenchidos,
      presentes,
      naoObservados,
      mensagem: `Nenhum dos ${totalEsperado} sinais foi marcado como presente nesta observação. Isso não exclui uma situação de risco. Diante de relato, suspeita ou urgência, siga o fluxo de proteção.`
    };
  }

  const api = Object.freeze({ avaliarObservacao });
  if (typeof module !== 'undefined') module.exports = api;
  else root.PuericulturaAvaliacaoRisco = api;
})(typeof window !== 'undefined' ? window : this);
