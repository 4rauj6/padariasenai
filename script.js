const menuToggle = document.querySelector('.menu-toggle');
        const menuLateral = document.querySelector('.menu-lateral');

        if (menuToggle && menuLateral) {
            menuToggle.addEventListener('click', () => {
                const isOpen = menuLateral.classList.toggle('menu-open');
                menuToggle.setAttribute('aria-expanded', String(isOpen));
            });

            document.addEventListener('click', (event) => {
                const clickedInsideMenu = menuLateral.contains(event.target);
                const clickedToggle = menuToggle.contains(event.target);

                if (window.innerWidth <= 768 && !clickedInsideMenu && !clickedToggle && menuLateral.classList.contains('menu-open')) {
                    menuLateral.classList.remove('menu-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    menuLateral.classList.remove('menu-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
