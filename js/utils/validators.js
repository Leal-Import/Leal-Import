export const isValidEmail = (email) => {
    if (!email) return false;

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(email.toLowerCase())) return false;
    if (email.length > 254) return false;

    const domain = email.substring(email.lastIndexOf('@') + 1);
    return domain.split('.').every(part => part.length <= 63);
};

export const isValidPhone = (phone) => {
    const cleanPhone = phone.replace(/[-\s]/g, '');
    return /^\d{8}$/.test(cleanPhone);
};

export function safeParseFloat(v) {
    const n = parseFloat(String(v || '').replace(/[$,\s]/g, ''));
    return isNaN(n) ? 0 : n;
}

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
    if (!url) return false;

    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:";
    } catch (e) {
        return false;
    }
}
