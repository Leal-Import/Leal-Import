import config from "../../../config.js";
import { buildParams } from "../../../utils/dom.js";
import { apiRequest } from "../../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/VehicleSales`;
const API_URLVeh = `${config.API_BASE_URL}/Vehicle`;

export const postVehicle = async(sale, id) => {
    return await apiRequest(
        `${API_URL}/postSale/${id}`,
        {
            method: 'POST',
            body: sale,
            credentials: 'include'
        },
        'Error al ingresar la venta'
    );
};

export const putVehicle = async(vehicleData, id) => {
    return await apiRequest(
        `${API_URL}/putSale/${id}`,
        {
            method: 'PUT',
            body: vehicleData,
            credentials: 'include'
        },
        'Error al actualizar la venta del vehículo'
    );
};

export const patchVehicleSale = async(id, reason) => {
    return await apiRequest(
        `${API_URL}/cancelSale/${id}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        },
        'Error al cancelar la venta del vehículo'
    );
};

export const getSaleById = async(id) => {
    return await apiRequest(
        `${API_URL}/getVehicleSaleById/${id}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la venta'
    );
};

export const getVehiclesAviable = async(page = 0, size = 15, search = '') => {
    const params = buildParams({ page, size, search });
    return await apiRequest(
        `${API_URLVeh}/getSaleSummary?${params.toString()}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de vehículos disponibles'
    );
};
