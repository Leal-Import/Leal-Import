import { getAuthMe } from '../modules/login/login.service.js';
import { showMessage } from './dom.js';
import { navigateTo, ROUTES } from './router.js';
import { DraftManager } from './draft.manager.js';
import { canAccess, setUserPrivileges, clearUserPrivileges } from './privilegesValidator.js';
import { initSidebar } from '../components/sidebar.js';

export class APIError extends Error {
    constructor(message, status = 500, cause = null, endpoint = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.cause = cause;
        this.endpoint = endpoint;
    }
}

export const handleApiError = async (error) => {
    console.error('[API Error]', error);
    initSidebar();
    if (error instanceof APIError) {
        if (error.status === 401) {
            await forceLogout('Sesión expirada');
            return;
        }

        if (error.status === 403) {
            await showMessage('Acceso Denegado', error.message || 'No tienes permiso para esta acción.', 'error');
            return;
        }

        if (error.status >= 500) {
            await showMessage('Error del Servidor', 'Intenta más tarde.', 'error');
            return;
        }

        await showMessage('Error', error.message || 'Error desconocido', 'error');
        return;
    }

    await showMessage('Error', error?.message || 'Error desconocido', 'error');
};

export const apiRequest = async (url, options = {}, friendlyMessage = 'Error de API', requiredPrivileges = []) => {
    if (!canAccess(requiredPrivileges)) {
        throw new APIError('No tienes permiso para esta acción.', 403, null, url);
    }

    try {
        const response = await fetch(url, options);
        let data = null;

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            initSidebar();

            let errorMessage = `${friendlyMessage}. Código: ${response.status}`;
            if (data && typeof data === 'object') {
                // Manejar errores de validación de Spring Boot (DTO errors)
                if (data.errors && typeof data.errors === 'object') {
                    const validationErrors = Object.values(data.errors).join('. ');
                    errorMessage = validationErrors || data.message || 'Errores de validación';
                } else if (data.message || data.error) {
                    errorMessage = data.message || data.error;
                }
            } else if (typeof data === 'string' && data.trim()) {
                errorMessage = data.trim();
            }

            throw new APIError(errorMessage, response.status, null, url);
        }

        return data;
    } catch (error) {
        initSidebar();
        if (error instanceof APIError) {
            throw error;
        }
        const isNetworkError = error instanceof TypeError || /network|failed/i.test(error?.message || '');
        const errorMessage = isNetworkError
            ? `${friendlyMessage}. El servicio no está disponible.`
            : `${friendlyMessage}. ${error?.message || 'Error inesperado.'}`;

        throw new APIError(errorMessage, isNetworkError ? 0 : 500, error, url);
    }
};

export let currentUser = null;

export const initSession = async () => {
    try {
        const response = await getAuthMe();
        if (response.status === "OK") {
            currentUser = response.data;
            const privileges = currentUser.privileges || currentUser.privilegeList || currentUser.directPrivileges || [];
            setUserPrivileges(Array.isArray(privileges) ? privileges : []);
            return currentUser;
        } else {
            await forceLogout("Sesión no válida");
        }
    } catch (error) {
        initSidebar();
        if (error?.status === 401) {
            await forceLogout("Sesión expirada");
        } else {
            console.error("Error verificando sesión:", error);
            await forceLogout("Error de sesión");
        }
    }
};

// Función auxiliar para sacar al usuario
const forceLogout = async (reason = 'Sesión finalizada') => {
    // Limpiar usuario
    currentUser = null;
    clearUserPrivileges();

    // Limpiar tokens/auth
    localStorage.removeItem('app.auth.token');
    sessionStorage.clear();

    // Limpiar drafts/datos temporales utilizando DraftManager
    // Esto centraliza la limpieza de borradores
    const commonDraftKeys = [
        'spareSalesFormState.saleKey',
        'workOrdersFormState.saleKey'
    ];

    commonDraftKeys.forEach(key => {
        try {
            const draftManager = new DraftManager(key);
            draftManager.clear();
        } catch (e) {
            console.warn(`No se pudo limpiar el borrador ${key}:`, e);
        }
    });

    // Fallback: Limpiar cualquier otra clave de draft restante
    const allDraftKeys = Object.keys(localStorage).filter(k =>
        k.includes('Sale') || k.includes('Order') || k.includes('Draft')
    );
    allDraftKeys.forEach(key => localStorage.removeItem(key));

    // Limpiar form memory si existe
    if (window.sessionStorage) sessionStorage.clear();

    // Mostrar mensaje y redirigir
    if (!window.location.pathname.includes("login.html")) {
        await showMessage("Sesión finalizada", reason, "warning");
        navigateTo(ROUTES.LOGIN);
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
