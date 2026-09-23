/*LÓGICA DO PRIMEIRO MODAL*/
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredGr = document.getElementById("gramaDoIngred");
const getFornoType = document.getElementById("tipoForno");

const saveButton = document.querySelector(".save-ingred");
const imageInput = document.getElementById("imgReceita");
const imagePreview = document.getElementById("imagePreview");
const uploadPlaceholder = document.querySelector(".upload-placeholder");

function setModalState(isOpen) {
  modal.classList.toggle("hidden", !isOpen);
  overlay.classList.toggle("hidden", !isOpen);

  if (!isOpen) {
    outsideModalBody.style.filter = "blur(0)";
    [getIngredName, getIngredQuant, getFornoType].forEach(
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
      outsideModalBody.style.filter = "blur(5px)";
    } else {
      setModalState(false);
      outsideModalBody.style.filter = "blur(0)";
    }
  });
});

overlay.addEventListener("click", (event) => {
  if (!event.target.closest(".modal-body")) {
    setModalState(false);
    outsideModalBody.style.filter = "blur(0)";
  }
});

/*LÓGICA PARA CADA INGREDIENTE TER SUA  PORCENTAGEM*/
const percentPorIngred = {
  acucar: [0, 0.5, 1, 1.5, 2],
  fermentoFresco: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  fermentoSeco: [0, 0.5, 1, 1.5, 2, 2.5],
  sal: [0, 0.5, 1, 1.5, 2],
  claraOvo: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
  gemaOvo: [10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20]
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
    resultPlacement.style.display = "block";
    resultPlacement.style.backgroundColor = "#e8c9a0";
    resultPlacement.innerText = "A porcentagem deve ser maior que 0%"
  } else {
    resultPlacement.style.display = "block";
    resultPlacement.style.backgroundColor = "#e8c9a0";
    resultPlacement.style.border = "solid ##4a2c1a"
    resultPlacement.innerText = `${result.toFixed(2)} g`;
  }
});

/*LÓGICA DE CRIAR E RENDERIZAR A TABELA PELO MODAL DE CADASTRAR RECEITA*/
const tablePlacement = document.getElementById("tablePlace");

saveButton.addEventListener("click", (e) => {
  e.preventDefault();

  const name = getIngredName.options[getIngredName.selectedIndex]?.text || "";
  const quant =
    getIngredQuant.options[getIngredQuant.selectedIndex]?.text || "";
  const grama = getIngredGr.textContent || "0g";
  const type = getFornoType.options[getFornoType.selectedIndex]?.text || "";

  if (!getIngredName.value || !getIngredQuant.value) {
    alert("Todos os campos precisão ser preenchidos antes de salvar");
    return;
  }

  let table = document.createElement("table");
  let th = document.createElement("thead");
  let tr = document.createElement("tr");
  let tb = tablePlacement.querySelector("tbody");

  if(tb) {
    const rows = tb.querySelectorAll("tr");
    let isDuplicate = false;

    rows.forEach((row) => {
      const rowName = row.cells[0].textContent || "";
      if(rowName && rowName.trim().toLowerCase() === name.trim().toLowerCase()) {
        isDuplicate = true;
      } 
    });

    if(isDuplicate) {
      alert("Não é possível adicionar ingredientes duplicados. Por favor, selecione outro ingrediente.");
      return;
    }
  }

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
  getFornoType.selectedIndex = 0;
  outsideModalBody.style.filter = "blur(0)";

  setModalState(false);
});


/*ÍCONE PARA LABEL DE ESCLHER A FOTO DA RECEITA*/
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
  uploadPlaceholder.hidden = true;
});
