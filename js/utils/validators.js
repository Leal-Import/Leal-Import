export const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(email.toLowerCase())) return false;
    if (email.length > 254) return false;

    const domain = email.substring(email.lastIndexOf('@') + 1);
    return domain.split('.').every(part => part.length <= 63);
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

export const validatePayment = (amount, method) => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return "El monto del abono debe ser mayor a cero.";
    }

    if (!method) {
        return "Debe seleccionar un método de pago.";
    }

    return null;
};

export const isValidURL = (url) => {
    if (!url || url.length < 1 || url.length > 1000) return false;

    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:";
    } catch (error) {
        throw new Error("URL inválida: " + error.message, { cause: error });
    }
};

// utils/validators.js

export const isValidDecimal = (value, precision = 10, scale = 2) => {
    const maxDecimals  = scale;
    const maxIntegers  = precision - scale;          // 8 dígitos enteros
    const maxValue     = Number('9'.repeat(maxIntegers) + '.' + '9'.repeat(maxDecimals)); // 99999999.99

    const parsed = safeParseFloat(value);
    if (isNaN(parsed) || parsed < 0) return false;
    if (parsed > maxValue)           return false;

    // Verificar que no tenga más decimales de los permitidos
    const str      = parsed.toString();
    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1 && str.length - dotIndex - 1 > maxDecimals) return false;

    return true;
};
