import config from "../../config.js";
import { apiRequest } from "../../utils/api.utils.js";

const APIPAY_URL = `${config.API_BASE_URL}/PaymentMethod`;
const API_URL = `${config.API_BASE_URL}/auth`;
const APIPW_URL = `${config.API_BASE_URL}/passwordReset`;
const API_ROLES_URL = `${config.API_BASE_URL}/Roles`;

export const getPaymentMethods = async () => {
    return await apiRequest(
        `${APIPAY_URL}/getPaymentMethod`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de métodos de pago'
    );
};

export const logout = async () => {
    return await apiRequest(
        `${API_URL}/logout`,
        {
            method: 'POST',
            credentials: 'include'
        },
        'Error al cerrar sesión'
    );
};

export const verifyCurrentPassword = async (currentPassword) => {
    return await apiRequest(
        `${APIPW_URL}/verifyPassword`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword })
        },
        'Error al verificar contraseña actual'
    );
};

export const putUsername = async (payload) => {
    return await apiRequest(
        `${APIPW_URL}/changeUsername`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        },
        'Error al verificar contraseña actual'
    );
};

export const editProfile = async (profile) => {
    return await apiRequest(
        `${API_URL}/profile`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        },
        'Error al editar perfil'
    );
};

export const changePassword = async (newPassword, ticket) => {
    return await apiRequest(
        `${APIPW_URL}/newPassword`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword, ticket })
        },
        'Error al cambiar contraseña'
    );
};

export const putPaymentMethod = async (method, id) => {
    return await apiRequest(
        `${APIPAY_URL}/putPaymentMethod/${id}`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(method)
        },
        'Error al actualizar método de pago'
    );
};

export const postPaymentMethod = async (method) => {
    return await apiRequest(
        `${APIPAY_URL}/postPaymentMethod`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(method)
        },
        'Error al agregar método de pago'
    );
};

export const deletePaymentMethod = async (id) => {
    return await apiRequest(
        `${APIPAY_URL}/${id}`,
        {
            method: 'DELETE',
            credentials: 'include'
        },
        'Error al eliminar método de pago'
    );
};

export const getSystemRoles = async () => {
    return await apiRequest(
        `${API_ROLES_URL}/getRoles`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener los roles del sistema'
    );
};

export const addPrivilegeToRole = async (roleId, privilegeId) => {
    return await apiRequest(
        `${API_ROLES_URL}/${roleId}/privileges/${privilegeId}`,
        {
            method: 'PATCH',
            credentials: 'include'
        },
        'Error al asignar privilegio al rol'
    );
};

export const removePrivilegeFromRole = async (roleId, privilegeId) => {
    return await apiRequest(
        `${API_ROLES_URL}/${roleId}/privileges/${privilegeId}`,
        {
            method: 'DELETE',
            credentials: 'include'
        },
        'Error al eliminar privilegio del rol'
    );
};
