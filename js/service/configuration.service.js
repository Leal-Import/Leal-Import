import { API_BASE_URL } from "../utils/api.utils.js";

const APIPAY_URL = `${API_BASE_URL}/Sales`;
const API_URL = `${API_BASE_URL}/auth`;
const APIPW_URL = `${API_BASE_URL}/passwordReset`;


export const getPaymentMethods = async () => {
    try {
        const request = await fetch(`${APIPAY_URL}/getPaymentMethod`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de metodos de pago. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getPaymentMethods:", error);
        throw new Error("Fallo al conectar con el servicio de metodos de pago.");
    }
};

export const logout = async () => {
    try {
        const request = await fetch(`${API_URL}/logout`, {
            credentials: 'include',
            method: 'POST'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo cerrar la sesion. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en autenticacion:", error);
        throw new Error("Fallo al conectar con el servicio de autenticacion");
    }
};

export const verifyCurrentPassword = async (currentPassword) => {
    try {
        const request = await fetch(`${APIPW_URL}/verifyPassword`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword })
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo verificar la contraseña actual. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en verificacion de contraseña:", error);
        throw new Error("Fallo al conectar con el servicio de verificacion de contraseña");
    }
};

export const changePassword = async (newPassword, ticket) => {
    try {
        const request = await fetch(`${APIPW_URL}/newPassword`, {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPassword, ticket })
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo cambiar la contraseña. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en cambio de contraseña:", error);
        throw new Error("Fallo al conectar con el servicio de cambio de contraseña");
    }
};