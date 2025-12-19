const API_URL = "http://127.0.0.1:8080/api/auth"


export let login = async (credentials, password) => {
    try {
        const request = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({credentials, password}),
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al iniciar sesion. Código: ${request.status}.`;

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

export let getAuthMe = async () => {
    try {
        const request = await fetch(`${API_URL}/me`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener los datos personales. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getAuthMe:", error);
        throw new Error("Fallo al conectar con el servicio de Login.");
    }
};


export let sendPin = () => {
}

export let verifyPin = () => {
}

export let putPasswordLogin = () => {
}