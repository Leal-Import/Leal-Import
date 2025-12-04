const API_URL = "http://127.0.0.1:8080/api/WorkOrder";

export let getServices = async (search) => {
    try {
        const request = await fetch(`${API_URL}/getService?search=${search}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de los servicios. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getServices:", error);
        throw new Error("Fallo al conectar con el servicio de servicios.");
    }
};

export let postWorkOrder = async (workOrderData, vin, idSale) => {
    try {
        const request = await fetch(`${API_URL}/postWorkOrder/${vin}?idSale=${idSale}`, {
            method: 'POST',
            body: workOrderData,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al crear la orden. Código: ${request.status}.`;

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
