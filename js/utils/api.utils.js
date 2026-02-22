import { getAuthMe } from '../service/login.service.js';
import { showMessage } from './dom.js';

let currentUser = null;

export function getCookie(name) {
    let cookieValue = null; if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break;
            }
        }
    }
    return cookieValue;
}

export const initSession = async () => {
    try {
        const response = await getAuthMe();
        if (response?.authenticated) {
            currentUser = response.user;
            return currentUser;
        } else {
            await forceLogout("Sesión no válida");
        }
    } catch (error) {
        if (error?.status === 401) {
            await forceLogout("Sesión expirada");
        } else {
            console.error("Error verificando sesión:", error);
            await forceLogout("Error de sesión");
        }
    }
};

// Función auxiliar para sacar al usuario
const forceLogout = async () => {
    currentUser = null;

    if (!window.location.pathname.includes("login.html")) {
        await showMessage(
            "Sesión finalizada",
            "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
            "warning"
        );

        window.location.href = 'login.html';
    }
};

/* Devuelve el ID del empleado actual, Útil para enviar en formularios.*/
export const getCurrentEmployeeId = () => {
    if (!currentUser) {
        console.warn("Se intentó obtener ID sin sesión iniciada.");
        return null;
    }
    return currentUser.idEmployee;
};