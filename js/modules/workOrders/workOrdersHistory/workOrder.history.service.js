import config from "../../../config.js";
import { buildParams } from "../../../utils/dom.js";

const API_URL = `${config.API_BASE_URL}/ViewWorkOrderHistory`;

export const getDetailsOrders = async(idVehicle, page = 0, size = 15, search = "", idStatus = "") => {
    try {
        const params = buildParams({ page, size, search, idStatus });
        const request = await fetch(`${API_URL}/getHistoryOrder/${idVehicle}?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();

            if (request.status === 401) {
                throw new Error(`Error ${request.status}: No autorizado. Detalle: ${JSON.parse(errorBody).message}`);
            }

            throw new Error(`Error ${request.status}: No se pudo obtener la lista de ordenes. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getDetailsOrders:", error);
        throw error;
    }
};

export const getDashboardWorkorder = async(id) => {
    try {
        const request = await fetch(`${API_URL}/${id}/dashboard`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            if (request.status === 401) {
                throw new Error(`Error ${request.status}: No autorizado. Detalle: ${JSON.parse(errorBody).message}`);
            }
            throw new Error(`Error ${request.status}: No se pudo obtener los datos de venta del vehiculos. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getDashboardWorkorder:", error);
        throw new Error("Fallo al conectar con el servicio de orden de trabajo.", { cause: error });
    }
};
