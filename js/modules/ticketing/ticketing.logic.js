const requiredText = (value) => typeof value === 'string' && value.trim().length > 0;

const decimalToMinorUnits = (value, fractionDigits) => {
    const normalized = String(value ?? '').trim();
    const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${fractionDigits}})?$`);
    if (!pattern.test(normalized)) return Number.NaN;

    const [wholePart, fractionPart = ''] = normalized.split('.');
    const scale = 10 ** fractionDigits;
    const minorUnits = Number(wholePart) * scale + Number(fractionPart.padEnd(fractionDigits, '0'));

    return Number.isSafeInteger(minorUnits) ? minorUnits : Number.NaN;
};

const localDateTimeToIso = (value) => {
    if (!requiredText(value)) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const isoToLocalDateTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
};

export const mapEventForm = (formData) => ({
    name: formData.name.trim(),
    venue: formData.venue.trim(),
    startsAt: localDateTimeToIso(formData.startsAt),
    endsAt: localDateTimeToIso(formData.endsAt),
    refundPolicy: formData.refundPolicy.trim()
});

export const validateEvent = (event) => {
    if (!requiredText(event.name)) return 'El nombre del evento es obligatorio.';
    if (!requiredText(event.venue)) return 'El lugar del evento es obligatorio.';
    if (!event.startsAt || !event.endsAt) return 'Debes indicar las fechas del evento.';
    if (new Date(event.endsAt) <= new Date(event.startsAt)) return 'La finalización debe ser posterior al inicio.';
    if (!requiredText(event.refundPolicy)) return 'La política de devolución es obligatoria.';
    return null;
};

export const mapZoneForm = (formData) => ({
    name: formData.name.trim(),
    capacity: Number(formData.capacity)
});

export const validateZone = (zone) => {
    if (!requiredText(zone.name)) return 'El nombre de la zona es obligatorio.';
    if (!Number.isInteger(zone.capacity) || zone.capacity < 1) return 'La capacidad debe ser un entero mayor que cero.';
    return null;
};

export const mapTicketTypeForm = (formData) => ({
    name: formData.name.trim(),
    priceInCents: decimalToMinorUnits(formData.price, 2),
    capacity: Number(formData.capacity)
});

export const validateTicketType = (ticketType) => {
    if (!requiredText(ticketType.name)) return 'El nombre del boleto es obligatorio.';
    if (!Number.isInteger(ticketType.priceInCents) || ticketType.priceInCents < 0) return 'El precio debe tener máximo dos decimales y ser mayor o igual a cero.';
    if (!Number.isInteger(ticketType.capacity) || ticketType.capacity < 1) return 'Los cupos deben ser un entero mayor que cero.';
    return null;
};
