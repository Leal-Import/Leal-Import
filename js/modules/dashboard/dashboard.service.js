import config from "../../config.js";
import { apiRequest } from '../../utils/api.utils.js';

const API_URL = `${config.API_BASE_URL}/dashboard`;

/**
 * Obtiene los contadores globales (órdenes atrasadas, clientes inactivos, etc)
 */
export const getCounters = async () => {
    return await apiRequest(`${API_URL}/counters`, { method: 'GET', credentials: 'include' }, 'Error al cargar contadores');
};

/**
 * Obtiene el ranking de mejores vendedores
 */
export const getTopSellers = async () => {
    return await apiRequest(`${API_URL}/topSellers`, { method: 'GET', credentials: 'include' }, 'Error al cargar mejores vendedores');
};

/**
 * Obtiene la mejor venta de vehículo
 */
export const getTopVehicleSales = async () => {
    return await apiRequest(`${API_URL}/topVehicleSales`, { method: 'GET', credentials: 'include' }, 'Error al cargar mejor venta de vehículo');
};

/**
 * Obtiene las órdenes de trabajo recientes
 */
export const getRecentWorkOrders = async () => {
    return await apiRequest(`${API_URL}/recentWorkOrders`, { method: 'GET', credentials: 'include' }, 'Error al cargar órdenes recientes');
};
