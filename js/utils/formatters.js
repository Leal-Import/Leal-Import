import { safeParseFloat } from "./validators.js";

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

export function formatWithCommas(number) {
    if (number === null || number === undefined || number === "") return "";

    const num = parseFloat(number);
    if (isNaN(num)) return number;

    return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* Utilidad para cuando se quita el focus de un input o elemento editable */
export function formatOnBlur(event, isInput) {
    const element = event.target;
    let value = isInput ? element.value : element.textContent;

    // Si está vacío al salir → 0
    if (!value || value.trim() === '') {
        if (isInput) element.value = '$0.00';
        else element.textContent = '$0.00';
        return;
    }

    const number = safeParseFloat(value);

    // Si no es número → 0
    if (isNaN(number)) {
        if (isInput) element.value = '$0.00';
        else element.textContent = '$0.00';
        return;
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formatted = formatter.format(number);

    if (isInput) element.value = formatted;
    else element.textContent = formatted;
}


/* Utilidad para cuando se hace focus de un input o elemento editable */
export function formatOnFocus(event, isInput) {
    const element = event.target;
    let value = isInput ? element.value : element.innerText;

    if (!value) return;

    // Si es $0.00, dejar vacío (significa "no hay nada")
    if (value === '$0.00') {
        if (isInput) element.value = '';
        else element.textContent = '';
        return;
    }

    // Quitar formato visual
    let clean = value.replace(/\$/g, '').replace(/,/g, '');

    // Si termina en .00, quitar decimales
    if (clean.endsWith('.00')) {
        clean = clean.slice(0, -3);
    }

    if (isInput) {
        element.value = clean;
    } else {
        element.textContent = clean;
    }
}

export function formatYearInput(input) {
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
            let num = parseInt(value);

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

        const num = parseInt(text);
        if (num > maxYear || num < minYear) e.preventDefault();
    });
}

export function formatDecimalInput(el) {
    const isInput = 'value' in el;

    const getValue = () => isInput ? el.value : el.textContent;
    const setValue = v => isInput ? el.value = v : el.textContent = v;

    el.addEventListener('input', () => {
        let value = getValue();
        let caretPos = 0;

        if (!isInput) {
            caretPos = getCaretPosition(el);
        }

        value = value.replace(/[^0-9.]/g, '');

        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        if (/^0\d+/.test(value)) {
            value = value.replace(/^0+/, '');
        }

        if (value.includes('.')) {
            const [int, dec] = value.split('.');
            value = int + '.' + dec.slice(0, 2);
        }

        setValue(value);

        if (!isInput) {
            setCaretPosition(el, caretPos);
        }
    });

    el.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData)
            .getData('text')
            .replace(/[^0-9.]/g, '');
        setValue(text);
    });
}

function getCaretPosition(el) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 0;

    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.endContainer, range.endOffset);
    return preRange.toString().length;
}

function setCaretPosition(el, pos) {
    const selection = window.getSelection();
    const range = document.createRange();
    let currentPos = 0;

    function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const nextPos = currentPos + node.length;
            if (pos <= nextPos) {
                range.setStart(node, pos - currentPos);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                return true;
            }
            currentPos = nextPos;
        } else {
            for (const child of node.childNodes) {
                if (traverse(child)) return true;
            }
        }
        return false;
    }

    traverse(el);
}

