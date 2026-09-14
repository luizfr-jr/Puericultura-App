# Mundo da Puericultura

Aplicativo estático de apoio ao acompanhamento infantil, com HTML, CSS e JavaScript. Não exige compilação.

## Desenvolvimento

Sirva esta pasta por HTTP, por exemplo com `python -m http.server 8765`, e abra `http://localhost:8765`. Os testes de cálculo e permissões usam apenas Node.js: `node --test tests/*.test.cjs`. O login exige conexão com o Firebase.

`index.html` preserva os módulos existentes. `revisao.js` monta as novas telas; `conteudo.js` e `materiais.js` contêm os materiais; `app.js` controla navegação e registros; `calculos.js` contém as funções de cálculo; `receituario.js` controla as prescrições. `revisao.css` complementa o estilo original.

## Login, perfis e registros

O início e os materiais educativos são públicos. O botão **Login** oferece entrada por e-mail/senha, criação de conta e recuperação de senha. O perfil é escolhido uma única vez no cadastro e fica vinculado ao usuário:

| Acesso | Educador | Enfermeiro |
| --- | --- | --- |
| Formulário do Educador | Sim | Não |
| Nova Consulta, Documentos de Enfermagem e Receituários | Não | Sim |
| Caderneta da Criança e exportação de consultas | Não | Sim |

As ferramentas ficam na área **Minha conta**. A tela inicial exibe os mesmos materiais públicos para todos, inclusive depois do login, sem botões de nova consulta, formulário do educador, documentos ou receituários. Não há botão de troca de perfil. O cadastro de enfermeiro solicita COREN/UF; a informação é declarada pelo usuário, sem validação automática da inscrição profissional. Alterações administrativas de perfil exigem revisão dos registros existentes; o aplicativo e as regras não permitem que a própria conta altere esse campo.

Contas criadas na versão anterior pelo Firebase Authentication continuam usando o mesmo e-mail e senha. Caso não exista o perfil em `perfis/{uid}`, o login apresenta **Complete seu perfil**, permitindo cadastrar a profissão uma única vez. O aplicativo não presume que a preferência antiga `saude` no navegador seja uma autorização de enfermagem.

Firebase Authentication gerencia as senhas. O Cloud Firestore armazena o perfil em `perfis/{uid}` e os registros em `usuarios/{uid}/registros/{tipo}`. As regras de `firestore.rules` verificam o UID e o papel da conta no servidor, negam acesso a terceiros e bloqueiam mudanças de perfil. Cada enfermeiro possui suas crianças/consultas; cada educador possui seus formulários. Não há compartilhamento de prontuários entre contas.

Os dados são carregados do servidor após autenticação. A sessão dura enquanto a aba permanece aberta, sobrevive à recarga e pode ser encerrada em **Sair**. O logout limpa os formulários e registros em memória. Não há cache persistente de prontuários nem gravação offline. Cada conjunto usa uma versão transacional para impedir que uma sessão sobrescreva alterações de outra sem aviso.

Os registros antigos em `localStorage` permanecem preservados, mas não são exibidos entre contas, importados automaticamente nem atribuídos à primeira pessoa que fizer login. A implementação anterior usava os caminhos `usuarios/{uid}` para perfil e `usuarios/{uid}/{tipo}/{id}` para registros, incompatíveis com as regras atualmente publicadas. O cliente foi alinhado aos caminhos reais do banco; gravações que falharam e ficaram apenas no navegador exigem uma migração com identificação do dono dos dados antes de qualquer importação. A exportação gera JSON dos registros da conta conectada; não existe importação automática. Cada conjunto possui limite de 1.000 entradas e está sujeito ao limite de 1 MiB por documento do Firestore; para volume maior, migrar para documentos individuais antes de atingir esses limites.

## Firebase e hospedagem

- Conta proprietária: `luizfr.jr@gmail.com`.
- Projeto: `puericultura-app` / Puericultura App; aplicativo web: Puericultura Web.
- Authentication: provedor e-mail/senha.
- Firestore: edição Standard, banco `(default)`, região `southamerica-east1` (São Paulo), regras de acesso publicadas.
- Plano Spark gratuito, sem habilitar faturamento. O site continua hospedado no Vercel.
- `firebase-config.js` contém a configuração pública do cliente. Não contém credenciais administrativas; a proteção dos registros depende das regras, não de esconder a chave pública.
- Para reproduzir em outro projeto: registrar o aplicativo web, habilitar e-mail/senha, criar o Firestore em modo de produção, publicar `firestore.rules` e atualizar a configuração pública. Nunca usar regras abertas de teste com dados reais.

## Revisão solicitada

- Início público, login por e-mail/senha e ferramentas vinculadas ao perfil cadastrado.
- Dez períodos de consulta, da primeira semana aos três anos, com orientações próprias.
- Guia de amamentação, educação familiar, vídeos e notícias indicadas.
- Formulário exclusivo do educador com idade em meses completos, vacinação, desenvolvimento, sinais, observações e encaminhamentos; histórico próprio e preparação de relatório por e-mail para a coordenação. Pendências vacinais são destacadas no assunto e no corpo da mensagem.
- Cadastro de crianças, consultas completas, visualização, edição, exclusão e exportação. A exclusão de criança com consultas vinculadas é impedida.
- Imagens próprias nos seis módulos da página inicial, miniaturas nos vídeos e notícias em cartões ilustrados, conforme a apresentação da reunião de 13/09/2026.
- Documentos de enfermagem com links e indicação de norma revogada/alterada.
- Catálogo dos medicamentos mencionados no material, conversão de mg/kg/dia, mg/kg/dose ou mg/dose em mg e mL, limites informados por dose/dia e impressão simples ou em duas vias para retenção.

## Pendências para finalizar a revisão clínica

1. **Base de medicamentos:** o exemplo fornecido importa `MEDICAMENTOS` e `CATEGORIAS`, mas não contém esses dados. É necessária a tabela aprovada pelo serviço: indicação, faixa etária, dose, intervalo, apresentação, concentração, máximos, contraindicações, duração e referência. A calculadora atual faz conversão matemática; não recomenda tratamentos nem presume doses. Não converte gotas, UI ou comprimidos. O texto final deve ser conferido pelo prescritor.
2. **Instrumento de observação:** o material não identifica validação dos cortes numéricos de risco. O questionário registra observações sem classificar risco. O fluxo orienta encaminhar suspeitas à rede de proteção independentemente da contagem.
3. **Documentos:** a Resolução COFEN 159/1993 está revogada; a 737/2024 trata de parto domiciliar planejado e foi alterada pela 786/2025. Essas condições estão identificadas. A referência específica ao Parecer COREN-RS 022/2023 permanece pendente de confirmação do documento correto.
4. **Conteúdo clínico:** as orientações novas foram resumidas com apoio de fontes oficiais. A conferência integral dos textos/imagens fornecidos e dos módulos anteriores, incluindo calendário vacinal e condutas neonatais, exige revisão pelo responsável clínico antes da publicação.

## Fontes utilizadas

- [Ministério da Saúde — Primeira infância](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/primeira-infancia)
- [Ministério da Saúde — Aleitamento materno](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/aleitamento-materno)
- [Ministério da Saúde — Prevenção e cultura de paz](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/prevencao-e-cultura-de-paz/prevencao-e-cultura-de-paz/)
- [COFEN 736/2024 — Processo de Enfermagem](https://www.cofen.gov.br/resolucao-cofen-no-736-de-17-de-janeiro-de-2024/)
- [COFEN 801/2026 — Prescrição de medicamentos](https://www.cofen.gov.br/resolucao-cofen-no-801-de-14-de-janeiro-de-2026/)

## Verificação realizada

Quinze testes automatizados cobrem permissões de visitante/educador/enfermeiro, relatórios e alertas por e-mail, idade, datas de nascimento/referência inválidas, unidades de dose, conversão de concentração, limites e entradas inválidas. No navegador foram conferidos cadastro, consulta completa, edição sem duplicação, persistência após recarga, recuperação do formulário do educador, alerta de vacinação, dez períodos de consulta, quinze links de vídeo e geração do conteúdo de uma/duas vias do receituário, usando dados fictícios.

Em 12/09/2026, a prévia do Vercel foi aberta pelo Edge autenticado. Na revisão anterior, a seleção de perfil, o início e os formulários de consulta, educador e receituário foram inspecionados em largura de 390 pixels, sem transbordamento horizontal da página; educador, estudo e receituário também foram verificados a 320 pixels. O menu tem rolagem horizontal própria em telas pequenas. A aparência final da impressão em papel permanece pendente.

As verificações anteriores de persistência local foram substituídas por testes com Firebase: cadastro dos dois perfis, gravação por conta, recarga, login/logout e negações reais pela API para visitante, outro UID, perfil incompatível, mudança de perfil e sobrescrita com versão antiga. Somente contas e registros fictícios foram usados. O novo login foi inspecionado a 390 pixels e o cadastro de enfermeiro a 320 pixels, sem transbordamento horizontal.

A publicação pelo Vercel usa os arquivos estáticos da raiz. A proposta de revisão deve permanecer separada da produção enquanto as pendências acima forem avaliadas.

