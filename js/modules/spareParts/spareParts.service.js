import config from "../../config.js";
import { buildParams } from "../../utils/dom.js";
import { apiRequest } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/SpareParts`;

export const getSpareParts = async(page = 0, size = 15, search = "", idState = "", startDate = "", endDate = "") => {
    const params = buildParams({ page, size, search, idState, startDate, endDate });
    return await apiRequest(
        `${API_URL}/getSparePartSummary?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de repuestos'
    );
};

export const getStatus = async() => {
    return await apiRequest(
        `${API_URL}/getStatus`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de estados de repuestos'
    );
};
