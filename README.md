# Simulador de Crédito — Cresol 2026

Aplicação web para simulação de operações de crédito da **Cresol**, construída sobre **Google Apps Script** e **Google Sheets**. O sistema permite que operadores de agências simulem financiamentos para associados ou prospects, com cálculo automático de custos (TAC, IOF, Seguro Prestamista, Cota Capital e outras custas), geração de cronograma de amortização, análise de comprometimento de renda e emissão de proposta em PDF.

> ⚠️ As simulações têm caráter meramente informativo e não constituem promessa, pré-aprovação ou vínculo de concessão de crédito.

---

## Visão geral

- **Frontend** (`index.html`): interface única (SPA) em HTML/CSS/JavaScript, usando **Bootstrap 5**, **Chart.js** (dashboards) e **jsPDF + AutoTable** (geração de propostas em PDF).
- **Backend** (`code.gs`): código Google Apps Script publicado como *Web App* (`doGet`), que serve a interface e expõe as funções chamadas pelo frontend via `google.script.run`.
- **Persistência**: uma planilha Google Sheets (`SPREADSHEET_ID`) funciona como banco de dados, com abas para configurações, usuários, associados, modalidades, log de simulações, agências, novidades, grupo econômico e composição societária. As abas são criadas automaticamente no primeiro acesso (`setupInicial`).

---

## Principais funcionalidades

### 1. Controle de acesso
- Autenticação pelo e-mail Google do usuário, validado contra a aba **Usuarios**.
- Perfis de acesso (**ADMIN** e operador) e vínculo por **Agência**.
- Bloqueio de usuários **Inativos** e **Modo de Manutenção** (só ADMINs acessam durante a manutenção).

### 2. Dados do Associado / Prospect
- Busca de associado por **número da conta** ou pesquisa por **nome**, trazendo score, tipo de pessoa (PF/PJ), idade e demais dados da aba **Associados**.
- Cadastro de **Novo Prospect** com preenchimento manual de nome, score, idade e renda.

### 3. Simulação Simples
- Simulação de uma modalidade em um único prazo mensal.
- Cálculo **pelo valor bruto** (custos descontados do valor digitado) ou **pelo valor líquido** (o sistema busca o bruto necessário via busca binária para entregar o valor desejado em mãos).
- Suporte a **carência** (grace period) e periodicidade.
- Sistemas de amortização **PRICE** e **SAC**, com cronograma parcela a parcela.
- Exibição de taxas recomendadas conforme faixa de score.
- Emissão de **proposta em PDF**.

### 4. Simulações Especiais
Sub-telas para comparação lado a lado:
- **📊 Lote por Prazos**: mesma operação simulada em vários prazos mensais.
- **🔀 Lote por Modalidades**: comparação da operação em diferentes modalidades.
- **🔗 Simulação Composta**: composição de múltiplas operações.

### 5. Histórico
- Registro automático de cada simulação na aba **Log Simulacoes** (`registrarLogSimulacao`).
- Consulta e filtro do histórico por nome/conta.

### 6. Dashboard (ADMIN)
- Gráficos de volume e quantidade por agência, mix de modalidades, evolução no tempo e distribuição por score (Chart.js).

### 7. Painel Administrativo (ADMIN)
- Gestão de **usuários** e **agências**.
- Gestão de **modalidades** de crédito (taxas por faixa de score, prazos, garantia, público-alvo, amortização, regras de IOF, tags).
- Parâmetros financeiros globais: **CDI anual**, faixas do **Seguro Prestamista**, faixas de **TAC PJ** e **exceções de TAC** por código.
- Textos de orientação, quadro de **Novidades** e **Modo de Manutenção**.
- Configuração e execução da **sincronização de bases**.

---

## Motor de cálculo financeiro

O núcleo de cálculo (`calcularCustosSimulacao` e funções relacionadas em `index.html`) considera:

- **TAC**: por faixas de valor para PJ e exceções por código de modalidade.
- **IOF**: fórmula padrão baseada em dias (alíquota fixa + diária, limitada a 365 dias), alíquota específica (ex.: 0,38%), isenção, e regra reduzida para PJ MEI/Simples Nacional em operações até R$ 30.000.
- **Seguro Prestamista**: por faixas etárias (mensal ou anual); para PJ, rateado por sócio conforme composição societária.
- **Cota Capital** e **Outras Custas**.
- **Cronograma de amortização** em PRICE ou SAC, com juros de carência.

### Análise de comprometimento de renda
`calcularComprometimentoRendaGlobal` consolida renda e endividamento de todo o **grupo econômico** do associado (com cache de 5 minutos), ou de membros informados manualmente no caso de prospects, para avaliar o percentual de comprometimento com a parcela simulada.

---

## Sincronização de bases (BI → Drive → Sheets)

Rotina agendada (sync noturno, horário configurável no Painel Admin) que importa arquivos **CSV do Google Drive** para as planilhas do simulador:

- **Base de associados** (`SYNC_CONFIG`): conta, nome, nascimento/idade, tipo de pessoa, MEI, Simples, CPF/CNPJ, renda, endividamento, etc.
- **Composição societária** (`SYNC_COMPOSICAO_CONFIG`): CNPJ, CPF do sócio e percentual de participação.
- **Grupo econômico**: relação entre CPF/CNPJ agrupador e integrantes.

A sincronização pode ser disparada manualmente ou via *trigger* automático (`instalarTriggerSyncAutomatico`).

---

## Estrutura do repositório

| Arquivo | Descrição |
|---------|-----------|
| `code.gs` | Backend Google Apps Script: setup, controle de acesso, CRUD (usuários, agências, modalidades, associados), log de simulações, sincronização de bases, comprometimento de renda e grupo econômico. |
| `index.html` | Frontend completo (HTML, CSS e JavaScript): interface, motor de cálculo no cliente, dashboards, geração de PDF e chamadas ao backend. |
| `README.md` | Este documento. |

### Principais abas da planilha
`Configuracoes`, `Usuarios`, `Associados`, `modalidades`, `Log Simulacoes`, `Agencias`, `Novidades`, `GrupoEconomico` e `ComposicaoSocietaria`.

---

## Como executar / publicar

1. Crie um projeto no **Google Apps Script** e adicione os arquivos `code.gs` e `index.html`.
2. Ajuste a constante `SPREADSHEET_ID` (topo de `code.gs`) para o ID da sua planilha Google Sheets. As abas necessárias são criadas automaticamente no primeiro acesso.
3. Configure os IDs dos arquivos CSV de sincronização em `SYNC_CONFIG` e `SYNC_COMPOSICAO_CONFIG`, se for usar o sync automático.
4. Publique o projeto como **Web App** (implantar → nova implantação → App da Web), com acesso pelo domínio da organização.
5. Cadastre o primeiro usuário **ADMIN** na aba `Usuarios` (é feito automaticamente no setup inicial) e acesse pela URL da implantação.

---

## Tecnologias

- Google Apps Script (backend / Web App)
- Google Sheets (persistência de dados)
- HTML5, CSS3 e JavaScript (frontend)
- Bootstrap 5, Chart.js, jsPDF + jsPDF-AutoTable
