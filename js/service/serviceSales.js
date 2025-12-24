const API_URL = "http://127.0.0.1:8080/api/SaleSummary";
const API_URLS = "http://127.0.0.1:8080/api/StateSale"

export let getSales = async (page = 0, size = 15, search = "", idState = "", productType = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, idState, productType })
        const request = await fetch(`${API_URL}/getSaleSummary?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();

            if (request.status === 401) {
                throw new Error(`Error ${request.status}: No autorizado. Detalle: ${JSON.parse(errorBody).message}`);
            }

            throw new Error(`Error ${request.status}: No se pudo obtener la lista de las ventas. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getSales:", error);
        throw error;
    }
};


export let getStateSales = async () => {
    try {
        const request = await fetch(`${API_URLS}/getStateSale`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();

            if (request.status === 401) {
                throw new Error(`Error ${request.status}: No autorizado. Detalle: ${JSON.parse(errorBody).message}`);
            }

            throw new Error(`Error ${request.status}: No se pudo obtener la lista de estados de la venta. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getStateSales:", error);
        throw error;
    }
};