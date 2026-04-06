import config from "../../../config.js";
import { apiRequest } from "../../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/Vehicle`;

export const getVehicles = async(id) => {
    return await apiRequest(
        `${API_URL}/getVehicleById/${id}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener vehículo'
    );
};

export const postVehicle = async(vehicleData) => {
    return await apiRequest(
        `${API_URL}/postVehicle`,
        {
            method: 'POST',
            body: vehicleData,
            credentials: 'include'
        },
        'Error al crear vehículo'
    );
};

export const putVehicle = async(vehicleData, id) => {
    return await apiRequest(
        `${API_URL}/putVehicle/${id}`,
        {
            method: 'PUT',
            body: vehicleData,
            credentials: 'include'
        },
        'Error al actualizar vehículo'
    );
};
