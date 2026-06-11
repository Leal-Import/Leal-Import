import config from "../../config.js";
import { apiRequest } from '../../utils/api.utils.js';

const API_URL = `${config.API_BASE_URL}/dashboard`;

const withPeriod = (endpoint, period = 'MONTH') =>
    `${API_URL}/${endpoint}?period=${encodeURIComponent(period)}`;

export const getCounters = async () => {
    return await apiRequest(`${API_URL}/counters`, { method: 'GET', credentials: 'include' }, 'Error al cargar contadores');
};

export const getTopSellers = async (period = 'MONTH') => {
    return await apiRequest(withPeriod('topSellers', period), { method: 'GET', credentials: 'include' }, 'Error al cargar mejores vendedores');
};

export const getTopVehicleSales = async (period = 'MONTH') => {
    return await apiRequest(withPeriod('topVehicleSales', period), { method: 'GET', credentials: 'include' }, 'Error al cargar mejor venta de vehículo');
};

export const getRecentWorkOrders = async (period = 'MONTH') => {
    return await apiRequest(withPeriod('recentWorkOrders', period), { method: 'GET', credentials: 'include' }, 'Error al cargar órdenes recientes');
};

export const getMetrics = async (period = 'MONTH') => {
    return await apiRequest(withPeriod('metrics', period), { method: 'GET', credentials: 'include' }, 'Error al cargar métricas');
};

export const getUrgentCollections = async (period = 'MONTH') => {
    return await apiRequest(withPeriod('urgentCollections', period), { method: 'GET', credentials: 'include' }, 'Error al cargar cobros urgentes');
};