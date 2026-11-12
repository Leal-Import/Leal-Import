import config from '../../config.js';
import { buildParams } from '../../utils/dom.js';
import { apiRequest } from '../../utils/api.utils.js';

const ORDERS_API = `${config.API_BASE_URL}/admin/ticketing/orders`;
const READ_TICKET_ORDERS = ['READ_TICKET_ORDERS'];

const getData = (response) => response?.data ?? response;

export const getTicketOrders = (page, size, filters = {}) => {
    const params = buildParams({ page, size, search: filters.search, status: filters.status });
    return apiRequest(
        `${ORDERS_API}?${params.toString()}`,
        { method: 'GET' },
        'No se pudieron cargar las órdenes de boletos',
        READ_TICKET_ORDERS
    );
};

export const getTicketOrder = (orderId) => apiRequest(
    `${ORDERS_API}/${orderId}`,
    { method: 'GET' },
    'No se pudo cargar el detalle de la orden',
    READ_TICKET_ORDERS
).then(getData);

export const voidCashSale = (orderId, reason) => apiRequest(
    `${config.API_BASE_URL}/admin/ticketing/cash-sales/${orderId}/void`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
    },
    'No se pudo anular la venta en efectivo',
    ['CANCEL_TICKET_SALES']
).then(getData);
