// ==========================
// MENU LATERAL (toggle)
// ==========================
const sidebar = document.getElementById('sidebar');
const btn = document.getElementById('btn-menu');
const colunaLateral = document.querySelector('.coluna_lateral');
const overlay = document.getElementById('overlay');

if (btn && sidebar && colunaLateral && overlay) {
    btn.addEventListener('click', () => {
        const abrindo = !sidebar.classList.contains('aberto');

        sidebar.classList.toggle('aberto');
        btn.classList.toggle('menu-aberto');
        colunaLateral.classList.toggle('oculta');
        overlay.classList.toggle('ativo');

        btn.setAttribute('aria-expanded', abrindo);
    });
}

// ==========================
// LINK ATIVO NO MENU
// ==========================
const paginaAtual = window.location.pathname.split('/').pop();
document.querySelectorAll('.auth-link').forEach((link) => {
    if (link.dataset.page === paginaAtual) {
        link.classList.add('ativo');
    }
});

// ==========================
// CATÁLOGO DE RECEITAS
// ==========================
const listaReceitas = document.querySelector('.lista-receitas');

if (listaReceitas) {

    const selectCategoria = document.getElementById('filtro-categoria');
    const tituloCategoria = document.getElementById('categoria-titulo');

    const nomesCategorias = {
        'mais-recente': 'Mais Recentes:',
        'massa-salgado': 'Massa Salgado:',
        'massa-meio-doce': 'Massa Semi Doce:',
        'massa-integral': 'Massa Integral:',
        'massa-doce': 'Massa Doce:',
        'favoritas': 'Favoritas:'
    };

    const iconeVazio = '../image/Coracao.png';
    const iconeCheio = '../image/CoracaoCheio.png';

    // Mock temporário - trocar pelo fetch da API quando estiver pronta
    const receitasMock = [
        {
            id: 1,
            nome: 'Pão Francês',
            descricao: 'Pão Crocante por fora, macio por dentro Tradicional',
            farinha: '50g',
            favorito: false,
            categoria: 'massa-salgado'
        },
        {
            id: 2,
            nome: 'Pão DOCE',
            descricao: 'Pão Crocante por fora, macio por dentro Tradicional',
            farinha: '50g',
            favorito: true,
            categoria: 'massa-doce'
        },
        {
            id: 3,
            nome: 'Pão MEIO DOCE',
            descricao: 'Pão Crocante por fora, macio por dentro Tradicional',
            farinha: '50g',
            favorito: false,
            categoria: 'massa-meio-doce'
        },
        {
            id: 4,
            nome: 'Pão INTEGRAL',
            descricao: 'Pão Crocante por fora, macio por dentro Tradicional',
            farinha: '50g',
            favorito: false,
            categoria: 'massa-integral'
        }
    ];

    function ativarBotoesFavorito() {
        const botoesFavorito = document.querySelectorAll('.btn-favorito');

        botoesFavorito.forEach(botao => {
            const img = botao.querySelector('img');
            botao.addEventListener('click', () => {
                if (img.src.includes('CoracaoCheio')) {
                    img.src = iconeVazio;
                } else {
                    img.src = iconeCheio;
                }

                // Pulso de feedback ao favoritar/desfavoritar
                img.classList.remove('animando');
                void img.offsetWidth; // força o navegador a "reiniciar" a animação
                img.classList.add('animando');
            });
        });
    }

    function ativarBotoesEditar() {
        const botoesEditar = document.querySelectorAll('.btn-editar');

        botoesEditar.forEach(botao => {
            botao.addEventListener('click', () => {
                const id = botao.dataset.id;
                window.location.href = `editar-receita.html?id=${id}`;
            });
        });
    }

    function renderizarReceitas(receitas) {
        listaReceitas.innerHTML = '';

        receitas.forEach((receita, index) => {
            const iconeInicial = receita.favorito ? iconeCheio : iconeVazio;

            const card = document.createElement('article');
            card.classList.add('receita-card');
            card.dataset.categoria = receita.categoria;

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

    if (selectCategoria && tituloCategoria) {
        function ocultarOpcaoSelecionda(){
            const valorAtual = selectCategoria.value;
           Array.from(selectCategoria.options).forEach(opt =>{
            if(opt.value === valorAtual){
                opt.dataset.removida = 'true';
                opt.remove();
            }
           })
        }
        selectCategoria.addEventListener('change', () => {
            const categoriaSelecionada = selectCategoria.value;
            tituloCategoria.textContent = nomesCategorias[categoriaSelecionada];

            const cards = document.querySelectorAll('.receita-card');

            cards.forEach(card => {
                const imgCoracao = card.querySelector('.btn-favorito img');

                if (categoriaSelecionada === 'favoritas') {
                    card.style.display = imgCoracao.src.includes('CoracaoCheio') ? '' : 'none';
                } else if (categoriaSelecionada === 'mais-recente') {
                    card.style.display = '';
                } else {
                    card.style.display = card.dataset.categoria === categoriaSelecionada ? '' : 'none';
                }
            });
            
        });
        
    }
    ocultarOpcaoSelecionda();

    // Renderização inicial com o mock
    renderizarReceitas(receitasMock);

    // Quando a API estiver pronta, troque a linha acima por:
    // fetch('URL_DA_API')
    //     .then(res => res.json())
    //     .then(dados => renderizarReceitas(dados))
    //     .catch(err => console.error('Erro ao buscar receitas:', err));
}