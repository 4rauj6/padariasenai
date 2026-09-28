const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredGr = document.getElementById("gramaDoIngred");
const getFornoType = document.getElementById("tipoForno");
const renderTable = document.querySelector(".save-ingred");
const getRecipeCatogry = document.getElementById("categoriaReceita");
const getFarinhaBase = document.getElementById("pesoBaseFarinha");

/* ELEMENTOS DO MODAL DE EDIÇÃO */
const editNomeIngred = document.getElementById("editNomeIngred");
const editPorcentSelect = document.getElementById("editPorcent");
const quantEditContainer = document.getElementById("quantEdit");
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
  outputElement.innerText = `${resultadoGrama.toFixed(2)} g`;

  return resultadoGrama;
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
  const grama = getIngredGr.textContent || "0 g";
  const type = getFornoType.options[getFornoType.selectedIndex]?.text || "";

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
        <th>Gramas</th>
        <th>Forno</th>
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
    <td class="col-grama">${grama}</td>
    <td class="col-forno">${type}</td>
    <td>
      <button class="delete-item">Excluir</button>
      <button class="edit-item">Editar</button>
    </td>
  `;
  tb.appendChild(tr);

  if (ingredValue === "farinha") {
    getFarinhaBase.disabled = true;
  }

  massaCruaCalc();
  massaTotalCalc();

  setModalState(false);
});

/* FUNÇÃO DE EXCLUIR E EDITAR O ITEM DA TABELA */
tablePlacement.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-item")) {
    e.preventDefault();
    const row = e.target.closest("tr");
    const farinhaDeleted = row.dataset.ingredValue === "farinha";

    row.remove();

    if (farinhaDeleted) {
      getFarinhaBase.disabled = false;
    }

    const rowsNumber = document.querySelectorAll("#tablePlace tbody tr");
    if (rowsNumber.length === 0) {
      const tableLines = tablePlacement.querySelector("table");
      if (tableLines) tableLines.remove();
    }

    massaCruaCalc();
    massaTotalCalc();
  }

  if (e.target.classList.contains("edit-item")) {
    e.preventDefault();
    const row = e.target.closest("tr");
    openEditModal(row);
  }
});

/* LÓGICA PARA ABRIR DO MODAL DE EDIÇÃO */
function openEditModal(row) {
  editingRow = row;
  const ingredKey = row.dataset.ingredValue;

  document.querySelector(".overlay-edit")?.classList.remove("hidden");
  document.querySelector(".modal-edit-body")?.classList.remove("hidden");
  outsideModalBody.style.filter = "blur(10px)";

  editNomeIngred.value = ingredKey;

  const currentQuantText = row
    .querySelector(".col-quant")
    .textContent.replace("%", "")
    .trim();
  const currentFornoText = row.querySelector(".col-forno").textContent.trim();

  Array.from(editTipoFornoSelect.options).forEach((opt) => {
    opt.selected = opt.text.trim() === currentFornoText;
  });

  renderEditFields(ingredKey, currentQuantText);
}

function closeEditModal() {
  document.querySelector(".overlay-edit")?.classList.add("hidden");
  document.querySelector(".modal-edit-body")?.classList.add("hidden");
  outsideModalBody.style.filter = "blur(0)";
  editingRow = null;
}

function renderEditFields(ingredKey, selectedPercent) {
  quantEditContainer.innerHTML = "";

  if (ingredKey === "farinha") {
    editPorcentSelect.style.display = "none";
    document.querySelector("label[for='editPorcent']").style.display = "none";

    quantEditContainer.innerHTML = `
      <label for="farinhaNumber">Digite o peso base da farinha (1000g = 1kg):</label>
      <input type="number" id="farinhaNumber" value="${getFarinhaBase.value}">
    `;

    const farinhaInput = document.getElementById("farinhaNumber");
    calcularGrama(100, editGramaSpan, farinhaInput.value);

    farinhaInput.addEventListener("input", () => {
      calcularGrama(100, editGramaSpan, farinhaInput.value);
    });
  } else {
    editPorcentSelect.style.display = "block";
    document.querySelector("label[for='editPorcent']").style.display = "block";

    const opcoes = porcentPorIngred[ingredKey] || [];
    editPorcentSelect.innerHTML = `<option value="">Selecione a porcentagem</option>`;

    opcoes.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = `${p}%`;
      if (p === selectedPercent) opt.selected = true;
      editPorcentSelect.appendChild(opt);
    });

    if (editPorcentSelect.value) {
      calcularGrama(editPorcentSelect.value, editGramaSpan);
    } else {
      editGramaSpan.innerText = "";
    }
  }
}

editNomeIngred.addEventListener("change", () => {
  renderEditFields(editNomeIngred.value);
});

editPorcentSelect.addEventListener("change", () => {
  calcularGrama(editPorcentSelect.value, editGramaSpan);
});

/* SALVAR ALTERAÇÕES DA EDIÇÃO */
if (saveEditBtn) {
  saveEditBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!editingRow) return;

    const newIngredKey = editNomeIngred.value;
    const newName =
      editNomeIngred.options[editNomeIngred.selectedIndex]?.text || "";
    const newForno =
      editTipoFornoSelect.options[editTipoFornoSelect.selectedIndex]?.text ||
      "";

    if (!newIngredKey) {
      alert("Selecione um ingrediente.");
      return;
    }

    let newQuantText = "";
    let newGramaText = "";

    if (newIngredKey === "farinha") {
      const farinhaInput = document.getElementById("farinhaNumber");
      const novoPeso = parseFloat(farinhaInput.value) || 0;

      if (novoPeso <= 0) {
        alert("Digite um peso válido para a farinha.");
        return;
      }

      getFarinhaBase.value = novoPeso;
      newQuantText = "100% (Base)";
      newGramaText = `${novoPeso.toFixed(2)} g`;
    } else {
      if (!editPorcentSelect.value) {
        alert("Selecione a porcentagem.");
        return;
      }
      newQuantText = `${editPorcentSelect.value}%`;
      newGramaText = editGramaSpan.textContent;
    }

    editingRow.dataset.ingredValue = newIngredKey;
    editingRow.querySelector(".col-nome").textContent = newName;
    editingRow.querySelector(".col-quant").textContent = newQuantText;
    editingRow.querySelector(".col-grama").textContent = newGramaText;
    editingRow.querySelector(".col-forno").textContent = newForno;

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
