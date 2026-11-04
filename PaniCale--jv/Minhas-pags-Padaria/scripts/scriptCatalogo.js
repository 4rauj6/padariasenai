const listaReceitas = document.querySelector(".lista-receitas");

if (listaReceitas) {
  const selectCategoria = document.getElementById("filtro-categoria");
  const tituloCategoria = document.getElementById("categoria-titulo");
  const modalReceita = document.getElementById("modal-receita");
  const tituloModalReceita = document.getElementById("modal-receita-titulo");
  const descricaoModalReceita = document.getElementById(
    "modal-receita-descricao",
  );
  const farinhaModalReceita = document.getElementById("modal-receita-farinha");
  const categoriaModalReceita = document.getElementById(
    "modal-receita-categoria",
  );
  const botaoFecharModalReceita = modalReceita.querySelector(
    ".modal-receita-fechar",
  );
  let cardAtivo = null;

  const nomesCategorias = {
    "mais-recente": "Mais Recentes:",
    "massa-salgado": "Massa Salgado:",
    "massa-meio-doce": "Massa Semi Doce:",
    "massa-integral": "Massa Integral:",
    "massa-doce": "Massa Doce:",
    favoritas: "Favoritas:",
  };

  const categoriasReceita = {
    "massa-salgado": "Massa Salgado",
    "massa-meio-doce": "Massa Semi Doce",
    "massa-integral": "Massa Integral",
    "massa-doce": "Massa Doce",
  };

  function criarSeletorCategoriaPersonalizado(select) {
    if (!select) return;

    const seletor = document.createElement("div");
    seletor.className = "catalogo-select-personalizado";

    const botao = document.createElement("button");
    botao.className = "catalogo-select-botao";
    botao.type = "button";
    botao.setAttribute("aria-haspopup", "listbox");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Filtrar receitas por categoria");

    const valor = document.createElement("span");
    const seta = document.createElement("span");
    seta.setAttribute("aria-hidden", "true");
    seta.textContent = "▾";
    botao.append(valor, seta);

    const opcoes = document.createElement("div");
    opcoes.className = "catalogo-select-opcoes";
    opcoes.id = "filtro-categoria-opcoes";
    opcoes.setAttribute("role", "listbox");
    opcoes.hidden = true;
    botao.setAttribute("aria-controls", opcoes.id);
    seletor.append(botao, opcoes);
    select.after(seletor);

    function fecharOpcoes(devolverFoco = false) {
      opcoes.hidden = true;
      botao.setAttribute("aria-expanded", "false");
      if (devolverFoco) botao.focus();
    }

    function abrirOpcoes(indice = 0) {
      atualizarOpcoes();
      const itens = opcoes.querySelectorAll('[role="option"]');
      if (!itens.length) return;

      opcoes.hidden = false;
      botao.setAttribute("aria-expanded", "true");
      itens[Math.max(0, Math.min(indice, itens.length - 1))].focus();
    }

    function atualizarOpcoes() {
      valor.textContent = select.selectedOptions[0].textContent;
      botao.setAttribute(
        "aria-label",
        `Filtrar receitas por categoria: ${valor.textContent}`,
      );
      opcoes.replaceChildren();

      Array.from(select.options)
        .filter((opcao) => !opcao.hidden)
        .forEach((opcao) => {
          const item = document.createElement("div");
          item.className = "catalogo-select-opcao";
          item.setAttribute("role", "option");
          item.setAttribute("tabindex", "-1");
          item.setAttribute("aria-selected", "false");
          item.dataset.value = opcao.value;
          item.textContent = opcao.textContent;
          opcoes.appendChild(item);
        });
    }

    botao.addEventListener("click", () => {
      if (opcoes.hidden) abrirOpcoes();
      else fecharOpcoes();
    });

    botao.addEventListener("keydown", (evento) => {
      if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
        evento.preventDefault();
        abrirOpcoes(evento.key === "ArrowUp" ? opcoes.children.length - 1 : 0);
      }
    });

    opcoes.addEventListener("click", (evento) => {
      const item = evento.target.closest('[role="option"]');
      if (!item) return;

      select.value = item.dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      fecharOpcoes(true);
    });

    opcoes.addEventListener("keydown", (evento) => {
      const itemAtual = evento.target.closest('[role="option"]');
      if (!itemAtual) return;

      const itens = Array.from(opcoes.querySelectorAll('[role="option"]'));
      const indice = itens.indexOf(itemAtual);

      if (evento.key === "Escape") {
        evento.preventDefault();
        fecharOpcoes(true);
      } else if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
        evento.preventDefault();
        const direcao = evento.key === "ArrowDown" ? 1 : -1;
        itens[(indice + direcao + itens.length) % itens.length].focus();
      } else if (evento.key === "Home" || evento.key === "End") {
        evento.preventDefault();
        itens[evento.key === "Home" ? 0 : itens.length - 1].focus();
      } else if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        itemAtual.click();
      }
    });

    document.addEventListener("click", (evento) => {
      if (!seletor.contains(evento.target)) fecharOpcoes();
    });

    select.classList.add("catalogo-select-nativo");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    atualizarOpcoes();

    return atualizarOpcoes;
  }

  const iconeVazio = "../image/Coracao.png";
  const iconeCheio = "../image/CoracaoCheio.png";

  const receitasMock = [
    {
      id: 1,
      nome: "Pão Francês",
      descricao: "Pão Crocante por fora, macio por dentro Tradicional",
      farinha: "50g",
      favorito: false,
      categoria: "massa-salgado",
    },
    {
      id: 2,
      nome: "Pão DOCE",
      descricao: "Pão Crocante por fora, macio por dentro Tradicional",
      farinha: "50g",
      favorito: true,
      categoria: "massa-doce",
    },
    {
      id: 3,
      nome: "Pão MEIO DOCE",
      descricao: "Pão Crocante por fora, macio por dentro Tradicional",
      farinha: "50g",
      favorito: false,
      categoria: "massa-meio-doce",
    },
    {
      id: 4,
      nome: "Pão INTEGRAL",
      descricao: "Pão Crocante por fora, macio por dentro Tradicional",
      farinha: "50g",
      favorito: false,
      categoria: "massa-integral",
    },
  ];

  function ativarBotoesFavorito() {
    const botoesFavorito = document.querySelectorAll(".btn-favorito");

    botoesFavorito.forEach((botao) => {
      const img = botao.querySelector("img");
      botao.addEventListener("click", () => {
        if (img.src.includes("CoracaoCheio")) {
          img.src = iconeVazio;
        } else {
          img.src = iconeCheio;
        }

        // Pulso de feedback ao favoritar/desfavoritar
        img.classList.remove("animando");
        void img.offsetWidth; // força o navegador a "reiniciar" a animação
        img.classList.add("animando");
      });
    });
  }

  function ativarBotoesEditar() {
    const botoesEditar = document.querySelectorAll(".btn-editar");

    botoesEditar.forEach((botao) => {
      botao.addEventListener("click", () => {
        const id = botao.dataset.id;
        window.location.href = `editar-receita.html?id=${id}`;
      });
    });
  }

  function visualizarReceita(id) {
    const receita = receitasMock.find((item) => String(item.id) === id);

    if (!receita) return;

    tituloModalReceita.textContent = receita.nome;
    descricaoModalReceita.textContent = receita.descricao;
    farinhaModalReceita.textContent = receita.farinha;
    categoriaModalReceita.textContent =
      categoriasReceita[receita.categoria] || "";
    modalReceita.showModal();
  }

  listaReceitas.addEventListener("click", (evento) => {
    const alvo = evento.target;

    if (!(alvo instanceof Element) || alvo.closest("button")) return;

    const card = alvo.closest(".receita-card");
    if (!card || !listaReceitas.contains(card)) return;

    cardAtivo = card;
    visualizarReceita(card.dataset.id);
  });

  listaReceitas.addEventListener("keydown", (evento) => {
    const card = evento.target;

    if (!(card instanceof HTMLElement) || !card.matches(".receita-card"))
      return;
    if (evento.key !== "Enter" && evento.key !== " ") return;

    evento.preventDefault();
    cardAtivo = card;
    visualizarReceita(card.dataset.id);
  });

  botaoFecharModalReceita.addEventListener("click", () => {
    modalReceita.close();
  });

  modalReceita.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") modalReceita.close();
  });

  modalReceita.addEventListener("click", (evento) => {
    if (evento.target === modalReceita) modalReceita.close();
  });

  modalReceita.addEventListener("close", () => {
    cardAtivo?.focus();
  });

  function renderizarReceitas(receitas) {
    listaReceitas.innerHTML = "";

    receitas.forEach((receita, index) => {
      const iconeInicial = receita.favorito ? iconeCheio : iconeVazio;

      const card = document.createElement("article");
      card.classList.add("receita-card");
      card.dataset.categoria = receita.categoria;
      card.dataset.id = receita.id;
      card.tabIndex = 0;
      card.setAttribute("aria-label", `Visualizar receita: ${receita.nome}`);

      // Cascata: cada card entra um pouco depois do anterior
      card.style.animationDelay = `${index * 0.08}s`;

      card.innerHTML = `
                <div class="card-img">
                    <button class="btn-favorito" aria-label="Favoritar receita">
                        <img src="${iconeInicial}" alt="">
                    </button>
                </div>
                <div class="receita-card-conteudo">
                    <h2>${receita.nome}</h2>
                    <p>Descrição: ${receita.descricao}</p>
                    <p>Porção de Farinha de Trigo: ${receita.farinha}</p>
                    <button class="btn-editar" data-id="${receita.id}">Editar Receita</button>
                </div>
            `;

      listaReceitas.appendChild(card);
    });

    ativarBotoesFavorito();
    ativarBotoesEditar();
  }

  // ==========================
  // FILTRO DE CATEGORIA + OCULTAÇÃO DA OPÇÃO SELECIONADA NA LISTA
  // ==========================
  if (selectCategoria && tituloCategoria) {
    const atualizarSeletorPersonalizado =
      criarSeletorCategoriaPersonalizado(selectCategoria);

    function ocultarOpcaoSelecionada() {
      const valorAtual = selectCategoria.value;

      // 'hidden' tira a opção só da LISTA suspensa (o menu que abre ao clicar).
      // Diferente de remove(), o elemento continua no DOM, então o texto
      // dela ainda aparece normalmente na caixa fechada do select.
      Array.from(selectCategoria.options).forEach((opt) => {
        opt.hidden = opt.value === valorAtual;
      });
      atualizarSeletorPersonalizado();
    }

    function filtrarCards(categoriaSelecionada) {
      const cards = document.querySelectorAll(".receita-card");

      cards.forEach((card) => {
        const imgCoracao = card.querySelector(".btn-favorito img");

        if (categoriaSelecionada === "favoritas") {
          card.style.display = imgCoracao.src.includes("CoracaoCheio")
            ? ""
            : "none";
        } else if (categoriaSelecionada === "mais-recente") {
          card.style.display = "";
        } else {
          card.style.display =
            card.dataset.categoria === categoriaSelecionada ? "" : "none";
        }
      });
    }
    selectCategoria.addEventListener("change", () => {
      const categoriaSelecionada = selectCategoria.value;
      tituloCategoria.textContent = nomesCategorias[categoriaSelecionada];

      filtrarCards(categoriaSelecionada);
      ocultarOpcaoSelecionada();
    });

    tituloCategoria.textContent = nomesCategorias[selectCategoria.value];
    filtrarCards(selectCategoria.value);
    ocultarOpcaoSelecionada();
  }
  renderizarReceitas(receitasMock);
}
