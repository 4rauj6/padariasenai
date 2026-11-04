const CONFIG = {
  urlDados: "",
  urlApiFaturamentoDiario: "",
  chaveFaturamentos: "precificacao-faturamentos-diarios",
  chaveEstadoCaixa: "precificacao-estado-caixa",
  percentualDespesasReceita: 0.45,
  diasSemana: 6,
  markupInicial: 295,
};

const dados = {
  receita: 120,
  unidades: 900,
};

let markup = CONFIG.markupInicial;
let indiceAtivo = -1;
// A data é a chave: assim só existe um registro por dia nesta página.
const faturamentos = new Map();

// Elementos da página usados pelo JavaScript.
const seletor = document.getElementById("markup-seletor");
const botaoMarkup = document.getElementById("markup-botao");
const listaMarkup = document.getElementById("markup-lista");
const opcoesMarkup = [...listaMarkup.querySelectorAll('[role="option"]')];
const precoSugerido = document.getElementById("preco-sugerido");
const formularioFaturamento = document.getElementById("faturamento-form");
const campoDataFaturamento = document.getElementById("faturamento-data");
const campoPaesSobraram = document.getElementById("paes-sobraram");
const estimativaFaturamento = document.getElementById("faturamento-estimativa");
const statusFaturamento = document.getElementById("faturamento-status");
const botaoSalvarFaturamento = formularioFaturamento.querySelector(
  'button[type="submit"]',
);
const botaoAcoesCaixa = document.getElementById("abrir-acoes-caixa");
const menuAcoesCaixa = document.getElementById("menu-acoes-caixa");
const botaoAbrirFechamento = document.getElementById("abrir-fechamento");
const botaoAbrirHistorico = document.getElementById("abrir-historico");
const dialogHistorico = document.getElementById("dialog-historico");
const campoSemanaHistorico = document.getElementById("historico-semana");
const dialogFechamento = document.getElementById("dialog-fechamento");
const botaoConfirmarFechamento = document.getElementById(
  "confirmar-fechamento",
);
const botaoZerarDadosTeste = document.getElementById("zerar-dados-teste");
const botaoFecharDialogFechamento = document.getElementById(
  "fechar-dialog-fechamento",
);
const botaoCancelarFechamento = document.getElementById("cancelar-fechamento");
const tituloFechamento = document.getElementById("fechamento-titulo");
let requisicaoFaturamentos = 0;
let salvandoFaturamento = false;
let fechamentos = [];
let inicioPeriodoAberto = "";
let fechamentoObrigatorioData = "";

// Usa o formato de moeda brasileiro, por exemplo: R$ 1.234,56.
const formatarMoeda = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Aceita valores como 12.5, "12,5" ou "R$ 1.234,56".
function paraNumero(valor) {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  if (typeof valor !== "string") return 0;

  let texto = valor.replace(/[^\d,.\-]/g, "");
  if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");

  const numero = Number.parseFloat(texto);
  return Number.isFinite(numero) ? numero : 0;
}

function moeda(valor) {
  return formatarMoeda.format(valor);
}

function calcularCustoTotal() {
  return dados.receita * (1 + CONFIG.percentualDespesasReceita);
}

// Faz as contas do preço e soma somente os dias que já foram registrados.
function calcular() {
  const custoTotal = calcularCustoTotal();
  const custoUnitario = dados.unidades > 0 ? custoTotal / dados.unidades : 0;
  const preco = custoUnitario * (1 + markup / 100);
  const lancamentosPeriodo = obterLancamentosDoPeriodo(inicioPeriodoAberto);
  const faturamentoSemana = lancamentosPeriodo.reduce(
    (total, item) => total + item.faturamento,
    0,
  );
  const faturamentoDia = estimarFaturamento(preco);
  // O lucro soma os registros salvos desde o último fechamento.
  const lucroSemana = lancamentosPeriodo.reduce(
    (total, item) => total + item.faturamento - custoTotal,
    0,
  );

  return {
    custoTotal,
    custoUnitario,
    preco,
    faturamentoDia,
    lucroSemana,
    faturamentoSemana,
    diasLancados: lancamentosPeriodo.length,
  };
}

function estimarFaturamento(preco = calcularPreco()) {
  const produzidos = Math.max(0, dados.unidades);
  const sobraram = Math.min(
    Math.max(0, campoPaesSobraram.valueAsNumber || 0),
    produzidos,
  );
  return Math.max(0, produzidos - sobraram) * preco;
}

// Calcula o preço de um pão com base no custo da receita e no markup escolhido.
function calcularPreco() {
  const custoTotal = calcularCustoTotal();
  const custoUnitario = dados.unidades > 0 ? custoTotal / dados.unidades : 0;
  return custoUnitario * (1 + markup / 100);
}

function atualizarEstimativa() {
  campoPaesSobraram.max = String(Math.max(0, dados.unidades));
  const preco = calcularPreco();
  const unidadesVendidas = Math.max(
    0,
    dados.unidades -
      Math.min(
        Math.max(0, campoPaesSobraram.valueAsNumber || 0),
        dados.unidades,
      ),
  );
  const estimado = estimarFaturamento(preco);
  estimativaFaturamento.textContent = `Estimativa: ${unidadesVendidas} pães vendidos × R$ ${moeda(preco)} = R$ ${moeda(estimado)}.`;
}

// Atualiza os valores e rótulos mostrados na tela.
function atualizarTela(animar = false) {
  atualizarEstimativa();
  const valores = calcular();

  document.querySelectorAll("[data-valor]").forEach((elemento) => {
    const valor = valores[elemento.dataset.valor];
    if (valor !== undefined) elemento.textContent = moeda(valor);
  });

  document.getElementById("dias-lucro-semanal").textContent =
    valores.diasLancados;
  document.getElementById("markup-texto").textContent = `${markup} %`;
  document.getElementById("preco-nota").textContent =
    `Custo unitário de R$ ${moeda(valores.custoUnitario)} com markup de ${markup} %`;
  document.getElementById("faturamento-semana-rotulo").textContent =
    `Faturamento do período (${valores.diasLancados} dias lançados)`;

  if (animar) {
    precoSugerido.classList.remove("piscar");
    void precoSugerido.offsetWidth;
    precoSugerido.classList.add("piscar");
  }
}

precoSugerido.addEventListener("animationend", () => {
  precoSugerido.classList.remove("piscar");
});

function normalizarDados(origem = {}) {
  origem = origem || {};
  const ler = (...nomes) => {
    const nome = nomes.find((chave) => origem[chave] != null);
    return paraNumero(nome ? origem[nome] : 0);
  };

  return {
    receita: ler("receita", "valorReceita", "custoReceita", "ingredientes"),
    despesas: ler("despesas", "gastos", "custosFixos"),
    unidades: Math.max(
      0,
      ler("unidades", "rendimento", "porcoes", "quantidade"),
    ),
  };
}

// Guarda os dados recebidos da página da receita e redesenha os cálculos.
function aplicarDados(origem, salvar = true, animar = false) {
  Object.assign(dados, normalizarDados(origem));

  if (salvar) {
    try {
      localStorage.setItem(CONFIG.chaveStorage, JSON.stringify(dados));
    } catch (erro) {
      console.warn("Não consegui salvar os dados da precificação:", erro);
    }
  }

  atualizarTela(animar);
}

// Converte uma data para AAAA-MM-DD sem deslocar o dia por causa do fuso horário.
function formatarData(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

// Encontra a segunda e o sábado da semana escolhida.
function intervaloSemana(dataString) {
  const [ano, mes, dia] = dataString.split("-").map(Number);
  const inicio = new Date(ano, mes - 1, dia);
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));

  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + CONFIG.diasSemana - 1);
  return { inicio: formatarData(inicio), fim: formatarData(fim) };
}

function dataValida(dataString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataString)) return false;
  const [ano, mes, dia] = dataString.split("-").map(Number);
  return formatarData(new Date(ano, mes - 1, dia)) === dataString;
}

function atualizarDisponibilidadeHistorico() {
  botaoAbrirHistorico.disabled = fechamentos.length === 0;
  botaoAbrirHistorico.title = fechamentos.length
    ? "Consultar períodos com caixa fechado"
    : "Feche o caixa para liberar o histórico";
}

function resumoDoMes(mes) {
  const lancamentosDoMes = new Map();

  fechamentos.forEach((fechamento) => {
    fechamento.lancamentos
      .filter((lancamento) => lancamento.data.startsWith(mes))
      .forEach((lancamento) =>
        lancamentosDoMes.set(lancamento.data, lancamento),
      );
  });

  faturamentos.forEach((registro, data) => {
    if (data.startsWith(mes) && !lancamentosDoMes.has(data)) {
      lancamentosDoMes.set(data, { data, ...registro });
    }
  });

  const registrosSalvos = JSON.parse(
    localStorage.getItem(CONFIG.chaveFaturamentos) || "[]",
  );
  validarLancamentos(registrosSalvos).forEach(([data, registro]) => {
    if (data.startsWith(mes) && !lancamentosDoMes.has(data)) {
      lancamentosDoMes.set(data, { data, ...registro });
    }
  });

  const dias = [...lancamentosDoMes.values()].sort((a, b) =>
    a.data.localeCompare(b.data),
  );
  const faturamento = dias.reduce(
    (total, lancamento) => total + lancamento.faturamento,
    0,
  );
  const custo = calcularCustoTotal();
  return {
    mes,
    dias,
    faturamento,
    lucro: faturamento - custo * dias.length,
  };
}

function nomeMes(mes) {
  const nome = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${mes}-01T00:00:00Z`));
  return nome.charAt(0).toLocaleUpperCase("pt-BR") + nome.slice(1);
}

function mesesNoPeriodo(inicio, fim) {
  const [anoInicio, mesInicio] = inicio.split("-").map(Number);
  const [anoFim, mesFim] = fim.split("-").map(Number);
  const meses = [];

  for (
    let ano = anoInicio, mes = mesInicio;
    ano < anoFim || (ano === anoFim && mes <= mesFim);
  ) {
    meses.push(`${ano}-${String(mes).padStart(2, "0")}`);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return meses;
}

let promessaLogoExtrato;

function carregarLogoExtrato() {
  if (!promessaLogoExtrato) {
    promessaLogoExtrato = new Promise((resolve, reject) => {
      const imagem = new Image();
      imagem.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = imagem.naturalWidth;
        canvas.height = imagem.naturalHeight;
        const contexto = canvas.getContext("2d");
        if (!contexto) {
          reject(new Error("Não foi possível preparar o logo para o PDF."));
          return;
        }
        contexto.drawImage(imagem, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      imagem.onerror = () =>
        reject(new Error("Não foi possível carregar a imagem logo-pan.png."));
      imagem.src = new URL("../image/logo-pan.png", window.location.href).href;
    });
  }
  return promessaLogoExtrato;
}

async function gerarPdfExtrato({ periodo = null, meses }) {
  const JsPdf = window.jspdf?.jsPDF;
  if (typeof JsPdf !== "function") {
    throw new Error("A biblioteca jsPDF não está disponível.");
  }

  const logo = await carregarLogoExtrato();
  const doc = new JsPdf();
  const br = (data) => data.split("-").reverse().join("/");
  const rs = (valor) => `R$ ${moeda(valor)}`;
  const largura = doc.internal.pageSize.getWidth();
  const altura = doc.internal.pageSize.getHeight();
  const margem = 15;
  const marrom = [74, 46, 30];
  const caramelo = [169, 127, 74];
  const creme = [242, 232, 218];
  const areia = [232, 201, 160];
  let y = 0;

  const cabecalhoPagina = () => {
    doc.setFillColor(...marrom);
    doc.rect(0, 0, largura, 34, "F");
    doc.addImage(logo, "PNG", margem, 5, 24, 24);
    doc.setTextColor(...creme);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text("PaniCalc", 44, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("PADARIA  •  CONTROLE FINANCEIRO", 44, 22);
    doc.setDrawColor(...caramelo);
    doc.setLineWidth(0.8);
    doc.line(44, 26, 95, 26);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("EXTRATO DO CAIXA", largura - margem, 17, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      `Emitido em ${br(formatarData(new Date()))}`,
      largura - margem,
      24,
      { align: "right" },
    );
    doc.setTextColor(...marrom);
    y = 45;
  };

  const novaPagina = () => {
    doc.addPage();
    cabecalhoPagina();
  };

  const garantirEspaco = (alturaNecessaria) => {
    if (y + alturaNecessaria > altura - 20) novaPagina();
  };

  const adicionarSecao = (titulo, subtitulo) => {
    garantirEspaco(25);
    doc.setFillColor(...areia);
    doc.roundedRect(margem, y, largura - margem * 2, 16, 3, 3, "F");
    doc.setFillColor(...caramelo);
    doc.roundedRect(margem, y, 2, 16, 1, 1, "F");
    doc.setTextColor(...marrom);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(titulo, margem + 7, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(subtitulo, largura - margem - 5, y + 7, { align: "right" });
    y += 21;
  };

  const adicionarLancamento = (lancamento, indice) => {
    garantirEspaco(9);
    if (indice % 2 === 0) {
      doc.setFillColor(255, 250, 243);
      doc.rect(margem, y - 5, largura - margem * 2, 8, "F");
    }
    doc.setTextColor(...marrom);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(br(lancamento.data), margem + 4, y);
    doc.text(rs(lancamento.faturamento), largura - margem - 4, y, {
      align: "right",
    });
    y += 8;
  };

  const adicionarResumo = (dias, faturamento, lucro) => {
    garantirEspaco(24);
    y += 3;
    doc.setFillColor(...marrom);
    doc.roundedRect(margem, y, largura - margem * 2, 18, 3, 3, "F");
    doc.setTextColor(...creme);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("DIAS", margem + 7, y + 6);
    doc.text("FATURAMENTO", margem + 48, y + 6);
    doc.text("LUCRO", largura - margem - 7, y + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(dias), margem + 7, y + 13);
    doc.text(rs(faturamento), margem + 48, y + 13);
    doc.text(rs(lucro), largura - margem - 7, y + 13, { align: "right" });
    doc.setTextColor(...marrom);
    y += 25;
  };

  cabecalhoPagina();

  if (periodo) {
    adicionarSecao(
      "Fechamento do caixa",
      `${br(periodo.inicio)} a ${br(periodo.fim)}`,
    );
    periodo.lancamentos.forEach(adicionarLancamento);
    adicionarResumo(
      periodo.lancamentos.length,
      periodo.faturamento,
      periodo.lucro,
    );
  }

  meses.forEach((mes) => {
    const resumo = resumoDoMes(mes);
    adicionarSecao("Resumo mensal", nomeMes(mes));
    resumo.dias.forEach(adicionarLancamento);
    adicionarResumo(resumo.dias.length, resumo.faturamento, resumo.lucro);
  });

  const totalPaginas = doc.internal.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setDrawColor(...areia);
    doc.setLineWidth(0.4);
    doc.line(margem, altura - 13, largura - margem, altura - 13);
    doc.setTextColor(...marrom);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("PaniCalc  •  Extrato do caixa", margem, altura - 8);
    doc.text(`${pagina} / ${totalPaginas}`, largura - margem, altura - 8, {
      align: "right",
    });
  }

  const ultimoMes = meses[meses.length - 1];
  doc.save(`extrato-${ultimoMes}.pdf`);
}

function limparInterfaceHistorico(mensagem = "Nenhum fechamento salvo.") {
  campoSemanaHistorico.replaceChildren();
  document.getElementById("historico-periodo").textContent = "";
  document.getElementById("historico-dias").textContent = "0 dias";
  document.getElementById("historico-faturamento").textContent = "R$ 0,00";
  document.getElementById("historico-lucro").textContent = "R$ 0,00";
  document.getElementById("historico-status").textContent = mensagem;
  if (dialogHistorico.open) dialogHistorico.close();
}

function salvarEstadoCaixa(
  dataSelecionada = campoDataFaturamento.value,
  fechamentosSalvos = fechamentos,
  inicioPeriodo = inicioPeriodoAberto,
) {
  localStorage.setItem(
    CONFIG.chaveEstadoCaixa,
    JSON.stringify({
      fechamentos: fechamentosSalvos,
      inicioPeriodo,
      dataSelecionada,
    }),
  );
}

function adicionarDias(dataString, quantidade) {
  const [ano, mes, dia] = dataString.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  data.setDate(data.getDate() + quantidade);
  return formatarData(data);
}

function obterLancamentosDoPeriodo(inicio, fim = "9999-12-31") {
  return [...faturamentos]
    .filter(([data]) => data >= inicio && data <= fim)
    .map(([data, registro]) => ({ data, ...registro }))
    .sort((a, b) => a.data.localeCompare(b.data));
}

function atualizarIndicacaoData() {
  const statusData = document.getElementById("status-data-faturamento");
  const registro = faturamentos.get(campoDataFaturamento.value);
  if (registro) {
    statusData.textContent = `Já informado: R$ ${moeda(registro.faturamento)}.`;
    statusData.classList.add("dia-com-faturamento");
  } else {
    statusData.textContent = "Nenhum faturamento informado nesta data.";
    statusData.classList.remove("dia-com-faturamento");
  }
}

function validarFechamento(fechamento) {
  return (
    fechamento &&
    dataValida(fechamento.inicio) &&
    dataValida(fechamento.fim) &&
    fechamento.inicio <= fechamento.fim &&
    Array.isArray(fechamento.lancamentos) &&
    fechamento.lancamentos.every(
      (item) =>
        dataValida(item.data) &&
        item.data >= fechamento.inicio &&
        item.data <= fechamento.fim &&
        Number.isFinite(Number(item.faturamento)) &&
        Number(item.faturamento) >= 0 &&
        Number.isInteger(Number(item.paesSobraram)) &&
        Number(item.paesSobraram) >= 0,
    )
  );
}

// Lê os períodos fechados e retoma o intervalo que ainda está aberto.
function iniciarControlePeriodos() {
  try {
    const estadoSalvo = JSON.parse(
      localStorage.getItem(CONFIG.chaveEstadoCaixa) || "{}",
    );
    const registrosSalvos = JSON.parse(
      localStorage.getItem(CONFIG.chaveFaturamentos) || "[]",
    );
    validarLancamentos(registrosSalvos).forEach(([data, registro]) => {
      faturamentos.set(data, registro);
    });

    if (Array.isArray(estadoSalvo.fechamentos)) {
      if (estadoSalvo.fechamentos.some((item) => !validarFechamento(item))) {
        throw new Error("A lista de fechamentos está inválida.");
      }
      fechamentos = estadoSalvo.fechamentos;
    } else if (Array.isArray(estadoSalvo.semanasFechadas)) {
      // Converte fechamentos da versão anterior para manter o histórico disponível.
      fechamentos = estadoSalvo.semanasFechadas.map((inicio) => {
        if (!dataValida(inicio))
          throw new Error("A data de um fechamento antigo é inválida.");
        const { fim } = intervaloSemana(inicio);
        const lancamentos = obterLancamentosDoPeriodo(inicio, fim);
        return {
          inicio,
          fim,
          lancamentos,
          dias: lancamentos.length,
          faturamento: lancamentos.reduce(
            (total, item) => total + item.faturamento,
            0,
          ),
          lucro: lancamentos.reduce(
            (total, item) => total + item.faturamento - calcularCustoTotal(),
            0,
          ),
        };
      });
    }

    fechamentos.sort((a, b) => a.fim.localeCompare(b.fim));
    const ultimoFechamento = fechamentos.at(-1);
    inicioPeriodoAberto =
      estadoSalvo.inicioPeriodo ||
      estadoSalvo.semanaAberta ||
      (ultimoFechamento
        ? adicionarDias(ultimoFechamento.fim, 1)
        : intervaloSemana(formatarData(new Date())).inicio);
    if (!dataValida(inicioPeriodoAberto)) {
      throw new Error("A data inicial do caixa aberto é inválida.");
    }

    const dataSelecionada = dataValida(estadoSalvo.dataSelecionada)
      ? estadoSalvo.dataSelecionada
      : formatarData(new Date());
    salvarEstadoCaixa(dataSelecionada);
    campoDataFaturamento.value = dataSelecionada;
    atualizarDisponibilidadeHistorico();
  } catch (erro) {
    console.error("Não consegui carregar os períodos do caixa:", erro);
    document.getElementById("faturamento-status").textContent =
      "Não foi possível carregar o estado do caixa. Verifique o armazenamento do navegador.";
    botaoAbrirHistorico.disabled = true;
    botaoAbrirFechamento.disabled = true;
    inicioPeriodoAberto = intervaloSemana(formatarData(new Date())).inicio;
    campoDataFaturamento.value = formatarData(new Date());
  }
}

function formatarPeriodo(inicio, fim) {
  return `${inicio.split("-").reverse().join("/")} a ${fim.split("-").reverse().join("/")}`;
}

// Confere se os dados vindos do navegador ou da API têm formato correto.
function validarLancamentos(lista) {
  if (!Array.isArray(lista))
    throw new Error("A API deve retornar uma lista de faturamentos.");

  return lista.map((item) => {
    const valor = Number(item.faturamento);
    const paesSobraram = Number(item.paesSobraram || 0);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(item.data) ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      !Number.isInteger(paesSobraram) ||
      paesSobraram < 0
    ) {
      throw new Error("A API retornou um lançamento de faturamento inválido.");
    }
    return [item.data, { faturamento: valor, paesSobraram }];
  });
}

// Carrega os registros sem limitar a data escolhida no calendário.
async function carregarFaturamentosDaSemana() {
  const requisicao = ++requisicaoFaturamentos;
  const dataSelecionada = campoDataFaturamento.value;

  try {
    if (CONFIG.urlApiFaturamentoDiario) {
      const url = new URL(CONFIG.urlApiFaturamentoDiario, window.location.href);
      url.searchParams.set("inicio", inicioPeriodoAberto);
      url.searchParams.set(
        "fim",
        dataSelecionada > inicioPeriodoAberto
          ? dataSelecionada
          : inicioPeriodoAberto,
      );

      const resposta = await fetch(url, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      if (requisicao !== requisicaoFaturamentos) return;
      validarLancamentos(await resposta.json()).forEach(([data, valor]) => {
        faturamentos.set(data, valor);
      });
    } else {
      const salvos = JSON.parse(
        localStorage.getItem(CONFIG.chaveFaturamentos) || "[]",
      );
      faturamentos.clear();
      validarLancamentos(salvos).forEach(([data, valor]) => {
        faturamentos.set(data, valor);
      });
    }

    if (requisicao !== requisicaoFaturamentos) return false;
    const registro = faturamentos.get(dataSelecionada);
    campoPaesSobraram.max = String(Math.max(0, dados.unidades));
    campoPaesSobraram.value = registro
      ? String(Math.min(registro.paesSobraram, Math.max(0, dados.unidades)))
      : "0";
    botaoSalvarFaturamento.textContent = registro
      ? "Atualizar registro do dia"
      : "Salvar registro do dia";
    atualizarIndicacaoData();
    statusFaturamento.textContent = "";
    atualizarTela();
    return true;
  } catch (erro) {
    if (requisicao !== requisicaoFaturamentos) return false;
    console.error("Não consegui carregar os faturamentos:", erro);
    statusFaturamento.textContent =
      "Não foi possível carregar os faturamentos. Tente novamente.";
    atualizarTela();
    return false;
  }
}

// Mostra apenas o período e os totais guardados no fechamento.
function carregarHistorico(fechamentoSelecionado) {
  const status = document.getElementById("historico-status");
  const fechamento = fechamentos.find(
    (item) => item.fim === fechamentoSelecionado,
  );
  if (!fechamento) {
    status.textContent = "Esse período ainda não foi fechado.";
    return;
  }
  const { inicio, fim } = fechamento;
  document.getElementById("historico-periodo").textContent =
    `Período fechado: ${formatarPeriodo(inicio, fim)}`;
  try {
    const lancamentos = validarLancamentos(fechamento.lancamentos);
    const faturamentoSemana = lancamentos.reduce(
      (total, [, registro]) => total + registro.faturamento,
      0,
    );
    const lucroSemana = lancamentos.reduce(
      (total, [, registro]) =>
        total + registro.faturamento - calcularCustoTotal(),
      0,
    );

    document.getElementById("historico-dias").textContent =
      `${Number.isFinite(fechamento.dias) ? fechamento.dias : lancamentos.length} dias`;
    document.getElementById("historico-faturamento").textContent =
      `R$ ${moeda(Number.isFinite(fechamento.faturamento) ? fechamento.faturamento : faturamentoSemana)}`;
    document.getElementById("historico-lucro").textContent =
      `R$ ${moeda(Number.isFinite(fechamento.lucro) ? fechamento.lucro : lucroSemana)}`;
    status.textContent = "Totais guardados no momento do fechamento.";
  } catch (erro) {
    console.error("Não consegui carregar o histórico de faturamentos:", erro);
    document.getElementById("historico-dias").textContent = "—";
    document.getElementById("historico-faturamento").textContent = "—";
    document.getElementById("historico-lucro").textContent = "—";
    status.textContent =
      "Não foi possível carregar o histórico. Tente novamente.";
  }
}

function preencherSemanasDoHistorico() {
  campoSemanaHistorico.replaceChildren();
  [...fechamentos].reverse().forEach((fechamento) => {
    const opcao = document.createElement("option");
    opcao.value = fechamento.fim;
    opcao.textContent = formatarPeriodo(fechamento.inicio, fechamento.fim);
    campoSemanaHistorico.append(opcao);
  });
}

function abrirMenuAcoes() {
  menuAcoesCaixa.hidden = false;
  botaoAcoesCaixa.setAttribute("aria-expanded", "true");
}

function fecharMenuAcoes() {
  menuAcoesCaixa.hidden = true;
  botaoAcoesCaixa.setAttribute("aria-expanded", "false");
}

botaoAcoesCaixa.addEventListener("click", () => {
  if (menuAcoesCaixa.hidden) abrirMenuAcoes();
  else fecharMenuAcoes();
});

document.addEventListener("click", (evento) => {
  if (!evento.target.closest(".acoes-caixa")) fecharMenuAcoes();
});

function dataExigeFechamento(data) {
  if (!dataValida(data) || data < inicioPeriodoAberto) return false;

  const [ano, mes, dia] = data.split("-").map(Number);
  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return dia === ultimoDiaDoMes;
}

async function abrirDialogFechamento({
  obrigatorio = false,
  dataObrigatoria = "",
} = {}) {
  if (salvandoFaturamento) return;
  if (dataObrigatoria) campoDataFaturamento.value = dataObrigatoria;
  if (!obrigatorio && !(await carregarFaturamentosDaSemana())) return;

  const dataFechamento = campoDataFaturamento.value;
  const lancamentos = obterLancamentosDoPeriodo(
    inicioPeriodoAberto,
    dataFechamento,
  );
  const inicioValido = dataFechamento >= inicioPeriodoAberto;
  const custoTotal = calcularCustoTotal();
  const faturamento = lancamentos.reduce(
    (total, item) => total + item.faturamento,
    0,
  );
  const lucro = lancamentos.reduce(
    (total, item) => total + item.faturamento - custoTotal,
    0,
  );
  document.getElementById("fechamento-periodo").textContent = inicioValido
    ? `Período: ${formatarPeriodo(inicioPeriodoAberto, dataFechamento)}`
    : "A data de fechamento precisa ser igual ou posterior ao início do período aberto.";
  document.getElementById("fechamento-dias").textContent = String(
    lancamentos.length,
  );
  document.getElementById("fechamento-faturamento").textContent =
    `R$ ${moeda(faturamento)}`;
  document.getElementById("fechamento-lucro").textContent =
    `R$ ${moeda(lucro)}`;
  document.getElementById("fechamento-status").textContent = obrigatorio
    ? "O faturamento do dia 31 foi salvo. É obrigatório fechar o caixa para continuar."
    : inicioValido && lancamentos.length === 0
      ? "Nenhum dia informado neste período; o fechamento ficará zerado."
      : "";
  botaoConfirmarFechamento.disabled = !inicioValido;
  fechamentoObrigatorioData = obrigatorio ? dataFechamento : "";
  tituloFechamento.textContent = obrigatorio
    ? "Fechamento obrigatório"
    : "Fechar caixa";
  botaoFecharDialogFechamento.hidden = obrigatorio;
  botaoCancelarFechamento.hidden = obrigatorio;
  dialogFechamento.showModal();
}

botaoAbrirFechamento.addEventListener("click", async () => {
  fecharMenuAcoes();
  await abrirDialogFechamento();
});

botaoFecharDialogFechamento.addEventListener("click", () => {
  if (fechamentoObrigatorioData) return;
  dialogFechamento.close();
});

botaoCancelarFechamento.addEventListener("click", () => {
  if (fechamentoObrigatorioData) return;
  dialogFechamento.close();
});

dialogFechamento.addEventListener("cancel", (evento) => {
  if (fechamentoObrigatorioData) evento.preventDefault();
});

// Fecha o período até a data escolhida e inicia outro no dia seguinte.
botaoConfirmarFechamento.addEventListener("click", async () => {
  if (salvandoFaturamento || botaoConfirmarFechamento.disabled) return;

  const dataFechamento = campoDataFaturamento.value;
  const status = document.getElementById("fechamento-status");
  if (dataFechamento < inicioPeriodoAberto) {
    status.textContent =
      "A data de fechamento precisa ser igual ou posterior ao início do período aberto.";
    botaoConfirmarFechamento.disabled = true;
    return;
  }
  if (
    fechamentoObrigatorioData &&
    dataFechamento !== fechamentoObrigatorioData
  ) {
    status.textContent =
      "Feche o caixa usando a data 31 que acabou de ser registrada.";
    return;
  }

  try {
    const lancamentos = obterLancamentosDoPeriodo(
      inicioPeriodoAberto,
      dataFechamento,
    );
    const custoTotal = calcularCustoTotal();
    const fechamento = {
      inicio: inicioPeriodoAberto,
      fim: dataFechamento,
      lancamentos: lancamentos.map(({ data, faturamento, paesSobraram }) => ({
        data,
        faturamento,
        paesSobraram,
      })),
      dias: lancamentos.length,
      faturamento: lancamentos.reduce(
        (total, item) => total + item.faturamento,
        0,
      ),
      lucro: lancamentos.reduce(
        (total, item) => total + item.faturamento - custoTotal,
        0,
      ),
    };
    const fechamentosAtualizados = [...fechamentos, fechamento];
    const novoInicioPeriodo = adicionarDias(dataFechamento, 1);
    salvarEstadoCaixa(
      dataFechamento,
      fechamentosAtualizados,
      novoInicioPeriodo,
    );
    fechamentos = fechamentosAtualizados;
    inicioPeriodoAberto = novoInicioPeriodo;
    fechamentoObrigatorioData = "";
    atualizarDisponibilidadeHistorico();
    tituloFechamento.textContent = "Fechar caixa";
    botaoFecharDialogFechamento.hidden = false;
    botaoCancelarFechamento.hidden = false;
    campoDataFaturamento.value = dataFechamento;
    atualizarIndicacaoData();
    dialogFechamento.close();
    atualizarTela();

    try {
      const meses = mesesNoPeriodo(fechamento.inicio, fechamento.fim);
      await gerarPdfExtrato({ periodo: fechamento, meses });
      statusFaturamento.textContent = `Caixa fechado em ${dataFechamento.split("-").reverse().join("/")}. O PDF do extrato foi baixado.`;
    } catch (erroPdf) {
      console.error("Caixa fechado, mas o PDF falhou:", erroPdf);
      statusFaturamento.textContent =
        "Caixa fechado, mas não foi possível gerar o PDF do extrato.";
    }
  } catch (erro) {
    console.error("Não consegui fechar o caixa:", erro);
    status.textContent =
      "Não foi possível salvar o fechamento. Tente novamente.";
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") fecharMenuAcoes();
});

botaoAbrirHistorico.addEventListener("click", () => {
  fecharMenuAcoes();
  if (fechamentos.length === 0) return;
  preencherSemanasDoHistorico();
  dialogHistorico.showModal();
  carregarHistorico(campoSemanaHistorico.value);
});

campoSemanaHistorico.addEventListener("change", () => {
  if (campoSemanaHistorico.value) carregarHistorico(campoSemanaHistorico.value);
});

document.getElementById("fechar-historico").addEventListener("click", () => {
  dialogHistorico.close();
});

dialogHistorico.addEventListener("click", (evento) => {
  if (evento.target === dialogHistorico) dialogHistorico.close();
});

dialogFechamento.addEventListener("click", (evento) => {
  if (evento.target === dialogFechamento && !fechamentoObrigatorioData)
    dialogFechamento.close();
});

// Apaga apenas os lançamentos e fechamentos locais para recomeçar os testes.
botaoZerarDadosTeste.addEventListener("click", async () => {
  if (salvandoFaturamento) {
    statusFaturamento.textContent =
      "Aguarde o salvamento atual antes de zerar os dados.";
    return;
  }
  if (CONFIG.urlApiFaturamentoDiario) {
    statusFaturamento.textContent =
      "O botão de teste só limpa os dados deste navegador. Limpe também os dados no banco da API.";
    return;
  }
  if (
    !window.confirm(
      "Apagar todos os faturamentos e fechamentos salvos neste navegador?",
    )
  )
    return;

  const registrosAntes = localStorage.getItem(CONFIG.chaveFaturamentos);
  const estadoAntes = localStorage.getItem(CONFIG.chaveEstadoCaixa);
  const hoje = formatarData(new Date());
  const estadoLimpo = {
    fechamentos: [],
    inicioPeriodo: hoje,
    dataSelecionada: hoje,
  };

  try {
    localStorage.setItem(CONFIG.chaveFaturamentos, "[]");
    localStorage.setItem(CONFIG.chaveEstadoCaixa, JSON.stringify(estadoLimpo));
    faturamentos.clear();
    fechamentos = [];
    inicioPeriodoAberto = hoje;
    campoDataFaturamento.value = hoje;
    campoPaesSobraram.value = "0";
    dialogFechamento.close();
    limparInterfaceHistorico();
    atualizarIndicacaoData();
    fecharMenuAcoes();
    atualizarDisponibilidadeHistorico();
    atualizarTela();

    if (await carregarFaturamentosDaSemana()) {
      statusFaturamento.textContent =
        "Dados de teste zerados. Receita e configurações de preço foram mantidas.";
    }
  } catch (erro) {
    try {
      if (registrosAntes === null)
        localStorage.removeItem(CONFIG.chaveFaturamentos);
      else localStorage.setItem(CONFIG.chaveFaturamentos, registrosAntes);
      if (estadoAntes === null)
        localStorage.removeItem(CONFIG.chaveEstadoCaixa);
      else localStorage.setItem(CONFIG.chaveEstadoCaixa, estadoAntes);
    } catch (erroRestauracao) {
      console.error(
        "Também não consegui restaurar os dados anteriores do caixa:",
        erroRestauracao,
      );
    }
    console.error("Não consegui zerar os dados de teste:", erro);
    statusFaturamento.textContent =
      "Não foi possível zerar os dados. Tente novamente.";
  }
});

// Salva um registro por data. Se a data já existir, corrige o registro em vez de criar outro.
formularioFaturamento.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (salvandoFaturamento) return;
  if (!formularioFaturamento.reportValidity()) return;

  const data = campoDataFaturamento.value;
  const paesSobraram = campoPaesSobraram.valueAsNumber;
  if (
    !data ||
    !Number.isInteger(paesSobraram) ||
    paesSobraram < 0 ||
    paesSobraram > dados.unidades
  ) {
    statusFaturamento.textContent =
      "Informe uma data e uma quantidade válida de pães que sobraram.";
    return;
  }
  let registroSalvo = false;
  const fechamentoObrigatorio = dataExigeFechamento(data);
  salvandoFaturamento = true;
  formularioFaturamento
    .querySelectorAll("input, button")
    .forEach((elemento) => {
      elemento.disabled = true;
    });
  statusFaturamento.textContent = "Salvando...";

  try {
    const valor = estimarFaturamento();
    if (CONFIG.urlApiFaturamentoDiario) {
      // A API deve atualizar o registro quando receber uma data já cadastrada.
      const resposta = await fetch(CONFIG.urlApiFaturamentoDiario, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, faturamento: valor, paesSobraram }),
      });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      // Map usa a data como chave, então substitui o valor sem criar outra linha.
      faturamentos.set(data, { faturamento: valor, paesSobraram });
    } else {
      // Lê a versão mais nova antes de salvar, preservando registros de outras abas.
      const salvos = JSON.parse(
        localStorage.getItem(CONFIG.chaveFaturamentos) || "[]",
      );
      faturamentos.clear();
      validarLancamentos(salvos).forEach(([dia, registro]) => {
        faturamentos.set(dia, registro);
      });
      // Se a data já existe, atualiza esse registro no lugar.
      faturamentos.set(data, { faturamento: valor, paesSobraram });
      localStorage.setItem(
        CONFIG.chaveFaturamentos,
        JSON.stringify(
          [...faturamentos].map(([dia, registro]) => ({
            data: dia,
            ...registro,
          })),
        ),
      );
    }

    statusFaturamento.textContent = CONFIG.urlApiFaturamentoDiario
      ? "Faturamento salvo no banco de dados."
      : "";
    botaoSalvarFaturamento.textContent = "Atualizar registro do dia";
    atualizarIndicacaoData();
    atualizarTela();
    registroSalvo = true;
  } catch (erro) {
    console.error("Não consegui salvar o faturamento diário:", erro);
    statusFaturamento.textContent =
      "Não foi possível salvar o faturamento. Tente novamente.";
  } finally {
    salvandoFaturamento = false;
    formularioFaturamento
      .querySelectorAll("input, button")
      .forEach((elemento) => {
        elemento.disabled = false;
      });
  }

  if (registroSalvo && fechamentoObrigatorio) {
    statusFaturamento.textContent =
      "Faturamento salvo. O fechamento do caixa é obrigatório.";
    await abrirDialogFechamento({ obrigatorio: true, dataObrigatoria: data });
  }
});

// Ao trocar de data, carrega as sobras já registradas naquele dia.
campoDataFaturamento.addEventListener("change", () => {
  if (!campoDataFaturamento.value) {
    campoDataFaturamento.value = formatarData(new Date());
  }
  try {
    salvarEstadoCaixa();
  } catch (erro) {
    console.error("Não consegui salvar a data selecionada do caixa:", erro);
    statusFaturamento.textContent =
      "A data foi selecionada, mas não consegui salvá-la para a próxima visita.";
  }
  carregarFaturamentosDaSemana();
});

// Atualiza a estimativa enquanto a quantidade de pães que sobraram é digitada.
campoPaesSobraram.addEventListener("input", () => {
  campoPaesSobraram.value = String(
    Math.min(
      Math.max(0, Math.floor(campoPaesSobraram.valueAsNumber || 0)),
      Math.max(0, dados.unidades),
    ),
  );
  atualizarTela();
});

// Lê os dados de receita que já estavam guardados neste navegador.
function carregarDadosSalvos() {
  try {
    const salvo = localStorage.getItem(CONFIG.chaveStorage);
    if (!salvo) return false;
    aplicarDados(JSON.parse(salvo), false);
    return true;
  } catch (erro) {
    console.warn(
      "Não consegui carregar os dados salvos da precificação:",
      erro,
    );
    return false;
  }
}

// Busca dados atualizados da receita, quando uma URL de API estiver configurada.
async function buscarDados() {
  if (!CONFIG.urlDados) return;

  try {
    const resposta = await fetch(CONFIG.urlDados, { cache: "no-store" });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    aplicarDados(await resposta.json(), true, true);
  } catch (erro) {
    console.warn("Não consegui buscar os dados da precificação:", erro);
  }
}

window.definirDados = (novosDados) => aplicarDados(novosDados, true, true);

// Atualiza os dados da receita se outra página os alterar no mesmo navegador.
window.addEventListener("storage", (evento) => {
  if (evento.key === CONFIG.chaveEstadoCaixa) {
    try {
      const estado = JSON.parse(evento.newValue || "{}");
      if (
        !Array.isArray(estado.fechamentos) ||
        estado.fechamentos.some((item) => !validarFechamento(item)) ||
        !dataValida(estado.inicioPeriodo)
      ) {
        throw new Error("O estado do caixa recebido é inválido.");
      }
      fechamentos = estado.fechamentos;
      inicioPeriodoAberto = estado.inicioPeriodo;
      if (dataValida(estado.dataSelecionada)) {
        campoDataFaturamento.value = estado.dataSelecionada;
      }
      atualizarDisponibilidadeHistorico();
      if (fechamentos.length === 0) {
        limparInterfaceHistorico();
      } else if (
        dialogHistorico.open &&
        fechamentos.some((item) => item.fim === campoSemanaHistorico.value)
      ) {
        carregarHistorico(campoSemanaHistorico.value);
      } else {
        preencherSemanasDoHistorico();
      }
      carregarFaturamentosDaSemana();
      atualizarTela();
    } catch (erro) {
      console.error(
        "Não consegui sincronizar o estado do caixa entre abas:",
        erro,
      );
      document.getElementById("faturamento-status").textContent =
        "Não foi possível sincronizar o fechamento do caixa entre abas.";
    }
    return;
  }

  if (
    evento.key === CONFIG.chaveFaturamentos &&
    !CONFIG.urlApiFaturamentoDiario
  ) {
    try {
      const salvos = JSON.parse(evento.newValue || "[]");
      faturamentos.clear();
      validarLancamentos(salvos).forEach(([data, registro]) => {
        faturamentos.set(data, registro);
      });
      atualizarIndicacaoData();
      atualizarTela();
    } catch (erro) {
      console.warn(
        "Não consegui atualizar os faturamentos de outra aba:",
        erro,
      );
    }
    return;
  }

  if (evento.key !== CONFIG.chaveStorage || !evento.newValue) return;

  try {
    aplicarDados(JSON.parse(evento.newValue), false, true);
  } catch (erro) {
    console.warn("Os dados de precificação recebidos são inválidos:", erro);
  }
});

// Lê o número de markup escrito em cada opção da lista.
function valorOpcao(opcao) {
  return Number.parseInt(opcao.textContent, 10);
}

function marcarOpcao(indice) {
  opcoesMarkup.forEach((opcao) => opcao.classList.remove("ativo"));
  indiceAtivo = indice;

  const opcao = opcoesMarkup[indice];
  if (!opcao) {
    listaMarkup.removeAttribute("aria-activedescendant");
    return;
  }

  opcao.classList.add("ativo");
  listaMarkup.setAttribute("aria-activedescendant", opcao.id);
  opcao.scrollIntoView({ block: "nearest" });
}

// Abre e fecha a lista de markup, mantendo a navegação pelo teclado.
// Fecha a lista e, se preciso, devolve o foco ao botão.
function fecharMarkup(devolverFoco = true) {
  seletor.classList.remove("aberto");
  botaoMarkup.setAttribute("aria-expanded", "false");
  marcarOpcao(-1);
  if (devolverFoco) botaoMarkup.focus({ preventScroll: true });
}

function abrirMarkup() {
  seletor.classList.add("aberto");
  botaoMarkup.setAttribute("aria-expanded", "true");

  const selecionada = opcoesMarkup.findIndex(
    (opcao) => valorOpcao(opcao) === markup,
  );
  marcarOpcao(selecionada < 0 ? 0 : selecionada);
  listaMarkup.focus({ preventScroll: true });
}

// Aplica o markup escolhido e atualiza os preços.
function escolherMarkup(indice) {
  const opcao = opcoesMarkup[indice];
  if (!opcao) return;

  markup = valorOpcao(opcao);
  opcoesMarkup.forEach((item) => {
    item.setAttribute("aria-selected", String(item === opcao));
  });
  atualizarTela(true);
  fecharMarkup();
}

botaoMarkup.addEventListener("click", () => {
  const aberto = seletor.classList.contains("aberto");
  if (aberto) fecharMarkup();
  else abrirMarkup();
});

opcoesMarkup.forEach((opcao, indice) => {
  opcao.addEventListener("click", () => escolherMarkup(indice));
  opcao.addEventListener("mousemove", () => marcarOpcao(indice));
});

// As setas, Enter, Espaço, Escape e Tab controlam a lista pelo teclado.
listaMarkup.addEventListener("keydown", (evento) => {
  let proximoIndice;

  switch (evento.key) {
    case "ArrowDown":
      proximoIndice = Math.min(indiceAtivo + 1, opcoesMarkup.length - 1);
      break;
    case "ArrowUp":
      proximoIndice = Math.max(indiceAtivo - 1, 0);
      break;
    case "Home":
      proximoIndice = 0;
      break;
    case "End":
      proximoIndice = opcoesMarkup.length - 1;
      break;
    case "Enter":
    case " ":
      evento.preventDefault();
      escolherMarkup(indiceAtivo);
      return;
    case "Escape":
      evento.preventDefault();
      fecharMarkup();
      return;
    case "Tab":
      fecharMarkup(false);
      return;
    default:
      return;
  }

  evento.preventDefault();
  marcarOpcao(proximoIndice);
});

// As setas do teclado também abrem a lista quando o botão está selecionado.
botaoMarkup.addEventListener("keydown", (evento) => {
  if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") return;
  evento.preventDefault();
  if (!seletor.classList.contains("aberto")) abrirMarkup();
});

// Fecha a lista se a pessoa clicar em outra parte da página.
document.addEventListener("click", (evento) => {
  if (
    seletor.classList.contains("aberto") &&
    !seletor.contains(evento.target)
  ) {
    fecharMarkup(false);
  }
});

opcoesMarkup.forEach((opcao) => {
  opcao.setAttribute("aria-selected", String(valorOpcao(opcao) === markup));
});

// Prepara a página: carrega os dados guardados e busca os dados mais recentes.
carregarDadosSalvos();
iniciarControlePeriodos();
carregarFaturamentosDaSemana().then((carregado) => {
  if (
    carregado &&
    dataExigeFechamento(campoDataFaturamento.value) &&
    faturamentos.has(campoDataFaturamento.value)
  ) {
    return abrirDialogFechamento({
      obrigatorio: true,
      dataObrigatoria: campoDataFaturamento.value,
    });
  }
});
buscarDados();
