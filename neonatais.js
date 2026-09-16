// Cartões acessíveis baseados na referência visual da reunião de 13/09/2026.
(() => {
  const modulo = document.querySelector('#view-neonatais .module-wrapper');
  const icones = ['termico', 'monitor', 'peso', 'alerta'];
  const cards = modulo.querySelectorAll(':scope > .module-grid > .module-card');
  cards.forEach((card, i) => {
    card.classList.add('neonatal-card');
    card.insertAdjacentHTML('beforeend', `<svg class="neonatal-illustration" aria-hidden="true" focusable="false"><use href="assets/neonatais.svg#${icones[i]}"></use></svg>`);
  });
  modulo.querySelector(':scope > .module-grid').classList.add('neonatal-grid');
  const itens = modulo.querySelectorAll('.module-panel .module-list li');
  itens[0].textContent = 'Avaliar respiração e vitalidade; não aspirar boca e nariz de rotina se há respiração espontânea e líquido amniótico claro.';
  itens[1].textContent = 'Clampeamento do cordão conforme avaliação e protocolo assistencial.';
  itens[2].textContent = 'Secagem, proteção térmica e contato pele a pele quando clinicamente indicado.';
  modulo.insertAdjacentHTML('beforeend', '<p class="source-note">Referência clínica: <a href="https://linhasdecuidado.saude.gov.br/portal/puericultura/unidade-hospitalar/planejamento-terapeutico/" target="_blank" rel="noopener noreferrer">Ministério da Saúde · Assistência Neonatal</a>. Os cuidados imediatos são realizados por equipe capacitada, conforme a condição do recém-nascido.</p>');
})();
