const API_URL = "https://leal-import-api.onrender.com/api/ViewWorkOrder";
const API_URLSTAT = "https://leal-import-api.onrender.com/api/OrdersStatus";

export let getVehiclesWOrders = async (page = 0, size = 15, search = "", idStatus = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, idStatus})
        const request = await fetch(`${API_URL}/getVehiclesWithOrders?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de las ordenes. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getVehiclesWOrders:", error);
        throw new Error("Fallo al conectar con el servicio de ordenes.");
    }
};

export let getWOStatus = async () => {
    try {
        const request = await fetch(`${API_URLSTAT}/getOrdersStatus`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de los estados. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getVehiclesWOrders:", error);
        throw new Error("Fallo al conectar con el servicio de los estados.");
    }
};