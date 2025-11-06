export const toggleModal = (modal, show) => {
    if (!modal) return;
    modal.classList.toggle("show", show);
    modal.classList.toggle("hide", !show);
};

export const setupModal = (openBtnSelector, modalSelector, closeBtnSelector, formId, text) => {
    const openBtn = document.querySelector(openBtnSelector);
    const closeBtn = document.querySelector(closeBtnSelector);
    const modal = document.querySelector(modalSelector);
    const form = document.querySelector(formId);
    
    if (!openBtn || !closeBtn || !modal) return;

    openBtn.addEventListener("click", () => {
        toggleModal(modal, true);
        form.reset();
        modal.querySelector('.titleModal').textContent = text;
        modal.querySelector('input[type="submit"]').value = "Agregar";
        enableFormUI(formId);
    });
    closeBtn.addEventListener("click", () => {
        toggleModal(modal, false);
        form.reset();
        enableFormUI(formId);
    });
    modal.addEventListener("click", e => {
        if (e.target === modal) {
            toggleModal(modal, false);
            form.reset();4
            enableFormUI(formId);
        }
    });
};

export const getInputsValues = (form) => {
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        if (input.id) {
            data[input.id] = input.value.trim();
        }
        else if (input.name) {
            data[input.name] = input.value.trim();
        }
    });
    return data;
};

export const showMessage = (title, message, type = 'info', isToast = false) => {
    let config = {
        icon: type,
        title: title,
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
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
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

    Swal.fire(config);
};

/* Llenar formulario */
export let fillForm = (formSelector, data) => {
    const form = document.querySelector(formSelector);
    console.log(form);
    if (!form) return console.error(`No se encontró el formulario ${formSelector}`);

    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
        console.log(field);
        console.log(data[key]);
        if (!field) return; // Si no hay campo con ese nombre, lo salta

        const value = data[key];

        // Verificamos tipo de elemento
        if (field.tagName === "INPUT") {
            if (field.type === "checkbox") {
                field.checked = Boolean(value);
            } else if (field.type === "radio") {
                const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                field.value = value ?? '';
            }
        } else if (field.tagName === "SELECT") {
            field.value = value ?? '';
        } else if (field.tagName === "TEXTAREA") {
            field.value = value ?? '';
        }
    });
}

/* Validaciones */

/* Esto es para que se haga focus en el elemento q esta mal */
export const highlightAndFocus = (element) => {
    element.classList.add('input-error');
    element.focus();
};

export const isValidEmail = (email) => {
    if (!email) {
        return false;
    }
    const emailRegex = new RegExp(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    if (!emailRegex.test(email.toLowerCase())) {
        return false;
    }
    if (email.length > 254) {
        return false;
    }
    const atIndex = email.lastIndexOf('@');
    const domain = email.substring(atIndex + 1);
    const domainParts = domain.split('.');
    for (let part of domainParts) {
        if (part.length > 63) {
            return false;
        }
    }
    return true;
};

export const isValidPhone = (phone) => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(cleanPhone);
};

/* Validaciones evento input */

export const formatPhoneNumber = (inputElement) => {
    let value = inputElement.value.replace(/\D/g, '');

    // Solo permite que el primer dígito sea 2, 6 o 7
    if (value.length > 0 && !/^[267]/.test(value)) {
        value = value.substring(1); // elimina el primer dígito inválido
    }

    // Limita a 8 dígitos
    if (value.length > 8) {
        value = value.substring(0, 8);
    }

    // Aplica el formato ####-####
    if (value.length > 4) {
        value = value.substring(0, 4) + '-' + value.substring(4);
    }

    inputElement.value = value;
};

export let formatDUIInput = (inputElement) => {
    inputElement.addEventListener("input", (e) => {
        let valor = e.target.value;

        // Quitar todo lo que no sea número
        valor = valor.replace(/\D/g, "");

        // Limitar a 9 dígitos
        if (valor.length > 9) {
            valor = valor.substring(0, 9);
        }

        // Agregar guion si hay más de 8 dígitos
        if (valor.length > 8) {
            valor = valor.substring(0, 8) + "-" + valor.substring(8);
        }

        e.target.value = valor;
    });
}


// Helpers para modo lectura / UI
export function setFormReadOnly(frm, readOnly) {
    const frmModal = document.querySelector(frm);
    const controls = frmModal.querySelectorAll('input, textarea, select, button[type="submit"]');
    controls.forEach(ctrl => {
        if (ctrl.type === 'submit') {
            ctrl.style.display = readOnly ? 'none' : '';
        } else {
            ctrl.disabled = readOnly;
        }
    });
}

export function enableFormUI(frm) {
    setFormReadOnly(frm, false);
}

/* Llenar select */
export const fillSelect = (selectId, data, valueKey, textKey) => {
    const select = document.getElementById(selectId);
    if (!select) return;

    //limpiar opciones previas
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccione una opción';
    select.appendChild(defaultOption);

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        select.appendChild(option);
    });
}

/*Menu flotante para las tablas */
export const showFloatingMenu = (event, actions) => {
    const existingMenu = document.querySelector('.floatingMenu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.classList.add('floatingMenu');
    menu.style.visibility = "hidden";
    menu.style.position = "fixed";
    menu.style.zIndex = "10000";

    const opener = event.currentTarget;
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2);

    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.textContent = action.label;
        btn.classList.add('floatingMenuButton');

        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            try {
                action.onClick && action.onClick();
            } finally {
                if (menu.parentNode) menu.parentNode.removeChild(menu);
                cleanup();
            }
        });

        if (action.id) btn.id = `${action.id}-${uniqueSuffix}`;
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // función para calcular la posición respecto al opener
    const positionMenu = () => {
        if (!document.body.contains(menu)) return;
        const menuRect = menu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        const rect = opener.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = rect.bottom + 5;
        let left = rect.right - menuWidth;

        if (left < 5) {
            if (rect.left + menuWidth <= viewportWidth - 5) left = rect.left;
            else left = 5;
        }
        if (top + menuHeight > viewportHeight - 5) {
            top = Math.max(5, rect.top - menuHeight - 5);
        }

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
    };

    // posicionar tras insertarlo (usar RAF para asegurar layout)
    requestAnimationFrame(() => {
        positionMenu();
        menu.style.visibility = "";
    });

    const onDocClick = (e) => {
        if (!menu.contains(e.target) && e.target !== opener) {
            if (menu.parentNode) menu.parentNode.removeChild(menu);
            cleanup();
        }
    };
    const onEsc = (e) => {
        if (e.key === 'Escape') {
            if (menu.parentNode) menu.parentNode.removeChild(menu);
            cleanup();
        }
    };
    const onResize = () => {
        // si el opener ya no está en el DOM, cerrar el menú
        if (!document.body.contains(opener)) {
            if (menu.parentNode) menu.parentNode.removeChild(menu);
            cleanup();
            return;
        }
        positionMenu();
    };
    const onScroll = () => {
        onResize();
    };

    function cleanup() {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll, true);
    }

    // registrar listeners tras crear el menú (evita interferir con el click que lo abrió)
    setTimeout(() => {
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        window.addEventListener('resize', onResize);
        // usar captura para detectar scrolls en elementos internos
        window.addEventListener('scroll', onScroll, true);
    }, 0);
};