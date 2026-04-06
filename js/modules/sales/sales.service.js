import { config } from "../../config.js";
import { buildParams } from "../../utils/dom.js";
import { apiRequest } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/SalesView`;
const API_URLS = `${config.API_BASE_URL}/StatusSales`;

export const getSales = async (page = 0, size = 15, search = "", idState = "", productType = "", startDate = "", endDate = "") => {
    const params = buildParams({ page, size, search, idState, productType, startDate, endDate });
    return await apiRequest(
        `${API_URL}/getSalesSummary?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de ventas'
    );
};

export const getStateSales = async () => {
    return await apiRequest(
        `${API_URLS}/getStatusSales`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener los estados de venta'
    );
};
