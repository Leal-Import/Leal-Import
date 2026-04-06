import config from "../../config.js";
import { buildParams } from "../../utils/dom.js";
import { apiRequest } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/Customer`;

export const getCustomers = async(page = 0, size = 15, search = "", status = 'ACTIVE') => {
    const params = buildParams({ page, size, search, status });
    return await apiRequest(
        `${API_URL}/getCustomers?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de clientes'
    );
};

export const postCustomer = async(customerData) => {
    return await apiRequest(
        `${API_URL}/postCustomer`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        },
        'Error al crear cliente'
    );
};

export const putCustomer = async(customerData, customerId) => {
    return await apiRequest(
        `${API_URL}/putCustomer/${customerId}`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        },
        'Error al actualizar cliente'
    );
};

export const patchCustomer = async(id, value) => {
    return await apiRequest(
        `${API_URL}/${id}/status?status=${value}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        },
        'Error al actualizar el estado del cliente'
    );
};
