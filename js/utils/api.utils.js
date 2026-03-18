import { getAuthMe } from '../service/login.service.js';
import { showMessage } from './dom.js';

export const API_BASE_URL = 'https://leal-import-api-jsol.onrender.com/api';

let currentUser = null;

export const initSession = async () => {
    try {
        const response = await getAuthMe();
        if (response?.authenticated) {
            currentUser = response.user;
            localStorage.setItem("app.user.name", currentUser.fullName || 'Usuario');
            localStorage.setItem("app.user.role", currentUser.role || 'Rol');
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
    localStorage.removeItem('app.user.name');
    localStorage.removeItem('app.user.role');
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

export const getCurrentEmployee = () => {
    if (!currentUser) {
        console.warn("Se intentó obtener el empleado actual sin sesión iniciada.");
        return null;
    }
    return currentUser;
};
