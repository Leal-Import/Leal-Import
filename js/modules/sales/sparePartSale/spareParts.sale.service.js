import config from "../../../config.js";
import { buildParams } from "../../../utils/dom.js";
import { apiRequest } from "../../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/SpareParts`;
const API_URLSALE = `${config.API_BASE_URL}/SparePartsSale`;

export const getSpareParts = async (page = 0, size = 15, search = "") => {
    const params = buildParams({ page, size, search });
    return await apiRequest(
        `${API_URL}/getSaleSummary?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de repuestos'
    );
};

export const getSparePartById = async (id) => {
    return await apiRequest(
        `${API_URLSALE}/getSparePartsSaleById/${id}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener el repuesto'
    );
};

export const postSparePart = async (sale) => {
    return await apiRequest(
        `${API_URLSALE}/postSale`,
        {
            method: 'POST',
            credentials: 'include',
            body: sale
        },
        'Error al ingresar la venta'
    );
};

export const patchSparePart = async (id, reason) => {
    return await apiRequest(
        `${API_URLSALE}/cancelSale/${id}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, id })
        },
        'Error al cancelar la venta'
    );
};

export const putSparePart = async (sale, id) => {
    return await apiRequest(
        `${API_URLSALE}/putSale/${id}`,
        {
            method: 'PUT',
            credentials: 'include',
            body: sale
        },
        'Error al actualizar la venta'
    );
};
