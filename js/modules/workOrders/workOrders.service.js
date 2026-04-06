import config from "../../config.js";
import { buildParams } from "../../utils/dom.js";
import { apiRequest } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/VehicleWorkOrderHistory`;

export const getVehiclesWOrders = async (page = 0, size = 15, search = "", idStatus = "") => {
    const params = buildParams({ page, size, search, idStatus });
    return await apiRequest(
        `${API_URL}/getVehiclesWithOrders?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de órdenes'
    );
};

export const getWOStatus = async () => {
    return await apiRequest(
        `${API_URL}/getWorkOrdersStatus`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de estados'
    );
};
