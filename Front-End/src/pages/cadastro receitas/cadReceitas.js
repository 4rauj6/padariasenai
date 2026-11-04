// ========================================
// 1. ELEMENTOS DO HTML
// ========================================

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredPreco = document.getElementById("precoPacote");
const getPctPeso = document.getElementById("pesoPacote");
const getIngredGr = document.getElementById("gramaDoIngred");
const getPpq = document.getElementById("precoPq");

const renderTable = document.querySelector(".save-ingred");
const getRecipeCatogry = document.getElementById("categoriaReceita");
const getFarinhaBase = document.getElementById("pesoBaseFarinha");
const getRequiredUnit = document.getElementById("uniDesejadas");
const getPesoPorPao = document.getElementById("pesoPorPao");

const editNomeIngred = document.getElementById("editNomeIngred");
const editPorcentSelect = document.getElementById("editPorcent");
const quantEditContainer = document.getElementById("quantEdit");
const editIngredPreco = document.getElementById("editPrecoIngred");
const editPesoPacote = document.getElementById("editPesoPacote");
const editPpq = document.getElementById("editPrecoPq");
const editGramaSpan = document.getElementById("editGrama");
const saveEditBtn = document.querySelector(".save-edit-ingred");

const tablePlacement = document.getElementById("tablePlace");
const pesoMassaTotal = document.getElementById("pesoMassaTotal");
const pesoMassaCrua = document.getElementById("pesoMassaCrua");
const valorTotalSpan = document.getElementById("valorTotal");
const quantidadeProduzidaEl = document.getElementById("quantidadeProduzida");

let editingRow = null;
let savingIngredient = false;
let savingEdit = false;

// ========================================
// 2. PORCENTAGENS DOS INGREDIENTES
// ========================================

const porcentPorIngred = {
  farinha: [100, 50],
  fariIntegral: [50],
  acucar: [0, 0.5, 1, 1.5, 2],
  fermentoFresco: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  fermentoSeco: [0, 0.5, 1, 1.5, 2, 2.5],
  sal: [0, 0.5, 1, 1.5, 2],
  claraOvo: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
  gemaOvo: [
    10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17,
    17.5, 18, 18.5, 19, 19.5, 20,
  ],
  agua: [50, 55, 60, 65, 70, 75, 80],
  gordura: [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9,
    9.5, 10,
  ],
  aditivoPo: [0, 0.5, 1],
  aditivoLiqui: [0, 0.2],
  aditivoPasta: [0, 0.3],
  essencia: [0.5],
  corante: [0.5],
  leitePo: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
  leiteLiq: [10, 20, 30, 40, 50, 60, 70, 80],
};

// ========================================
// 3. FUNÇÃO AUXILIAR DE NÚMEROS
// ========================================

function numero(valor) {
  return (
    parseFloat(
      String(valor ?? "")
        .replace("R$", "")
        .replace("g", "")
        .replace("%", "")
        .replace(",", ".")
        .trim(),
    ) || 0
  );
}

// ========================================
// 4. ATUALIZAR RESULTADOS
// ========================================

function atualizarResultados() {
  massaCruaCalc();
  massaTotalCalc();
  rendimentoCalc();
  valorTotalCalc();
}

// ========================================
// 5. ABRIR E FECHAR MODAL PRINCIPAL
// ========================================

function setModalState(isOpen) {
  if (!modal || !overlay) return false;

  if (isOpen) {
    if (!getRecipeCatogry?.value.trim()) {
      alert("Selecione uma categoria primeiro!");
      return false;
    }

    if (!getRequiredUnit?.value.trim()) {
      alert("Informe quantas unidades deseja produzir!");
      return false;
    }

    if (!getFarinhaBase?.value.trim()) {
      alert("Informe o peso base da farinha de trigo!");
      return false;
    }

    if (numero(getRequiredUnit.value) > numero(getFarinhaBase.value)) {
      alert(
        "A quantidade de unidades desejadas não pode ser maior que o peso base da farinha!",
      );
      return false;
    }
  }

  modal.classList.toggle("hidden", !isOpen);
  overlay.classList.toggle("hidden", !isOpen);

  if (outsideModalBody) {
    outsideModalBody.style.filter = isOpen ? "blur(5px)" : "blur(0)";
  }

  if (!isOpen) {
    if (getIngredName) getIngredName.selectedIndex = 0;
    if (getIngredQuant) {
      getIngredQuant.innerHTML =
        '<option value="">Selecione um ingrediente primeiro</option>';
      getIngredQuant.disabled = true;
    }
    if (getIngredPreco) getIngredPreco.value = "";
    if (getPctPeso) getPctPeso.value = "";
    if (getIngredGr) {
      getIngredGr.textContent = "";
      getIngredGr.style.display = "none";
    }
    if (getPpq) {
      getPpq.textContent = "";
      getPpq.style.display = "none";
    }
  }

  return true;
}

// ========================================
// 6. EVENTOS DOS BOTÕES DO MODAL
// ========================================

modalButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (btn.classList.contains("addIngred")) {
      setModalState(true);
    } else {
      setModalState(false);
    }
  });
});

// ========================================
// 7. CALCULAR GRAMAS
// ========================================

function calcularGrama(
  percentValue,
  screenRender = getIngredGr,
  baseFarinhaCustom = null,
) {
  const valorFarinha =
    baseFarinhaCustom !== null
      ? String(baseFarinhaCustom).replace(",", ".").trim()
      : getFarinhaBase?.value.replace(",", ".").trim() || "0";

  const pesoFarinha = numero(valorFarinha);
  const porcentagemNum = numero(percentValue);

  if (!screenRender) return 0;

  screenRender.style.display = "block";
  screenRender.style.backgroundColor = "white";
  screenRender.style.border = "2px solid var(--cor-3)";
  screenRender.style.padding = "10px 12px";
  screenRender.style.width = "100%";
  screenRender.style.borderRadius = "8px";
  screenRender.style.color = "#4a2c1a";
  screenRender.style.fontWeight = "600";
  screenRender.style.textAlign = "center";

  if (pesoFarinha <= 0) {
    screenRender.innerText = "Informe o peso da farinha no formulário!";
    return 0;
  }

  if (porcentagemNum < 0) {
    screenRender.innerText = "A porcentagem deve ser válida";
    return 0;
  }

  const gramas = (porcentagemNum / 100) * pesoFarinha;
  screenRender.innerText = `${gramas.toFixed(0)} g`;

  return gramas;
}

// ========================================
// 8. CALCULAR PREÇO POR QUANTIDADE
// ========================================

function calcPpq(
  gramasCalc,
  precoIngredElement = getIngredPreco,
  pesoPctElement = getPctPeso,
  screenRender = getPpq,
) {
  if (!screenRender) return 0;

  const precoPacote = numero(precoIngredElement?.value);
  const pesoPacote = numero(pesoPctElement?.value);

  screenRender.style.display = "block";
  screenRender.style.backgroundColor = "white";
  screenRender.style.border = "2px solid var(--cor-3)";
  screenRender.style.padding = "10px 12px";
  screenRender.style.borderRadius = "8px";
  screenRender.style.color = "#4a2c1a";
  screenRender.style.fontWeight = "600";
  screenRender.style.textAlign = "center";

  if (precoPacote <= 0) {
    screenRender.innerText = "Informe o preço do produto";
    return 0;
  }

  if (pesoPacote <= 0) {
    screenRender.innerText = "Informe o peso do produto";
    return 0;
  }

  const precoGrama = precoPacote / pesoPacote;
  const precoUtilizado = precoGrama * (gramasCalc || 0);

  screenRender.innerText = `R$ ${precoUtilizado.toFixed(2)}`;
  return precoUtilizado;
}

// ========================================
// 9. SELEÇÃO DO INGREDIENTE
// ========================================

if (getIngredName) {
  getIngredName.addEventListener("change", () => {
    const actualIngred = getIngredName.value;
    const options = porcentPorIngred[actualIngred];

    getIngredQuant.innerHTML = "";
    getIngredGr.style.display = "none";

    if (getPpq) getPpq.style.display = "none";

    if (!actualIngred) {
      getIngredQuant.innerHTML =
        '<option value="">Selecione um ingrediente primeiro</option>';
      getIngredQuant.disabled = true;
      return;
    }

    if (options) {
      getIngredQuant.disabled = false;
      getIngredQuant.innerHTML =
        '<option value="">Selecione a porcentagem</option>';

      options.forEach((option) => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = `${option}%`;

        if (actualIngred === "farinha" && option === 50) {
          opt.textContent += " (para pão integral)";
        }

        getIngredQuant.appendChild(opt);
      });
    }
  });
}

// ========================================
// 10. RECALCULAR INGREDIENTE PRINCIPAL
// ========================================

function recalcularIngredientePrincipal() {
  const percentValue = numero(getIngredQuant?.value);
  const gramas = calcularGrama(percentValue);
  calcPpq(gramas);
}

getIngredQuant?.addEventListener("change", recalcularIngredientePrincipal);
getIngredPreco?.addEventListener("input", recalcularIngredientePrincipal);
getPctPeso?.addEventListener("input", recalcularIngredientePrincipal);

// ========================================
// 11. CÁLCULO DA MASSA CRUA
// ========================================

function massaCruaCalc() {
  const rows = document.querySelectorAll("#tablePlace tbody tr");
  let pesoCru = 0;

  if (rows.length === 0) {
    if (pesoMassaCrua) pesoMassaCrua.style.display = "none";
    return 0;
  }

  rows.forEach((row) => {
    const gramsTd = row.querySelector(".col-grama");
    pesoCru += numero(gramsTd?.textContent);
  });

  if (pesoMassaCrua) {
    pesoMassaCrua.style.display = "block";
    pesoMassaCrua.innerText = `${pesoCru.toFixed(0)} g`;
  }

  return pesoCru;
}

// ========================================
// 12. CÁLCULO DA MASSA TOTAL
// ========================================

function massaTotalCalc() {
  const rows = document.querySelectorAll("#tablePlace tbody tr");
  let massaTotal = 0;

  if (rows.length === 0) {
    if (pesoMassaTotal) pesoMassaTotal.style.display = "none";
    return 0;
  }

  rows.forEach((row) => {
    massaTotal += numero(row.querySelector(".col-grama")?.textContent);
  });

  const pesoEstimado = massaTotal * 0.98;

  if (pesoMassaTotal) {
    pesoMassaTotal.style.display = "block";
    pesoMassaTotal.innerText = `${pesoEstimado.toFixed(0)} g`;
  }

  return massaTotal;
}

// ========================================
// 13. CÁLCULO DO CUSTO TOTAL
// ========================================

function valorTotalCalc() {
  const rows = document.querySelectorAll("#tablePlace tbody tr");
  let totalCusto = 0;

  if (rows.length === 0) {
    if (valorTotalSpan) valorTotalSpan.style.display = "none";
    return;
  }

  rows.forEach((row) => {
    totalCusto += numero(row.querySelector(".col-ppq")?.textContent);
  });

  if (valorTotalSpan) {
    valorTotalSpan.style.display = "block";
    valorTotalSpan.textContent = `R$ ${totalCusto.toFixed(2)}`;
  }
}

// ========================================
// 14. CÁLCULO DO RENDIMENTO
// ========================================

function rendimentoCalc() {
  const pesoTotalMassa = massaCruaCalc();
  const pesoPorPao = numero(getPesoPorPao?.value);

  if (!quantidadeProduzidaEl) return;

  if (pesoPorPao <= 0 || pesoTotalMassa <= 0) {
    quantidadeProduzidaEl.style.display = "none";
    quantidadeProduzidaEl.innerText = "";
    return;
  }

  const quantidadeProduzida = Math.floor(pesoTotalMassa / pesoPorPao);

  quantidadeProduzidaEl.style.display = "block";
  quantidadeProduzidaEl.innerText = `${quantidadeProduzida} pães`;
}

getPesoPorPao?.addEventListener("input", rendimentoCalc);

// ========================================
// 15. CRIAR TABELA
// ========================================

function criarTabela() {
  let table = tablePlacement.querySelector("table");

  if (table) return table;

  table = document.createElement("table");

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  thead.innerHTML = `
    <tr>
      <th>Ingrediente</th>
      <th>Porcentagem</th>
      <th>Preço do pacote</th>
      <th>Peso do pacote</th>
      <th>Gramas utilizadas</th>
      <th>Preço utilizado</th>
      <th>Ação</th>
      <th class="col-filter">
        <button type="button" class="filterUpper" data-tooltip="Ordenar crescentes">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        <button type="button" class="filterDown" data-tooltip="Ordenar decrescentes">
          <i class="fa-solid fa-arrow-down"></i>
        </button>
      </th>
    </tr>
  `;

  table.appendChild(thead);
  table.appendChild(tbody);
  tablePlacement.appendChild(table);

  return table;
}

// ========================================
// 16. SALVAR INGREDIENTE
// ========================================

if (renderTable) {
  renderTable.addEventListener("click", (e) => {
    if (e.target.closest(".save-edit-ingred")) return;

    if (!modal || modal.classList.contains("hidden")) return;

    if (savingIngredient) return;

    e.preventDefault();

    const ingredValue = getIngredName.value;
    const name = getIngredName.options[getIngredName.selectedIndex]?.text || "";
    const quant = `${getIngredQuant.value}%`;

    const preco = numero(getIngredPreco?.value);
    const pesoPacote = numero(getPctPeso?.value);

    const grama = getIngredGr.textContent || "0 g";
    const precoQuant = getPpq?.textContent || "";

    if (
      !ingredValue ||
      !getIngredQuant.value ||
      preco <= 0 ||
      pesoPacote <= 0
    ) {
      alert("Preencha todos os campos obrigatórios do ingrediente.");
      return;
    }

    const tableRows = document.querySelectorAll("#tablePlace tbody tr");

    const alreadyExist = Array.from(tableRows).some((row) => {
      const sameIngred = row.querySelector(".col-nome");
      return sameIngred?.textContent.trim() === name.trim();
    });

    if (alreadyExist) {
      alert("Não é possível adicionar o mesmo ingrediente duas vezes.");
      return;
    }

    savingIngredient = true;

    try {
      const table = criarTabela();
      const tbody = table.querySelector("tbody");

      const tr = document.createElement("tr");

      tr.dataset.ingredValue = ingredValue;
      tr.dataset.pesoPacote = pesoPacote;

      const cells = [
        ["col-nome", name],
        ["col-quant", quant],
        ["col-preco", `R$ ${preco.toFixed(2)}`],
        ["col-peso-pacote", `${pesoPacote} g`],
        ["col-grama", grama],
        ["col-ppq", precoQuant],
      ];

      cells.forEach(([className, value]) => {
        const td = document.createElement("td");
        td.className = className;
        td.textContent = value;
        tr.appendChild(td);
      });

      const actions = document.createElement("td");
      actions.innerHTML = `
        <button type="button" class="delete-item" data-tooltip="Excluir ingrediente">
          <i class="fa-solid fa-trash"></i>
        </button>
        <button type="button" class="edit-item" data-tooltip="Editar ingrediente">
          <i class="fa-solid fa-pencil"></i>
        </button>
      `;

      tr.appendChild(actions);

      const filterCell = document.createElement("td");
      filterCell.className = "col-filter";
      tr.appendChild(filterCell);

      tbody.appendChild(tr);

      if (getRequiredUnit) getRequiredUnit.disabled = true;
      if (getFarinhaBase) getFarinhaBase.disabled = true;

      atualizarResultados();

      setModalState(false);
    } finally {
      savingIngredient = false;
    }
  });
}

// ========================================
// 17. ORDENAR INGREDIENTES
// ========================================

function FilterByQuant(tb, crescente) {
  const rows = Array.from(tb.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const valorA = numero(a.querySelector(".col-quant")?.textContent);
    const valorB = numero(b.querySelector(".col-quant")?.textContent);

    return crescente ? valorA - valorB : valorB - valorA;
  });

  rows.forEach((row) => tb.appendChild(row));
}

// ========================================
// 18. SELECIONAR PORCENTAGEM
// ========================================

function percentSelect(selectEl, percentValue) {
  const percentNum = numero(percentValue);

  for (const opt of selectEl.options) {
    if (numero(opt.value) === percentNum) {
      selectEl.value = opt.value;
      return;
    }
  }
}

// ========================================
// 19. CARREGAR PORCENTAGENS NA EDIÇÃO
// ========================================

function editingIngreds(ingredKey, selectedPercent) {
  const options = porcentPorIngred[ingredKey] || [];

  editPorcentSelect.innerHTML = `
    <option value="">Selecione a porcentagem</option>
  `;

  options.forEach((percent) => {
    const opt = document.createElement("option");
    opt.value = percent;
    opt.textContent = `${percent}%`;

    if (ingredKey === "farinha" && percent === 50) {
      opt.textContent += " (para pão integral)";
    }

    editPorcentSelect.appendChild(opt);
  });

  percentSelect(editPorcentSelect, selectedPercent);
}

// ========================================
// 20. RECALCULAR INGREDIENTE NA EDIÇÃO
// ========================================

function recalcAfterEdit() {
  const ingredKey = editNomeIngred.value;
  let gramas = 0;

  if (ingredKey === "farinha") {
    const farinhaInput = document.getElementById("farinhaNumber");
    gramas = calcularGrama(
      editPorcentSelect.value,
      editGramaSpan,
      farinhaInput?.value ?? null,
    );
  } else {
    gramas = calcularGrama(editPorcentSelect.value, editGramaSpan);
  }

  calcPpq(gramas, editIngredPreco, editPesoPacote, editPpq);

  return gramas;
}

// ========================================
// 21. FECHAR MODAL DE EDIÇÃO
// ========================================

function closeEditModal() {
  const overlayEdit = document.querySelector(".overlay-edit");
  const modalEditBody = document.querySelector(".modal-edit-body");

  overlayEdit?.classList.add("hidden");
  modalEditBody?.classList.add("hidden");

  editingRow = null;

  if (outsideModalBody) {
    outsideModalBody.style.filter = "blur(0)";
  }
}

// ========================================
// 22. MOSTRAR CAMPOS DE EDIÇÃO (COM ESTILOS JAVASCRIPT HARMÔNICOS)
// ========================================

function renderEditFields(ingredKey, currentQuant = "") {
  editNomeIngred.value = ingredKey;
  quantEditContainer.innerHTML = "";

  const porcentLabel = document.querySelector("label[for='editPorcent']");

  if (porcentLabel) {
    porcentLabel.style.display = "block";
  }

  editPorcentSelect.style.display = "block";

  if (ingredKey === "farinha") {
    quantEditContainer.innerHTML = `
      <label for="farinhaNumber" style="font-family: var(--font-1); font-size: 0.9rem; color: #4a2c1a; font-weight: 600;">
        Peso base da farinha (g):
      </label>
      <input
        type="number"
        id="farinhaNumber"
        value="${getFarinhaBase?.value || ""}"
        style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 2px solid #e8c9a0; background-color: white; color: #4a2c1a; outline: none; font-size: 0.95rem; font-family: var(--font-1); text-align: center;"
      >
    `;

    editingIngreds(ingredKey, currentQuant);

    const farinhaInput = document.getElementById("farinhaNumber");
    farinhaInput.addEventListener("input", recalcAfterEdit);

    recalcAfterEdit();
  } else {
    editingIngreds(ingredKey, currentQuant);

    if (editPorcentSelect.value) {
      recalcAfterEdit();
    } else {
      editGramaSpan.innerText = "";
      if (editPpq) {
        editPpq.innerText = "";
      }
    }
  }
}

// ========================================
// 23. ABRIR MODAL DE EDIÇÃO
// ========================================

function openEditModal(row) {
  if (!row) return;

  editingRow = row;

  const overlayEdit = document.querySelector(".overlay-edit");
  const modalEditBody = document.querySelector(".modal-edit-body");

  if (!overlayEdit || !modalEditBody) return;

  overlayEdit.style.zIndex = "9998";
  modalEditBody.style.zIndex = "9999";

  overlayEdit.classList.remove("hidden");
  modalEditBody.classList.remove("hidden");

  const ingredKey = row.dataset.ingredValue;
  const currentQuant = numero(row.querySelector(".col-quant")?.textContent);
  const currentPreco = numero(row.querySelector(".col-preco")?.textContent);
  const currentPesoPacote = row.dataset.pesoPacote || "1000";

  if (editIngredPreco) editIngredPreco.value = currentPreco;
  if (editPesoPacote) editPesoPacote.value = currentPesoPacote;

  renderEditFields(ingredKey, currentQuant);
}

// ========================================
// 24. EVENTOS DOS CAMPOS DE EDIÇÃO
// ========================================

editPorcentSelect?.addEventListener("change", recalcAfterEdit);
editIngredPreco?.addEventListener("input", recalcAfterEdit);
editPesoPacote?.addEventListener("input", recalcAfterEdit);

editNomeIngred?.addEventListener("change", () => {
  renderEditFields(editNomeIngred.value, "");
});

// ========================================
// 25. SALVAR EDIÇÃO
// ========================================

if (saveEditBtn) {
  saveEditBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (savingEdit || !editingRow) return;

    const newIngredKey = editNomeIngred.value;
    const newName =
      editNomeIngred.options[editNomeIngred.selectedIndex]?.text || "";

    const newPreco = numero(editIngredPreco.value);
    const newPesoPacote = numero(editPesoPacote.value);

    if (!newIngredKey) {
      alert("Selecione um ingrediente.");
      return;
    }

    if (newPreco <= 0 || newPesoPacote <= 0) {
      alert("Informe o preço e o peso do pacote.");
      return;
    }

    if (!editPorcentSelect.value) {
      alert("Selecione a porcentagem.");
      return;
    }

    let novoPesoFarinha = null;

    if (newIngredKey === "farinha") {
      const farinhaInput = document.getElementById("farinhaNumber");
      novoPesoFarinha = numero(farinhaInput?.value);

      if (novoPesoFarinha <= 0) {
        alert("Digite um peso válido para a farinha.");
        return;
      }
    }

    const rows = document.querySelectorAll("#tablePlace tbody tr");

    const duplicate = Array.from(rows).some((row) => {
      if (row === editingRow) return false;
      const rowName = row.querySelector(".col-nome");
      return rowName?.textContent.trim() === newName.trim();
    });

    if (duplicate) {
      alert("Esse ingrediente já existe na tabela.");
      return;
    }

    savingEdit = true;

    try {
      const gramas = recalcAfterEdit();

      const newQuantValue = `${editPorcentSelect.value}%`;
      const newGramaValue = `${gramas.toFixed(0)} g`;
      const newPpqValue = editPpq?.textContent || "R$ 0,00";

      const updateTableData = {
        ".col-nome": newName,
        ".col-quant": newQuantValue,
        ".col-preco": `R$ ${newPreco.toFixed(2)}`,
        ".col-peso-pacote": `${newPesoPacote} g`,
        ".col-grama": newGramaValue,
        ".col-ppq": newPpqValue,
      };

      Object.assign(editingRow.dataset, {
        ingredValue: newIngredKey,
        pesoPacote: newPesoPacote,
      });

      for (const [selector, value] of Object.entries(updateTableData)) {
        const element = editingRow.querySelector(selector);
        if (element) {
          element.textContent = value;
        }
      }

      if (newIngredKey === "farinha" && getFarinhaBase) {
        getFarinhaBase.value = novoPesoFarinha;
      }

      atualizarResultados();
      closeEditModal();
    } finally {
      savingEdit = false;
    }
  });
}

// ========================================
// 26. EXCLUIR, EDITAR E ORDENAR
// ========================================

if (tablePlacement) {
  tablePlacement.addEventListener("click", (e) => {
    const deleteItem = e.target.closest(".delete-item");
    const editItem = e.target.closest(".edit-item");
    const filterUpBtn = e.target.closest(".filterUpper");
    const filterDownBtn = e.target.closest(".filterDown");

    if (!deleteItem && !editItem && !filterUpBtn && !filterDownBtn) {
      return;
    }

    e.preventDefault();

    if (deleteItem) {
      const row = deleteItem.closest("tr");
      const table = deleteItem.closest("table");

      row.remove();

      const remainingRows = table.querySelectorAll("tbody tr");

      if (remainingRows.length === 0) {
        table.remove();

        if (getRequiredUnit) getRequiredUnit.disabled = false;
        if (getFarinhaBase) getFarinhaBase.disabled = false;

        document.querySelectorAll(".tooltip").forEach((el) => {
          el.style.display = "none";
        });
      }
    } else if (editItem) {
      openEditModal(editItem.closest("tr"));
    } else {
      const table = tablePlacement.querySelector("table");
      const tbody = table?.querySelector("tbody");

      if (tbody && filterUpBtn) FilterByQuant(tbody, true);
      if (tbody && filterDownBtn) FilterByQuant(tbody, false);
    }

    atualizarResultados();
  });
}

// ========================================
// 27. UPLOAD E PRÉ-VISUALIZAÇÃO DA IMAGEM
// ========================================

const imageInput = document.getElementById("imgReceita");
const imagePreview = document.getElementById("imagePreview");
const uploadPlaceholder = document.querySelector(".upload-placeholder");

if (imageInput) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    const formatosPermitidos = ["image/jpeg", "image/png"];

    if (!formatosPermitidos.includes(file.type)) {
      alert("Selecione uma imagem JPG ou PNG.");
      imageInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5 MB.");
      imageInput.value = "";
      return;
    }

    if (imagePreview) {
      if (imagePreview.dataset.objectUrl) {
        URL.revokeObjectURL(imagePreview.dataset.objectUrl);
      }

      const imageUrl = URL.createObjectURL(file);
      imagePreview.src = imageUrl;
      imagePreview.dataset.objectUrl = imageUrl;
      imagePreview.hidden = false;
    }

    if (uploadPlaceholder) {
      uploadPlaceholder.hidden = true;
    }
  });
}

// ========================================
// 28. TOOLTIP
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  let tooltip = document.querySelector(".tooltip");

  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.appendChild(tooltip);
  }

  document.addEventListener(
    "mouseover",
    (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (!target) return;

      tooltip.textContent = target.dataset.tooltip;
      const rect = target.getBoundingClientRect();

      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.top = `${rect.bottom + window.scrollY}px`;
      tooltip.style.display = "block";
    },
    true,
  );

  document.addEventListener(
    "mouseout",
    (e) => {
      const target = e.target.closest("[data-tooltip]");
      if (!target) return;

      if (e.relatedTarget && target.contains(e.relatedTarget)) {
        return;
      }

      tooltip.style.display = "none";
    },
    true,
  );

  window.addEventListener("scroll", () => {
    tooltip.style.display = "none";
  });
});

// ========================================
// 29. LIMPAR URL DA IMAGEM AO SAIR
// ========================================

window.addEventListener("beforeunload", () => {
  if (imagePreview?.dataset.objectUrl) {
    URL.revokeObjectURL(imagePreview.dataset.objectUrl);
  }
});
