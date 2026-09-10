/*LÓGICA DO PRIMEIRO MODAL*/
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalButtons = document.querySelectorAll(".addIngred, .close-modal");

function setModalState(isOpen) {
  modal.classList.toggle("hidden", !isOpen);
  overlay.classList.toggle("hidden", !isOpen);
}

modalButtons.forEach((modalElement) => {
  modalElement.addEventListener("click", () => {
    if (modalElement.classList.contains("addIngred")) {
      setModalState(true);
    } else {
      setModalState(false);
    }
  });
});

overlay.addEventListener("click", (event) => {
  if (!event.target.closest(".modal-body")) {
    setModalState(false);
  }
});


/*LÓGICA DA ESCOLHA DE PORCENTAGEM PARA O INGREDIENTE ESCOLHIDO*/
const percentPorIngred = {
  acucar: [0, 0.5, 1, 1.5, 2],
  fermentoFresco: [0, 0.5, 1, 1.5, 2, 2.5, 3,  3.5, 4, 4.5, 5],
  fermentoSeco: [0, 0.5, 1, 1.5, 2, 2.5],
}


/*LÓGICA DO CALCÚLO PARA PORCENTAGEM ESCOLHIDA SER TRANSFORMADA EM GRAMAS */
const percentIngred = document.getElementById("quantIngred");

percentIngred.addEventListener("change", () => {
  const percentValue = parseFloat(percentIngred.value) || 0;
  const totalWeight = 1000;

  const result = (percentValue / 100) * totalWeight;

  const resultPlacement = document.getElementById('gramaDoIngred');

  if(result === 0) {
    resultPlacement.style.display = "none";
  } else {
    resultPlacement.style.display = "block";
  }

  resultPlacement.innerText = `${result.toFixed(2)} g`;
  resultPlacement.style.backgroundColor = "#f2e8d9";
});
