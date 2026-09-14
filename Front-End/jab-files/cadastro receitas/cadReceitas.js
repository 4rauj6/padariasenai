/*LÓGICA DO PRIMEIRO MODAL*/
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredGr = document.getElementById("gramaDoIngred");
const getINgredType = document.getElementById("tipoIngred");
const saveButton = document.querySelector(".save-ingred");

function setModalState(isOpen) {
  modal.classList.toggle("hidden", !isOpen);
  overlay.classList.toggle("hidden", !isOpen);

  if (!isOpen) {
    [getIngredName, getIngredQuant, getINgredType].forEach(
      (index) => (index.selectedIndex = 0),
    );
    getIngredQuant.disabled = true;
    getIngredGr.textContent = "";
    getIngredGr.style.display = "none";
  }
}

modalButtons.forEach((modalElement) => {
  modalElement.addEventListener("click", () => {
    if (modalElement.classList.contains("addIngred")) {
      setModalState(true);
      outsideModalBody.style.filter = "grayscale(100%)";
    } else {
      setModalState(false);
      outsideModalBody.style.filter = "grayscale(0)";
    }
  });
});

overlay.addEventListener("click", (event) => {
  if (!event.target.closest(".modal-body")) {
    setModalState(false);
  }
});

/*LÓGICA PARA CADA INGREDIENTE TER SUA  */
const percentPorIngred = {
  acucar: [0, 0.5, 1, 1.5, 2],
  fermentoFresco: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  fermentoSeco: [0, 0.5, 1, 1.5, 2, 2.5],
};

const selectedIngred = document.querySelector("#nomeIngred");
const percentSelectPlace = document.querySelector("#quantIngred");

selectedIngred.addEventListener("change", () => {
  const actualIngred = selectedIngred.value;
  const actualIngredQuant = percentPorIngred[actualIngred] || [];
  const resultBox = document.getElementById("gramaDoIngred");

  percentSelectPlace.innerHTML = "";

  if (resultBox) {
    resultBox.style.display = "none";
  }

  if (actualIngredQuant.length === 0) {
    percentSelectPlace.innerHTML = `<option value="">Nenhuma quantidade disponível</option>`;

    percentSelectPlace.disabled = true;
    return;
  }

  percentSelectPlace.innerHTML = `<option value="">Seleciona a quantidade</option>`;

  actualIngredQuant.forEach((percent) => {
    const options = document.createElement("option");

    options.value = percent;
    options.textContent = `${percent}%`;

    percentSelectPlace.appendChild(options);
  });

  percentSelectPlace.disabled = false;
});

/*LÓGICA DO CALCÚLO PARA PORCENTAGEM ESCOLHIDA SER TRANSFORMADA EM GRAMAS */
const percentIngred = document.getElementById("quantIngred");

percentIngred.addEventListener("change", () => {
  const percentValue = parseFloat(percentIngred.value) || 0;
  const totalWeight = 1000;
  const result = (percentValue / 100) * totalWeight;
  const resultPlacement = document.getElementById("gramaDoIngred");

  if (result === 0) {
    resultPlacement.style.display = "none";
  } else {
    resultPlacement.style.display = "block";
  }

  resultPlacement.innerText = `${result.toFixed(2)} g`;
  resultPlacement.style.backgroundColor = "#f2e8d9";
});

/*LÓGICA DE CRIAR E RENDERIZAR A TABELA PELO MODAL DE CADASTRAR RECEITA*/
const tablePlacement = document.getElementById("tablePlace");

saveButton.addEventListener("click", (e) => {
  e.preventDefault();

  const name = getIngredName.options[getIngredName.selectedIndex]?.text || "";
  const quant =
    getIngredQuant.options[getIngredQuant.selectedIndex]?.text || "";
  const grama = getIngredGr.textContent || "0g";
  const type = getINgredType.options[getINgredType.selectedIndex]?.text || "";

  if (!getIngredName.value || !getIngredQuant.value) {
    alert("Todos os campos precisão ser preenchidos antes de salvar");
    return;
  }

  let table = document.createElement("table");
  let th = document.createElement("thead");
  let tr = document.createElement("tr");
  let tb = tablePlacement.querySelector("tbody");

  if (!tb) {
    tb = document.createElement("tbody");

    th.innerHTML = `
    <tr>
      <th>Nome do ingrediente</th>
      <th>Porcentagem</th>
      <th>Quantidade em grama</th>
      <th>Tipo</th>
    </tr>`;

    table.appendChild(th);
    table.appendChild(tb);
    tablePlacement.appendChild(table);
  }

  tr.innerHTML = `
      <td>${name}</td>
      <td>${quant}</td>
      <td>${grama}</td>
      <td>${type}</td>
  `;

  tb.appendChild(tr);

  getIngredName.selectedIndex = 0;
  getIngredQuant.selectedIndex = 0;
  getIngredQuant.disabled = true;
  getIngredGr.textContent = "";
  getINgredType.selectedIndex = 0;

  setModalState(false);
});
