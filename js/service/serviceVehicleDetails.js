const API_URL = "http://127.0.0.1:8080/api/Vehicle";

export let getVehicles = async (page = 0, size = 15, search = "", stateId = "", year = "") => {
    try {
        const params = new URLSearchParams({ page, size, search, stateId, year });
        const request = await fetch(`${API_URL}/getVehicle?${params.toString()}`, {
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

export let postVehicle = async (vehicleData) => {
    try {
        const request = await fetch(`${API_URL}/postVehicle`, {
            method: 'POST',
            body: vehicleData,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al crear vehiculo. Código: ${request.status}.`;

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

export let putVehicle = async (vehicleData, id) => {
    try {
        const request = await fetch(`${API_URL}/putVehicle/${id}`, {
            method: 'PUT',
            body: vehicleData,
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al actualizar vehiculo. Código: ${request.status}.`;

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