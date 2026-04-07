import { qs } from "./dom.js";

/* Menu flotante para tablas */
export const showFloatingMenu = (event, actions) => {
    const existingMenu = qs('.floatingMenu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.classList.add('floatingMenu');
    menu.style.visibility = 'hidden';
    menu.style.position = 'fixed';
    menu.style.zIndex = '10000';

    const opener = event.currentTarget;
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2);

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.textContent = action.label;
        btn.classList.add('floatingMenuButton');
        if (action.privilege) btn.dataset.privilege = action.privilege;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                action.onClick && action.onClick();
            } finally {
                menu.remove();
                cleanup();
            }
        });

        if (action.id) btn.id = `${action.id}-${uniqueSuffix}`;
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    const positionMenu = () => {
        if (!document.body.contains(menu)) return;

        const menuRect = menu.getBoundingClientRect();
        const rect = opener.getBoundingClientRect();

        let top = rect.bottom + 5;
        let left = rect.right - menuRect.width;

        if (left < 5) left = rect.left;
        if (top + menuRect.height > window.innerHeight) {
            top = rect.top - menuRect.height - 5;
        }

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
    };

    requestAnimationFrame(() => {
        positionMenu();
        menu.style.visibility = '';
    });

    const onDocClick = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            cleanup();
        }
    };

    const onEsc = (e) => {
        if (e.key === 'Escape') {
            menu.remove();
            cleanup();
        }
    };

    const onResize = () => positionMenu();

    const cleanup = () => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
        window.removeEventListener('resize', onResize);
    };

    setTimeout(() => {
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        window.addEventListener('resize', onResize);
    }, 0);
};
