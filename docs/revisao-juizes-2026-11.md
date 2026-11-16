# Revisão do portal após validação por juízes (novembro de 2026)

## 1. Resultado da validação

Foram 15 juízes. A escala ia de 1 a 4, e o IVC considera as respostas 3 ou 4.

| Item | IVC | Nota 4 |
| --- | --- | --- |
| 1. O conteúdo atende aos objetivos | 1,00 | 15/15 |
| 2. Adequação ao público-alvo | 1,00 | 14/15 |
| 3. Linguagem clara e objetiva | 1,00 | 14/15 |
| 4. Teoria de Nola Pender evidente | 1,00 | 12/15 |
| 5. Organização facilita a leitura | 1,00 | 15/15 |
| 6. Pertinência do conteúdo CIPE/NANDA | 1,00 | 14/15 |
| 7. Contribui para qualificar a puericultura | 1,00 | 15/15 |

O IVC global foi de 1,00. O item 4 teve a menor proporção de nota máxima. Na versão avaliada, o nome de Nola Pender e as linguagens CIPE/NANDA-I não apareciam explicitamente no portal.

## 2. Sugestões dos juízes e alterações feitas

| Juiz(a) | Sugestão | Alteração | Local |
| --- | --- | --- | --- |
| Fabiana P. S. Ortiz | Aos 4 meses, orientar a importância da primeira consulta odontológica. Aos 6 meses, reforçá-la e iniciar a escovação após o primeiro dente. | Orientação de saúde bucal incluída aos 4, 6 e 12 meses. Aos 6 meses, inclui o uso de creme dental com flúor de 1.000 a 1.500 ppm, em quantidade de até um grão de arroz cru. | Consultas de Rotina (`conteudo.js`) |
| Emanuele A. da Cunha | Em cuidados neonatais, incluir os testes neonatais e seus prazos, além das vacinas. | Seção "Triagem neonatal: testes e prazos" com os cinco testes. Seção "Vacinas ao nascer" com atalho para o calendário. Os testes também aparecem no roteiro da 1ª semana. | Cuidados Neonatais (`validacao.js`) |
| Marliza L. da Silva | M-CHAT | M-CHAT-R/F incluído aos 18 meses (faixa de 16 a 30 meses), com as faixas de pontuação e a conduta. Reaplicação aos 24 meses quando indicada. | Consultas de Rotina (`conteudo.js`) |
| Item 4: 3 juízes deram nota 3 | Tornar a teoria de Nola Pender evidente | Nova tela "Promoção da Saúde e Processo de Enfermagem", com os três componentes do modelo e um passo a passo para a consulta. Cada roteiro por idade passou a ter um bloco de Pender: comportamento, benefícios, barreiras, autoeficácia e plano de ação. | `validacao.js` |
| Item 6: 1 juíza deu nota 3 | Conteúdo de CIPE/NANDA pertinente à prática | Processo de Enfermagem conforme a Resolução COFEN 736/2024. Tabela de exemplos de enunciados diagnósticos e intervenções. | `validacao.js` |
| Itens 2 e 3: 1 juiz deu nota 3 em cada | Público-alvo e linguagem | Início reorganizado por perfil e por idade, com textos de interface diretos e sem jargão de marketing. | Início |

## 3. Correção identificada na revisão: calendário vacinal

O módulo Imunização estava desatualizado em relação ao Calendário Nacional de Vacinação 2026. Alguns exemplos:

- Indicava uma 3ª dose da pneumocócica aos 6 meses. O esquema correto é 2 doses, aos 2 e 4 meses, com reforço aos 12 meses.
- Não incluía a meningocócica C aos 3 e 5 meses.
- Não incluía a febre amarela aos 9 meses, a COVID-19, a influenza nem o reforço da VIP aos 15 meses.
- Indicava meningocócica C aos 12 meses. A vacina correta nessa idade é a ACWY.

O calendário foi refeito com base no calendário técnico do Ministério da Saúde e na Nota Técnica nº 64/2026, que define o 2º reforço da VIP aos 4 anos. Os roteiros por idade agora mostram as vacinas previstas até a consulta seguinte.

## 4. Design centrado no ser humano

O processo seguiu a ISO 9241-210: entender as pessoas usuárias e seus contextos, definir requisitos, propor soluções e avaliar.

| Pessoa usuária | Contexto e necessidade | Problema na versão anterior | Solução |
| --- | --- | --- | --- |
| Enfermeiro(a) da APS | Pensa pela idade da criança durante a consulta e tem pouco tempo | As informações estavam separadas por tema. Para cruzar vacinas, marcos e orientações era preciso abrir vários módulos. | Atalhos "Qual a idade da criança?" no início. Roteiro por idade reúne exame, desenvolvimento, orientações, vacinas e Pender. |
| Educador(a) de creche | Observa o desenvolvimento e registra encaminhamentos | Não havia uma entrada clara para esse perfil | Cartão "Sou educador(a)" com marcos, educação familiar e acesso ao formulário |
| Mãe, pai ou cuidador(a) | Usa o celular e busca informação acessível | No celular, o início tinha cerca de 2.200 px de cartões grandes e títulos de marketing ("plataforma inteligente", emojis) | Hero com propósito claro, cartões em duas colunas no celular e atalho para unidades de saúde |
| Todos | Navegação previsível | Imunização, Consultas e Educação Familiar não estavam no menu. Os botões de voltar tinham textos diferentes. | Menu completo, na ordem da jornada da criança. Botão "← Início" padronizado. |
| Pessoas que usam teclado ou leitor de tela | Acessibilidade (WCAG 2.1) | Cartões sem acesso por teclado e foco pouco visível | Cartões com `role="button"` e acesso por teclado, foco visível, tabela com cabeçalhos e `region` rotulada |

Verificação: sem rolagem horizontal a 320, 390 e 1280 px, nenhum erro de script e 28 testes automatizados aprovados.

## 5. Pendências para revisão clínica antes da publicação

1. Conferir os rótulos diagnósticos da tabela CIPE/NANDA-I na edição vigente da NANDA-I (2024–2026) e na CIPE®. Na tela, eles estão identificados como exemplos.
2. O responsável clínico deve validar os prazos da triagem neonatal e as faixas do M-CHAT-R/F.
3. Conferir a sugestão de comportamento de Pender para cada idade.
4. Uma nova rodada com os juízes, ou um teste de usabilidade com 5 a 8 usuários reais, completaria o ciclo iterativo do design centrado no ser humano.
