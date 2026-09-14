const {test} = require('node:test');
const assert = require('node:assert/strict');
const {podeAcessar,podeUsarRegistros} = require('../permissoes.js');
test('visitante acessa o início público, mas nenhuma ferramenta privada',()=>{
  assert.equal(podeAcessar('view-dashboard',null),true);
  for(const pagina of ['view-educador','view-documentos','view-nova-consulta','view-receituario','view-caderneta'])
    assert.equal(podeAcessar(pagina,null),false);
});
test('educador tem seu formulário e não tem ferramentas de enfermagem',()=>{
  assert.equal(podeAcessar('view-educador','educador'),true);
  for(const pagina of ['view-documentos','view-nova-consulta','view-receituario','view-caderneta'])
    assert.equal(podeAcessar(pagina,'educador'),false);
  assert.equal(podeUsarRegistros('consultas','educador'),false);
  assert.equal(podeUsarRegistros('educadores','educador'),true);
});
test('enfermeiro acessa consulta, documentos e receituário, mas não formulário do educador',()=>{
  for(const pagina of ['view-documentos','view-nova-consulta','view-receituario','view-caderneta'])
    assert.equal(podeAcessar(pagina,'enfermeiro'),true);
  assert.equal(podeAcessar('view-educador','enfermeiro'),false);
  assert.equal(podeUsarRegistros('consultas','enfermeiro'),true);
  assert.equal(podeUsarRegistros('educadores','enfermeiro'),false);
});
test('papéis antigos ou desconhecidos não liberam ferramentas',()=>{
  for(const perfil of ['saude','admin','',undefined])
    assert.equal(podeAcessar('view-receituario',perfil),false);
  assert.equal(podeAcessar('pagina-inexistente','enfermeiro'),false);
});

