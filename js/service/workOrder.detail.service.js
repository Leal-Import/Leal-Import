import { API_BASE_URL } from "../utils/api.utils.js";
import { buildParams } from "../utils/dom.js";

const API_URL = `${API_BASE_URL}/WorkOrder`;
const API_URLVE = `${API_BASE_URL}/Vehicle`;
const API_URLSPA = `${API_BASE_URL}/spareParts`;

export const getServices = async (search) => {
    try {
        const request = await fetch(`${API_URL}/getService?search=${search}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de los servicios. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getServices:", error);
        throw new Error("Fallo al conectar con el servicio de servicios.", { cause: error });
    }
};

export const patchWorkOrder = async (idWorkOrder) => {
    try {
        const response = await fetch(
            `${API_URL}/patchWorkOrder/${idWorkOrder}/complete`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            let errorMessage = `Error al completar la orden. Código: ${response.status}.`;

            try {
                const errorData = await response.json();
                if (errorData.errors) {
                    errorMessage = Object.values(errorData.errors).join('\n');
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                const text = await response.text();
                if (text) errorMessage += ` Detalle: ${text.substring(0, 100)}`;
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }
        throw error;
    }
};

export const getDataVehicleById = async (id) => {
    try {
        const request = await fetch(`${API_URLVE}/getWorkOrderVehicle/${id}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudueron obtener los datos del vehiculo. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getDataVehicleById:", error);
        throw new Error("Fallo al conectar con el servicio de vehiculos.", { cause: error });
    }
};

export const getWorkOrderById = async (id) => {
    try {
        const request = await fetch(`${API_URL}/getWorkOrderById/${id}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudueron obtener los datos de la orden. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getWorkOrderById:", error);
        throw new Error("Fallo al conectar con el servicio de ordenes.", { cause: error });
    }
};

export const getSpareParts = async () => {
    try {
        const request = await fetch(`${API_URLSPA}/getWorkOrderSpareParts`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudueron obtener los repuestos. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSpareParts:", error);
        throw new Error("Fallo al conectar con el servicio de repuestos.", { cause: error });
    }
};

export const postWorkOrder = async (workOrderData, idVehicle, idSale) => {
    try {
        const params = buildParams({ idSale });
        const request = await fetch(`${API_URL}/postWorkOrder/${idVehicle}?${params.toString()}`, {
            method: 'POST',
            body: workOrderData,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al crear la orden. Código: ${request.status}.`;

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

export const putWorkOrder = async (workOrderData, idWorkOrder) => {
    try {

        const request = await fetch(`${API_URL}/putWorkOrder/${idWorkOrder}`, {
            method: 'PUT',
            body: workOrderData,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al actualizar la orden. Código: ${request.status}.`;

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
