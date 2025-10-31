const API_URL = "https://api-generator.retool.com/lk8eTA/employee";

export let getActiveEmployees = async () => {

    try {
        // 1. Realiza la petición
        const request = await fetch(`${API_URL}`);

        // 2. Verifica si la respuesta es exitosa (código 200-299)
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de empleados. Detalle: ${errorBody.substring(0, 100)}`);
        }

        // 3. Convierte la respuesta a JSON y la retorna
        return await request.json();

    } catch (error) {
        // Captura errores de red (ej. servidor caído) o el error que lanzamos arriba
        console.error("Error en getActiveEmployees:", error);

        // Puedes lanzar un nuevo error más amigable o retornar un array vacío
        throw new Error("Fallo al conectar con el servicio de empleados.");
        // Alternativamente, si quieres fallar de forma silenciosa: return [];
    }
};

export let postEmployee = async (employeeData) => {
    try {
        const request = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        if (!request.ok) {
            let errorMessage = `Error al crear empleado. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
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