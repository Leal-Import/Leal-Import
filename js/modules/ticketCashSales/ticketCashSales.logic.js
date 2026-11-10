export const toMinorUnits = (value) => {
    const normalized = String(value ?? '').trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return Number.NaN;

    const [whole, fraction = ''] = normalized.split('.');
    const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(amount) ? amount : Number.NaN;
};

export const selectedLines = (ticketTypes) => ticketTypes
    .map((ticketType) => ({
        ticketTypeId: ticketType.id,
        quantity: Number(ticketType.quantity || 0)
    }))
    .filter((line) => Number.isInteger(line.quantity) && line.quantity > 0);

export const validateSaleInput = ({ customerName, customerEmail, lines }) => {
    if (!customerName.trim()) return 'El nombre del comprador es obligatorio.';
    if (!customerEmail.trim()) return 'El correo del comprador es obligatorio.';
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) return 'El correo del comprador no es válido.';
    if (!lines.length) return 'Selecciona al menos un boleto para continuar.';
    return null;
};

export const createIdempotencyKey = () => {
    if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
};
