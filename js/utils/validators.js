import { showMessage } from "./dom.js";

export const isValidEmail = (email) => {
    if (!email) return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;
    if (email.length > 254) return false;
    const [localPart, domain] = email.split('@');
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;
    const domainParts = domain.split('.');
    if (!domainParts.every(part => part.length > 0 && part.length <= 63)) return false;
    if (domainParts.some(part => part.startsWith('-') || part.endsWith('-'))) return false;
    return true;
};

export const isValidFromToDates = (start, end, dt) => {
    if (start && end) {
        if (new Date(end) < new Date(start)) {
            // puedes manejar el error como quieras
            showMessage('La fecha final no puede ser menor a la fecha inicial');
            dt.value = '';
            return;
        }
    }
    return true;
};

export const isValidDui = (dui) => {
    return /^[0-9]{8}-[0-9]$/.test(dui);
};

export const isValidFullName = (name) => {
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'' ]{3,75}$/.test(name);
};

export const isValidPhone = (phone) => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    return /^[267]\d{7}$/.test(cleanPhone);
};

export const safeParseFloat = (v) => {
    const n = parseFloat(String(v || '').replace(/[$,\s]/g, ''));
    return isNaN(n) ? 0 : n;
};

export const isValidYear = (year, options = {}) => {
    const {
        min = 1900,
        max = new Date().getFullYear() + 1
    } = options;

    if (!year) return false;

    const parsed = Number(year);
    if (!Number.isInteger(parsed)) return false;
    if (parsed < min || parsed > max) return false;

    return true;
};

export const validateDate = (input, minDate = null) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let finalMinDate;

    if (!minDate) {
        finalMinDate = today;
    } else {
        const recordDate = new Date(minDate);
        recordDate.setHours(0, 0, 0, 0);
        finalMinDate = recordDate < today ? recordDate : today;
    }

    finalMinDate.setMinutes(
        finalMinDate.getMinutes() - finalMinDate.getTimezoneOffset()
    );

    input.min = finalMinDate.toISOString().slice(0, 10);
};

export const isValidURL = (url) => {
    if (!url || url.length < 1 || url.length > 1000) return false;

    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
};

export const isValidDecimal = (value, precision = 10, scale = 2) => {
    const maxDecimals = scale;
    const maxIntegers = precision - scale;          // 8 dígitos enteros
    const maxValue = Number('9'.repeat(maxIntegers) + '.' + '9'.repeat(maxDecimals)); // 99999999.99

    const parsed = safeParseFloat(value);
    if (isNaN(parsed) || parsed <= 0) return false;
    if (parsed > maxValue) return false;

    // Verificar que no tenga más decimales de los permitidos
    const str = parsed.toString();
    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1 && str.length - dotIndex - 1 > maxDecimals) return false;

    return true;
};
