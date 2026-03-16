import { API_BASE_URL } from "../utils/api.utils.js";

const API_URL = `${API_BASE_URL}/employees`;
const API_URLR = `${API_BASE_URL}/roles`;
const API_URLUS = `${API_BASE_URL}/users`;

export const getActiveEmployees = async (page = 0, size = 15, search = "", idRole = "", status = "") => {

    try {
        const params = new URLSearchParams({ page, size, search, idRole, status })
        const request = await fetch(`${API_URL}/getEmployees?${params.toString()}`, {
            credentials: 'include'
        });
        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de empleados. Detalle: ${errorBody.substring(0, 100)}`);
        }
        return await request.json();

    } catch (error) {
        console.error("Error en getActiveEmployees:", error.message);
        throw new Error("Fallo al conectar con el servicio de empleados." + error.message);
    }
};

export const postEmployee = async (employeeData) => {
    try {
        const request = await fetch(`${API_URL}/postEmployee`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData),
        });

        if (!request.ok) {
            let errorMessage = `Error al crear empleado. Código: ${request.status}.`;

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

export const patchEmployee = async (username, value) => {
    try {
        const response = await fetch(
            `${API_URLUS}/${username}/status?value=${value}`,
            {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            let errorMessage = `Error al actualizar el estado del usuario. Código: ${response.status}.`;

            try {
                const errorData = await response.json();
                if (errorData.errors) {
                    errorMessage = Object.values(errorData.errors).join('\n');
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
                const text = await response.text();
                if (text) errorMessage += ` Detalle: ${text.substring(0, 100)}`;
            }

            throw new Error(errorMessage);
        }

        return await response.json();

    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error("Fallo de conexión: El servicio de la API no está disponible.");
        }
        throw error;
    }
};


export const putEmployee = async (employeeData, id) => {
    try {
        const request = await fetch(`${API_URL}/putEmployee/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData),
        });

        if (!request.ok) {
            let errorMessage = `Error al Actualizar empleado. Código: ${request.status}.`;

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

// GET para obtener los roles del empleado
export const getRoles = async () => {
    try {
        const request = await fetch(`${API_URLR}/getRoles`, {
            credentials: 'include'
        });

        if (!request.ok) {
            const errorBody = await request.text();
            throw new Error(`Error ${request.status}: No se pudo obtener la lista de roles. Detalle: ${errorBody.substring(0, 100)}`);
        }

        return await request.json();

    } catch (error) {
        console.error("Error en getRoles:", error);
        throw new Error("Fallo al conectar con el servicio de roles.");
    }
};