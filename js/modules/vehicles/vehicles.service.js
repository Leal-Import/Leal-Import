import config from "../../config.js";
import { buildParams } from "../../utils/dom.js";
import { apiRequest } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/Vehicle`;

export const getVehicles = async(page = 0, size = 15, search = "", statusId = "", year = "", source = "", startDate = "", endDate = "") => {
    const params = buildParams({ page, size, search, statusId, year, source, startDate, endDate });
    return await apiRequest(
        `${API_URL}/getVehicleSummary?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de vehículos'
    );
};

/*GET para optener el status*/
export const getStatus = async() => {
    return await apiRequest(
        `${API_URL}/getStatus`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de roles'
    );
};

export const getVehicleStats = async() => {
    return await apiRequest(
        `${API_URL}/getGlobalStats`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener las estadisticas de los vehículos'
    );
};
