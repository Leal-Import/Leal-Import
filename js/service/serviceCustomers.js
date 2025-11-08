const API_URL = "http://127.0.0.1:8080/api/customer";

export let getCustomers = async (page = 0, size = 15, search = "") => {
    try {
        const params = new URLSearchParams({ page, size, search });
        const request = await fetch(`${API_URL}/getCustomers?${params.toString()}`, {
            credentials: 'include'
        }); 
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de clientes. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();
    } catch (error) {
        console.error("Error en getCustomers:", error);
        throw new Error("Fallo al conectar con el servicio de clientes.");
    }
};

export let postCustomer = async (customerData) => {
    try {
        const request = await fetch(`${API_URL}/postCustomer`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData),
        });
        if (!request.ok) {
            let errorMessage = `Error al crear cliente. Código: ${request.status}.`;
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

export let putCustomer = async (customerData, customerId) => {
    try {
        const request = await fetch(`${API_URL}/putCustomer/${customerId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData),
        }); 
        if (!request.ok) {
            let errorMessage = `Error al actualizar cliente. Código: ${request.status}.`;
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