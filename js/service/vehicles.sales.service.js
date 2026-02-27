import { getCookie } from "../utils/api.utils.js";

const API_URL = "https://leal-import-api.onrender.com/api/VehicleSale";
const API_URLVeh = "https://leal-import-api.onrender.com/api/Vehicle";

export let postVehicle = async (sale, id) => {
    try {
        const request = await fetch(`${API_URL}/postVehicleSale/${id}`, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
            },
            body: sale,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al ingresar la venta. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([camp, message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
            }

            // Lanza el error capturable por el controlador
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.");
        }

        throw error;
    }
};

export let putVehicle = async (vehicleData, id) => {
    try {
        const request = await fetch(`${API_URL}/putVehicleSale/${id}`, {
            method: 'PUT',
            headers: {
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
            },
            body: vehicleData,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al actualizar la venta del vehiculo. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([camp, message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
            }

            // Lanza el error capturable por el controlador
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.");
        }

        throw error;
    }
};

export let getSaleById = async (id) => {
    try {
        const request = await fetch(`${API_URL}/getVehicleSaleById/${id}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();

            if (request.status === 401) {
                throw new Error(`Error ${request.status}: No autorizado. Detalle: ${JSON.parse(errorBody).message}`);
            }

            throw new Error(`Error ${request.status}: No se pudo obtener la venta. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSaleById:", error);
        throw error;
    }
};

export let getVehiclesAviable = async (page = 0, size = 15, search = '') => {
    try {
        const request = await fetch(`${API_URLVeh}/getSaleSummary?page=${page}&size=${size}&search=${search}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();

            if (request.status === 401) {
                throw new Error(`Error ${request.status}: No autorizado. Detalle: ${JSON.parse(errorBody).message}`);
            }

            throw new Error(`Error ${request.status}: No se pudo obtener la lista de vehiculos. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getVehicles:", error);
        throw new Error("Fallo al conectar con el servicio de vehiculos.");
    }
};