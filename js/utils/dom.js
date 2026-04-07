import { initSession } from './api.utils.js';
import { cleanOneShotParams as cleanURLParams } from './draft.manager.js';
import { initSidebar } from '../components/sidebar.js';
import { canAccess } from './privilegesValidator.js';

export const $ = id => document.getElementById(id);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const qs = (sel, root = document) => root.querySelector(sel);

export const debounce = (fn, delay = 300) => {
    let timeoutId;

    const debounced = (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return debounced;
};

export const showElement = (el) => { if (!el) return; el.classList.remove('hide'); el.classList.add('show'); };
export const hideElement = (el) => { if (!el) return; el.classList.remove('show'); el.classList.add('hide'); };
export const disableElement = (el) => { if (!el) return; el.setAttribute("disabled", true); };
export const removeDisable = (el) => { if (!el) return; el.removeAttribute("disabled"); };

export const asUUID = (v) => (typeof v === 'string' && v.trim() !== '' ? v : null);
export const asBoolean = (v) => v === 'true';
export const asNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

export const existsById = (list, id, key) => {
    return list.some(item => String(item[key]) === String(id));
};

/**
 * Muestra u oculta un modal
 * @param {HTMLElement|string} modal - Elemento o selector del modal
 * @param {boolean} show
 */
export const toggleModal = (modal, show) => {
    const el = typeof modal === 'string'
        ? qs(modal)
        : modal;

    if (!el) return;

    el.classList.toggle('show', show);
    el.classList.toggle('hide', !show);
};

/**
 * Llena un formulario usando un objeto
 * Las keys deben coincidir con el id del input/select
 * @param {string} formSelector
 * @param {Object} data
 */
export const fillForm = (formSelector, data) => {
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
};

/**
 * Habilita o deshabilita todos los campos del formulario
 * @param {string} formSelector
 * @param {boolean} readOnly
 */
export const setFormReadOnly = (formSelector, readOnly = true) => {
    const form = qs(formSelector);
    if (!form) return;

    const controls = form.querySelectorAll(
        'input, textarea, select, .btnAddData'
    );

    controls.forEach(ctrl => {
        if (ctrl.classList.contains('btnAddData')) {
            ctrl.style.display = readOnly ? 'none' : '';
        } else {
            ctrl.disabled = readOnly;
        }
    });
};

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
/* Mensajes globales (SweetAlert2) */
export const showMessage = async (
    title,
    message,
    type = 'info',
    isToast = false,
    cancelButton = false
) => {
    const dangerColor = cssVar('--danger-color');
    const warningColor = cssVar('--warning-color');
    const helperStatColor = cssVar('--helper-stat-color');
    let config = {
        icon: type,
        title,
        text: message,
        showCancelButton: cancelButton,
        cancelButtonColor: dangerColor || '#F44336',
        confirmButtonColor: helperStatColor || '#007bff'
    };

    if (isToast) {
        config = {
            ...config,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        };
    } else {
        if (type === 'error') {
            config.confirmButtonColor = dangerColor || '#F44336';
        } else if (type === 'warning') {
            config.confirmButtonColor = warningColor || '#ff9800';
        } else if (type === 'success') {
            config.showConfirmButton = false;
            config.timer = 2000;
        }
    }

    return await Swal.fire(config);
};

export const enableFormUI = (frm) => {
    setFormReadOnly(frm, false);
};

export const fillSelect = (selectOrId, data, valueKey, textKey, selectedValue = null, defaultText = 'Seleccione una opción') => {
    const select =
        typeof selectOrId === 'string'
            ? $(selectOrId)
            : selectOrId;

    if (!select) return;

    // limpiar opciones previas
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }

    // opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultText;

    // si NO hay valor seleccionado, dejamos la opción por defecto
    if (selectedValue === null || selectedValue === '') {
        defaultOption.selected = true;
    }

    select.appendChild(defaultOption);

    // opciones dinámicas
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];

        // marcar como seleccionado si coincide
        if (String(option.value) === String(selectedValue)) {
            option.selected = true;
        }

        select.appendChild(option);
    });
};

export const highlightAndFocus = (elementOrId) => {
    const element = typeof elementOrId === 'string'
        ? $(elementOrId)
        : elementOrId;

    if (!element) return;

    element.classList.add('input-error');
    element.focus();
};

export const getNullableParam = (value) => {
    return value === null || value === 'null' ? null : value;
};

export const addModalCloseEvents = (modal, onClose) => {
    let pointerDownOnOverlay = false;
    modal.addEventListener('pointerdown', (e) => {
        pointerDownOnOverlay = e.target === modal;
    });
    modal.addEventListener('pointerup', (e) => {
        if (pointerDownOnOverlay && e.target === modal) onClose();
        pointerDownOnOverlay = false;
    });
};

export const buildParams = (obj) => {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    return params;
};

export const cleanOneShotParams = cleanURLParams;

/**
 * Escanea el DOM buscando elementos con el atributo [data-privilege]
 * y los oculta si el usuario no cuenta con dicho permiso.
 * @param {HTMLElement} container - Opcional, contenedor raíz para el escaneo
 */
export const applyPrivilegesToUI = (container = document) => {
    const elements = container.querySelectorAll('[data-privilege]');
    elements.forEach(el => {
        const required = el.getAttribute('data-privilege').split(',').map(p => p.trim());
        if (canAccess(required)) showElement(el);
        else hideElement(el);
    });
};

/**
 * Factory para inicialización de módulos
 * Elimina código duplicado en controllers
 */
export const createModuleInitializer = async ({
    resetState,
    initialize,
    load,
    DOMRefs
}) => {
    try {
        // 1. Inicializamos el sidebar de inmediato.
        // Esto inyecta la estructura y quita la "pantalla negra" (clase uiReady).
        initSidebar();

        await resetState();
        const user = await initSession();

        // 2. Si la sesión es válida, re-inicializamos para mostrar los ítems
        // según los privilegios reales obtenidos.
        if (user) initSidebar();

        if (!user) return false;

        const refs = DOMRefs.init();
        await initialize(refs);
        await load(refs);
        applyPrivilegesToUI();
        return true;
    } catch (error) {
        console.error('Error inicializando:', error);
        // Fallback: Si falló algo crítico antes de initSidebar, forzamos la visibilidad
        document.documentElement.classList.add('uiReady');
        document.body.classList.add('sidebarReady');

        await showMessage('Error', 'No se pudo cargar el módulo correctamente', 'error');
        return false;
    }
};
