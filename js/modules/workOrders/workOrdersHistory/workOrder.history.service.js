import config from "../../../config.js";
import { buildParams } from "../../../utils/dom.js";
import { apiRequest } from "../../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/VehicleWorkOrderHistory`;

export const getDetailsOrders = async(idVehicle, page = 0, size = 15, search = "", idStatus = "") => {
    const params = buildParams({ page, size, search, idStatus });
    return await apiRequest(
        `${API_URL}/getHistoryByVehicle/${idVehicle}?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de órdenes'
    );
};

export const getDashboardWorkorder = async(id) => {
    return await apiRequest(
        `${API_URL}/${id}/dashboard`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener los datos del dashboard'
    );
};
