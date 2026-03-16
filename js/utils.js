import { getAuthMe } from '../js/service/serviceLogin.js';

export const safeParseFloat = (v) => { const n = parseFloat(String(v || '').replace(/[$,\s]/g, '')); return isNaN(n) ? 0 : n; };
export const $ = id => document.getElementById(id);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const toggleModal = (modal, show) => {
    if (!modal) return;
    modal.classList.toggle("show", show);
    modal.classList.toggle("hide", !show);
};

export const validateDate = (input, minDate = null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let finalMinDate;

    if (!minDate) {
        // No viene fecha → hoy
        finalMinDate = today;
    } else {
        const recordDate = new Date(minDate);
        recordDate.setHours(0, 0, 0, 0);

        // Elegir la menor entre hoy y la fecha del registro
        finalMinDate = recordDate < today ? recordDate : today;
    }

    // Ajuste timezone
    finalMinDate.setMinutes(
        finalMinDate.getMinutes() - finalMinDate.getTimezoneOffset()
    );

    input.min = finalMinDate.toISOString().slice(0, 10);
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

export const showMessage = async(title, message, type = 'info', isToast = false) => {
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

/* Optener el idEmployee del Auth/Me */
let currentUser = null;

/**
 * Inicializa la sesión. Debe llamarse al cargar cualquier página.
 * Si falla o no hay usuario, redirige al login automáticamente.
 */
export const initSession = async() => {
    try {
        const response = await getAuthMe();

        if (response?.authenticated) {
            currentUser = response.user;
            return currentUser;
        } else {
            await forceLogout("Sesión no válida");
        }
    } catch (error) {
        if (error?.status === 401) {
            await forceLogout("Sesión expirada");
        } else {
            console.error("Error verificando sesión:", error);
            await forceLogout("Error de sesión");
        }
    }
};

/* Devuelve el ID del empleado actual, Útil para enviar en formularios.*/
export const getCurrentEmployeeId = () => {
    if (!currentUser) {
        console.warn("Se intentó obtener ID sin sesión iniciada.");
        return null;
    }
    return currentUser.idEmployee;
};

/* Devuelve el objeto completo del usuario (para mostrar nombre, rol, etc)*/
export const getCurrentUser = () => {
    return currentUser;
};

// Función auxiliar para sacar al usuario
const forceLogout = async() => {
    currentUser = null;

    if (!window.location.pathname.includes("login.html")) {
        await showMessage(
            "Sesión finalizada",
            "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
            "warning"
        );

        window.location.href = 'login.html';
    }
};

/* Llenar formulario */
export const fillForm = (formSelector, data) => {
    const form = document.querySelector(formSelector);
    if (!form) return console.error(`No se encontró el formulario ${formSelector}`);

    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
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
};

/* Validaciones */

/* Esto es para que se haga focus en el elemento q esta mal */

export const allowMotoYear = (input) => {

    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
    const minYear = currentYear - 40;

    input.addEventListener("input", () => {
        let value = input.value;

        // Solo números
        value = value.replace(/[^0-9]/g, "");

        // Máximo 4 dígitos
        if (value.length > 4) {
            value = value.substring(0, 4);
        }

        // Validar rango SOLO cuando llegue a 4 dígitos
        if (value.length === 4) {
            let num = parseInt(value, 10);

            if (num > maxYear) num = maxYear;
            if (num < minYear) num = minYear;

            value = num.toString();
        }

        input.value = value;
    });

    // Evitar pegar texto inválido
    input.addEventListener("paste", (e) => {
        const text = e.clipboardData.getData("text");
        if (!/^\d{1,4}$/.test(text)) {
            e.preventDefault();
            return;
        }

        const num = parseInt(text, 10);
        if (num > maxYear || num < minYear) e.preventDefault();
    });
};

export const highlightAndFocus = (element) => {
    element.classList.add('input-error');
    element.focus();
};

export const isValidImage = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        showMessage("Formato inválido", "Solo se permiten imágenes JPG y PNG.", "warning");
        return false;
    }

    if (file.size > MAX_FILE_SIZE) {
        showMessage("La imagen es demasiado pesada", "Máximo permitido: 5 MB.", "warning");
        return false;
    }

    return true;
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
    for (const part of domainParts) {
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

export const formatDUIInput = (inputElement) => {
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
};

export const formatWithCommas = (number) => {
    if (number === null || number === undefined || number === "") return "";

    const num = parseFloat(number);
    if (isNaN(num)) return number;

    return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const cleanNumber = (str) => {
    if (!str) return "0";

    // Quitar $ y comas
    const cleanStr = str.replace(/[$,]/g, "");

    // Si no contiene punto → retornar tal cual
    if (!cleanStr.includes(".")) {
        return cleanStr;
    }

    const [intPart, decPart] = cleanStr.split(".");

    // Si los decimales son 0 o vacíos → eliminar el punto y decimales
    if (!decPart || /^0+$/.test(decPart)) {
        return intPart;
    }

    // Si los decimales son válidos → devolver número normal
    return `${intPart}.${decPart}`;
};

export const allowDecimal = (element) => {
    const isInput = element instanceof HTMLInputElement;
    const isEditable = element.isContentEditable;

    const getValue = () => isInput ? element.value : element.textContent;
    const setValue = (v) => {
        if (isInput) element.value = v;
        else element.textContent = v;
    };

    const getCaret = () => {
        if (isInput) return element.selectionStart;
        if (isEditable) return getCaretPositionContentEditable(element);
    };

    const setCaret = (pos) => {
        if (isInput) {
            element.selectionStart = pos;
            element.selectionEnd = pos;
        } else if (isEditable) {
            setCaretPositionContentEditable(element, pos);
        }
    };

    element.addEventListener("input", () => {

        const cursorPos = getCaret();
        const oldValue = getValue();

        // Limpiar caracteres
        let value = oldValue.replace(/[^0-9.]/g, "");

        let parts = value.split(".");

        if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
            parts = value.split(".");
        }

        if (parts[1]?.length > 2) {
            parts[1] = parts[1].slice(0, 2);
        }

        const finalValue =
            parts.length > 1
                ? `${parts[0]}.${parts[1] ?? ""}`
                : parts[0];

        setValue(finalValue);

        // Ajustar cursor
        const diff = finalValue.length - oldValue.length;
        setCaret(cursorPos + diff);
    });

    // Paste solo aplica a input
    if (isInput) {
        element.addEventListener("paste", (e) => {
            const text = e.clipboardData.getData("text");
            if (!/^[0-9]*\.?[0-9]{0,2}$/.test(text)) {
                e.preventDefault();
            }
        });
    }

    element.addEventListener("blur", () => {
        const value = getValue();

        if (!value.includes(".")) return;

        const parts = value.split(".");
        const decimal = parts[1];

        if (decimal.length === 1) {
            setValue(parts[0] + "." + decimal + "0");
        }
    });

};

const getCaretPositionContentEditable = (el) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return 0;

    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(el);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    const caretOffset = preCaretRange.toString().length;
    return caretOffset;
};

const setCaretPositionContentEditable = (el, pos) => {
    const nodeStack = [el]; // ← const porque nunca se reasigna
    let node;
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(el, 0);
    range.collapse(true);

    while ((node = nodeStack.pop())) {
        if (node.nodeType === 3) {
            const nextCharIndex = charIndex + node.length;
            if (pos >= charIndex && pos <= nextCharIndex) {
                range.setStart(node, pos - charIndex);
                break;
            }
            charIndex = nextCharIndex;
        } else {
            const children = node.childNodes;
            for (let i = children.length - 1; i >= 0; i--) {
                nodeStack.push(children[i]);
            }
        }
    }

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

// Helpers para modo lectura / UI
export const setFormReadOnly = (frm, readOnly) => {
    const frmModal = document.querySelector(frm);
    const controls = frmModal.querySelectorAll('input, textarea, select, button[type="submit"]');
    controls.forEach(ctrl => {
        if (ctrl.type === 'submit') {
            ctrl.style.display = readOnly ? 'none' : '';
        } else {
            ctrl.disabled = readOnly;
        }
    });
};

export const enableFormUI = (frm) => {
    setFormReadOnly(frm, false);
};

/* Llenar select */
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
};

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

    const cleanup = () => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll, true);
    };

    // registrar listeners tras crear el menú (evita interferir con el click que lo abrió)
    setTimeout(() => {
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        window.addEventListener('resize', onResize);
        // usar captura para detectar scrolls en elementos internos
        window.addEventListener('scroll', onScroll, true);
    }, 0);
};
