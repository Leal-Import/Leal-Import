import config from "../../config.js";
import { buildParams } from "../../utils/dom.js";
import { apiRequest } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/Employees`;
const API_URLR = `${config.API_BASE_URL}/Roles`;
const API_URLUS = `${config.API_BASE_URL}/Users`;

export const getActiveEmployees = async (page = 0, size = 15, search = "", idRole = "", status = "") => {
    const params = buildParams({ page, size, search, idRole, status });
    return await apiRequest(
        `${API_URL}/getEmployees?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de empleados'
    );
};

export const postEmployee = async (employeeData) => {
    return await apiRequest(
        `${API_URL}/postEmployee`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        },
        'Error al crear empleado'
    );
};

export const patchEmployee = async (userId, value) => {
    return await apiRequest(
        `${API_URLUS}/${userId}/status?status=${value}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        },
        'Error al actualizar el estado del usuario'
    );
};

export const putEmployee = async (employeeData, id) => {
    return await apiRequest(
        `${API_URL}/putEmployee/${id}`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        },
        'Error al actualizar empleado'
    );
};

// GET para obtener los roles del empleado
export const getRoles = async () => {
    return await apiRequest(
        `${API_URLR}/getRoles`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener roles de empleado'
    );
};
