const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredPreco = document.getElementById("precoIngred");
const getPesoPacoteIngred = document.getElementById("pesoPacoteIngred");
const getIngredGr = document.getElementById("gramaDoIngred");
const getPpq = document.getElementById("precoPq");
const getFornoType = document.getElementById("tipoForno");
const renderTable = document.querySelector(".save-ingred");
const getRecipeCatogry = document.getElementById("categoriaReceita");
const getFarinhaBase = document.getElementById("pesoBaseFarinha");
const getPesoUnidadeCrua = document.getElementById("pesoUnidadeCrua");

/* ELEMENTOS DO MODAL DE EDIÇÃO */
const editNomeIngred = document.getElementById("editNomeIngred");
const editPorcentSelect = document.getElementById("editPorcent");
const quantEditContainer = document.getElementById("quantEdit");
const editIngredPreco = document.getElementById("editPrecoIngred");
const editPesoPacoteIngred = document.getElementById("editPesoPacoteIngred");
const editPpq = document.getElementById("editPrecoPq");
const editGramaSpan = document.getElementById("editGrama");
const editTipoFornoSelect = document.getElementById("editTipoForno");
const saveEditBtn = document.querySelector(".save-edit-ingred");

let editingRow = null;

/* PORCENTAGEM DE CADA INGREDIENTE */
const porcentPorIngred = {
  farinha: [100],
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
  leiteLiquido: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
  leitePo: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6],
};

/* LÓGICA DE ABRIR E FECHAR O MODAL DE ADICIONAR */
function setModalState(isOpen) {
  if (isOpen) {
    if (!getRecipeCatogry || !getRecipeCatogry.value) {
      alert(
        "Antes de adicionar os ingredientes selecione a categoria da receita",
      );
      return false;
    }
  }

  modal.classList.toggle("hidden", !isOpen);
  overlay.classList.toggle("hidden", !isOpen);

  if (!isOpen) {
    outsideModalBody.style.filter = "blur(0)";
    getIngredName.selectedIndex = 0;
    getIngredQuant.selectedIndex = 0;
    getIngredQuant.disabled = true;
    getIngredGr.textContent = "";
    getIngredGr.style.display = "none";
    if (getIngredPreco) getIngredPreco.value = "";
    if (getPesoPacoteIngred) getPesoPacoteIngred.value = "1000";
    if (getPpq) getPpq.textContent = "";
  }
  return true;
}

modalButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (btn.classList.contains("addIngred")) {
      if (setModalState(true)) outsideModalBody.style.filter = "blur(5px)";
    } else {
      setModalState(false);
      outsideModalBody.style.filter = "blur(0)";
    }
  });
});

/* LÓGICA DE TRANSFORMAR AS PORCENTAGENS EM GRAMAS */
function calcularGrama(percentValue, outputElement = getIngredGr, baseFarinhaCustom = null) {
  if (!outputElement) return 0;
  const pesoFarinha = baseFarinhaCustom !== null
    ? numeroBR(baseFarinhaCustom)
    : numeroBR(getFarinhaBase?.value);
  const textoPercentual = String(percentValue ?? "").trim().replace(",", ".");
  const porcentagem = textoPercentual === "" ? NaN : Number(textoPercentual);
  outputElement.style.display = "block";
  outputElement.style.backgroundColor = "transparent";
  outputElement.style.border = "solid 2px #e8c9a0";
  outputElement.style.padding = "4px 8px";
  outputElement.style.borderRadius = "4px";
  if (pesoFarinha <= 0) {
    outputElement.textContent = "Informe o peso da farinha no formulário!";
    return 0;
  }
  if (!Number.isFinite(porcentagem) || porcentagem < 0) {
    outputElement.textContent = "Selecione uma porcentagem válida";
    return 0;
  }

  const resultadoGrama = (porcentagemNum / 100) * pesoFarinha;
  outputElement.innerText = `${resultadoGrama.toFixed(2)} g`;

  return resultadoGrama;
}
function calcPpq(gramasCalc, precoInput = getIngredPreco, outputElement = getPpq, pesoInput = getPesoPacoteIngred) {
  if (!outputElement) return 0;
  const precoPacote = numeroBR(precoInput?.value);
  const pesoPacote = numeroBR(pesoInput?.value);
  outputElement.style.display = "block";
  outputElement.style.backgroundColor = "transparent";
  outputElement.style.border = "solid 2px #e8c9a0";
  outputElement.style.padding = "4px 8px";
  outputElement.style.borderRadius = "4px";
  if (!precoInput || String(precoInput.value).trim() === "" || precoPacote < 0 || pesoPacote <= 0) {
    outputElement.textContent = "Informe o preço do pacote e seu peso";
    return 0;
  }

  const pPg = precoPacote / 1000;
  const precoUtili = pPg * (gramasCalc || 0);

  outputElement.innerText = `R$ ${precoUtili.toFixed(4)}`;

  return precoUtili;
}
const timeEstimative = document.getElementById("tempoEstimado");
const porcoesEstimative = document.getElementById("porcoesEstimadas");
const pesoMassaTotal = document.getElementById("pesoMassaTotal");
const pesoMassaCrua = document.getElementById("pesoMassaCrua");

function massaCruaCalc() {
  const searchInTableRows = document.querySelectorAll("#tablePlace tbody tr");
  let pesoCru = 0;

  searchInTableRows.forEach((row) => {
    const gramsTd = row.querySelector(".col-grama");

    if (gramsTd) {
      const textCleaner = gramsTd.textContent
        .replace("g", "")
        .replace(",", ".")
        .trim();

      const gramsNum = parseFloat(textCleaner) || 0;
      pesoCru += gramsNum;
    }
  });

  if (pesoMassaCrua) {
    pesoMassaCrua.textContent = `${pesoCru.toFixed(2)} g`;
  }
}
function massaTotalCalc() {
  const searchInTableRows = document.querySelectorAll("#tablePlace tbody tr");
  let massaTotal = 0;

  searchInTableRows.forEach((row) => {
    const GramsTd = row.querySelector(".col-grama");

    if (GramsTd) {
      const textCleaner = GramsTd.textContent
        .replace("g", "")
        .replace(",", ".")
        .trim();

      const gramsNum = parseFloat(textCleaner) || 0;
      massaTotal += gramsNum;
    }
  });

  const WeightEstimate = massaTotal * (1 - 2 / 100);

  if (pesoMassaTotal) {
    pesoMassaTotal.textContent = `${WeightEstimate.toFixed(2)} g`;
  }
}

// function calcPrecoTotal() {
//   const searchInTableRows = document.querySelectorAll("#tablePlace tbody tr");

//   let actualPpq = 0;

//   searchInTableRows.forEach((row) => {
//     const ppqTd = row.querySelector(".col-ppq");

//     if (ppqTd) {
//       const textCleaner =
//         ppqTd.textContent.replace("R$", "").replace(",", ".") || 0;

//       const ppqNum = parseFloat(textCleaner);

//       actualPpq += ppqNum;
//     }
//   });

//   const estimatePpq = getIngredGr / actualPpq;

//   if (ppqInTable) {
//     ppqInTable.textContent = `${estimatePpq.toFixed(2)}`;
//   }
// }

/* LÓGICA DE SELEÇÃO DOS INGREDIENTES E TROCA DOS SEUS VALORES */
getIngredName.addEventListener("change", () => {
  const actualIngred = getIngredName.value;
  const opcoes = getOpcoesPercentual(actualIngred);

  getIngredQuant.innerHTML = "";
  getIngredGr.style.display = "none";

  if (!actualIngred) {
    getIngredQuant.innerHTML = `<option value="">Selecione um ingrediente primeiro</option>`;
    getIngredQuant.disabled = true;
    return;
  }

  if (actualIngred === "farinha") {
    getIngredQuant.innerHTML = `<option value="100" selected>100% (Base)</option>`;
    getIngredQuant.disabled = true;
    calcularGrama(100);
    return;
  }

  getIngredQuant.disabled = false;
  getIngredQuant.innerHTML = `<option value="">Selecione a porcentagem</option>`;

  opcoes.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = `${p}%`;
    getIngredQuant.appendChild(opt);
  });
});

getIngredQuant.addEventListener("change", () => {
  const percentValue = parseFloat(getIngredQuant.value) || 0;
  calcularGrama(percentValue);
});

/* SALVAR OS INGREDIENTES DO MODAL E EXIBIR A TABELA */
const tablePlacement = document.getElementById("tablePlace");

renderTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("save-edit-ingred")) return;
  e.preventDefault();

  const ingredValue = getIngredName.value;
  const name = getIngredName.options[getIngredName.selectedIndex]?.text || "";
  const quant =
    getIngredQuant.options[getIngredQuant.selectedIndex]?.text || "";
  const preco = String(numeroBR(getIngredPreco.value));
  const pesoPacote = numeroBR(getPesoPacoteIngred?.value);
  const grama = getIngredGr.textContent || "0 g";
  const precoQuant = getPpq.textContent || "R$ 0,0000";

  if (!getIngredName.value || !getIngredQuant.value || getIngredPreco.value.trim() === "" || numeroBR(getIngredPreco.value) < 0 || pesoPacote <= 0) {
    alert("Informe o ingrediente, a porcentagem, o preço do pacote e o peso da embalagem.");
    return;
  }

  const tableRows = document.querySelectorAll("#tablePlace tbody tr");
  let alreadyExist = false;

  tableRows.forEach((row) => {
    const sameIngred = row.querySelector(".col-nome");
    if (sameIngred && sameIngred.textContent.trim() === name) {
      alreadyExist = true;
    }
  });

  if (alreadyExist) {
    alert("Não é possível adicionar o mesmo ingrediente duas vezes");
    return;
  }

  let table = tablePlacement.querySelector("table");
  let tb = tablePlacement.querySelector("tbody");

  if (!table) {
    table = document.createElement("table");
    let th = document.createElement("thead");
    tb = document.createElement("tbody");

    th.innerHTML = `
      <tr>
        <th>Ingrediente</th>
        <th>Porcentagem</th>
        <th>Preço</th>
        <th>Gramas</th>
        <th>Preço por quant.</th>
        <th>Ação</th>
      </tr>`;

    table.appendChild(th);
    table.appendChild(tb);
    tablePlacement.appendChild(table);
  }

  let tr = document.createElement("tr");
  tr.dataset.ingredValue = ingredValue;
  tr.dataset.pesoPacote = String(pesoPacote);
  tr.innerHTML = `
    <td class="col-nome">${escapeHtml(name)}</td>
    <td class="col-quant">${escapeHtml(quant)}</td>
    <td class="col-preco">R$ ${escapeHtml(preco)}</td>
    <td class="col-pacote">${pesoPacote.toFixed(2)} g</td>
    <td class="col-grama">${escapeHtml(grama)}</td>
    <td class="col-ppq">${escapeHtml(precoQuant)}</td>
    <td>
      <button class="delete-item" data-tooltip="Excluir ingrediente"><i class="fa-solid fa-trash"></i></button>
      <button class="edit-item" data-tooltip="Editar ingrediente"><i class="fa-solid fa-pencil"></i></button>
    </td>
  `;
  tb.appendChild(tr);

  if (ingredValue === "farinha") {
    getFarinhaBase.disabled = true;
  }

  massaCruaCalc();
  massaTotalCalc();
  calcPpq();

  setModalState(false);
});

/* FUNÇÃO DE EXCLUIR E EDITAR O ITEM DA TABELA */

tablePlacement.addEventListener("click", (e) => {
  e.preventDefault();

  const deleteItem = e.target.closest(".delete-item");
  const editItem = e.target.closest(".edit-item");
  const tooltipLabel = document.getElementsByClassName("toottip");

  if (!deleteItem && !editItem) {
    return;
  }

  if (deleteItem) {
    const row = deleteItem.closest("tr");
    const table = deleteItem.closest("table");

    row.remove();

    const tableIndex = table.querySelectorAll("tbody tr");

    if (tableIndex.length === 0) {
      table.remove();
      tooltipLabel.style.display = "none";
    }
  } else if (editItem) {
    openEditModal(editItem.closest("tr"));
  }

  massaCruaCalc();
  massaTotalCalc();
  calcPpq();
});

/* LÓGICA PARA ABRIR E FECHAR O MODAL DE EDIÇÃO */
function openEditModal(row) {
  editingRow = row;
  const ingrediente = row.dataset.ingredValue;
  document.querySelector(".overlay-edit")?.classList.remove("hidden");
  document.querySelector(".modal-edit-body")?.classList.remove("hidden");
  if (editNomeIngred) editNomeIngred.value = ingrediente;
  renderEditFields(ingrediente, row.querySelector(".col-quant")?.textContent || "");
  if (editIngredPreco) editIngredPreco.value = numeroBR(row.querySelector(".col-preco")?.textContent).toFixed(2);
  if (editPesoPacoteIngred) {
    editPesoPacoteIngred.value = numeroBR(row.dataset.pesoPacote || row.querySelector(".col-pacote")?.textContent).toFixed(2);
  }
  if (ingrediente === "farinha") {
    const campoFarinha = document.getElementById("farinhaNumber");
    if (campoFarinha) campoFarinha.value = numeroBR(row.querySelector(".col-grama")?.textContent);
  } else if (editPorcentSelect) {
    const percentualAtual = numeroBR(row.querySelector(".col-quant")?.textContent);
    const existeOpcao = [...editPorcentSelect.options].some((opcao) => Number(opcao.value) === percentualAtual);
    if (!existeOpcao) editPorcentSelect.add(new Option(`${percentualAtual}% (valor atual)`, String(percentualAtual)));
    editPorcentSelect.value = String(percentualAtual);
    calcularGrama(editPorcentSelect.value, editGramaSpan);
  }
  atualizarPreviaEdicao();
}
function closeEditModal() {
  document.querySelector(".overlay-edit")?.classList.add("hidden");
  document.querySelector(".modal-edit-body")?.classList.add("hidden");
  outsideModalBody.style.filter = "blur(0)";
}

function renderEditFields(ingredKey, newPreco = "") {
  editNomeIngred.value = ingredKey;

  quantEditContainer.innerHTML = "";

  if (ingredKey === "farinha") {
    editPorcentSelect.style.display = "none";

    const porcentLabel = document.querySelector("label[for='editPorcent']");

    if (porcentLabel) {
      porcentLabel.style.display = "none";
    }

    quantEditContainer.innerHTML = `
      <label for="farinhaNumber">
        Digite o peso base da farinha (1000g = 1kg):
      </label>

      <input
        type="number"
        id="farinhaNumber"
        value="${escapeHtml(getFarinhaBase.value)}"
      >
    `;

    const farinhaInput = document.getElementById("farinhaNumber");

    calcularGrama(100, editGramaSpan, farinhaInput.value);

    farinhaInput.addEventListener("input", () => {
      calcularGrama(100, editGramaSpan, farinhaInput.value);
    });
  } else {
    editPorcentSelect.style.display = "block";

    const porcentLabel = document.querySelector("label[for='editPorcent']");

    if (porcentLabel) {
      porcentLabel.style.display = "block";
    }

    const opcoes = getOpcoesPercentual(ingredKey);

    editPorcentSelect.innerHTML = `
      <option value="">
        Selecione a porcentagem
      </option>
    `;

    opcoes.forEach((percentByIngred) => {
      const opt = document.createElement("option");

      opt.value = percentByIngred;
      opt.textContent = `${percentByIngred}%`;

      editPorcentSelect.appendChild(opt);
    });

    if (editPorcentSelect.value) {
      calcularGrama(editPorcentSelect.value, editGramaSpan);
    } else {
      editGramaSpan.innerText = "";
    }
  }
}

editPorcentSelect.addEventListener("change", () => {
  calcularGrama(editPorcentSelect.value, editGramaSpan);
});

editNomeIngred.addEventListener("change", () => {
  const novoIngrediente = editNomeIngred.value;

  renderEditFields(novoIngrediente, "");
});

/* SALVAR ALTERAÇÕES DA EDIÇÃO */
if (saveEditBtn) {
  saveEditBtn.addEventListener("click", (saveEdition) => {
    saveEdition.preventDefault();
    if (!editingRow) return;

    const newIngredKey = editNomeIngred.value;
    const newName =
      editNomeIngred.options[editNomeIngred.selectedIndex]?.text || "";
    const newPpq = numeroBR(editPpq.textContent);
    const newPreco = numeroBR(editIngredPreco.value);
    const newPesoPacote = numeroBR(editPesoPacoteIngred?.value);
    let newQuantValue = "";
    let newGramaValue = "";
    let newPrecoValue = `R$ ${newPreco}`;
    let newPpqValue = `R$ ${newPpq}`;

    if (!newIngredKey) {
      alert("Selecione um ingrediente.");
      return;
    }
    const ingredienteDuplicado = [...document.querySelectorAll("#tablePlace tbody tr")].some((linha) => linha !== editingRow && linha.dataset.ingredValue === newIngredKey);
    if (ingredienteDuplicado) {
      alert("Esse ingrediente já está na receita.");
      return;
    }
    if (editIngredPreco.value.trim() === "" || newPreco < 0 || newPesoPacote <= 0) {
      alert("Informe o preço do pacote e um peso de embalagem válido.");
      return;
    }

    if (newIngredKey === "farinha") {
      const farinhaInput = document.getElementById("farinhaNumber");
      const novoPeso = parseFloat(farinhaInput.value) || 0;

      if (novoPeso <= 0) {
        alert("Digite um peso válido para a farinha.");
        return;
      }

      getFarinhaBase.value = novoPeso;
      newQuantValue = "100% (Base)";
      newGramaValue = `${novoPeso.toFixed(2)} g`;
      newPrecoValue = `R$ ${newPreco.toFixed(2)}`;
      newPpqValue = `R$ ${newPpq.toFixed(2)}`;
    } else {
      if (!editPorcentSelect.value) {
        alert("Selecione a porcentagem.");
        return;
      }
      newQuantValue = `${editPorcentSelect.value}%`;
      newGramaValue = editGramaSpan.textContent;
      newPrecoValue = `R$ ${newPreco.toFixed(2)}`;
    }

    editingRow.dataset.ingredValue = newIngredKey;
    editingRow.dataset.pesoPacote = String(newPesoPacote);
    editingRow.querySelector(".col-nome").textContent = newName;
    editingRow.querySelector(".col-quant").textContent = newQuantValue;
    editingRow.querySelector(".col-preco").textContent = newPrecoValue;
    editingRow.querySelector(".col-pacote").textContent = `${newPesoPacote.toFixed(2)} g`;
    editingRow.querySelector(".col-grama").textContent = newGramaValue;
    editingRow.querySelector(".col-ppq").textContent = newPpqValue;

    massaCruaCalc();
    massaTotalCalc();
    closeEditModal();
  });
}

/* PRÉVIA DA FOTO DA RECEITA */
const imageInput = document.getElementById("imgReceita");
const imagePreview = document.getElementById("imagePreview");
const uploadPlaceholder = document.querySelector(".upload-placeholder");

if (imageInput) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Selecione uma imagem JPG ou PNG.");
      imageInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5 MB.");
      imageInput.value = "";
      return;
    }

    imagePreview.src = URL.createObjectURL(file);
    imagePreview.hidden = false;
    if (uploadPlaceholder) {
      uploadPlaceholder.hidden = true;
    }
  });
}

/* TOOLTIPS DOS BOTÕES DA TABELA*/
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  document.addEventListener(
    "mouseover",
    (OnHover) => {
      const target = OnHover.target.closest("[data-tooltip]");

      if (!target) {
        return;
      }

      tooltip.textContent = target.dataset.tooltip;

      const rect = target.getBoundingClientRect();
      tooltip.style.left = rect.left + window.scrollX + "px";
      tooltip.style.top = rect.bottom + window.scrollY + "px";
      tooltip.style.display = "block";
    },
    true,
  );

  document.addEventListener(
    "mouseout",
    (OnHoverOut) => {
      const target = OnHoverOut.target.closest("[data-tooltip]");
      if (!target) {
        return;
      }

      tooltip.style.display = "none";
    },
    true,
  );
});

/* CORRECOES: conversao brasileira, recalculo automatico e custo atualizado */
function numeroBR(valor) {
  const texto = String(valor ?? "").replace(/R\$\s?/gi, "").replace(/[g%]$/i, "").replace(/\s/g, "");
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

function atualizarPreviaIngrediente() {
  if (!getIngredQuant || !getIngredPreco || !getPpq || !getIngredGr) return;
  if (!getIngredName?.value) {
    getIngredGr.style.display = "none";
    getIngredGr.textContent = "";
    getPpq.textContent = "";
    return;
  }
  if (getIngredName.value !== "farinha" && getIngredQuant.value === "") {
    getIngredGr.style.display = "none";
    getIngredGr.textContent = "";
    getPpq.style.display = "block";
    getPpq.textContent = "Selecione a porcentagem";
    return;
  }
  const gramas = calcularGrama(getIngredQuant.value);
  calcPpq(gramas, getIngredPreco, getPpq, getPesoPacoteIngred);
}
getIngredPreco?.addEventListener("input", atualizarPreviaIngrediente);
getPesoPacoteIngred?.addEventListener("input", atualizarPreviaIngrediente);
getIngredQuant?.addEventListener("change", atualizarPreviaIngrediente);
getFarinhaBase?.addEventListener("input", () => {
  if (getIngredName?.value === "farinha") atualizarPreviaIngrediente();
});

function atualizarPreviaEdicao() {
  if (!editIngredPreco || !editPpq) return;
  const chave = editNomeIngred?.value;
  if (!chave) {
    editPpq.textContent = "";
    return;
  }
  if (chave !== "farinha" && (!editPorcentSelect || editPorcentSelect.value === "")) {
    if (editGramaSpan) editGramaSpan.textContent = "";
    editPpq.textContent = "Selecione a porcentagem";
    return;
  }
  let gramas = 0;
  if (chave === "farinha") {
    const campoFarinha = document.getElementById("farinhaNumber");
    gramas = Number(campoFarinha?.value) || 0;
  } else {
    gramas = calcularGrama(editPorcentSelect?.value || 0, editGramaSpan);
  }
  calcPpq(gramas, editIngredPreco, editPpq, editPesoPacoteIngred);
}
editIngredPreco?.addEventListener("input", atualizarPreviaEdicao);
editPesoPacoteIngred?.addEventListener("input", atualizarPreviaEdicao);
editPorcentSelect?.addEventListener("change", atualizarPreviaEdicao);
editNomeIngred?.addEventListener("change", atualizarPreviaEdicao);
quantEditContainer?.addEventListener("input", (e) => {
  if (e.target.id === "farinhaNumber") atualizarPreviaEdicao();
});

// Corrige o custo da linha editada após o salvamento do listener original.
saveEditBtn?.addEventListener("click", () => {
  if (!editingRow || !editIngredPreco || !editPesoPacoteIngred) return;
  const precoPacote = numeroBR(editIngredPreco.value);
  const pesoPacote = numeroBR(editPesoPacoteIngred.value);
  editingRow.dataset.pesoPacote = String(pesoPacote);
  editingRow.querySelector(".col-preco").textContent = formatarReais(precoPacote, 2);
  editingRow.querySelector(".col-pacote").textContent = `${pesoPacote.toFixed(2)} g`;
  if (getFarinhaBase) getFarinhaBase.disabled = Boolean(document.querySelector('#tablePlace tbody tr[data-ingred-value="farinha"]'));
  recalcularIngredientesReceita();
});

// Exibe o preço digitado com separadores brasileiros ao adicionar a linha.
// Só atualiza a linha quando o listener original realmente adicionou uma nova.
renderTable?.addEventListener("click", (e) => {
  e.__linhasAntes = document.querySelectorAll("#tablePlace tbody tr").length;
  e.__precoPacote = getIngredPreco?.value;
  e.__pesoPacote = getPesoPacoteIngred?.value;
}, true);
renderTable?.addEventListener("click", (e) => {
  const linhas = [...document.querySelectorAll("#tablePlace tbody tr")];
  if (!linhas.length || linhas.length <= e.__linhasAntes) return;
  const linha = linhas[linhas.length - 1];
  const precoPacote = numeroBR(e.__precoPacote);
  const pesoPacote = numeroBR(e.__pesoPacote);
  linha.dataset.pesoPacote = String(pesoPacote);
  linha.querySelector(".col-preco").textContent = formatarReais(precoPacote, 2);
  linha.querySelector(".col-pacote").textContent = `${pesoPacote.toFixed(2)} g`;
  recalcularIngredientesReceita();
});
// Escapa valores antes de inseri-los em templates HTML.
function escapeHtml(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
  })[caractere]);
}
getPesoUnidadeCrua?.addEventListener("input", massaCruaCalc);
function formatarReais(valor, casas = 4) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(Number(valor) || 0);
}

function atualizarValorTotal() {
  const campoTotal = document.getElementById("valorTotal");
  if (!campoTotal) return;
  const linhas = document.querySelectorAll("#tablePlace tbody tr");
  const total = [...linhas].reduce((soma, linha) => {
    const armazenado = Number(linha.dataset.custoIngrediente);
    const custo = Number.isFinite(armazenado)
      ? armazenado
      : numeroBR(linha.querySelector(".col-ppq")?.textContent);
    return soma + custo;
  }, 0);
  campoTotal.textContent = formatarReais(total, 2);
}

function recalcularIngredientesReceita() {
  const pesoBase = numeroBR(getFarinhaBase?.value);
  const linhas = document.querySelectorAll("#tablePlace tbody tr");
  linhas.forEach((linha) => {
    const chave = linha.dataset.ingredValue;
    const percentual = numeroBR(linha.querySelector(".col-quant")?.textContent);
    const gramas = chave === "farinha" ? pesoBase : (pesoBase * percentual) / 100;
    const precoPacote = numeroBR(linha.querySelector(".col-preco")?.textContent);
    const pesoPacote = numeroBR(linha.dataset.pesoPacote || linha.querySelector(".col-pacote")?.textContent);
    const custo = pesoPacote > 0 ? (precoPacote * gramas) / pesoPacote : 0;
    const gramasCell = linha.querySelector(".col-grama");
    const custoCell = linha.querySelector(".col-ppq");
    if (gramasCell) gramasCell.textContent = `${gramas.toFixed(2)} g`;
    if (custoCell) custoCell.textContent = formatarReais(custo);
    linha.dataset.custoIngrediente = String(custo);
  });
  massaCruaCalc();
  massaTotalCalc();
  atualizarValorTotal();
}

function faixaPercentual(inicio, fim, passo) {
  const quantidade = Math.round((fim - inicio) / passo);
  return Array.from({ length: quantidade + 1 }, (_, i) =>
    Number((inicio + i * passo).toFixed(2)),
  );
}

function getOpcoesPercentual(ingrediente, categoria = getRecipeCatogry?.value) {
  const salgada = "massaSalgada";
  const semiDoce = "massaDoce";
  const doce = "sobremessa";
  const faixas = {
    acucar: {
      [salgada]: faixaPercentual(0, 4, 0.5),
      [semiDoce]: faixaPercentual(5, 14, 1),
      [doce]: faixaPercentual(15, 25, 1),
    },
    sal: { [salgada]: [2], [semiDoce]: [2], [doce]: [1.5] },
    fermentoFresco: {
      [salgada]: faixaPercentual(1, 5, 0.5),
      [semiDoce]: faixaPercentual(1, 5, 0.5),
      [doce]: faixaPercentual(4, 10, 0.5),
    },
    fermentoSeco: {
      [salgada]: faixaPercentual(0.1, 2.5, 0.1),
      [semiDoce]: faixaPercentual(1, 3.5, 0.1),
      [doce]: faixaPercentual(3, 5, 0.1),
    },
    gordura: {
      [salgada]: faixaPercentual(0, 4, 0.5),
      [semiDoce]: faixaPercentual(5, 10, 0.5),
      [doce]: faixaPercentual(5, 10, 0.5),
    },
    agua: { [salgada]: [50, 55, 58, 59, 60, 65, 70, 75, 80], [semiDoce]: [50, 55, 58, 59, 60, 65, 70, 75, 80], [doce]: [50, 55, 58, 59, 60, 65, 70, 75, 80] },
    aditivoPo: { [salgada]: [1], [semiDoce]: [1], [doce]: [1] },
    aditivoLiqui: { [salgada]: [0.2], [semiDoce]: [0.2], [doce]: [0.2] },
    aditivoPasta: { [salgada]: [0.3], [semiDoce]: [0.3], [doce]: [0.3] },
    leiteLiquido: { [salgada]: faixaPercentual(0, 60, 5), [semiDoce]: faixaPercentual(0, 60, 5), [doce]: faixaPercentual(0, 60, 5) },
    leitePo: { [salgada]: faixaPercentual(0, 6, 0.5), [semiDoce]: faixaPercentual(0, 6, 0.5), [doce]: faixaPercentual(0, 6, 0.5) },
  };
  return faixas[ingrediente]?.[categoria] || porcentPorIngred[ingrediente] || [];
}

getRecipeCatogry?.addEventListener("change", () => {
  const ingrediente = getIngredName?.value;
  if (!ingrediente || ingrediente === "farinha" || !getIngredQuant) return;
  const valorAtual = getIngredQuant.value;
  const opcoes = getOpcoesPercentual(ingrediente);
  getIngredQuant.replaceChildren(new Option("Selecione a porcentagem", ""));
  opcoes.forEach((percentual) => getIngredQuant.add(new Option(`${percentual}%`, String(percentual))));
  if (opcoes.includes(Number(valorAtual))) getIngredQuant.value = valorAtual;
  atualizarPreviaIngrediente();
});

getFarinhaBase?.addEventListener("input", () => {
  if (!getFarinhaBase.disabled) recalcularIngredientesReceita();
  if (getIngredName?.value === "farinha") atualizarPreviaIngrediente();
});

tablePlacement?.addEventListener("click", (e) => {
  if (e.target.closest(".delete-item")) {
    const farinhaNaTabela = document.querySelector('#tablePlace tbody tr[data-ingred-value="farinha"]');
    if (!farinhaNaTabela && getFarinhaBase) getFarinhaBase.disabled = false;
  }
  recalcularIngredientesReceita();
});

atualizarValorTotal();