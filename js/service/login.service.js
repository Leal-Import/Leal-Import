const API_URL = `https://leal-import-api-jsol.onrender.com/api/auth`;
const API_URLS = `https://leal-import-api-jsol.onrender.com/api/passwordReset`;

export const login = async(credentials, password) => {
    try {
        const request = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credentials, password }),
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al iniciar sesion. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (error) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
                throw new Error(errorMessage, { cause: error });
            }

            // Lanza el error capturable por el controlador
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }

        throw error;
    }
};

export const getAuthMe = async() => {
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
        throw new Error("Fallo al conectar con el servicio de Login.", { cause: error });
    }
};

export const verifyEmail = async(email) => {
    try {
        const request = await fetch(`${API_URLS}/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al verificar correo. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (error) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
                throw new Error(errorMessage, { cause: error });
            }
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }
        throw error;
    }
};

export const verifyPIN = async(resetId, email, code) => {
    try {
        const request = await fetch(`${API_URLS}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resetId, email, code }),
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al verificar PIN. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (error) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
                throw new Error(errorMessage, { cause: error });
            }
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }
        throw error;
    }
};

export const resetPassword = async(ticket, newPassword) => {
    try {
        const request = await fetch(`${API_URLS}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket, newPassword }),
            credentials: 'include'
        });
        if (!request.ok) {
            let errorMessage = `Error al restablecer contraseña. Código: ${request.status}.`;

            try {
                const errorData = await request.json();
                if (errorData.errors) {
                    const errores = Object.entries(errorData.errors)
                        .map(([message]) => `${message}`)
                        .join("\n");
                    errorMessage = `Errores de validación:\n${errores}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (error) {
                const errorText = await request.text();
                if (errorText.length > 0) {
                    errorMessage += ` Detalle: ${errorText.substring(0, 100)}`;
                }
                throw new Error(errorMessage, { cause: error });
            }
            throw new Error(errorMessage);
        }
        return await request.json();

    } catch (error) {
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.", { cause: error });
        }
        throw error;
    }
};
