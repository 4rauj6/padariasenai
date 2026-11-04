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
