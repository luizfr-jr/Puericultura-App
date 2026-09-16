const {test} = require('node:test');
const assert = require('node:assert/strict');
const {idadeMeses,calcularConversao,calcularConcentracao} = require('../calculos.js');
test('idade considera o dia do aniversário mensal',()=>{
  assert.equal(idadeMeses('2025-09-12','2026-09-11'),11);
  assert.equal(idadeMeses('2025-09-12','2026-09-12'),12);
  assert.equal(idadeMeses('2026-09-11','2026-09-11'),0);
});
test('datas futuras, ausentes e impossíveis são rejeitadas',()=>{
  assert.equal(idadeMeses('2026-09-12','2026-09-11'),null);
  assert.equal(idadeMeses('2025-02-30','2026-09-11'),null);
  assert.equal(idadeMeses('','2026-09-11'),null);
});
const base={tipo:'mg/kg/dia',peso:10,dose:30,concentracao:50,tomadas:3};
test('apresentação em mg por 5 mL é normalizada antes do cálculo', () => {
  const concentracao = calcularConcentracao(250, 5);
  assert.equal(concentracao, 50);
  assert.equal(calcularConversao({...base, concentracao}).ml, 2);
  for (const n of [0, -1, NaN, Infinity]) {
    assert.throws(() => calcularConcentracao(n, 5));
    assert.throws(() => calcularConcentracao(250, n));
  }
});
test('data de referência inválida não produz idade incorreta',()=>{
  for(const referencia of ['',null,'2026-02-30','2026-13-01','2026-9-12'])
    assert.equal(idadeMeses('2025-01-01',referencia),null);
  assert.equal(idadeMeses('2024-02-29','2024-02-29'),0);
});
test('dose diária é dividida pelo número de tomadas antes da conversão',()=>{
  assert.deepEqual(calcularConversao(base),{mg:100,dia:300,ml:2});
});
test('dose por tomada não sofre divisão adicional',()=>{
  assert.deepEqual(calcularConversao({...base,tipo:'mg/kg/dose',dose:10}),{mg:100,dia:300,ml:2});
});
test('dose fixa em mg não exige peso',()=>{
  assert.deepEqual(calcularConversao({...base,tipo:'mg/dose',peso:0,dose:50}),{mg:50,dia:150,ml:1});
});
test('máximo diário e máximo por dose têm unidades distintas',()=>{
  assert.throws(()=>calcularConversao({...base,maxDia:250}),/máximo diário/);
  assert.throws(()=>calcularConversao({...base,maxDose:90}),/máximo por dose/);
  assert.equal(calcularConversao({...base,maxDose:100,maxDia:300}).mg,100);
});
test('zero, negativos e valores não finitos nunca geram dose',()=>{
  for(const name of ['peso','dose','concentracao','tomadas'])for(const value of [0,-1,NaN,Infinity])assert.throws(()=>calcularConversao({...base,[name]:value}));
  assert.throws(()=>calcularConversao({...base,tomadas:1.5}));
  assert.throws(()=>calcularConversao({...base,tipo:'UI/kg'}));
});

