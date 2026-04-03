import config from "../../../config.js";
import { buildParams } from "../../../utils/dom.js";

const API_URL = `${config.API_BASE_URL}/spareParts`;
const API_URLSALE = `${config.API_BASE_URL}/sparePartsSale`;

export const getSpareParts = async(page = 0, size = 15, search = "") => {
    try {
        const params = buildParams({ page, size, search });
        const request = await fetch(`${API_URL}/getSaleSummary?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de repuestos. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSpareParts:", error);
        throw new Error("Fallo al conectar con el servicio de repuestos.", { cause: error });
    }
};

export const getSparePartById = async(id) => {
    try {
        const request = await fetch(`${API_URLSALE}/getSparePartsSaleById/${id}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener el repuesto. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSparePartById:", error);
        throw new Error("Fallo al conectar con el servicio de repuestos.", { cause: error });
    }
};

export const postSparePart = async(sale) => {
    try {
        const request = await fetch(`${API_URLSALE}/postSparePartsSale`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sale)
        });
        if (!request.ok) {
            let errorMessage = `Error al ingresar la venta. Código: ${request.status}.`;

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

export const putSparePart = async(sale, id) => {
    try {
        const request = await fetch(`${API_URLSALE}/putSparePartsSale/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sale)
        });
        if (!request.ok) {
            let errorMessage = `Error al actualizar la venta. Código: ${request.status}.`;

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
