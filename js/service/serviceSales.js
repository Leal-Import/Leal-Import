const API_URL = "http://127.0.0.1:8080/api/SaleSummary";

export let getSales = async (search = "", page = 0, size = 15) => {
    try {
        const request = await fetch(`${API_URL}/getSaleSummary?search=${search}&page=${page}&size=${size}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de las ventas. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSales:", error);
        throw new Error("Fallo al conectar con el servicio de ventas.");
    }
};