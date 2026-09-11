# Mundo da Puericultura

Aplicativo estático de apoio ao acompanhamento infantil, com HTML, CSS e JavaScript. Não exige compilação.

## Desenvolvimento

Sirva esta pasta por HTTP, por exemplo com `python -m http.server 8765`, e abra `http://localhost:8765`. Os testes de cálculo usam apenas Node.js: `node --test tests/calculos.test.cjs`.

`index.html` preserva os módulos existentes. `revisao.js` monta as novas telas; `conteudo.js` e `materiais.js` contêm os materiais; `app.js` controla navegação e registros; `calculos.js` contém as funções de cálculo; `receituario.js` controla as prescrições. `revisao.css` complementa o estilo original.

## Registros e perfis

A seleção de perfil personaliza a tela inicial. Esta versão não possui autenticação, contas, isolamento por usuário ou sincronização. Crianças, consultas e formulários são armazenados no `localStorage` do navegador, no domínio onde o aplicativo é aberto. Dados de um domínio de prévia não aparecem no domínio de produção.

O botão de exportação gera um arquivo JSON. Não há importação automática nesta versão. Limpar os dados do navegador remove os registros; mantenha uma cópia dos dados necessários. A chave histórica `consultas_puericultura` é preservada, inclusive os campos disponíveis em registros antigos. Para completar uma consulta antiga, cadastre/selecione a criança ao editá-la.

## Revisão solicitada

- Seleção inicial entre profissional de saúde e educador.
- Dez períodos de consulta, da primeira semana aos três anos, com orientações próprias.
- Guia de amamentação, educação familiar, vídeos e notícias indicadas.
- Formulário do educador com idade em meses completos, vacinação, desenvolvimento, sinais, observações e encaminhamentos; gravação e edição na caderneta.
- Cadastro de crianças, consultas completas, visualização, edição, exclusão e exportação. A exclusão de criança com consultas vinculadas é impedida.
- Documentos de enfermagem com links e indicação de norma revogada/alterada.
- Catálogo dos medicamentos mencionados no material, conversão de mg/kg/dia, mg/kg/dose ou mg/dose em mg e mL, limites informados por dose/dia e impressão simples ou em duas vias para retenção.

## Pendências para finalizar a revisão clínica

1. **Base de medicamentos:** o exemplo fornecido importa `MEDICAMENTOS` e `CATEGORIAS`, mas não contém esses dados. É necessária a tabela aprovada pelo serviço: indicação, faixa etária, dose, intervalo, apresentação, concentração, máximos, contraindicações, duração e referência. A calculadora atual faz conversão matemática; não recomenda tratamentos nem presume doses. Não converte gotas, UI ou comprimidos. O texto final deve ser conferido pelo prescritor.
2. **Instrumento de observação:** o material não identifica validação dos cortes numéricos de risco. O questionário registra observações sem classificar risco. O fluxo orienta encaminhar suspeitas à rede de proteção independentemente da contagem.
3. **Documentos:** a Resolução COFEN 159/1993 está revogada; a 737/2024 trata de parto domiciliar planejado e foi alterada pela 786/2025. Essas condições estão identificadas. A referência específica ao Parecer COREN-RS 022/2023 permanece pendente de confirmação do documento correto.
4. **Conteúdo clínico:** as orientações novas foram resumidas com apoio de fontes oficiais. A conferência integral dos textos/imagens fornecidos e dos módulos anteriores, incluindo calendário vacinal e condutas neonatais, exige revisão pelo responsável clínico antes da publicação.
5. **Contas e sincronização:** caso desejadas, exigem uma etapa própria de backend e autenticação. A seleção de perfil não oferece essas funções.

## Fontes utilizadas

- [Ministério da Saúde — Primeira infância](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/primeira-infancia)
- [Ministério da Saúde — Aleitamento materno](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/aleitamento-materno)
- [Ministério da Saúde — Prevenção e cultura de paz](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/prevencao-e-cultura-de-paz/prevencao-e-cultura-de-paz/)
- [COFEN 736/2024 — Processo de Enfermagem](https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/)
- [COFEN 801/2026 — Prescrição de medicamentos](https://www.cofen.gov.br/resolucao-cofen-no-801-de-14-de-janeiro-de-2026/)

## Verificação realizada

Sete testes automatizados cobrem idade, unidades de dose, conversão de concentração, limites e entradas inválidas. No navegador foram conferidos cadastro, consulta completa, edição sem duplicação, persistência após recarga, recuperação do formulário do educador, alerta de vacinação, dez períodos de consulta, quinze links de vídeo e geração do conteúdo de uma/duas vias do receituário, usando dados fictícios. A aparência final da impressão em papel e a tela de celular ainda precisam de conferência; o navegador de teste não aplicou a dimensão solicitada.

A publicação pelo Vercel usa os arquivos estáticos da raiz. A proposta de revisão deve permanecer separada da produção enquanto as pendências acima forem avaliadas.

