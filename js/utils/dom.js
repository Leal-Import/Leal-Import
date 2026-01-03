export const $ = id => document.getElementById(id);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const qs = (sel, root = document) => root.querySelector(sel);


/**
 * Muestra u oculta un modal
 * @param {HTMLElement|string} modal - Elemento o selector del modal
 * @param {boolean} show
 */
export function toggleModal(modal, show) {
    const el = typeof modal === 'string'
        ? qs(modal)
        : modal;

    if (!el) return;

    el.classList.toggle('show', show);
    el.classList.toggle('hide', !show);
}

/**
 * Llena un formulario usando un objeto
 * Las keys deben coincidir con el id del input/select
 * @param {string} formSelector
 * @param {Object} data
 */
export function fillForm(formSelector, data) {
    const form = qs(formSelector);
    if (!form) return;

    Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`#${key}`);
        if (!field) return;

        if (field.type === 'checkbox') {
            field.checked = Boolean(value);
        } else if (field.tagName === 'SELECT') {
            field.value = value ?? '';
        } else {
            field.value = value ?? '';
        }
    });
}

/**
 * Habilita o deshabilita todos los campos del formulario
 * @param {string} formSelector
 * @param {boolean} readOnly
 */
export function setFormReadOnly(formSelector, readOnly = true) {
    const form = qs(formSelector);
    if (!form) return;

    const controls = form.querySelectorAll(
        'input, textarea, select, button[type="submit"]'
    );

    controls.forEach(ctrl => {
        if (ctrl.type === 'submit') {
            ctrl.style.display = readOnly ? 'none' : '';
        } else {
            ctrl.disabled = readOnly;
        }
    });
}

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

    function cleanup() {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
        window.removeEventListener('resize', onResize);
    }

    setTimeout(() => {
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        window.addEventListener('resize', onResize);
    }, 0);
};

/* Mensajes globales (SweetAlert2) */
export const showMessage = async (
    title,
    message,
    type = 'info',
    isToast = false
) => {
    let config = {
        icon: type,
        title,
        text: message,
        confirmButtonColor: '#007bff'
    };

    if (isToast) {
        config = {
            ...config,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        };
    } else {
        if (type === 'error') {
            config.confirmButtonColor = '#F44336';
        } else if (type === 'warning') {
            config.confirmButtonColor = '#ffc107';
        } else if (type === 'success') {
            config.showConfirmButton = false;
            config.timer = 2000;
        }
    }

    await Swal.fire(config);
};

export function enableFormUI(frm) {
    setFormReadOnly(frm, false);
}

export const setupModal = (
    openBtnSelector,
    modalSelector,
    closeBtnSelector,
    formId,
    text,
    onClose
) => {
    const openBtn = qs(openBtnSelector);
    const closeBtn = qs(closeBtnSelector);
    const modal = qs(modalSelector);
    const form = qs(formId);

    if (!openBtn || !closeBtn || !modal) return;

    openBtn.addEventListener("click", () => {
        toggleModal(modal, true);
        form?.reset();
        modal.querySelector('.titleModal').textContent = text;

        modal.querySelector('input[type="submit"]').value = "Agregar";
        enableFormUI(formId);
    });

    const closeHandler = () => {
        toggleModal(modal, false);
        form?.reset();
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    closeBtn.addEventListener("click", closeHandler);

    modal.addEventListener("click", e => {
        if (e.target === modal) closeHandler();
    });
};

export const fillSelect = (selectId, data, valueKey, textKey, defaultText = 'Seleccione una opción') => {
    const select = $(selectId);
    if (!select) return;

    //limpiar opciones previas
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultText;
    select.appendChild(defaultOption);

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        select.appendChild(option);
    });
}

export const highlightAndFocus = (elementOrId) => {
    const element = typeof elementOrId === 'string'
        ? $(elementOrId)
        : elementOrId;

    if (!element) return;

    element.classList.add('input-error');
    element.focus();
};
