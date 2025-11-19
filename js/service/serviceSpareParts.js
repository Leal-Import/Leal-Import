const API_URL = "http://127.0.0.1:8080/api/spareParts";

export let getSpareParts = async () => {
    try {
        const request = await fetch(`${API_URL}/getSparePartSummary`, {
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