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
const getFornoType = document.getElementById("tipoForno");
const renderTable = document.querySelector(".save-ingred");
const getRecipeCatogry = document.getElementById("categoriaReceita");
const getFarinhaBase = document.getElementById("pesoBaseFarinha");

const editNomeIngred = document.getElementById("editNomeIngred");
const editPorcentSelect = document.getElementById("editPorcent");
const quantEditContainer = document.getElementById("quantEdit");
const editIngredPreco = document.getElementById("editPrecoIngred");
const editPesoPacote = document.getElementById("editPesoPacote");
const editPpq = document.getElementById("editPrecoPq");
const editGramaSpan = document.getElementById("editGrama");
const editTipoFornoSelect = document.getElementById("editTipoForno");
const saveEditBtn = document.querySelector(".save-edit-ingred");

let editingRow = null;

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
};

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
    if (getIngredPreco) getIngredPreco.value = "";
    if (getPctPeso) getPctPeso.value = "";
    getIngredGr.textContent = "";
    getIngredGr.style.display = "none";
    if (getPpq) getPpq.style.display = "none";
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

function calcularGrama(
  percentValue,
  screenRender = getIngredGr,
  baseFarinhaCustom = null,
) {
  const valorFarinha =
    baseFarinhaCustom !== null
      ? String(baseFarinhaCustom).replace(",", ".").trim()
      : getFarinhaBase
        ? getFarinhaBase.value.replace(",", ".").trim()
        : "0";

  const pesoFarinha = parseFloat(valorFarinha) || 0;
  const porcentagemNum = parseFloat(percentValue) || 0;

  screenRender.style.display = "block";
  screenRender.style.backgroundColor = "transparent";
  screenRender.style.border = "solid 2px #e8c9a0";
  screenRender.style.padding = "4px 8px";
  screenRender.style.borderRadius = "4px";

  if (pesoFarinha <= 0) {
    screenRender.innerText = "Informe o peso da farinha no formulário!";
    return 0;
  }

  if (porcentagemNum <= 0) {
    screenRender.innerText = "A porcentagem deve ser maior que 0%";
    return 0;
  }

  const gramaUtili = (porcentagemNum / 100) * pesoFarinha;
  screenRender.innerText = `${gramaUtili.toFixed(0)} g`;

  return gramaUtili;
}

function calcPpq(
  gramasCalc,
  precoIngredElement = getIngredPreco,
  pesoPctElement = getPctPeso,
  screenRender = getPpq,
) {
  if (!screenRender) {
    return 0;
  }

  const rowPreco = precoIngredElement ? precoIngredElement.value : "0";
  const precoPacote =
    parseFloat(rowPreco.replace("R$", "").replace(",", ".").trim()) || 0;

  const rowPeso = pesoPctElement ? pesoPctElement.value : "0";
  const pesoPacote =
    parseFloat(rowPeso.replace("g", "").replace(",", ".").trim()) || 0;

  screenRender.style.display = "block";
  screenRender.style.backgroundColor = "transparent";
  screenRender.style.border = "solid 2px #e8c9a0";
  screenRender.style.padding = "4px 8px";
  screenRender.style.borderRadius = "4px";

  if (precoPacote <= 0 || pesoPacote <= 0) {
    screenRender.innerText = "Informe o preço e o peso do pacote";
    return 0;
  }

  const pPg = precoPacote / pesoPacote;
  const precoUtili = pPg * (gramasCalc || 0);

  screenRender.innerText = `R$ ${precoUtili.toFixed(2)}`;

  return precoUtili;
}

const timeEstimative = document.getElementById("tempoEstimado");
const porcoesEstimative = document.getElementById("porcoesEstimadas");
const pesoMassaTotal = document.getElementById("pesoMassaTotal");
const pesoMassaCrua = document.getElementById("pesoMassaCrua");
const valorTotalSpan = document.getElementById("valorTotal");

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
    pesoMassaCrua.textContent = `${pesoCru.toFixed(0)} g`;
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
    pesoMassaTotal.textContent = `${WeightEstimate.toFixed(0)} g`;
  }
}

function valorTotalCalc() {
  const searchInTableRows = document.querySelectorAll("#tablePlace tbody tr");
  let totalCusto = 0;

  searchInTableRows.forEach((row) => {
    const ppqTd = row.querySelector(".col-ppq");

    if (ppqTd) {
      const textCleaner =
        ppqTd.textContent.replace("R$", "").replace(",", ".").trim() || "0";

      const ppqNum = parseFloat(textCleaner) || 0;
      totalCusto += ppqNum;
    }
  });

  if (valorTotalSpan) {
    valorTotalSpan.textContent = `R$ ${totalCusto.toFixed(2)}`;
  }
}

getIngredName.addEventListener("change", () => {
  const actualIngred = getIngredName.value;
  const opcoes = porcentPorIngred[actualIngred] || [];

  getIngredQuant.innerHTML = "";
  getIngredGr.style.display = "none";
  if (getPpq) getPpq.style.display = "none";

  if (!actualIngred) {
    getIngredQuant.innerHTML = `<option value="">Selecione um ingrediente primeiro</option>`;
    getIngredQuant.disabled = true;
    return;
  }

  if (actualIngred === "farinha") {
    getIngredQuant.innerHTML = `<option value="100" selected>100% (Base)</option>`;
    getIngredQuant.disabled = true;
    const g = calcularGrama(100);
    calcPpq(g, getIngredPreco, getPctPeso, getPpq);
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
  const g = calcularGrama(percentValue);
  calcPpq(g, getIngredPreco, getPctPeso, getPpq);
});

if (getIngredPreco) {
  getIngredPreco.addEventListener("input", () => {
    const percentValue = parseFloat(getIngredQuant.value) || 0;
    const g = calcularGrama(percentValue);
    calcPpq(g, getIngredPreco, getPctPeso, getPpq);
  });
}

if (getPctPeso) {
  getPctPeso.addEventListener("input", () => {
    const percentValue = parseFloat(getIngredQuant.value) || 0;
    const g = calcularGrama(percentValue);
    calcPpq(g, getIngredPreco, getPctPeso, getPpq);
  });
}

const tablePlacement = document.getElementById("tablePlace");

renderTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("save-edit-ingred")) return;
  e.preventDefault();

  const ingredValue = getIngredName.value;
  const name = getIngredName.options[getIngredName.selectedIndex]?.text || "";
  const quant =
    getIngredQuant.options[getIngredQuant.selectedIndex]?.text || "";
  const preco = getIngredPreco.value.replace("R$", "").replace(",", ".") || "0";
  const pesoPacoteVal = getPctPeso.value.replace(",", ".") || "0";
  const grama = getIngredGr.textContent || "0 g";
  const precoQuant = getPpq ? getPpq.textContent : "R$ 0,00";

  if (
    !getIngredName.value ||
    !getIngredQuant.value ||
    !getPctPeso.value ||
    !getIngredPreco.value
  ) {
    alert("Preencha todos os campos do ingrediente.");
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
        <th>Preço do pacote</th>
        <th>Peso do pacote</th>
        <th>Gramas utilizadas</th>
        <th>Preço utilizado</th>
        <th>Ação</th>
      </tr>`;

    table.appendChild(th);
    table.appendChild(tb);
    tablePlacement.appendChild(table);
  }

  let tr = document.createElement("tr");
  tr.dataset.ingredValue = ingredValue;
  tr.dataset.pesoPacote = pesoPacoteVal;
  tr.innerHTML = `
    <td class="col-nome">${name}</td>
    <td class="col-quant">${quant}</td>
    <td class="col-preco">R$ ${parseFloat(preco || 0).toFixed(2)}</td>
    <td class="col-peso-pacote">${pesoPacoteVal} g</td>
    <td class="col-grama">${grama}</td>
    <td class="col-ppq">${precoQuant}</td>
    <td>
      <button class="delete-item" id="editionBtn" data-tooltip="Excluir ingrediente"><i class="fa-solid fa-trash"></i></button>
      <button class="edit-item" id="editionBtn" data-tooltip="Editar ingrediente"><i class="fa-solid fa-pencil"></i></button>
    </td>
  `;
  tb.appendChild(tr);

  if (ingredValue === "farinha") {
    getFarinhaBase.disabled = true;
  }

  massaCruaCalc();
  massaTotalCalc();
  valorTotalCalc();

  setModalState(false);
});

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
      if (tooltipLabel.length > 0) tooltipLabel[0].style.display = "none";
    }
  } else if (editItem) {
    openEditModal(editItem.closest("tr"));
  }

  massaCruaCalc();
  massaTotalCalc();
  valorTotalCalc();
});

function openEditModal(row) {
  editingRow = row;
  const ingredKey = row.dataset.ingredValue;

  document.querySelector(".overlay-edit")?.classList.remove("hidden");
  document.querySelector(".modal-edit-body")?.classList.remove("hidden");

  const currentQuantIndex = row
    .querySelector(".col-quant")
    .textContent.replace("%", "")
    .trim();

  const currentPrecoIndex = row
    .querySelector(".col-preco")
    .textContent.replace("R$", "")
    .trim();

  const currentPesoPacote = row.dataset.pesoPacote || "1000";

  if (editIngredPreco) {
    editIngredPreco.value = currentPrecoIndex;
  }

  if (editPesoPacote) {
    editPesoPacote.value = currentPesoPacote;
  }

  renderEditFields(ingredKey, currentQuantIndex, currentPrecoIndex);
}

function closeEditModal() {
  document.querySelector(".overlay-edit")?.classList.add("hidden");
  document.querySelector(".modal-edit-body")?.classList.add("hidden");
  outsideModalBody.style.filter = "blur(0)";
}

function renderEditFields(ingredKey) {
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
        value="${getFarinhaBase.value}"
      >
    `;

    const farinhaInput = document.getElementById("farinhaNumber");

    const g = calcularGrama(100, editGramaSpan, farinhaInput.value);
    calcPpq(g, editIngredPreco, editPesoPacote, editPpq);

    farinhaInput.addEventListener("input", () => {
      const gCalc = calcularGrama(100, editGramaSpan, farinhaInput.value);
      calcPpq(gCalc, editIngredPreco, editPesoPacote, editPpq);
    });
  } else {
    editPorcentSelect.style.display = "block";

    const porcentLabel = document.querySelector("label[for='editPorcent']");

    if (porcentLabel) {
      porcentLabel.style.display = "block";
    }

    const opcoes = porcentPorIngred[ingredKey] || [];

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
      const g = calcularGrama(editPorcentSelect.value, editGramaSpan);
      calcPpq(g, editIngredPreco, editPesoPacote, editPpq);
    } else {
      editGramaSpan.innerText = "";
      if (editPpq) {
        editPpq.innerHTML = "";
      }
    }
  }
}

editPorcentSelect.addEventListener("change", () => {
  const g = calcularGrama(editPorcentSelect.value, editGramaSpan);
  calcPpq(g, editIngredPreco, editPesoPacote, editPpq);
});

if (editIngredPreco) {
  editIngredPreco.addEventListener("input", () => {
    let gramas = 0;
    if (editNomeIngred.value === "farinha") {
      const farinhaInput = document.getElementById("farinhaNumber");
      gramas = calcularGrama(
        100,
        editGramaSpan,
        farinhaInput ? farinhaInput.value : null,
      );
    } else {
      gramas = calcularGrama(editPorcentSelect.value, editGramaSpan);
    }
    calcPpq(gramas, editIngredPreco, editPesoPacote, editPpq);
  });
}

if (editPesoPacote) {
  editPesoPacote.addEventListener("input", () => {
    let gramas = 0;
    if (editNomeIngred.value === "farinha") {
      const farinhaInput = document.getElementById("farinhaNumber");
      gramas = calcularGrama(
        100,
        editGramaSpan,
        farinhaInput ? farinhaInput.value : null,
      );
    } else {
      gramas = calcularGrama(editPorcentSelect.value, editGramaSpan);
    }
    calcPpq(gramas, editIngredPreco, editPesoPacote, editPpq);
  });
}

editNomeIngred.addEventListener("change", () => {
  const novoIngrediente = editNomeIngred.value;

  renderEditFields(novoIngrediente, "");
});

if (saveEditBtn) {
  saveEditBtn.addEventListener("click", (saveEdition) => {
    saveEdition.preventDefault();
    if (!editingRow) return;

    const newIngredKey = editNomeIngred.value;
    const newName =
      editNomeIngred.options[editNomeIngred.selectedIndex]?.text || "";
    const newPreco =
      parseFloat(editIngredPreco.value.replace("R$", "").replace(",", ".")) ||
      0;
    const newPesoPacote =
      parseFloat(editPesoPacote.value.replace("g", "").replace(",", ".")) || 0;

    let newQuantValue = "";
    let newGramaValue = "";
    let newPrecoValue = `R$ ${newPreco.toFixed(2)}`;
    let newPpqValue = editPpq ? editPpq.textContent : "R$ 0,00";

    if (!newIngredKey) {
      alert("Selecione um ingrediente.");
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
      newGramaValue = `${novoPeso.toFixed(0)} g`;
    } else {
      if (!editPorcentSelect.value) {
        alert("Selecione a porcentagem.");
        return;
      }
      newQuantValue = `${editPorcentSelect.value}%`;
      newGramaValue = editGramaSpan.textContent;
    }

    editingRow.dataset.ingredValue = newIngredKey;
    editingRow.dataset.pesoPacote = newPesoPacote;
    editingRow.querySelector(".col-nome").textContent = newName;
    editingRow.querySelector(".col-quant").textContent = newQuantValue;
    editingRow.querySelector(".col-preco").textContent = newPrecoValue;
    editingRow.querySelector(".col-peso-pacote").textContent =
      `${newPesoPacote} g`;
    editingRow.querySelector(".col-grama").textContent = newGramaValue;
    editingRow.querySelector(".col-ppq").textContent = newPpqValue;

    massaCruaCalc();
    massaTotalCalc();
    valorTotalCalc();
    closeEditModal();
  });
}

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
