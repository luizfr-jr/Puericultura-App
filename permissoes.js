(function (root) {
  'use strict';
  const paginas = Object.freeze({
    'view-dashboard': [], 'view-crescimento': [], 'view-neonatais': [],
    'view-imunizacao': [], 'view-consultas': [], 'view-amamentacao': [],
    'view-educacao': [], 'view-noticias': [], 'view-login': [],
    'view-educador': ['educador'],
    'view-documentos': ['enfermeiro'],
    'view-nova-consulta': ['enfermeiro'],
    'view-receituario': ['enfermeiro'],
    'view-caderneta': ['enfermeiro', 'educador'],
    'view-conta': ['enfermeiro', 'educador']
  });
  function podeAcessar(pagina, perfil) {
    const permitidos = paginas[pagina];
    return !!permitidos && (permitidos.length === 0 || permitidos.includes(perfil));
  }
  function podeUsarRegistros(tipo, perfil) {
    return perfil === 'enfermeiro' ? ['criancas', 'consultas'].includes(tipo)
      : perfil === 'educador' && tipo === 'educadores';
  }
  const api = Object.freeze({ paginas, podeAcessar, podeUsarRegistros });
  if (typeof module !== 'undefined') module.exports = api;
  else root.PuericulturaPermissoes = api;
})(typeof window !== 'undefined' ? window : this);

