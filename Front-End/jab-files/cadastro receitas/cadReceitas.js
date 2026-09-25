/* LÓGICA DO MODAL E ELEMENTOS DO DOM */
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

/* MAPA DE PORCENTAGENS POR INGREDIENTE */
const percentPorIngred = {
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

/* ABRIR E FECHAR MODAL */
function setModalState(isOpen) {
  if (isOpen) {
    if (!getRecipeCatogry || !getRecipeCatogry.value) {
      alert(
        "Antes de adicionar os ingredientes selecione a categória da receita",
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
    }
  });
});

/* LÓGICA DE TRANSFORMAR AS PORCENTAGENS EM GRAMAS */
function calcularGrama(percentValue) {
  const valorFarinha = getFarinhaBase
    ? getFarinhaBase.value.replace(",", ".").trim()
    : "0";
  const pesoFarinha = parseFloat(valorFarinha) || 0;
  const porcentagemNum = parseFloat(percentValue) || 0;

  getIngredGr.style.display = "block";
  getIngredGr.style.backgroundColor = "transparent";
  getIngredGr.style.border = "solid 2px #e8c9a0";
  getIngredGr.style.padding = "4px 8px";
  getIngredGr.style.borderRadius = "4px";

  if (pesoFarinha <= 0) {
    getIngredGr.innerText = "Informe o peso da farinha no formulário!";
    return;
  }

  if (porcentagemNum <= 0) {
    getIngredGr.innerText = "A porcentagem deve ser maior que 0%";
    return;
  }

  const resultadoGrama = (porcentagemNum / 100) * pesoFarinha;
  getIngredGr.innerText = `${resultadoGrama.toFixed(2)} g`;

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
    pesoMassaCrua.textContent = "";
    const span = document.createTextNode(`${pesoCru.toFixed(2)} g`);
    pesoMassaCrua.appendChild(span);
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
    pesoMassaTotal.textContent = "";
    const span = document.createTextNode(`${WeightEstimate.toFixed(2)} g`);
    pesoMassaTotal.appendChild(span);
  }
}

/*LÓGICA DE SELEÇÃO DOS INGREDIENTES E TROCA DOS SEUS VALORES */
getIngredName.addEventListener("change", () => {
  const actualIngred = getIngredName.value;
  const opcoes = percentPorIngred[actualIngred] || [];

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

  if (actualIngred) getIngredQuant.disabled = false;
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

/* SALVAR OS INGREDIENTE DO MODAL E EXIBIR A TABELA */
const tablePlacement = document.getElementById("tablePlace");

renderTable.addEventListener("click", (e) => {
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
    <td>${quant}</td>
    <td class="col-grama">${grama}</td>
    <td>${type}</td>
    <td><button class="delete-item">Excluir</button></td>
    <td><button class="edit-item">Editar</button></td>
  `;
  tb.appendChild(tr);

  if (ingredValue === "farinha") {
    getFarinhaBase.disabled = true;
  }

  massaCruaCalc();
  massaTotalCalc();

  setModalState(false);
});

/* FUNÇÃO DE EXCLUIR O ITEM DA TABELA */
tablePlacement.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.classList.contains("delete-item")) {
    const row = e.target.closest("tr");
    const farinhaDeleted = row.dataset.ingredValue === "farinha";

    row.remove();

    if (farinhaDeleted) {
      getFarinhaBase.disabled = false;
    }

    const rowsNumber = document.querySelectorAll("tbody tr");

    if (rowsNumber.length === 0) {
      const tableLines = tablePlacement.querySelector("table");
      if (tableLines) {
        tableLines.remove();
      }
    }

    massaCruaCalc();
    massaTotalCalc();
  }
});

/* FUNÇÃO DE EDITAR O ITEM DA TABELA */
tablePlacement.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.classList.contains("edit-item")) {
  }
});

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
