const SPREADSHEET_ID = '19qboiD0IOYFrnWwDRoorMW1olSaP-iRcVeJ369IThts';

function doGet() {
  setupInicial();
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Simulador de Crédito - Cresol')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// SETUP INICIAL E CRIAÇÃO DE PARÂMETROS
// ==========================================
function setupInicial() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    let sheetConf = ss.getSheetByName('Configuracoes');
    if (!sheetConf) {
      sheetConf = ss.insertSheet('Configuracoes');
      sheetConf.appendRow(["Chave", "Valor"]);
      sheetConf.appendRow(["TAGS_ATIVAS", "Veículos, Imóveis, Consórcio, Investimento, Capital de Giro"]);
      sheetConf.appendRow(["CDI_ANUAL", "10.50"]);
      // Matrizes Iniciais de Regras de Negócio (Em formato JSON para o motor)
      sheetConf.appendRow(["SEGURO_FAIXAS", JSON.stringify([{ max: 65, taxa: 0.89 }, { max: 70, taxa: 1.1518 }, { max: 80, taxa: 2.5724 }])]);
      sheetConf.appendRow(["TAC_FAIXAS_PJ", JSON.stringify([{ max: 50000, taxa: 2.00 }, { max: 100000, taxa: 1.50 }, { max: 500000, taxa: 1.00 }, { max: 999999999, taxa: 0.50 }])]);
      sheetConf.appendRow(["TAC_EXCECOES", JSON.stringify([{ cod: "7669", taxa: 3.00 }, { cod: "7668", taxa: 3.00 }])]); // Ex: PNMPO
      formatarCabecalho(sheetConf, 2);
    }

    let sheetUsuarios = ss.getSheetByName('Usuarios');
    if (!sheetUsuarios) {
      sheetUsuarios = ss.insertSheet('Usuarios');
      const colunasUsuarios = ["Nome", "Email", "Perfil", "Agência", "Status"];
      sheetUsuarios.appendRow(colunasUsuarios);
      sheetUsuarios.appendRow(["Anderson Luiz Traesel Weiss", "anderson.weiss@cresolsicoper.com.br", "ADMIN", "Todas", "Ativo"]);
      formatarCabecalho(sheetUsuarios, colunasUsuarios.length);
    }

    let sheetAssociados = ss.getSheetByName('Associados');
    if (!sheetAssociados) {
      sheetAssociados = ss.insertSheet('Associados');
      const colunasAssociados = ["Nome Coop", "Associado", "Conta", "Score", "Pessoa", "Idade"];
      sheetAssociados.appendRow(colunasAssociados);
      formatarCabecalho(sheetAssociados, colunasAssociados.length);
      const maxCols = sheetAssociados.getMaxColumns();
      if (maxCols > colunasAssociados.length) sheetAssociados.deleteColumns(colunasAssociados.length + 1, maxCols - colunasAssociados.length);
    }

    let sheetModalidades = ss.getSheetByName('modalidades');
    if (!sheetModalidades) {
      sheetModalidades = ss.insertSheet('modalidades');
      const colunasModalidades = ["Perfil", "Código", "Modalidade", "Finalidade", "Parcela", "Carência Máx", "Prazo Máx", "Taxa Baixíssimo", "Taxa Baixo", "Taxa Médio", "Taxa Alto", "Público-Alvo", "Garantia", "Descrição", "Tags", "Amortização"];
      sheetModalidades.appendRow(colunasModalidades);
      formatarCabecalho(sheetModalidades, colunasModalidades.length);
    }

    let sheetLog = ss.getSheetByName('Log Simulacoes');
    if (!sheetLog) {
      sheetLog = ss.insertSheet('Log Simulacoes');
      const colunasLog = ["Data/Hora", "Operador", "Email Operador", "Conta", "Associado", "Modalidade", "Valor Financiado", "Carência (Dias)", "Periodicidade", "Prazo", "Valor TAC", "Valor IOF", "Seguro Prestamista", "Cota Capital", "Outras Custas", "Total de Custas", "Valor Líquido", "Taxa Mínima", "Taxa Efetiva", "1ª Parcela", "Última Parcela", "Agência", "Score", "Tipo Simulação", "Grupo Simulação"];
      sheetLog.appendRow(colunasLog);
      formatarCabecalho(sheetLog, colunasLog.length);
    }

    let sheetAgencias = ss.getSheetByName('Agencias');
    if (!sheetAgencias) {
      sheetAgencias = ss.insertSheet('Agencias');
      const colunasAgencias = ["Nome", "Status"];
      sheetAgencias.appendRow(colunasAgencias);
      sheetAgencias.appendRow(["Agência Sede", "Ativo"]);
      formatarCabecalho(sheetAgencias, colunasAgencias.length);
    }

    let sheetNovidades = ss.getSheetByName('Novidades');
    if (!sheetNovidades) {
      sheetNovidades = ss.insertSheet('Novidades');
      const colunasNovidades = ["Data", "Resumo", "Detalhes", "Autor"];
      sheetNovidades.appendRow(colunasNovidades);
      formatarCabecalho(sheetNovidades, colunasNovidades.length);
      sheetNovidades.appendRow([Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy"), "Sistema de Novidades Implementado!", "Agora você pode acompanhar as melhorias do simulador diretamente na tela principal.", "Agente Antigravity"]);
    }

    let sheetGrupo = ss.getSheetByName('GrupoEconomico');
    if (!sheetGrupo) {
      sheetGrupo = ss.insertSheet('GrupoEconomico');
      const colunasGrupo = ["nr_cpf_cnpj_agrupador", "nr_cpf_cnpj_integrante"];
      sheetGrupo.appendRow(colunasGrupo);
      formatarCabecalho(sheetGrupo, colunasGrupo.length);
      const maxCols = sheetGrupo.getMaxColumns();
      if (maxCols > colunasGrupo.length) sheetGrupo.deleteColumns(colunasGrupo.length + 1, maxCols - colunasGrupo.length);
    }

  } catch (e) { Logger.log("Erro no setup: " + e.message); }
}

function formatarCabecalho(sheet, numColunas) {
  const range = sheet.getRange(1, 1, 1, numColunas);
  range.setFontWeight("bold");
  range.setBackground("#D9EAD3");
  sheet.setFrozenRows(1);
}

// ==========================================
// SEGURANÇA E CONTROLO DE ACESSO
// ==========================================
function verificarAcesso() {
  try {
    const emailLogado = Session.getActiveUser().getEmail();
    if (!emailLogado) return { autorizado: false, erro: "E-mail não identificado." };
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Usuarios');
    const data = sheet.getDataRange().getValues();
    let userFound = null;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === String(emailLogado).trim().toLowerCase()) {
        if (String(data[i][4]).trim().toLowerCase() === "ativo") {
          userFound = { autorizado: true, nome: data[i][0], email: data[i][1], perfil: data[i][2], agencia: data[i][3] };
          break;
        } else { return { autorizado: false, erro: "O seu acesso está INATIVO." }; }
      }
    }
    if (!userFound) return { autorizado: false, erro: `Acesso negado. O e-mail (${emailLogado}) não possui registo.` };

    if (userFound.perfil.toUpperCase() !== "ADMIN") {
      const sheetConf = ss.getSheetByName('Configuracoes');
      if (sheetConf) {
        const dataConf = sheetConf.getDataRange().getValues();
        for (let i = 0; i < dataConf.length; i++) {
          if (dataConf[i][0] === "MANUTENCAO_ATIVA" && String(dataConf[i][1]).trim().toUpperCase() === "SIM") {
            return { autorizado: false, erro: "SISTEMA EM MANUTENÇÃO. Por favor, aguarde alguns instantes." };
          }
        }
      }
    }
    return userFound;
  } catch (e) { return { autorizado: false, erro: "Erro ao validar credenciais: " + e.message }; }
}

function validarAcessoAdmin() {
  const acesso = verificarAcesso();
  if (!acesso.autorizado || String(acesso.perfil).toUpperCase() !== "ADMIN") {
    throw new Error("Acesso negado. Apenas administradores podem executar esta ação.");
  }
}

function alternarModoManutencao(estado) {
  try {
    validarAcessoAdmin();
    setConfigGlobal('MANUTENCAO_ATIVA', estado);
    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function listarUsuarios() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const sheet = ss.getSheetByName('Usuarios'); const data = sheet.getDataRange().getValues(); const usuarios = [];
    for (let i = 1; i < data.length; i++) { usuarios.push({ nome: data[i][0], email: data[i][1], perfil: data[i][2], agencia: data[i][3], status: data[i][4] }); }
    return { sucesso: true, dados: usuarios };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function salvarUsuario(nome, email, perfil, agencia) {
  try {
    validarAcessoAdmin();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const sheet = ss.getSheetByName('Usuarios'); const data = sheet.getDataRange().getValues();
    let emailLower = String(email).trim().toLowerCase(); let linhaEncontrada = -1;
    for (let i = 1; i < data.length; i++) { if (String(data[i][1]).trim().toLowerCase() === emailLower) { linhaEncontrada = i + 1; break; } }
    if (linhaEncontrada !== -1) { sheet.getRange(linhaEncontrada, 1).setValue(nome); sheet.getRange(linhaEncontrada, 3).setValue(perfil); sheet.getRange(linhaEncontrada, 4).setValue(agencia); }
    else { sheet.appendRow([nome, emailLower, perfil, agencia, "Ativo"]); }
    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function alternarStatusUsuario(email) {
  try {
    validarAcessoAdmin();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const sheet = ss.getSheetByName('Usuarios'); const data = sheet.getDataRange().getValues(); let emailLower = String(email).trim().toLowerCase();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === emailLower) {
        let novoStatus = String(data[i][4]).trim() === "Ativo" ? "Inativo" : "Ativo";
        sheet.getRange(i + 1, 5).setValue(novoStatus);
        return { sucesso: true };
      }
    }
    return { sucesso: false, erro: "Utilizador não encontrado." };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function listarAgencias() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const sheet = ss.getSheetByName('Agencias');
    if (!sheet) return { sucesso: true, dados: [] };
    const data = sheet.getDataRange().getValues(); const agencias = [];
    for (let i = 1; i < data.length; i++) { agencias.push({ nome: data[i][0], status: data[i][1] }); }
    return { sucesso: true, dados: agencias };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function salvarAgencia(nome, status = "Ativo") {
  try {
    validarAcessoAdmin();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const sheet = ss.getSheetByName('Agencias');
    if (!sheet) return { sucesso: false, erro: "Aba Agencias não encontrada." };
    const data = sheet.getDataRange().getValues();
    let nomeTrim = String(nome).trim();
    let linhaEncontrada = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === nomeTrim.toLowerCase()) { linhaEncontrada = i + 1; break; }
    }
    if (linhaEncontrada !== -1) {
      sheet.getRange(linhaEncontrada, 1).setValue(nomeTrim); // Corrige case
      sheet.getRange(linhaEncontrada, 2).setValue(status);
    } else {
      sheet.appendRow([nomeTrim, status]);
    }
    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

// ============================================================================
// GESTÃO DINÂMICA DE CONFIGURAÇÕES E MATRIZES
// ==========================================
function setConfigGlobal(chave, valor) {
  try {
    validarAcessoAdmin();
    return _setConfigInterna(chave, valor);
  } catch (e) {
    Logger.log(`[AVISO] Falha ao gravar configuração global (${chave}): ${e.message}`);
    return { sucesso: false, erro: e.message };
  }
}

/**
 * Versão interna de setConfigGlobal — SEM validação de perfil.
 * Usada por triggers automáticos e funções internas de sistema que
 * não possuem sessão de usuário ativa (ex: sincronizarGrupoEconomico,
 * substituirAssociados, etc.).
 */
function _setConfigInterna(chave, valor) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheetConf = ss.getSheetByName('Configuracoes');
    if (!sheetConf) { sheetConf = ss.insertSheet('Configuracoes'); sheetConf.appendRow(["Chave", "Valor"]); }

    let data = sheetConf.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === chave) {
        sheetConf.getRange(i + 1, 2).setValue(valor);
        SpreadsheetApp.flush();
        return { sucesso: true };
      }
    }
    sheetConf.appendRow([chave, valor]);
    SpreadsheetApp.flush();
    return { sucesso: true };
  } catch (e) {
    Logger.log(`[AVISO] Falha ao gravar configuração interna (${chave}): ${e.message}`);
    return { sucesso: false, erro: e.message };
  }
}

function buscarConfiguracoesAdmin() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetMod = ss.getSheetByName('modalidades');
    let tagsUnicas = [];

    if (sheetMod && sheetMod.getLastRow() > 1) {
      const data = sheetMod.getDataRange().getValues();
      const headers = data[0];
      const idxTag = headers.indexOf("Tags");
      if (idxTag !== -1) {
        let todasTags = new Set();
        for (let i = 1; i < data.length; i++) {
          let tagsCell = String(data[i][idxTag]).split(',');
          tagsCell.forEach(t => { let tagLimpa = t.trim(); if (tagLimpa) todasTags.add(tagLimpa); });
        }
        tagsUnicas = Array.from(todasTags).sort();
      }
    }

    const sheetConf = ss.getSheetByName('Configuracoes');
    let ativas = []; let cdi = "10.50";
    let seguroFaixas = []; let tacPJ = []; let tacExc = [];
    let dataAssoc = "Não informada"; let dataMod = "Não informada"; let versaoMod = "N/A";
    let dataGrupo = "Não informada";
    let manutencao = "NÃO";
    let instAssoc, instMod, instEnriq, orientCDI, orientSeguro, orientTAC;

    if (sheetConf) {
      const dataConf = sheetConf.getDataRange().getValues();
      for (let i = 0; i < dataConf.length; i++) {
        if (dataConf[i][0] === "TAGS_ATIVAS") ativas = String(dataConf[i][1]).split(',').map(t => t.trim()).filter(t => t);
        if (dataConf[i][0] === "CDI_ANUAL") cdi = String(dataConf[i][1]);
        if (dataConf[i][0] === "SEGURO_FAIXAS") seguroFaixas = JSON.parse(dataConf[i][1] || "[]");
        if (dataConf[i][0] === "TAC_FAIXAS_PJ") tacPJ = JSON.parse(dataConf[i][1] || "[]");
        if (dataConf[i][0] === "TAC_EXCECOES") tacExc = JSON.parse(dataConf[i][1] || "[]");
        if (dataConf[i][0] === "DATA_ATUALIZACAO_ASSOCIADOS") dataAssoc = String(dataConf[i][1]);
        if (dataConf[i][0] === "DATA_ATUALIZACAO_MODALIDADES") dataMod = String(dataConf[i][1]);
        if (dataConf[i][0] === "DATA_ATUALIZACAO_GRUPO_ECONOMICO") dataGrupo = String(dataConf[i][1]);
        if (dataConf[i][0] === "VERSAO_MODALIDADE") versaoMod = String(dataConf[i][1]);
        if (dataConf[i][0] === "MANUTENCAO_ATIVA") manutencao = String(dataConf[i][1]).trim().toUpperCase();

        // Novos campos de textos de orientação
        if (dataConf[i][0] === "INST_ASSOC") instAssoc = String(dataConf[i][1]);
        if (dataConf[i][0] === "INST_MOD") instMod = String(dataConf[i][1]);
        if (dataConf[i][0] === "INST_ENRIQ") instEnriq = String(dataConf[i][1]);
        if (dataConf[i][0] === "ORIENT_CDI") orientCDI = String(dataConf[i][1]);
        if (dataConf[i][0] === "ORIENT_SEGURO") orientSeguro = String(dataConf[i][1]);
        if (dataConf[i][0] === "ORIENT_TAC") orientTAC = String(dataConf[i][1]);
      }
    }

    // Textos padrão se estiverem vazios
    const t = (val, def) => (val && val !== "undefined" && val !== "") ? val : def;
    const finalInstAssoc = t(instAssoc || "", "1. Acesse o sistema CRM/Relatórios.\n2. Gere o relatório de associados em formato .xlsx.\n3. Certifique-se de que as colunas Conta e Nome estão presentes.");
    const finalInstMod = t(instMod || "", "1. Baixe o catálogo de taxas e modalidades vigente.\n2. Verifique se as taxas estão em formato decimal.\n3. Importe o arquivo para atualizar o simulador.");
    const finalInstEnriq = t(instEnriq || "", "1. Use este campo para colunas extras (ex: Periodicidade).\n2. O arquivo deve conter a coluna 'Código' como chave.\n3. Os dados novos serão mesclados aos existentes.");
    const finalOrientCDI = t(orientCDI || "", "Atualize o CDI sempre que houver alteração na meta Selic pelo COPOM.");
    const finalOrientSeguro = t(orientSeguro || "", "Defina as faixas de idade de acordo com a apólice vigente da cooperativa.");
    const finalOrientTAC = t(orientTAC || "", "Configure o escalonamento da TAC conforme as regras de receita de serviços vigentes.");

    return {
      sucesso: true, disponiveis: tagsUnicas, ativas: ativas, cdi: cdi,
      seguroFaixas: seguroFaixas, tacPJ: tacPJ, tacExc: tacExc,
      dataAssoc: dataAssoc, dataMod: dataMod, dataGrupo: dataGrupo,
      versaoMod: versaoMod, manutencao: manutencao,
      orientacoes: {
        instAssoc: finalInstAssoc, instMod: finalInstMod, instEnriq: finalInstEnriq,
        orientCDI: finalOrientCDI, orientSeguro: finalOrientSeguro, orientTAC: finalOrientTAC
      }
    };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function salvarTextoOrientacao(chave, texto) {
  try {
    validarAcessoAdmin();
    setConfigGlobal(chave, texto);
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

function salvarParametrosFinanceirosAdmin(cdi, seguroFaixas, tacPJ, tacExc) {
  try {
    validarAcessoAdmin();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheetConf = ss.getSheetByName('Configuracoes');
    if (!sheetConf) { sheetConf = ss.insertSheet('Configuracoes'); sheetConf.appendRow(["Chave", "Valor"]); }

    let data = sheetConf.getDataRange().getValues();

    function atualizarOuInserir(chave, valor) {
      let achou = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i][0] === chave) { sheetConf.getRange(i + 1, 2).setValue(valor); achou = true; break; }
      }
      if (!achou) { sheetConf.appendRow([chave, valor]); data.push([chave, valor]); }
    }

    atualizarOuInserir("CDI_ANUAL", cdi);
    atualizarOuInserir("SEGURO_FAIXAS", JSON.stringify(seguroFaixas));
    atualizarOuInserir("TAC_FAIXAS_PJ", JSON.stringify(tacPJ));
    atualizarOuInserir("TAC_EXCECOES", JSON.stringify(tacExc));

    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function salvarTagsAdmin(tagsArray) {
  try {
    validarAcessoAdmin();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheetConf = ss.getSheetByName('Configuracoes');
    let data = sheetConf.getDataRange().getValues();
    let achou = false; let stringTags = tagsArray.join(', ');
    for (let i = 0; i < data.length; i++) { if (data[i][0] === "TAGS_ATIVAS") { sheetConf.getRange(i + 1, 2).setValue(stringTags); achou = true; break; } }
    if (!achou) sheetConf.appendRow(["TAGS_ATIVAS", stringTags]);
    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

// ==========================================
// FUNÇÕES DE PESQUISA E SIMULAÇÃO
// ==========================================
// ==========================================
// BUSCAR DADOS DO ASSOCIADO (ULTRARRÁPIDO, INTELIGENTE E COM NORMALIZAÇÃO)
/**
 * Busca a composição societária de um CNPJ, cruzando com a aba Associados para obter a idade.
 * @param {string} cnpj CNPJ a ser buscado.
 * @returns {Array} Lista de sócios contendo cpf, percentual e idade.
 */
function buscarSociosPorCnpj(cnpj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetComp = ss.getSheetByName('ComposicaoSocietaria');
    if (!sheetComp) return [];

    const dataComp = sheetComp.getDataRange().getValues();
    if (dataComp.length <= 1) return [];

    const headersComp = dataComp[0];
    const idxCnpj = headersComp.findIndex(h => String(h).toUpperCase().includes('CNPJ'));
    const idxCpf = headersComp.findIndex(h => String(h).toUpperCase().includes('CPF'));
    const idxPerc = headersComp.findIndex(h => String(h).toUpperCase().includes('PERCENTUAL'));

    if (idxCnpj === -1 || idxCpf === -1 || idxPerc === -1) return [];

    const cleanCnpj = String(cnpj).replace(/\D/g, '');
    let sociosEncontrados = [];

    for (let i = 1; i < dataComp.length; i++) {
      let rowCnpj = String(dataComp[i][idxCnpj]).replace(/\D/g, '');
      if (rowCnpj === cleanCnpj) {
        sociosEncontrados.push({
          cpf: String(dataComp[i][idxCpf]).trim(),
          percentual: parseFloat(String(dataComp[i][idxPerc]).replace(',', '.')) || 0,
          idade: 0
        });
      }
    }

    if (sociosEncontrados.length === 0) return [];

    const sheetAssoc = ss.getSheetByName('Associados');
    if (sheetAssoc) {
      const dataAssoc = sheetAssoc.getDataRange().getValues();
      const headersAssoc = dataAssoc[0];
      const aIdxCpf = headersAssoc.findIndex(h => String(h).toUpperCase().includes('CPF') || String(h).toUpperCase().includes('CNPJ'));
      const aIdxIdade = headersAssoc.findIndex(h => String(h).toUpperCase().includes('IDADE'));

      if (aIdxCpf !== -1 && aIdxIdade !== -1) {
        sociosEncontrados.forEach(socio => {
          let cleanCpf = socio.cpf.replace(/\D/g, '');
          for (let i = 1; i < dataAssoc.length; i++) {
            let rowCpf = String(dataAssoc[i][aIdxCpf]).replace(/\D/g, '');
            if (rowCpf === cleanCpf) {
              socio.idade = parseInt(dataAssoc[i][aIdxIdade]) || 0;
              break;
            }
          }
        });
      }
    }

    return sociosEncontrados;
  } catch (e) {
    Logger.log("Erro em buscarSociosPorCnpj: " + e.message);
    return [];
  }
}

// ==========================================
// ==========================================
function buscarAssociado(contaBusca) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Associados');
    if (!sheet) return { sucesso: false, erro: "Aba de Associados não encontrada." };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { sucesso: false, erro: "Base de associados está vazia." };

    const headers = data[0];

    // 1. Busca da Conta
    const idxConta = headers.findIndex(h => String(h).toUpperCase().trim() === 'CONTA' || String(h).toUpperCase().includes('CONTA'));

    // 2. CORREÇÃO: Busca do Nome Inteligente e Segura
    // Primeiro tenta achar os nomes exatos das colunas padrão
    let idxNome = headers.findIndex(h => {
      let str = String(h).toUpperCase().trim();
      return str === 'ASSOCIADO' || str === 'NOME DO ASSOCIADO' || str === 'NOME COMPLETO' || str === 'NOME';
    });

    // Se não achar o nome exato, faz a busca parcial, mas EXCLUI as colunas de "Nome Coop" e "Nome Agência"
    if (idxNome === -1) {
      idxNome = headers.findIndex(h => {
        let str = String(h).toUpperCase();
        return (str.includes('NOME') || str.includes('ASSOCIADO')) &&
          !str.includes('COOP') && !str.includes('AGÊNCIA') && !str.includes('AGENCIA');
      });
    }

    // Busca das outras variáveis
    const idxIdade = headers.findIndex(h => String(h).toUpperCase().includes('IDADE') || String(h).toUpperCase().includes('NASCIMENTO'));
    const idxPessoa = headers.findIndex(h => String(h).toUpperCase().includes('TIPO') && String(h).toUpperCase().includes('PESSOA'));
    const idxMei = headers.findIndex(h => String(h).toUpperCase().includes('MEI'));
    const idxSimples = headers.findIndex(h => String(h).toUpperCase().includes('SIMPLES'));
    const idxScore = headers.findIndex(h => String(h).toUpperCase().includes('SCORE'));
    const idxCpfCnpj = headers.findIndex(h => String(h).toUpperCase().includes('CPF'));
    const idxRenda = headers.findIndex(h => String(h).toUpperCase().includes('RENDA') && !String(h).toUpperCase().includes('DATA'));
    const idxDataRenda = headers.findIndex(h => String(h).toUpperCase().includes('DATA') && String(h).toUpperCase().includes('RENDA') || String(h).toUpperCase().includes('ATUALIZACAO'));
    const idxColab = headers.findIndex(h => String(h).toUpperCase().includes('COLABORADOR'));
    const idxEndivCP = headers.findIndex(h => String(h).toUpperCase().includes('CURTO'));
    const idxEndivTot = headers.findIndex(h => String(h).toUpperCase().includes('ENDIV') && String(h).toUpperCase().includes('TOTAL'));

    if (idxConta === -1) return { sucesso: false, erro: "Coluna 'Conta' não encontrada na base de dados." };

    // Higienizador de dados (Trata datas e nulos)
    const limparDado = (valor) => {
      if (valor instanceof Date) {
        let d = valor.getDate(); let m = valor.getMonth() + 1; let y = valor.getFullYear();
        return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${y}`;
      }
      return valor == null ? "" : String(valor).trim();
    };

    let contaProcurada = String(contaBusca).trim();

    // Varre a base
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idxConta]).trim() === contaProcurada) {
        let result = {
          sucesso: true,
          nome: idxNome !== -1 ? limparDado(data[i][idxNome]) : "Nome Indisponível",
          idade: idxIdade !== -1 ? limparDado(data[i][idxIdade]) : "",
          // Normalização semântica: garante 'PF'/'PJ' e 'SIM'/'NÃO'
          pessoa: idxPessoa !== -1 ? _normalizarPessoa(data[i][idxPessoa]) : "PF",
          mei: idxMei !== -1 ? _normalizarBoolean(data[i][idxMei]) : "NÃO",
          simples: idxSimples !== -1 ? _normalizarBoolean(data[i][idxSimples]) : "NÃO",
          score: idxScore !== -1 ? limparDado(data[i][idxScore]) : "",
          cpfCnpj: idxCpfCnpj !== -1 ? limparDado(data[i][idxCpfCnpj]) : "",
          renda: idxRenda !== -1 ? limparDado(data[i][idxRenda]) : "",
          dataRenda: idxDataRenda !== -1 ? limparDado(data[i][idxDataRenda]) : "",
          colaborador: idxColab !== -1 ? _normalizarBoolean(data[i][idxColab]) : "NÃO",
          endivCP: idxEndivCP !== -1 ? limparDado(data[i][idxEndivCP]) : "",
          endivTotal: idxEndivTot !== -1 ? limparDado(data[i][idxEndivTot]) : ""
        };

        if (result.pessoa === 'PJ' && result.cpfCnpj) {
          result.sociosPJ = buscarSociosPorCnpj(result.cpfCnpj);
        }

        if (result.cpfCnpj) {
          // T2: passa ss já aberto para buscarGrupoEconomico
          result.grupoEconomico = buscarGrupoEconomico(result.cpfCnpj, ss);
        }

        return result;
      }
    }

    return { sucesso: false, erro: "Conta não encontrada na base." };
  } catch (e) {
    return { sucesso: false, erro: "Erro no servidor: " + e.message };
  }
}

// ==========================================
// MÓDULOS DE IMPORTAÇÃO E ENRIQUECIMENTO
// ==========================================
// ==========================================
// IMPORTAÇÃO DE ASSOCIADOS (RECEBE CARGA LEVE DO FRONTEND)
// ==========================================
function substituirAssociados(dadosFiltrados) {
  try {
    validarAcessoAdmin();
    if (!dadosFiltrados || dadosFiltrados.length === 0) return { sucesso: false, erro: "Sem dados para gravar." };

    const TAMANHO_LOTE = 5000; // Máximo de linhas por lote para não exceder o tempo do Apps Script
    const totalLinhas = dadosFiltrados.length;
    const neededCols = dadosFiltrados[0].length;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Associados');
    if (!sheet) {
      sheet = ss.insertSheet('Associados');
    }

    // Deleta e recria a aba para garantir dimensões mínimas a cada sync.
    // sheet.clear() não redimensiona a aba — linhas alocadas historicamente
    // acumulam e podem ultrapassar o limite de 10M células do Sheets.
    const pos = sheet.getIndex() - 1;
    ss.deleteSheet(sheet);
    sheet = ss.insertSheet('Associados', pos);

    // Redimensionar colunas excedentes
    const maxCols = sheet.getMaxColumns();
    if (maxCols > neededCols) {
      sheet.deleteColumns(neededCols + 1, maxCols - neededCols);
    }

    // Alocar todas as linhas necessárias de uma só vez antes de gravar
    const maxRows = sheet.getMaxRows();
    if (totalLinhas > maxRows) {
      sheet.insertRowsAfter(maxRows, totalLinhas - maxRows);
    }
    SpreadsheetApp.flush(); // Garante que a estrutura seja processada antes de gravar

    // Gravação em lotes para evitar timeout com grandes volumes (~54k linhas)
    let linhaInicio = 1;
    while (linhaInicio <= totalLinhas) {
      const lote = dadosFiltrados.slice(linhaInicio - 1, linhaInicio - 1 + TAMANHO_LOTE);
      sheet.getRange(linhaInicio, 1, lote.length, neededCols).setValues(lote);
      SpreadsheetApp.flush(); // Força o Sheets a processar o lote antes do próximo
      linhaInicio += TAMANHO_LOTE;
    }

    _setConfigInterna('DATA_ATUALIZACAO_ASSOCIADOS', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"));

    return { sucesso: true, linhas: totalLinhas - 1 };
  } catch (e) {
    return { sucesso: false, erro: "Erro no servidor ao gravar: " + e.message };
  }
}


/**
 * FALLBACK MANUAL — Atualiza colunas MEI e Simples diretamente na aba Associados.
 * Recebe array 2D com colunas [OptanteMei, bl_optante_simples_nacional, nr_contacorrente].
 * Usado como alternativa quando o Sync Automático não está disponível.
 * (Anteriormente: substituirDadosPJ — agora aponta para Associados)
 */
function atualizarMeiSimplesNaAssociados(dados2D) {
  try {
    validarAcessoAdmin();
    if (!dados2D || dados2D.length < 2) return { sucesso: false, erro: "Nenhum dado recebido." };
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Associados');
    if (!sheet) return { sucesso: false, erro: "Aba 'Associados' não encontrada." };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idxConta = headers.findIndex(h => String(h).toUpperCase().includes('CONTA'));
    const idxMei = headers.findIndex(h => String(h).toUpperCase().includes('MEI'));
    const idxSimples = headers.findIndex(h => String(h).toUpperCase().includes('SIMPLES'));

    if (idxConta === -1 || idxMei === -1 || idxSimples === -1) {
      return { sucesso: false, erro: "Colunas MEI, Simples ou Conta não encontradas na aba Associados." };
    }

    // Monta mapa conta → {mei, simples} a partir dos dados recebidos
    // Espera cabeçalho na linha 0: [OptanteMei, bl_optante_simples_nacional, nr_contacorrente]
    const mapa = {};
    for (let i = 1; i < dados2D.length; i++) {
      const mei = String(dados2D[i][0]).trim();
      const simples = String(dados2D[i][1]).trim();
      const conta = String(dados2D[i][2]).trim();
      if (conta) mapa[conta] = { mei, simples };
    }

    let atualizados = 0;
    for (let i = 1; i < data.length; i++) {
      const conta = String(data[i][idxConta]).trim();
      if (mapa[conta]) {
        sheet.getRange(i + 1, idxMei + 1).setValue(mapa[conta].mei);
        sheet.getRange(i + 1, idxSimples + 1).setValue(mapa[conta].simples);
        atualizados++;
      }
    }

    _setConfigInterna('DATA_ATUALIZACAO_ASSOCIADOS', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"));
    return { sucesso: true, linhas: atualizados };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}


function substituirModalidades(dados2D) {
  try {
    validarAcessoAdmin();
    if (!dados2D || dados2D.length === 0) return { sucesso: false, erro: "Nenhum dado recebido." };
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const sheet = ss.getSheetByName('modalidades'); if (!sheet) return { sucesso: false, erro: "Aba 'modalidades' não encontrada." };
    sheet.clear();

    let versaoExtraida = "Versão não identificada";
    let idxHeaderOffset = -1;
    for (let r = 0; r < Math.min(dados2D.length, 10); r++) {
      for (let c = 0; c < dados2D[r].length; c++) {
        if (!dados2D[r][c]) continue;
        let celula = String(dados2D[r][c]).toUpperCase();
        if (celula.includes("VERSÃO") || celula.includes("VERSAO")) {
          let match = celula.match(/(VERS[ÃA]O\s*[\d\.]+\s*\|\s*VIG[ÊE]NCIA[^\n]+)/i);
          if (match) versaoExtraida = match[1].trim();
          else {
            let matchFallback = celula.match(/(VERS[ÃA]O[^\n]+)/i);
            if (matchFallback) versaoExtraida = matchFallback[1].trim();
          }
        }
        if (celula.includes("MODALIDADE") && idxHeaderOffset === -1) {
          idxHeaderOffset = r;
        }
      }
    }

    let targetMapping = [];
    if (idxHeaderOffset !== -1) {
      const headerRow = dados2D[idxHeaderOffset].map(c => String(c).toUpperCase().trim());
      targetMapping[0] = headerRow.findIndex(h => h.includes("PERFIL"));
      targetMapping[1] = headerRow.findIndex(h => h.includes("CÓD") || h.includes("COD"));
      targetMapping[2] = headerRow.findIndex(h => h.includes("MODALIDADE"));
      targetMapping[3] = headerRow.findIndex(h => h.includes("FINALIDADE"));
      targetMapping[4] = headerRow.findIndex(h => h.includes("PARCELA"));
      targetMapping[5] = headerRow.findIndex(h => h.includes("CARÊNCIA") || h.includes("CARENCIA"));
      targetMapping[6] = headerRow.findIndex(h => h.includes("PRAZO"));
      targetMapping[7] = headerRow.findIndex(h => h.includes("BAIXÍSSIMO") || h.includes("BAIXISSIMO"));
      targetMapping[8] = headerRow.findIndex(h => h.includes("BAIXO") && !h.includes("BAIXÍSSIMO") && !h.includes("BAIXISSIMO"));
      targetMapping[9] = headerRow.findIndex(h => h.includes("MÉDIO") || h.includes("MEDIO"));
      targetMapping[10] = headerRow.findIndex(h => h.includes("ALTO"));
      targetMapping[11] = headerRow.findIndex(h => h.includes("PÚBLICO") || h.includes("PUBLICO"));
      targetMapping[12] = headerRow.findIndex(h => h.includes("GARANTIA"));
      targetMapping[13] = headerRow.findIndex(h => h.includes("DESCRIÇÃO") || h.includes("DESCRICAO") || h.includes("OBS"));
      targetMapping[14] = headerRow.findIndex(h => h.includes("TAGS"));
      targetMapping[15] = headerRow.findIndex(h => h.includes("AMORTIZAÇÃO") || h.includes("AMORTIZACAO"));
    } else {
      for (let i = 0; i < 16; i++) targetMapping[i] = i;
    }

    let dadosLimpos = idxHeaderOffset !== -1 ? dados2D.slice(idxHeaderOffset + 1) : dados2D;
    // O filtro procura a coluna designada para CODIGO (targetMapping[1]) ou MODALIDADE (targetMapping[2])
    let idxCod = targetMapping[1] !== -1 ? targetMapping[1] : 1;
    let idxMod = targetMapping[2] !== -1 ? targetMapping[2] : 2;
    dadosLimpos = dadosLimpos.filter(linha => (linha[idxCod] && String(linha[idxCod]).trim()) || (linha[idxMod] && String(linha[idxMod]).trim()));

    const headersBase = ["Perfil", "Código", "Modalidade", "Finalidade", "Parcela", "Carência Máx", "Prazo Máx", "Taxa Baixíssimo", "Taxa Baixo", "Taxa Médio", "Taxa Alto", "Público-Alvo", "Garantia", "Descrição", "Tags", "Amortização"];
    let dadosFormatados = [headersBase];

    dadosLimpos.forEach((linha) => {
      let novaLinha = [];
      for (let i = 0; i < 16; i++) {
        let colIdx = targetMapping[i];
        if (colIdx !== -1 && colIdx < linha.length) {
          novaLinha.push(linha[colIdx]);
        } else {
          novaLinha.push("");
        }
      }
      dadosFormatados.push(novaLinha);
    });

    sheet.getRange(1, 1, dadosFormatados.length, 16).setValues(dadosFormatados); formatarCabecalho(sheet, 16);

    _setConfigInterna('DATA_ATUALIZACAO_MODALIDADES', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"));
    _setConfigInterna('VERSAO_MODALIDADE', versaoExtraida);

    return { sucesso: true, linhas: dadosFormatados.length - 1 };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

// ==========================================
// ENRIQUECIMENTO MANUAL DE MODALIDADES (ATUALIZADO)
// ==========================================
function enriquecerModalidades(dados) {
  try {
    validarAcessoAdmin();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Modalidades');
    if (!sheet) return { sucesso: false, erro: "Aba 'Modalidades' não encontrada no banco de dados." };

    const sheetData = sheet.getDataRange().getValues();
    if (sheetData.length <= 1) return { sucesso: false, erro: "A Base de Modalidades está vazia." };

    const sheetHeaders = sheetData[0];
    const uploadHeaders = dados[0];

    // Procura onde está a coluna "Código" no ficheiro Excel enviado
    const idxCodUpload = uploadHeaders.findIndex(h => String(h).toUpperCase().trim() === 'CÓDIGO' || String(h).toUpperCase().trim() === 'CODIGO');
    if (idxCodUpload === -1) return { sucesso: false, erro: "Coluna 'Código' não encontrada no ficheiro de upload." };

    // Procura onde está a coluna "Código" na base de dados (Planilha)
    const idxCodSheet = sheetHeaders.findIndex(h => String(h).toUpperCase().trim() === 'CÓDIGO' || String(h).toUpperCase().trim() === 'CODIGO');
    if (idxCodSheet === -1) return { sucesso: false, erro: "A coluna 'Código' sumiu da aba Modalidades." };

    // Mapeia todas as colunas que vieram no ficheiro de enriquecimento (exceto o Código)
    const colunasEnriquecimento = [];
    for (let i = 0; i < uploadHeaders.length; i++) {
      if (i !== idxCodUpload && String(uploadHeaders[i]).trim() !== "") {
        colunasEnriquecimento.push({ name: String(uploadHeaders[i]).trim(), indexUpload: i });
      }
    }

    // Verifica se as colunas novas (ex: Periodicidades, Regras IOF) existem na Planilha. Se não, cria-as!
    colunasEnriquecimento.forEach(col => {
      let idxSheet = sheetHeaders.indexOf(col.name);
      if (idxSheet === -1) {
        // Cria o novo cabeçalho na última coluna vazia
        sheet.getRange(1, sheetHeaders.length + 1).setValue(col.name);
        sheetHeaders.push(col.name);
        col.indexSheet = sheetHeaders.length - 1;
      } else {
        col.indexSheet = idxSheet;
      }
    });

    let linhasAtualizadas = 0;

    // Percorre as linhas do ficheiro enviado
    for (let i = 1; i < dados.length; i++) {
      let rowUpload = dados[i];
      let codUpload = String(rowUpload[idxCodUpload]).trim();
      if (!codUpload) continue;

      // Procura a modalidade correspondente na base de dados
      for (let j = 1; j < sheetData.length; j++) {
        if (String(sheetData[j][idxCodSheet]).trim() === codUpload) {

          // Atualiza as células com as novas informações
          colunasEnriquecimento.forEach(col => {
            let valor = rowUpload[col.indexUpload];
            // Só atualiza se o Excel enviado tiver algum valor escrito (não apaga dados antigos se a célula vier vazia)
            if (valor !== undefined && valor !== "") {
              sheet.getRange(j + 1, col.indexSheet + 1).setValue(valor);
            }
          });

          linhasAtualizadas++;
          // Sem break: continua a varrer para enriquecer TODAS as linhas com o mesmo código
        }
      }
    }

    return { sucesso: true, linhas: linhasAtualizadas };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

// ==========================================
// REGISTRO DE LOGS DE SIMULAÇÃO (ATUALIZADO)
// ==========================================
function registrarLogSimulacao(dados) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetLog = ss.getSheetByName('Log Simulacoes');
    if (!sheetLog) return { sucesso: false, erro: "Aba de Log não encontrada." };

    const dataHora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    const emailOperador = Session.getActiveUser().getEmail();

    const linha = [
      dataHora,
      dados.operador,
      emailOperador,
      dados.conta,
      dados.nomeAssociado,
      dados.modalidade,
      dados.valorFinanciado,
      dados.carencia,
      dados.periodicidade,
      dados.prazo,
      dados.tac,
      dados.iof,
      dados.seguro,
      dados.cota,
      dados.custas,
      dados.totalCustas,
      dados.valorLiquido,
      dados.taxaMinima,
      dados.taxaEfetiva,
      dados.primeiraParcela, // Coluna T
      dados.ultimaParcela,    // Coluna U
      dados.agencia,         // Coluna V
      dados.score,           // Coluna W
      dados.tipoSimulacao || "SIMPLES", // Coluna X: SIMPLES | COMPOSTA | LOTE_PRAZOS | LOTE_MODALIDADES
      dados.grupoSimulacao || ""        // Coluna Y: ID de grupo para simulações especiais
    ];

    sheetLog.appendRow(linha);
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

// ==========================================
// BUSCAR HISTÓRICO DE SIMULAÇÕES (COM CONTROLE DE ACESSO)
// ==========================================
// ==========================================
// BUSCAR HISTÓRICO DE SIMULAÇÕES (CORREÇÃO DE DATAS E COMUNICAÇÃO)
// ==========================================
function buscarHistoricoSimulacoes() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetLog = ss.getSheetByName('Log Simulacoes');
    if (!sheetLog) return { sucesso: false, erro: "Aba 'Log Simulacoes' não encontrada." };

    const data = sheetLog.getDataRange().getDisplayValues();
    if (data.length <= 1) return { sucesso: true, dados: [], perfil: "AGÊNCIA" };

    const emailUsuario = Session.getActiveUser().getEmail();
    let perfilAtual = "AGÊNCIA";
    let agenciaAtual = "Legado";
    const sheetUsers = ss.getSheetByName('Usuarios');
    if (sheetUsers) {
      const usersData = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < usersData.length; i++) {
        if (String(usersData[i][1]).trim().toLowerCase() === emailUsuario.toLowerCase() && String(usersData[i][4]).trim().toLowerCase() === 'ativo') {
          perfilAtual = String(usersData[i][2]).trim().toUpperCase();
          agenciaAtual = String(usersData[i][3]).trim();
          break;
        }
      }
    }

    const logs = [];
    for (let i = data.length - 1; i >= 1; i--) {
      let row = data[i];
      if (perfilAtual === "AGÊNCIA" && String(row[21] || "Legado").trim() !== agenciaAtual) continue;

      logs.push({
        dataHora: row[0], operador: row[1], email: row[2], conta: row[3], nomeAssociado: row[4],
        modalidade: row[5], valorFinanciado: row[6], carencia: row[7], periodicidade: row[8],
        prazo: row[9], tac: row[10], iof: row[11], seguro: row[12], cota: row[13],
        custas: row[14], totalCustas: row[15], valorLiquido: row[16], taxaMinima: row[17], taxaEfetiva: row[18],
        primeiraParcela: row[19] || "---",
        ultimaParcela: row[20] || "---",
        agencia: row[21] || "Legado",
        score: row[22] || "Sem Score",
        tipoSimulacao: row[23] || "SIMPLES",  // Coluna X
        grupoSimulacao: row[24] || ""          // Coluna Y
      });
    }
    return { sucesso: true, dados: logs, perfil: perfilAtual };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

/**
 * Função de Ajuste Único: Recupera a agência de logs antigos baseando-se no e-mail do operador.
 */
function ajusteRetroativoAgencias() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetLog = ss.getSheetByName('Log Simulacoes');
    const sheetUsers = ss.getSheetByName('Usuarios');

    if (!sheetLog || !sheetUsers) return "Abas necessárias não encontradas.";

    const logs = sheetLog.getRange(1, 1, sheetLog.getLastRow(), 22).getValues();
    const users = sheetUsers.getRange(1, 1, sheetUsers.getLastRow(), 4).getValues();

    // Criar um mapa de Email -> Agência para busca rápida
    const mapaAgencias = {};
    for (let i = 1; i < users.length; i++) {
      let email = String(users[i][1]).trim().toLowerCase();
      let agencia = String(users[i][3]).trim();
      if (email) mapaAgencias[email] = agencia;
    }

    let logsAtualizados = 0;
    const numLinhas = logs.length;

    for (let i = 1; i < numLinhas; i++) {
      let logEmail = String(logs[i][2]).trim().toLowerCase(); // Coluna C (Índice 2)
      let logAgenciaAtual = String(logs[i][21] || "").trim(); // Coluna V (Índice 21)

      if (!logAgenciaAtual || logAgenciaAtual === "Legado") {
        if (mapaAgencias[logEmail]) {
          sheetLog.getRange(i + 1, 22).setValue(mapaAgencias[logEmail]); // Escreve na coluna V (22)
          logsAtualizados++;
        }
      }
    }

    return `Ajuste concluído. ${logsAtualizados} registros atualizados.`;
  } catch (e) {
    return "Erro no ajuste: " + e.message;
  }
}

// ==========================================
// BUSCAR CATÁLOGO DE MODALIDADES (CORREÇÃO DE TAGS E LEITURA INFINITA BLINDADA)
// ==========================================
function buscarModalidadesGlobais() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Modalidades');
    if (!sheet) return { sucesso: false, erro: "Aba 'Modalidades' não encontrada." };

    // CORREÇÃO MESTRA: getDisplayValues() força a leitura como texto puro, 
    // evitando crashes silenciosos com datas ou formatações do Excel
    const data = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) return { sucesso: false, dados: [] };

    const headers = data[0];
    const modalidades = [];

    // Leitura dinâmica infinita de colunas
    for (let i = 1; i < data.length; i++) {
      let row = data[i];
      let obj = {};

      for (let j = 0; j < headers.length; j++) {
        let colName = String(headers[j]).trim();
        if (colName) {
          obj[colName] = row[j];
        }
      }

      // Só adiciona se a linha tiver um Código válido
      if (obj['Código'] || obj['Codigo']) {
        modalidades.push(obj);
      }
    }

    // Busca das Tags Globais Ativas
    let tagsAtivas = [];
    try {
      const config = buscarConfiguracoesAdmin();
      if (config && config.ativas) {
        tagsAtivas = config.ativas;
      }
    } catch (errTag) {
      // Fallback silencioso
    }

    return { sucesso: true, dados: modalidades, configGlobais: { ativas: tagsAtivas } };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

// ==========================================
// ==========================================
// PESQUISA AVANÇADA POR NOME (PARA O POP-UP)
// ==========================================
function pesquisarNomeAssociado(termo) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Associados');
    if (!sheet) return { sucesso: false, erro: "Aba de Associados não encontrada." };

    const termoUpper = String(termo).toUpperCase().trim();
    if (termoUpper.length < 3) return { sucesso: false, erro: "Digite pelo menos 3 letras para pesquisar." };

    const totalLinhas = sheet.getLastRow();
    if (totalLinhas < 2) return { sucesso: true, dados: [] };

    // FASE 1 — Lê 9 colunas para pegar também o CPF/CNPJ (índice 8)
    // [0]=Nome Coop, [1]=Associado, [2]=Conta, [3]=Score, [4]=Tipo Pessoa, [5]=Idade, [6]=MEI, [7]=Simples, [8]=CPF/CNPJ
    const bloco = sheet.getRange(2, 1, totalLinhas - 1, 9).getValues();

    const resultados = [];
    for (let i = 0; i < bloco.length; i++) {
      const nomeCelula = String(bloco[i][1] || '').toUpperCase();
      if (nomeCelula.includes(termoUpper)) {
        resultados.push({
          linhaSheet: i + 2,                          // linha real no Sheets (1-indexed + cabeçalho)
          nome: String(bloco[i][1] || 'Nome Indisponível'),
          conta: String(bloco[i][2] || ''),
          score: String(bloco[i][3] || ''),
          pessoa: _normalizarPessoa(bloco[i][4]),
          documento: String(bloco[i][8] || '')       // CPF/CNPJ
        });
        if (resultados.length >= 100) break;
      }
    }

    return { sucesso: true, dados: resultados };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

// ==========================================
// BUSCA DE ASSOCIADO POR NÚMERO DE LINHA (Fase 2)
// ==========================================
function buscarAssociadoPorLinha(linhaNum) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Associados');
    if (!sheet) return { sucesso: false, erro: "Aba de Associados não encontrada." };

    const numCols = sheet.getLastColumn();
    if (numCols === 0) return { sucesso: false, erro: "Aba Associados vazia." };

    const headers = sheet.getRange(1, 1, 1, numCols).getValues()[0];
    const row = sheet.getRange(linhaNum, 1, 1, numCols).getValues()[0];

    const limparDado = (valor) => {
      if (valor instanceof Date) {
        let d = valor.getDate(); let m = valor.getMonth() + 1; let y = valor.getFullYear();
        return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${y}`;
      }
      return valor == null ? "" : String(valor).trim();
    };

    const idxNome = headers.findIndex(h => { const s = String(h).toUpperCase().trim(); return s === 'ASSOCIADO' || s === 'NOME DO ASSOCIADO' || s === 'NOME COMPLETO' || s === 'NOME'; });
    const idxConta = headers.findIndex(h => String(h).toUpperCase().includes('CONTA'));
    const idxScore = headers.findIndex(h => String(h).toUpperCase().includes('SCORE'));
    const idxIdade = headers.findIndex(h => String(h).toUpperCase().includes('IDADE') || String(h).toUpperCase().includes('NASCIMENTO'));
    const idxPessoa = headers.findIndex(h => String(h).toUpperCase().includes('TIPO') && String(h).toUpperCase().includes('PESSOA'));
    const idxMei = headers.findIndex(h => String(h).toUpperCase().includes('MEI'));
    const idxSimples = headers.findIndex(h => String(h).toUpperCase().includes('SIMPLES'));
    const idxCpf = headers.findIndex(h => String(h).toUpperCase().includes('CPF'));
    const idxRenda = headers.findIndex(h => String(h).toUpperCase().includes('RENDA') && !String(h).toUpperCase().includes('DATA'));
    const idxDtRenda = headers.findIndex(h => (String(h).toUpperCase().includes('DATA') && String(h).toUpperCase().includes('RENDA')) || String(h).toUpperCase().includes('ATUALIZACAO'));
    const idxColab = headers.findIndex(h => String(h).toUpperCase().includes('COLABORADOR'));
    const idxEndivCP = headers.findIndex(h => String(h).toUpperCase().includes('CURTO'));
    const idxEndivTt = headers.findIndex(h => String(h).toUpperCase().includes('ENDIV') && String(h).toUpperCase().includes('TOTAL'));

    let result = {
      sucesso: true,
      nome: idxNome !== -1 ? limparDado(row[idxNome]) : "Nome Indisponível",
      conta: idxConta !== -1 ? limparDado(row[idxConta]) : "",
      score: idxScore !== -1 ? limparDado(row[idxScore]) : "",
      idade: idxIdade !== -1 ? limparDado(row[idxIdade]) : "",
      pessoa: idxPessoa !== -1 ? _normalizarPessoa(row[idxPessoa]) : "PF",
      mei: idxMei !== -1 ? _normalizarBoolean(row[idxMei]) : "NÃO",
      simples: idxSimples !== -1 ? _normalizarBoolean(row[idxSimples]) : "NÃO",
      cpfCnpj: idxCpf !== -1 ? limparDado(row[idxCpf]) : "",
      renda: idxRenda !== -1 ? limparDado(row[idxRenda]) : "",
      dataRenda: idxDtRenda !== -1 ? limparDado(row[idxDtRenda]) : "",
      colaborador: idxColab !== -1 ? _normalizarBoolean(row[idxColab]) : "NÃO",
      endivCP: idxEndivCP !== -1 ? limparDado(row[idxEndivCP]) : "",
      endivTotal: idxEndivTt !== -1 ? limparDado(row[idxEndivTt]) : ""
    };

    if (result.pessoa === 'PJ' && result.cpfCnpj) {
      result.sociosPJ = buscarSociosPorCnpj(result.cpfCnpj);
    }

    if (result.cpfCnpj) {
      // T2: passa ss já aberto para buscarGrupoEconomico
      result.grupoEconomico = buscarGrupoEconomico(result.cpfCnpj, ss);
    }

    return result;
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

// ==========================================
// GESTÃO DE NOVIDADES E MELHORIAS
// ==========================================
function buscarNovidades() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Novidades');
    if (!sheet) return { sucesso: true, dados: [] };

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length <= 1) return { sucesso: true, dados: [] };

    const novidades = [];
    // Retorna do mais recente para o mais antigo
    for (let i = data.length - 1; i >= 1; i--) {
      novidades.push({
        data: data[i][0],
        resumo: data[i][1],
        detalhes: data[i][2],
        autor: data[i][3]
      });
    }
    return { sucesso: true, dados: novidades };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

function registrarNovidade(resumo, detalhes) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Novidades');
    if (!sheet) {
      sheet = ss.insertSheet('Novidades');
      sheet.appendRow(["Data", "Resumo", "Detalhes", "Autor"]);
      formatarCabecalho(sheet, 4);
    }

    const emailOperador = Session.getActiveUser().getEmail();
    let nomeAutor = emailOperador;

    // Tenta buscar o nome do autor na base de usuários
    const sheetUsers = ss.getSheetByName('Usuarios');
    if (sheetUsers) {
      const usersData = sheetUsers.getDataRange().getValues();
      for (let i = 1; i < usersData.length; i++) {
        if (String(usersData[i][1]).trim().toLowerCase() === emailOperador.toLowerCase()) {
          nomeAutor = usersData[i][0];
          break;
        }
      }
    }

    const dataHoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
    sheet.appendRow([dataHoje, resumo, detalhes, nomeAutor]);
    return { sucesso: true };
  } catch (e) { return { sucesso: false, erro: e.message }; }
}

// ============================================================================
// SINCRONIZAÇÃO AUTOMÁTICA — BI → GOOGLE DRIVE CSV → GOOGLE SHEETS
// Implementado em: 2026-06-03
// Plano: Rotina Agendada (Sync Noturno) com horário configurável via Admin
// ============================================================================

// --- CONFIGURAÇÕES DO SYNC ---
const SYNC_CONFIG = {
  // ID do arquivo CSV no Google Drive (fixo — não requer alteração)
  CSV_FILE_ID: '15jGftcqh9h9-5p5LN1-LFkUr6M8wQl0q',

  // Separador do CSV
  CSV_SEPARATOR: ',',

  // Encoding do CSV
  CSV_ENCODING: 'UTF-8',

  // Mapeamento exato das colunas do CSV para os campos do simulador
  COLUNAS: {
    conta: 'nr_conta_corrente',
    nome: 'nm_nome',
    nascimento: 'dt_nascimento',             // Data de nascimento → calcular idade
    pessoa: 'ds_pessoa_tipo',             // 'F' → 'PF' | 'J' → 'PJ'
    mei: 'bl_optante_mei',             // '1' → 'SIM' | '0' → 'NÃO'
    simples: 'bl_optante_simples_nacional', // '1' → 'SIM' | '0' → 'NÃO'
    // score: não disponível no CSV — será gravado como vazio
    cpfCnpj: 'nr_cpf_cnpj',
    renda: 'vl_anual_fonte_renda_total',
    dataRenda: 'dt_mes_ano_atualizacao_fonte_renda',
    dataSCR: 'dt_situacao_Restr',
    colaborador: 'bl_colaborador',             // '1' → 'SIM' | '0' → 'NÃO'
    endivMensal: 'vl_mensal_endividamento', // Endividamento mensal
    endivTotal: 'vl_12_total',                // Endividamento total
  }
};

// --- CONFIGURAÇÕES DO SYNC DA COMPOSIÇÃO SOCIETÁRIA ---
const SYNC_COMPOSICAO_CONFIG = {
  CSV_FILE_ID: '1kRZHq5jTSuyphz0G3vJdBtN-XnYkgIg6',
  CSV_SEPARATOR: ',',
  CSV_ENCODING: 'UTF-8',
  COLUNAS: {
    cnpj: 'nr_cnpj',
    cpfSocio: 'nr_cpf_composicao_societaria',
    percentual: 'nr_percentual_participacao'
  }
};

// --- FUNÇÕES AUXILIARES DE TRANSFORMAÇÃO ---

/**
 * Calcula a idade em anos a partir de uma string de data de nascimento.
 * Suporta formatos: 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY'.
 * @param {string} valorData - O valor de data vindo do CSV.
 * @returns {string} Idade em anos, ou '' se não for possível calcular.
 */
function _calcularIdade(valorData) {
  if (!valorData) return '';
  let dataNasc;
  const str = String(valorData).trim();

  // Tenta formato ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    dataNasc = new Date(str.substring(0, 10));
  }
  // Tenta formato BR: DD/MM/YYYY ou DD-MM-YYYY
  else if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(str)) {
    const partes = str.split(/[\/\-]/);
    dataNasc = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
  }
  else {
    // Último recurso: tenta o construtor nativo
    dataNasc = new Date(str);
  }

  if (isNaN(dataNasc.getTime())) return '';

  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNasc = dataNasc.getMonth();
  const diaNasc = dataNasc.getDate();

  // Ajusta se ainda não fez aniversário este ano
  if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
    idade--;
  }

  return idade >= 0 ? String(idade) : '';
}

/**
 * Normaliza o tipo de pessoa: 'F' → 'PF', 'J' → 'PJ'.
 * Aceita também 'PF', 'PJ', 'FÍSICA', 'JURÍDICA' como entrada.
 */
function _normalizarPessoa(valor) {
  const v = String(valor || '').trim().toUpperCase();
  if (v === 'F' || v === 'PF' || v.includes('FISICA') || v.includes('FÍSICA')) return 'PF';
  if (v === 'J' || v === 'PJ' || v.includes('JURIDICA') || v.includes('JURÍDICA')) return 'PJ';
  return 'PF'; // Padrão
}

/**
 * Normaliza booleano de enquadramento tributário: '1'/'S'/'SIM'/'TRUE' → 'SIM', resto → 'NÃO'.
 */
function _normalizarBoolean(valor) {
  const v = String(valor || '').trim().toUpperCase();
  if (v === '1' || v === 'S' || v === 'SIM' || v === 'TRUE' || v === 'T') return 'SIM';
  return 'NÃO';
}

// --- FUNÇÕES PRINCIPAIS ---

/**
 * FUNÇÃO PRINCIPAL — Executada pelo Trigger agendado.
 * Orquestra todo o processo de leitura do CSV e atualização do Sheets.
 */
function sincronizarBaseDosDrive() {
  const inicio = new Date();
  Logger.log(`[SYNC] Iniciando sincronização em ${inicio.toLocaleString('pt-BR')}`);

  try {
    // 1. Obter o arquivo CSV do Drive
    const arquivo = DriveApp.getFileById(SYNC_CONFIG.CSV_FILE_ID);
    const conteudoCsv = arquivo.getBlob().getDataAsString(SYNC_CONFIG.CSV_ENCODING);

    // 2. Parse do CSV (Utilities.parseCsv lida corretamente com valores entre aspas)
    const linhas = Utilities.parseCsv(conteudoCsv, SYNC_CONFIG.CSV_SEPARATOR.charCodeAt(0));
    if (!linhas || linhas.length < 2) {
      throw new Error('Arquivo CSV está vazio ou sem dados após o cabeçalho.');
    }

    const headers = linhas[0].map(h => String(h).trim());
    Logger.log(`[SYNC] ${linhas.length - 1} registros encontrados no CSV.`);

    // 3. Mapear índices das colunas configuradas
    const idx = {};
    for (const [campo, nomeColuna] of Object.entries(SYNC_CONFIG.COLUNAS)) {
      idx[campo] = headers.findIndex(h => h.toLowerCase() === nomeColuna.toLowerCase());
      if (idx[campo] === -1) {
        Logger.log(`[SYNC][AVISO] Coluna "${nomeColuna}" (campo: ${campo}) não encontrada no CSV.`);
      }
    }

    // 4. Montar array de Associados
    // Cabeçalho compatível com a lógica de leitura dinâmica do buscarAssociado()
    const headersAssoc = [
      'Nome Coop', 'Associado', 'Conta', 'Score', 'Tipo Pessoa', 'Idade',
      'MEI', 'Simples', 'CPF/CNPJ', 'Renda Mensal', 'Data Atualizacao Renda', 'Data Consulta SCR',
      'Colaborador', 'Endividamento Mensal', 'Endiv. Total'
    ];
    const dadosAssoc = [headersAssoc];

    for (let i = 1; i < linhas.length; i++) {
      const row = linhas[i];

      const conta = idx.conta !== undefined && idx.conta !== -1
        ? String(row[idx.conta] || '').trim()
        : '';

      const contaFinal = conta || 'Sem conta';

      const nome = idx.nome !== -1 ? String(row[idx.nome] || '').trim() : '';
      const nascim = idx.nascimento !== -1 ? String(row[idx.nascimento] || '').trim() : '';
      const pessoa = idx.pessoa !== -1 ? _normalizarPessoa(row[idx.pessoa]) : 'PF';
      const mei = idx.mei !== -1 ? _normalizarBoolean(row[idx.mei]) : 'NÃO';
      const simples = idx.simples !== -1 ? _normalizarBoolean(row[idx.simples]) : 'NÃO';
      const idade = _calcularIdade(nascim);
      const cpfCnpj = idx.cpfCnpj !== -1 ? String(row[idx.cpfCnpj] || '').trim() : '';
      const renda = idx.renda !== -1 ? String(row[idx.renda] || '').trim() : '';
      const dataRenda = idx.dataRenda !== -1 ? String(row[idx.dataRenda] || '').trim() : '';
      const dataSCR = idx.dataSCR !== -1 ? String(row[idx.dataSCR] || '').trim() : '';
      const colab = idx.colaborador !== -1 ? _normalizarBoolean(row[idx.colaborador]) : 'NÃO';
      const endivMensal = idx.endivMensal !== -1 ? _parseCurrencyRobust(row[idx.endivMensal]) : 0;
      const endivTot = idx.endivTotal !== -1 ? String(row[idx.endivTotal] || '').trim() : '';

      dadosAssoc.push([
        '',          // Nome Coop (não disponível no CSV)
        nome,        // Associado
        contaFinal,  // Conta (ou 'Sem conta')
        '',          // Score — vazio (operador informa manualmente)
        pessoa,      // Tipo Pessoa (PF/PJ)
        idade,       // Idade calculada
        mei,         // MEI (SIM/NÃO)
        simples,     // Simples Nacional (SIM/NÃO)
        cpfCnpj,     // CPF/CNPJ
        renda,       // Renda Mensal
        dataRenda,   // Data Atualização Renda
        dataSCR,     // Data Consulta SCR
        colab,       // Colaborador (SIM/NÃO)
        endivMensal, // Endividamento Mensal
        endivTot,    // Endividamento Total
      ]);
    }

    // 5. Gravar Associados
    const resultAssoc = substituirAssociados(dadosAssoc);
    Logger.log(`[SYNC] Associados: ${JSON.stringify(resultAssoc)}`);

    if (!resultAssoc.sucesso) {
      throw new Error(resultAssoc.erro);
    }

    // 6. Registrar resultado (MEI/Simples já gravados na aba Associados acima)
    const duracao = ((new Date() - inicio) / 1000).toFixed(1);
    const resumo = `Sync automático concluído: ${dadosAssoc.length - 1} associados atualizados. Duração: ${duracao}s.`;
    Logger.log(`[SYNC] ✅ ${resumo}`);

    // Gravar timestamp e status do último sync nas configurações
    _setConfigInterna('SYNC_ULTIMO_STATUS', 'SUCESSO');
    _setConfigInterna('SYNC_ULTIMO_RESULTADO', resumo);

    // Após concluir Associados com sucesso, chama o sync de Composição Societária
    try {
      Logger.log(`[SYNC] Iniciando sincronização em cadeia da Composição Societária...`);
      sincronizarBaseComposicaoSocietaria();
    } catch (eComposicao) {
      Logger.log(`[SYNC][AVISO] Falha ao sincronizar Composição Societária: ${eComposicao.message}`);
    }

    // Após concluir, chama o sync de Grupo Econômico
    try {
      Logger.log(`[SYNC] Iniciando sincronização em cadeia de Grupo Econômico...`);
      sincronizarGrupoEconomico();
    } catch (eGrupo) {
      Logger.log(`[SYNC][AVISO] Falha ao sincronizar Grupo Econômico: ${eGrupo.message}`);
    }

    return { sucesso: true, resumo };

  } catch (e) {
    const mensagemErro = `FALHA na sincronização: ${e.message}`;
    Logger.log(`[SYNC] ❌ ${mensagemErro}`);

    _setConfigInterna('SYNC_ULTIMO_STATUS', 'FALHA');
    _setConfigInterna('SYNC_ULTIMO_RESULTADO', mensagemErro);

    // Notificação por e-mail para todos os ADMINs ativos
    try {
      const resp = listarUsuarios();
      if (resp && resp.sucesso && resp.dados) {
        const admins = resp.dados.filter(u => String(u.perfil).toUpperCase() === 'ADMIN' && String(u.status).toUpperCase() === 'ATIVO');
        const emails = admins.map(u => u.email).filter(e => e).join(',');
        if (emails) {
          MailApp.sendEmail(
            emails,
            '[Simulador Cresol] Falha no Sync Automático (Associados)',
            mensagemErro
          );
        }
      }
    } catch (errMail) {
      Logger.log(`[SYNC] Erro ao enviar e-mail de falha: ${errMail.message}`);
    }

    return { sucesso: false, erro: e.message };
  }
}

/**
 * SUBSTITUIÇÃO SEGURA DA ABA COMPOSIÇÃO SOCIETÁRIA
 * Usa a estratégia de deletar e recriar a aba para bypass do limite de células.
 */
function substituirComposicaoSocietaria(dadosFiltrados) {
  try {
    if (!dadosFiltrados || dadosFiltrados.length === 0) return { sucesso: false, erro: "Sem dados para gravar." };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('ComposicaoSocietaria');
    let pos = 1; // Default

    if (sheet) {
      pos = sheet.getIndex() - 1;
      ss.deleteSheet(sheet);
    }

    sheet = ss.insertSheet('ComposicaoSocietaria', pos);

    const maxCols = sheet.getMaxColumns();
    const neededCols = dadosFiltrados[0].length;
    if (maxCols > neededCols) {
      sheet.deleteColumns(neededCols + 1, maxCols - neededCols);
    }

    const maxRows = sheet.getMaxRows();
    if (dadosFiltrados.length > maxRows) {
      sheet.insertRowsAfter(maxRows, dadosFiltrados.length - maxRows);
    }

    sheet.getRange(1, 1, dadosFiltrados.length, neededCols).setValues(dadosFiltrados);

    return { sucesso: true, linhas: dadosFiltrados.length - 1 };
  } catch (e) {
    return { sucesso: false, erro: "Erro no servidor ao gravar composição societária: " + e.message };
  }
}

/**
 * Parser resiliente para valores monetários vindos do CSV
 */
function _parseCurrencyRobust(val) {
  if (!val) return 0;
  let str = String(val).trim();
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  let floatVal = parseFloat(str);
  return isNaN(floatVal) ? 0 : floatVal;
}

/**
 * ROTINA DE SINCRONIZAÇÃO AUTOMÁTICA DE COMPOSIÇÃO SOCIETÁRIA
 */
function sincronizarBaseComposicaoSocietaria() {
  const inicio = new Date();
  Logger.log(`[SYNC-COMPOSICAO] Iniciando sincronização em ${inicio.toLocaleString('pt-BR')}`);

  try {
    // 1. Obter o arquivo CSV do Drive
    const arquivo = DriveApp.getFileById(SYNC_COMPOSICAO_CONFIG.CSV_FILE_ID);
    const conteudoCsv = arquivo.getBlob().getDataAsString(SYNC_COMPOSICAO_CONFIG.CSV_ENCODING);

    // 2. Parse do CSV
    const linhas = Utilities.parseCsv(conteudoCsv, SYNC_COMPOSICAO_CONFIG.CSV_SEPARATOR.charCodeAt(0));
    if (!linhas || linhas.length < 2) {
      throw new Error('Arquivo CSV está vazio ou sem dados após o cabeçalho.');
    }

    const headers = linhas[0].map(h => String(h).trim());
    Logger.log(`[SYNC-COMPOSICAO] ${linhas.length - 1} registros encontrados no CSV.`);

    // 3. Mapear índices
    const idxCnpj = headers.findIndex(h => h.toLowerCase() === SYNC_COMPOSICAO_CONFIG.COLUNAS.cnpj.toLowerCase());
    const idxCpfSocio = headers.findIndex(h => h.toLowerCase() === SYNC_COMPOSICAO_CONFIG.COLUNAS.cpfSocio.toLowerCase());
    const idxPercentual = headers.findIndex(h => h.toLowerCase() === SYNC_COMPOSICAO_CONFIG.COLUNAS.percentual.toLowerCase());

    if (idxCnpj === -1 || idxCpfSocio === -1 || idxPercentual === -1) {
      throw new Error('Colunas obrigatórias não encontradas no CSV de Composição Societária.');
    }

    // 4. Montar array
    const headersFinais = ['nr_cnpj', 'nr_cpf_composicao_societaria', 'nr_percentual_participacao'];
    const dados = [headersFinais];

    for (let i = 1; i < linhas.length; i++) {
      const row = linhas[i];
      dados.push([
        String(row[idxCnpj] || '').trim(),
        String(row[idxCpfSocio] || '').trim(),
        String(row[idxPercentual] || '').trim()
      ]);
    }

    // 5. Gravar
    const result = substituirComposicaoSocietaria(dados);
    Logger.log(`[SYNC-COMPOSICAO] Gravado: ${JSON.stringify(result)}`);

    const duracao = ((new Date() - inicio) / 1000).toFixed(1);
    const resumo = `Sync Composição Societária concluído: ${dados.length - 1} sócios atualizados. Duração: ${duracao}s.`;
    Logger.log(`[SYNC-COMPOSICAO] ✅ ${resumo}`);

    return { sucesso: true, resumo };
  } catch (e) {
    Logger.log(`[SYNC-COMPOSICAO] ❌ FALHA: ${e.message}`);

    // Notificação por e-mail para todos os ADMINs ativos
    try {
      const resp = listarUsuarios();
      if (resp && resp.sucesso && resp.dados) {
        const admins = resp.dados.filter(u => String(u.perfil).toUpperCase() === 'ADMIN' && String(u.status).toUpperCase() === 'ATIVO');
        const emails = admins.map(u => u.email).filter(em => em).join(',');
        if (emails) {
          MailApp.sendEmail(
            emails,
            '[Simulador Cresol] Falha no Sync Automático (Composição Societária PJ)',
            `FALHA na sincronização de Composição Societária: ${e.message}`
          );
        }
      }
    } catch (errMail) {
      Logger.log(`[SYNC-COMPOSICAO] Erro ao enviar e-mail de falha: ${errMail.message}`);
    }

    return { sucesso: false, erro: e.message };
  }
}

/**
 * FUNÇÃO AUXILIAR — Instala o Trigger de tempo no projeto.
 * Lê o horário da configuração SYNC_HORA (padrão: 5).
 * Execute MANUALMENTE UMA ÚNICA VEZ pelo editor do Apps Script,
 * ou via botão "Salvar e Aplicar" no painel Admin do simulador.
 */
function instalarTriggerSyncAutomatico() {
  // Lê o horário configurado no Sheets (ou usa o padrão 5)
  let hora = 5;
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetConf = ss.getSheetByName('Configuracoes');
    if (sheetConf) {
      const dataConf = sheetConf.getDataRange().getValues();
      for (let i = 0; i < dataConf.length; i++) {
        if (dataConf[i][0] === 'SYNC_HORA') {
          const h = parseInt(dataConf[i][1]);
          if (!isNaN(h) && h >= 0 && h <= 23) hora = h;
          break;
        }
      }
    }
  } catch (e) {
    Logger.log('[TRIGGER] Não foi possível ler SYNC_HORA, usando padrão 05h. Erro: ' + e.message);
  }

  // Remove triggers existentes da mesma função (evita duplicatas)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'sincronizarBaseDosDrive') {
      ScriptApp.deleteTrigger(t);
      Logger.log('[TRIGGER] Trigger anterior removido.');
    }
  });

  // Cria o novo trigger diário
  ScriptApp.newTrigger('sincronizarBaseDosDrive')
    .timeBased()
    .everyDays(1)
    .atHour(hora)
    .create();

  const msg = `Trigger instalado: sincronizarBaseDosDrive — diariamente às ${String(hora).padStart(2, '0')}h.`;
  Logger.log(`[TRIGGER] ✅ ${msg}`);
  setConfigGlobal('SYNC_HORA', hora);
  setConfigGlobal('SYNC_TRIGGER_ATIVO', 'SIM');
  return { sucesso: true, mensagem: msg };
}

/**
 * FUNÇÃO AUXILIAR — Remove o Trigger de sync (para desativar a automação).
 */
function removerTriggerSyncAutomatico() {
  const triggers = ScriptApp.getProjectTriggers();
  let removidos = 0;
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'sincronizarBaseDosDrive') {
      ScriptApp.deleteTrigger(t);
      removidos++;
    }
  });
  setConfigGlobal('SYNC_TRIGGER_ATIVO', 'NÃO');
  Logger.log(`[TRIGGER] ${removidos} trigger(s) de sync removido(s).`);
  return { sucesso: true, removidos };
}

/**
 * FUNÇÃO ADMIN — Salva o horário do sync e reinstala o trigger.
 * Chamada pelo painel Admin do simulador via botão "Salvar e Aplicar".
 * @param {number} hora - Hora desejada (0–23).
 */
function salvarHorarioSync(hora) {
  try {
    const h = parseInt(hora);
    if (isNaN(h) || h < 0 || h > 23) {
      return { sucesso: false, erro: 'Horário inválido. Informe um valor entre 0 e 23.' };
    }
    setConfigGlobal('SYNC_HORA', h);
    return instalarTriggerSyncAutomatico();
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

/**
 * FUNÇÃO ADMIN — Retorna o status atual do sync para exibir no painel Admin.
 */
function buscarStatusSync() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetConf = ss.getSheetByName('Configuracoes');
    let hora = 5, triggerAtivo = 'NÃO', ultimoStatus = '—', ultimoResultado = '—';

    if (sheetConf) {
      const dataConf = sheetConf.getDataRange().getValues();
      dataConf.forEach(row => {
        if (row[0] === 'SYNC_HORA') hora = row[1];
        if (row[0] === 'SYNC_TRIGGER_ATIVO') triggerAtivo = row[1];
        if (row[0] === 'SYNC_ULTIMO_STATUS') ultimoStatus = row[1];
        if (row[0] === 'SYNC_ULTIMO_RESULTADO') ultimoResultado = row[1];
      });
    }

    // Verificar se o trigger realmente existe no Apps Script
    const triggers = ScriptApp.getProjectTriggers();
    const triggerExiste = triggers.some(t => t.getHandlerFunction() === 'sincronizarBaseDosDrive');
    if (!triggerExiste && triggerAtivo === 'SIM') {
      triggerAtivo = 'NÃO';
      setConfigGlobal('SYNC_TRIGGER_ATIVO', 'NÃO');
    }

    return {
      sucesso: true,
      hora: hora,
      triggerAtivo: triggerAtivo,
      ultimoStatus: ultimoStatus,
      ultimoResultado: ultimoResultado
    };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

/**
 * FUNÇÃO ADMIN — Executa a sincronização manualmente (chamada via google.script.run).
 */
function executarSincronizacaoManual() {
  return sincronizarBaseDosDrive();
}

// ==========================================
// SINCRONIZAÇÃO E BUSCA DE GRUPO ECONÔMICO
// ==========================================

const SYNC_GRUPO_ECONOMICO_CONFIG = {
  CSV_FILE_ID: '1ciKl0ZsJ1cnWDJGfX6lRrkCJy-6Tezyw',
  CSV_SEPARATOR: ',',
  CSV_ENCODING: 'UTF-8'
};

function substituirGrupoEconomico(dadosFiltrados) {
  try {
    if (!dadosFiltrados || dadosFiltrados.length === 0) return { sucesso: false, erro: "Sem dados para gravar." };

    const TAMANHO_LOTE = 5000;
    const totalLinhas = dadosFiltrados.length;
    const neededCols = dadosFiltrados[0].length;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('GrupoEconomico');
    let pos = 1;

    if (sheet) {
      pos = sheet.getIndex() - 1;
      ss.deleteSheet(sheet);
    }

    sheet = ss.insertSheet('GrupoEconomico', pos);

    // Ajustar colunas excedentes
    const maxCols = sheet.getMaxColumns();
    if (maxCols > neededCols) {
      sheet.deleteColumns(neededCols + 1, maxCols - neededCols);
    }

    // Alocar todas as linhas necessárias de uma vez
    const maxRows = sheet.getMaxRows();
    if (totalLinhas > maxRows) {
      sheet.insertRowsAfter(maxRows, totalLinhas - maxRows);
    }
    SpreadsheetApp.flush();

    // Gravação em lotes para evitar timeout com grandes volumes
    let linhaInicio = 1;
    while (linhaInicio <= totalLinhas) {
      const lote = dadosFiltrados.slice(linhaInicio - 1, linhaInicio - 1 + TAMANHO_LOTE);
      sheet.getRange(linhaInicio, 1, lote.length, neededCols).setValues(lote);
      SpreadsheetApp.flush();
      linhaInicio += TAMANHO_LOTE;
    }

    // Usa _setConfigInterna pois esta função é chamada por triggers (sem sessão de usuário)
    _setConfigInterna('DATA_ATUALIZACAO_GRUPO_ECONOMICO', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss"));

    return { sucesso: true, linhas: totalLinhas - 1 };
  } catch (e) {
    return { sucesso: false, erro: "Erro no servidor ao gravar grupo econômico: " + e.message };
  }
}

function sincronizarGrupoEconomico() {
  const inicio = new Date();
  Logger.log(`[SYNC-GRUPO-ECONOMICO] Iniciando sincronização em ${inicio.toLocaleString('pt-BR')}`);

  try {
    const arquivo = DriveApp.getFileById(SYNC_GRUPO_ECONOMICO_CONFIG.CSV_FILE_ID);
    const conteudoCsv = arquivo.getBlob().getDataAsString(SYNC_GRUPO_ECONOMICO_CONFIG.CSV_ENCODING);

    const linhas = Utilities.parseCsv(conteudoCsv, SYNC_GRUPO_ECONOMICO_CONFIG.CSV_SEPARATOR.charCodeAt(0));
    if (!linhas || linhas.length < 2) {
      throw new Error('Arquivo CSV está vazio ou sem dados após o cabeçalho.');
    }

    const headers = linhas[0].map(h => String(h).trim());
    const idxAgrupador = headers.findIndex(h => h.toLowerCase() === 'nr_cpf_cnpj_agrupador');
    const idxIntegrante = headers.findIndex(h => h.toLowerCase() === 'nr_cpf_cnpj_integrante');

    if (idxAgrupador === -1 || idxIntegrante === -1) {
      throw new Error('Colunas obrigatórias não encontradas no CSV de Grupo Econômico.');
    }

    const headersFinais = ['nr_cpf_cnpj_agrupador', 'nr_cpf_cnpj_integrante'];
    const dados = [headersFinais];

    for (let i = 1; i < linhas.length; i++) {
      const row = linhas[i];
      dados.push([
        String(row[idxAgrupador] || '').trim(),
        String(row[idxIntegrante] || '').trim()
      ]);
    }

    const result = substituirGrupoEconomico(dados);
    Logger.log(`[SYNC-GRUPO-ECONOMICO] Gravado: ${JSON.stringify(result)}`);

    const duracao = ((new Date() - inicio) / 1000).toFixed(1);
    const resumo = `Sync Grupo Econômico concluído: ${dados.length - 1} registros atualizados. Duração: ${duracao}s.`;
    Logger.log(`[SYNC-GRUPO-ECONOMICO] ✅ ${resumo}`);

    return { sucesso: true, resumo };
  } catch (e) {
    Logger.log(`[SYNC-GRUPO-ECONOMICO] ❌ FALHA: ${e.message}`);
    return { sucesso: false, erro: e.message };
  }
}

/**
 * Busca o grupo econômico de um CPF/CNPJ.
 * T2: Aceita um objeto Spreadsheet (ss) já aberto para evitar dupla abertura.
 * Se não receber ss, abre sozinha (compatibilidade retroativa).
 */
function buscarGrupoEconomico(cpfCnpjBusca, ssParam) {
  try {
    const ss = ssParam || SpreadsheetApp.openById(SPREADSHEET_ID); // T2
    const sheetGrupo = ss.getSheetByName('GrupoEconomico');
    if (!sheetGrupo) return { temGrupo: false, integrantes: [] };

    const dataGrupo = sheetGrupo.getDataRange().getValues();
    if (dataGrupo.length <= 1) return { temGrupo: false, integrantes: [] };

    const cleanBusca = String(cpfCnpjBusca).replace(/\D/g, '');
    let cpfCnpjAgrupador = null;

    // T3: Criar índice Map uma única vez para lookup O(1)
    // Mapa: integrante → agrupador
    const mapaIntegranteParaAgrupador = new Map();
    // Mapa: agrupador → lista de integrantes
    const mapaAgrupadorParaIntegrantes = new Map();

    for (let i = 1; i < dataGrupo.length; i++) {
      const agrup = String(dataGrupo[i][0]).replace(/\D/g, '');
      const integ = String(dataGrupo[i][1]).replace(/\D/g, '');
      if (agrup && integ) {
        mapaIntegranteParaAgrupador.set(integ, agrup);
        if (!mapaAgrupadorParaIntegrantes.has(agrup)) {
          mapaAgrupadorParaIntegrantes.set(agrup, []);
        }
        mapaAgrupadorParaIntegrantes.get(agrup).push(String(dataGrupo[i][1]).trim());
      }
    }

    // Lookup O(1)
    cpfCnpjAgrupador = mapaIntegranteParaAgrupador.get(cleanBusca) || null;

    if (!cpfCnpjAgrupador) {
      return { temGrupo: false, integrantes: [] };
    }

    const integrantes = mapaAgrupadorParaIntegrantes.get(cpfCnpjAgrupador) || [];

    return {
      temGrupo: true,
      agrupador: cpfCnpjAgrupador,
      integrantes: integrantes
    };
  } catch (e) {
    Logger.log("Erro em buscarGrupoEconomico: " + e.message);
    return { temGrupo: false, integrantes: [] };
  }
}

// ==========================================
// CÁLCULO DE COMPROMETIMENTO DE RENDA
// Otimizações: CacheService + T2 (único ss) + T3 (Map O(1)) + T6 (servidor retorna dados brutos)
// ==========================================

/**
 * Núcleo de busca de dados de comprometimento.
 * T2: Recebe ss já aberto. T3: Usa Map para lookup O(1).
 * T6: Retorna apenas dados brutos (renda, endivCP, detalhamento) — sem calcular percentual.
 */
function _buscarDadosComprometimento(ss, cpfCnpjPrincipal) {
  let detalhamentoPorPessoa = [];
  let rendaTotal = 0;
  let endivCurtoPrazoTotal = 0;

  // T2: Reutiliza ss passado como parâmetro
  let grupoInfo = buscarGrupoEconomico(cpfCnpjPrincipal, ss);
  let cpfsParaBuscar = new Set();

  if (grupoInfo.temGrupo && grupoInfo.integrantes && grupoInfo.integrantes.length > 0) {
    grupoInfo.integrantes.forEach(i => cpfsParaBuscar.add(String(i).replace(/\D/g, '')));
  } else if (cpfCnpjPrincipal) {
    cpfsParaBuscar.add(String(cpfCnpjPrincipal).replace(/\D/g, ''));
  }

  if (cpfsParaBuscar.size > 0) {
    const sheetAssoc = ss.getSheetByName('Associados');
    if (sheetAssoc) {
      const dataAssoc = sheetAssoc.getDataRange().getValues();
      const headersAssoc = dataAssoc[0];

      const idxNome = headersAssoc.findIndex(h => { const s = String(h).toUpperCase().trim(); return s === 'ASSOCIADO' || s === 'NOME DO ASSOCIADO' || s === 'NOME COMPLETO' || s === 'NOME'; });
      const idxCpf = headersAssoc.findIndex(h => String(h).toUpperCase().includes('CPF'));
      const idxPessoa = headersAssoc.findIndex(h => String(h).toUpperCase().includes('TIPO') && String(h).toUpperCase().includes('PESSOA'));
      const idxMei = headersAssoc.findIndex(h => String(h).toUpperCase().includes('MEI'));
      const idxSimples = headersAssoc.findIndex(h => String(h).toUpperCase().includes('SIMPLES'));
      const idxRenda = headersAssoc.findIndex(h => String(h).toUpperCase().includes('RENDA') && !String(h).toUpperCase().includes('DATA'));
      const idxEndivCP = headersAssoc.findIndex(h => String(h).toUpperCase().includes('MENSAL') && String(h).toUpperCase().includes('ENDIVIDAMENTO'));
      const idxDataRenda = headersAssoc.findIndex(h => String(h).toUpperCase().includes('DATA ATUALIZACAO RENDA'));
      const idxDataSCR = headersAssoc.findIndex(h => String(h).toUpperCase().includes('DATA CONSULTA SCR'));
      const idxColab = headersAssoc.findIndex(h => String(h).toUpperCase().includes('COLABORADOR'));

      if (idxCpf !== -1 && idxRenda !== -1 && idxEndivCP !== -1) {
        // T3: Indexar aba Associados por CPF uma única vez — O(n) total
        const indiceCpf = new Map();
        for (let i = 1; i < dataAssoc.length; i++) {
          const cpf = String(dataAssoc[i][idxCpf]).replace(/\D/g, '');
          if (cpf && !indiceCpf.has(cpf)) {
            indiceCpf.set(cpf, dataAssoc[i]); // O(1) por inserção
          }
        }

        // T3: Lookup O(1) por CPF — sem varredura linear
        cpfsParaBuscar.forEach(cpf => {
          const rowData = indiceCpf.get(cpf);
          if (!rowData) return;

          const nome = idxNome !== -1 ? String(rowData[idxNome]).trim() : 'Nome Indisponível';
          const documento = String(rowData[idxCpf]).trim();
          const tipoPessoa = idxPessoa !== -1 ? String(rowData[idxPessoa]).trim() : 'PF';
          const isMei = idxMei !== -1 ? String(rowData[idxMei]).trim() : 'NÃO';
          const isSimples = idxSimples !== -1 ? String(rowData[idxSimples]).trim() : 'NÃO';

          const rawRenda = rowData[idxRenda];
          const renda = typeof rawRenda === 'number' ? rawRenda : parseFloat(String(rawRenda).replace(/\./g, '').replace(',', '.')) || 0;
          const rawEndiv = rowData[idxEndivCP];
          const endiv = typeof rawEndiv === 'number' ? rawEndiv : parseFloat(String(rawEndiv).replace(/\./g, '').replace(',', '.')) || 0;
          const dataRenda = idxDataRenda !== -1 ? String(rowData[idxDataRenda]).trim() : 'N/D';
          const dataSCR = idxDataSCR !== -1 ? String(rowData[idxDataSCR]).trim() : 'N/D';
          const isColab = idxColab !== -1 ? String(rowData[idxColab]).toUpperCase().trim() === 'SIM' : false;

          rendaTotal += renda;
          endivCurtoPrazoTotal += endiv;
          detalhamentoPorPessoa.push({
            nome,
            cpfCnpj: documento,
            tipoPessoa,
            mei: isMei,
            simples: isSimples,
            renda,
            endivCP: endiv,
            dataRenda,
            dataSCR,
            colaborador: isColab
          });
        });
      }
    }
  }

  // T6: Retorna apenas dados brutos — o cálculo do percentual fica no frontend
  return {
    sucesso: true,
    rendaTotalGrupo: rendaTotal,
    endivCurtoPrazoTotalGrupo: endivCurtoPrazoTotal,
    detalhamentoPorPessoa: detalhamentoPorPessoa,
    temGrupoEconomico: grupoInfo.temGrupo
  };
}

/**
 * Calcula o comprometimento de renda.
 * CacheService: verifica cache primeiro. T2+T3: via _buscarDadosComprometimento.
 * T6: não calcula o percentual — retorna apenas dados brutos para o frontend processar.
 */
function calcularComprometimentoRendaGlobal(cpfCnpjPrincipal, valorParcela, periodicidade, membrosManuais) {
  try {
    // Caso Prospect: membros manuais fornecidos pelo frontend — sem consulta à planilha
    if (membrosManuais && Array.isArray(membrosManuais) && membrosManuais.length > 0) {
      let rendaTotal = 0;
      let endivCurtoPrazoTotal = 0;
      const detalhamentoPorPessoa = [];

      membrosManuais.forEach(membro => {
        const renda = parseFloat(String(membro.renda).replace(/\./g, '').replace(',', '.')) || 0;
        const endiv = parseFloat(String(membro.endivCP).replace(/\./g, '').replace(',', '.')) || 0;
        rendaTotal += renda;
        endivCurtoPrazoTotal += endiv;
        detalhamentoPorPessoa.push({ nome: membro.nome || 'Prospect/Membro', renda, endivCP: endiv, colaborador: false });
      });

      // T6: retorna dados brutos — frontend calcula o percentual
      return {
        sucesso: true,
        rendaTotalGrupo: rendaTotal,
        endivCurtoPrazoTotalGrupo: endivCurtoPrazoTotal,
        detalhamentoPorPessoa: detalhamentoPorPessoa,
        temGrupoEconomico: false
      };
    }

    // Caso Associado: verificar CacheService primeiro
    const cache = CacheService.getUserCache();
    const chave = 'COMP_' + String(cpfCnpjPrincipal || '').replace(/\D/g, '');
    const cached = cache.get(chave);
    if (cached) {
      // Cache hit: retorno em ~50ms sem abrir a planilha
      return JSON.parse(cached);
    }

    // Cache miss: calcular e armazenar
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID); // T2: única abertura
    const resultado = _buscarDadosComprometimento(ss, cpfCnpjPrincipal);

    if (resultado.sucesso) {
      try {
        cache.put(chave, JSON.stringify(resultado), 300); // TTL: 5 minutos
      } catch (cacheErr) { /* Silencioso se objeto > 100KB */ }
    }

    return resultado;
  } catch (e) {
    return { sucesso: false, erro: 'Erro ao calcular comprometimento: ' + e.message };
  }
}

/**
 * Busca as regras do Checklist na API externa.
 * @returns {Object} O JSON de resposta da API
 */
function buscarRegrasChecklistAPI() {
  try {
    // URL placeholder da API. O usuário substituirá futuramente.
    const urlAPI = "https://script.google.com/a/macros/cresolsicoper.com.br/s/AKfycbx0qsJ6ZhgZnVzUmtWrYL6XiMcIu7Vq9lY7Eo6wU2vMg_7LAHQfpj9uAq_IDQ_O8YHCvg/exec?action=getRegras";


    const options = {
      'method': 'get',
      'headers': {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(urlAPI, options);
    const json = JSON.parse(response.getContentText());

    return json;
  } catch (e) {
    return { success: false, erro: "Erro ao buscar API de Checklist: " + e.message };
  }
}

