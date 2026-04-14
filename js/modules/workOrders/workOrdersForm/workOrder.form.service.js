import config from "../../../config.js";
import { buildParams } from "../../../utils/dom.js";
import { apiRequest } from "../../../utils/api.utils.js";

const API_URL = `${config.API_BASE_URL}/WorkOrders`;
const API_URLVE = `${config.API_BASE_URL}/Vehicle`;
const API_URLSPA = `${config.API_BASE_URL}/SpareParts`;

export const getServices = async (search) => {
    return await apiRequest(
        `${API_URL}/getServicesCatalog?search=${encodeURIComponent(search)}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener la lista de servicios'
    );
};

export const completeWorkOrder = async (idWorkOrder) => {
    return await apiRequest(
        `${API_URL}/finishOrder/${idWorkOrder}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        },
        'Error al completar la orden'
    );
};

export const cancelWorkOrder = async (idWorkOrder, reason) => {
    return await apiRequest(
        `${API_URL}/cancelOrder/${idWorkOrder}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        },
        'Error al cancelar la orden'
    );
};

export const approveOrder = async (idWorkOrder) => {
    return await apiRequest(
        `${API_URL}/approveOrder/${idWorkOrder}`,
        {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        },
        'Error al completar la orden'
    );
};

export const getDataVehicleById = async (id) => {
    return await apiRequest(
        `${API_URLVE}/getWorkOrderVehicle/${id}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener datos del vehículo'
    );
};

export const getWorkOrderById = async (id) => {
    return await apiRequest(
        `${API_URL}/getById/${id}`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener los datos de la orden'
    );
};

export const getSpareParts = async () => {
    return await apiRequest(
        `${API_URLSPA}/getWorkOrderSpareParts`,
        { method: 'GET', credentials: 'include' },
        'Error al obtener los repuestos'
    );
};

export const postWorkOrder = async (workOrderData, idVehicle, idSale) => {
    const params = buildParams({ idSale });
    return await apiRequest(
        `${API_URL}/postWorkOrder/${idVehicle}?${params.toString()}`,
        {
            method: 'POST',
            body: workOrderData,
            credentials: 'include'
        },
        'Error al crear la orden'
    );
};

export const putWorkOrder = async (workOrderData, idWorkOrder) => {
    return await apiRequest(
        `${API_URL}/putWorkOrder/${idWorkOrder}`,
        {
            method: 'PUT',
            body: workOrderData,
            credentials: 'include'
        },
        'Error al actualizar la orden'
    );
};
