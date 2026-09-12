const dataHoje = () => {const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function idadeMeses(nascimento,referencia=dataHoje()) {
  for (const valor of [nascimento, referencia]) {
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
    const [ano, mes, dia] = valor.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  }
  if(nascimento>referencia) return null;
  const [a,m,d]=nascimento.split('-').map(Number), [ar,mr,dr]=referencia.split('-').map(Number);
  return (ar-a)*12+mr-m-(dr<d?1:0);
}

// Função dimensional: os parâmetros terapêuticos são definidos pelo protocolo do prescritor.
function calcularConversao({tipo,peso,dose,concentracao,tomadas,maxDose=null,maxDia=null}) {
  if(!['mg/kg/dose','mg/kg/dia','mg/dose'].includes(tipo))throw Error('Unidade de cálculo inválida.');
  if(![dose,concentracao,tomadas].every(n=>Number.isFinite(n)&&n>0)||!Number.isInteger(tomadas)||tomadas>24)throw Error('Informe dose e concentração positivas e de 1 a 24 tomadas por dia.');
  if(tipo!=='mg/dose'&&(!Number.isFinite(peso)||peso<=0||peso>300))throw Error('Informe um peso válido em kg.');
  for(const max of [maxDose,maxDia])if(max!==null&&(!Number.isFinite(max)||max<=0))throw Error('Os limites do protocolo devem ser positivos.');
  const mg=tipo==='mg/dose'?dose:tipo==='mg/kg/dia'?dose*peso/tomadas:dose*peso;
  const dia=mg*tomadas,ml=mg/concentracao;
  if(![mg,dia,ml].every(n=>Number.isFinite(n)&&n>0))throw Error('Resultado inválido. Confira os parâmetros.');
  if(maxDose!==null&&mg>maxDose)throw Error('O resultado excede o máximo por dose informado. Revise o protocolo.');
  if(maxDia!==null&&dia>maxDia)throw Error('O resultado excede o máximo diário informado. Revise o protocolo.');
  return {mg,dia,ml};
}

if (typeof module !== "undefined") module.exports = { dataHoje, idadeMeses, calcularConversao };

