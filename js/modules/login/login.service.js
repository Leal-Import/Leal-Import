import config from "../../config.js";
import { apiRequest, APIError } from "../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/auth`;
const API_URLS = `${config.API_BASE_URL}/passwordReset`;

const defaultApiOptions = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
};

export const login = async (username, password) => {
    try {
        const body = JSON.stringify({ username, password });
        return await apiRequest(
            `${API_URL}/login`,
            { ...defaultApiOptions, method: 'POST', body },
            'Error al iniciar sesión'
        );
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError('Error al iniciar sesión', 0, error, `${API_URL}/login`);
    }
};

export const getAuthMe = async () => {
    return await apiRequest(`${API_URL}/me`, {
        ...defaultApiOptions,
        method: 'GET'
    }, 'No se pudo obtener los datos de sesión');
};

export const verifyEmail = async (email) => {
    const body = JSON.stringify({ email });
    return await apiRequest(
        `${API_URLS}/request`,
        { ...defaultApiOptions, method: 'POST', body },
        'Error al enviar solicitud de verificación de correo'
    );
};

export const verifyPIN = async (resetId, email, code) => {
    const body = JSON.stringify({ resetId, email, code });
    return await apiRequest(
        `${API_URLS}/verify`,
        { ...defaultApiOptions, method: 'POST', body },
        'Error al verificar el PIN'
    );
};

export const resetPassword = async (ticket, newPassword) => {
    const body = JSON.stringify({ ticket, newPassword });
    return await apiRequest(
        `${API_URLS}/confirm`,
        { ...defaultApiOptions, method: 'POST', body },
        'Error al restablecer contraseña'
    );
};
