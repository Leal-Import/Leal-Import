import config from "../../../config.js";
import { apiRequest } from "../../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/SpareParts`;

export const postSparePart = async(sparePart) => {
    return await apiRequest(
        `${API_URL}/postSparepart`,
        {
            method: 'POST',
            credentials: 'include',
            body: sparePart
        },
        'Error al ingresar el repuesto'
    );
};

export const putSparePart = async(sparePart, id) => {
    return await apiRequest(
        `${API_URL}/putSparepart/${id}`,
        {
            method: 'PUT',
            credentials: 'include',
            body: sparePart
        },
        'Error al actualizar el repuesto'
    );
};

export const getSparePart = async(id) => {
    return await apiRequest(
        `${API_URL}/getSparePartById/${id}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener el repuesto'
    );
};
