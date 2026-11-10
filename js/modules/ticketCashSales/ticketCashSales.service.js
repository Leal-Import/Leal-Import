import config from '../../config.js';
import { apiRequest } from '../../utils/api.utils.js';

const CASH_SALES_API = `${config.API_BASE_URL}/admin/ticketing/cash-sales`;
const WRITE_TICKET_SALES = ['WRITE_TICKET_SALES'];
const getData = (response) => response?.data ?? response;

const post = (path, body, friendlyMessage) => apiRequest(
    `${CASH_SALES_API}${path}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    },
    friendlyMessage,
    WRITE_TICKET_SALES
).then(getData);

export const quoteCashSale = (payload) => post('/quote', payload, 'No se pudo calcular la venta en efectivo');

export const confirmCashSale = (payload) => post('/confirm', payload, 'No se pudo confirmar la venta en efectivo');
