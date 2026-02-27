const API_URL = "https://leal-import-api.onrender.com/api/spareParts";
const API_URLSTAT = "https://leal-import-api.onrender.com/api/PartsState";

export let getSpareParts = async (page = 0, size = 15, search = "", idState = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, idState })
        const request = await fetch(`${API_URL}/getSparePartSummary?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de repuestos. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSpareParts:", error);
        throw new Error("Fallo al conectar con el servicio de repuestos.");
    }
};

export let getStatus = async () => {
    try {
        const request = await fetch(`${API_URLSTAT}/getState`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de los estados del repuesto. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.");
        }

        throw error;
    }
};