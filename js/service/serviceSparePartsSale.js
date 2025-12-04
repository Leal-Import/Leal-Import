const API_URL = "http://127.0.0.1:8080/api/spareParts";
const API_URLSALE = "http://127.0.0.1:8080/api/sparePartsSale";

export let getSpareParts = async (search = "") => {
    try {
        const request = await fetch(`${API_URL}/getSaleSummary?search=${search}`, {
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

export let postSparePart = async (sale) => {
    try {
        const request = await fetch(`${API_URLSALE}/postSparePartsSale`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sale)
        });
        if (!request.ok) {
            let errorMessage = `Error al ingresar la venta. Código: ${request.status}.`;

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