import config from '../../config.js';
import { apiRequest } from '../../utils/api.utils.js';

const ORDERS_API = `${config.API_BASE_URL}/admin/ticketing/orders`;
const READ_SALES = ['READ_SALES'];

const getData = (response) => response?.data ?? response;

export const getTicketOrders = (page, size) => apiRequest(
    `${ORDERS_API}?page=${page}&size=${size}`,
    { method: 'GET' },
    'No se pudieron cargar las órdenes de boletos',
    READ_SALES
);

export const getTicketOrder = (orderId) => apiRequest(
    `${ORDERS_API}/${orderId}`,
    { method: 'GET' },
    'No se pudo cargar el detalle de la orden',
    READ_SALES
).then(getData);
