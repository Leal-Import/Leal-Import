import config from '../../config.js';
import { apiRequest } from '../../utils/api.utils.js';

const VALIDATION_URL = `${config.API_BASE_URL}/admin/ticketing/tickets/validate`;

export const validateTicketQr = (qrContent) => apiRequest(
    VALIDATION_URL,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrContent })
    },
    'No se pudo validar el boleto',
    ['VALIDATE_TICKETS']
).then(response => response?.data ?? response);
