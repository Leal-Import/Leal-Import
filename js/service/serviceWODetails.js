const API_URL = "http://127.0.0.1:8080/api/ViewWorkOrderHistory";


export let getDetailsOrders = async (idVehicle, page = 0, size = 15, search = "", idStatus = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, idStatus});
        const request = await fetch(`${API_URL}/getHistoryOrder/${idVehicle}?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de ordenes. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getDetailsOrders:", error);
        throw new Error("Fallo al conectar con el servicio de ordenes.");
    }
};