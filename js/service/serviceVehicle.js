const API_URL = "http://127.0.0.1:8080/api/Vehicle";
const API_URLS = "http://127.0.0.1:8080/api/Status";

export let getVehicles = async (page = 0, size = 15, search = "", stateId = "", year = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, stateId, year });
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
        throw new Error("Fallo al conectar con el servicio de vehiculos.");
    }
};


/*GET para optener el status*/ 
export let getStatus = async () => {
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
        throw new Error("Fallo al conectar con el servicio de roles.");
    }
};