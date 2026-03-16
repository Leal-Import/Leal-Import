import { API_BASE_URL } from "../utils/api.utils.js";

const API_URL = `${API_BASE_URL}/Vehicle`;
const API_URLS = `${API_BASE_URL}/Sales`;

export const getVehicles = async(page = 0, size = 15, search = "", statusId = "", year = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, statusId, year });
        const request = await fetch(`${API_URL}/getVehicleSummary?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de vehiculos. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getVehicles:", error);
        throw new Error("Fallo al conectar con el servicio de vehiculos.", { cause: error });
    }
};

/*GET para optener el status*/
export const getStatus = async() => {
    try {
        const request = await fetch(`${API_URLS}/getStatus`, {
            credentials: 'include'
        });

        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de roles. Detalle: ${errorBody.substring(0, 100)}`);
        }

        return await request.json();

    } catch (error) {
        console.error("Error en getRoles:", error);
        throw new Error("Fallo al conectar con el servicio de roles.", { cause: error });
    }
};
