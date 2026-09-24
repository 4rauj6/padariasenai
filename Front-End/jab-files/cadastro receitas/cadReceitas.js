/* LÓGICA DO MODAL */
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");
const outsideModalBody = document.querySelector(".hero");

const getIngredName = document.getElementById("nomeIngred");
const getIngredQuant = document.getElementById("quantIngred");
const getIngredGr = document.getElementById("gramaDoIngred");
const getFornoType = document.getElementById("tipoForno");
const saveButton = document.querySelector(".save-ingred");

function setModalState(isOpen) {
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
}

modalButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("addIngred")) {
      setModalState(true);
      outsideModalBody.style.filter = "blur(5px)";
    } else {
      setModalState(false);
    }
  });
});

const percentPorIngred = {
  farinha: [100],
  acucar: [0, 0.5, 1, 1.5, 2],
  fermentoFresco: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  fermentoSeco: [0, 0.5, 1, 1.5, 2, 2.5],
  sal: [0, 0.5, 1, 1.5, 2],
  claraOvo: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
  gemaOvo: [10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20],
  agua: [50, 55, 60, 65, 70, 75, 80]
};

let pesoBaseFarinhaGrams = 1000; 


// LÓGICA DE SELECIONAR 
getIngredName.addEventListener("change", () => {
  const actualIngred = getIngredName.value;
  const opcoes = percentPorIngred[actualIngred] || [];

  getIngredQuant.innerHTML = "";
  getIngredGr.style.display = "none";

  if (!actualIngred) {
    getIngredQuant.disabled = true;
    return;
  }

  if (actualIngred === "farinha") {
    getIngredQuant.innerHTML = `<option value="100" selected>100% (Base)</option>`;
    getIngredQuant.disabled = true;
    calcularEExibirGrama(100);
    return;
  }

  getIngredQuant.innerHTML = `<option value="">Selecione a porcentagem</option>`;
  opcoes.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = `${p}%`;
    getIngredQuant.appendChild(opt);
  });

  getIngredQuant.disabled = false;
});

function calcularGrama(percentValue) {
  const resultadoGrama = (percentValue / 100) * pesoBaseFarinhaGrams;

  getIngredGr.style.display = "block";
  getIngredGr.style.backgroundColor = "#e8c9a0";
  getIngredGr.style.padding = "4px 8px";
  getIngredGr.style.borderRadius = "4px";

  if (percentValue === 0) {
    getIngredGr.innerText = "A porcentagem deve ser maior que 0%";
  } else {
    getIngredGr.innerText = `${resultadoGrama.toFixed(2)} g (Base: ${pesoBaseFarinhaGrams}g de farinha)`;
  }
}

getIngredQuant.addEventListener("change", () => {
  const percentValue = parseFloat(getIngredQuant.value) || 0;
  calcularEExibirGrama(percentValue);
});

/* LOÓGICA DE RENDERIZAR A TABELA */
const tablePlacement = document.getElementById("tablePlace");

saveButton.addEventListener("click", (e) => {
  e.preventDefault();

  const name = getIngredName.options[getIngredName.selectedIndex]?.text || "";
  const quant = getIngredQuant.options[getIngredQuant.selectedIndex]?.text || "";
  const grama = getIngredGr.textContent || "0g";
  const type = getFornoType.options[getFornoType.selectedIndex]?.text || "";

  if (!getIngredName.value || !getIngredQuant.value) {
    alert("Preencha todos os campos do ingrediente.");
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
      </tr>`;

    table.appendChild(th);
    table.appendChild(tb);
    tablePlacement.appendChild(table);
  }

  let tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${name}</td>
    <td>${quant}</td>
    <td>${grama}</td>
    <td>${type}</td>
  `;
  tb.appendChild(tr);

  setModalState(false);
});

/* LÓGICA DE RENDERIZAR A FOTO */
imageInput.addEventListener('change',()=>{
  const file=imageInput.files[0];if(!file)return;
  if(!['image/jpeg','image/png'].includes(file.type)){alert('Selecione uma imagem JPG ou PNG.');imageInput.value='';return;}
  if(file.size>5*1024*1024){alert('A imagem deve ter no máximo 5 MB.');imageInput.value='';return;}
  imagePreview.src=URL.createObjectURL(file);imagePreview.hidden=false;if(uploadPlaceholder)uploadPlaceholder.hidden=true;
});

/* FUNÇÃO DE EXIBIR RESULTADOS FINAIS */



