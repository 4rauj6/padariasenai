const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredPreco = document.getElementById("precoIngred");
const getIngredGr = document.getElementById("gramaDoIngred");
const getPpq = document.getElementById("precoPq");
const getFornoType = document.getElementById("tipoForno");
const renderTable = document.querySelector(".save-ingred");
const getRecipeCatogry = document.getElementById("categoriaReceita");
const getFarinhaBase = document.getElementById("pesoBaseFarinha");

/* ELEMENTOS DO MODAL DE EDIÇÃO */
const editNomeIngred = document.getElementById("editNomeIngred");
const editPorcentSelect = document.getElementById("editPorcent");
const quantEditContainer = document.getElementById("quantEdit");
const editIngredPreco = document.getElementById("editPrecoIngred");
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
function calcularGrama(
  percentValue,
  outputElement = getIngredGr,
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

  outputElement.style.display = "block";
  outputElement.style.backgroundColor = "transparent";
  outputElement.style.border = "solid 2px #e8c9a0";
  outputElement.style.padding = "4px 8px";
  outputElement.style.borderRadius = "4px";

  if (pesoFarinha <= 0) {
    outputElement.innerText = "Informe o peso da farinha no formulário!";
    return 0;
  }

  if (porcentagemNum <= 0) {
    outputElement.innerText = "A porcentagem deve ser maior que 0%";
    return 0;
  }

  const resultadoGrama = (porcentagemNum / 100) * pesoFarinha;
  outputElement.innerText = `${resultadoGrama.toFixed(0)} g`;

  return resultadoGrama;
}

function calcPpq(
  gramasCalc,
  precoInput = getIngredPreco,
  outputElement = getPpq,
) {
  if (!outputElement) {
    return 0;
  }

  const rowPreco = precoInput ? precoInput.value : "0";
  const precoPacote =
    parseFloat(rowPreco.replace("R$", "").replace(",", ".").trim()) || 0;

  outputElement.style.display = "block";
  outputElement.style.backgroundColor = "transparent";
  outputElement.style.border = "solid 2px #e8c9a0";
  outputElement.style.padding = "4px 8px";
  outputElement.style.borderRadius = "4px";

  if (precoPacote <= 0) {
    outputElement.innerText = "Por favor informe o preço primmeiro";
    return 0;
  }

  const pPg = precoPacote / 1000;
  const precoUtili = pPg * (gramasCalc || 0);

  outputElement.innerText = `R$ ${precoUtili.toFixed(2)}`;

  return precoUtili;
}

const timeEstimative = document.getElementById("tempoEstimado");
const porcoesEstimative = document.getElementById("porcoesEstimadas");
const pesoMassaTotal = document.getElementById("pesoMassaTotal");
const pesoMassaCrua = document.getElementById("pesoMassaCrua");

const ppqInTable = document.querySelector(".col-ppq");

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
  const opcoes = porcentPorIngred[actualIngred] || [];

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
    calcPpq();
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
  const preco = getIngredPreco.value.replace("R$", "").replace(",", ".") || "0";
  const grama = getIngredGr.textContent || "0 g";
  const precoQuant =
    getPpq.textContent.replace("R$", "").replace(",", ".") || "0";

  if (!getIngredName.value || !getIngredQuant.value) {
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
  tr.innerHTML = `
    <td class="col-nome">${name}</td>
    <td class="col-quant">${quant}</td>
    <td class="col-preco">R$ ${preco}</td>
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
  const ingredKey = row.dataset.ingredValue;

  document.querySelector(".overlay-edit")?.classList.remove("hidden");
  document.querySelector(".modal-edit-body")?.classList.remove("hidden");

  const currentQuantIndex = row
    .querySelector(".col-quant")
    .textContent.replace("%", "")
    .trim();

  renderEditFields(ingredKey, currentQuantIndex);
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
        value="${getFarinhaBase.value}"
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
    const newPpq = parseFloat(
      editPpq.textContent.replace("R$", "").replace(",", ".") || "0",
    );
    const newPreco =
      parseFloat(editIngredPreco.value.replace("R$", "").replace(",", ".")) ||
      "0";
    let newQuantValue = "";
    let newGramaValue = "";
    let newPrecoValue = `R$ ${newPreco}`;
    let newPpqValue = `R$ ${newPpq}`;

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
    editingRow.querySelector(".col-nome").textContent = newName;
    editingRow.querySelector(".col-quant").textContent = newQuantValue;
    editingRow.querySelector(".col-preco").textContent = newPrecoValue;
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
    if (!file) return;

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
    if (uploadPlaceholder) uploadPlaceholder.hidden = true;
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
