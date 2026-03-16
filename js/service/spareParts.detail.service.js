import { API_BASE_URL } from "../utils/api.utils.js";

const API_URL = `${API_BASE_URL}/spareParts`;

export const postSparePart = async(sparePart) => {
    try {
        const request = await fetch(`${API_URL}/postSparepart`, {
            method: 'POST',
            credentials: 'include',
            body: sparePart
        });

        if (!request.ok) {
            let errorMessage = `Error al ingresar el repuesto. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (error) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
                throw new Error(errorMessage, { cause: error });
            }

            // Lanza el error capturable por el controlador
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }

        throw error;
    }
};

export const putSparePart = async(sparePart, id) => {
    try {
        const request = await fetch(`${API_URL}/putSparepart/${id}`, {
            method: 'PUT',
            credentials: 'include',
            body: sparePart
        });

        if (!request.ok) {
            let errorMessage = `Error al actualizar el repuesto. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (error) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
                throw new Error(errorMessage, { cause: error });
            }

            // Lanza el error capturable por el controlador
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }

        throw error;
    }
};

export const getSparePart = async(id) => {
    try {
        const request = await fetch(`${API_URL}/getSparePartById/${id}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la informacion del repuesto. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }

        throw error;
    }
};
