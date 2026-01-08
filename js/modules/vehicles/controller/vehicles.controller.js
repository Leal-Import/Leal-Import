import { vehiclesState } from '../../../core/state/vehicles.state.js';
import { insertVehicles } from '../../../core/dom/vehicles.dom.js';
import { createPagination } from '../../../pagination/pagination.controller.js';
import { getVehicles, getStatus } from '../../../service/vehicles.service.js';
import { showMessage, qs, $, fillSelect } from '../../../utils/dom.js';
import { initVehicleEvents } from '../event/vehicles.events.js';

const tableBody = qs('.cardContainer');

const pagination = createPagination({
    initialSize: vehiclesState.pagination.size,
    onChange: ({ page, size }) => {
        vehiclesState.pagination.page = page;
        vehiclesState.pagination.size = size;
        loadVehicles();
    }
});

async function loadStatusSelect() {
    try {
        const status = await getStatus();
        vehiclesState.statusList = status;
        fillSelect('cmbSearchByStatus', vehiclesState.statusList, 'idStatus', 'statusName', 'Buscar por estado');
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los estados del vehiculo',
            'error'
        );
        console.error(error);
    }
}

export async function loadVehicles() {
    try {
        const { page, size } = vehiclesState.pagination;
        const { search, year, stateId } = vehiclesState.filters;
        const data = await getVehicles(
            page - 1,
            size,
            search || '',
            stateId || '',
            year || ''
        );

        vehiclesState.list = data.content;
        vehiclesState.pagination.total = data.page.totalElements;
        vehiclesState.pagination.totalPages = data.page.totalPages;

        insertVehicles(tableBody, vehiclesState.list, vehiclesState.context.hasWorkOrder);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los vehículos', 'error');
        console.error(error);
    }
}

export function onSearchVehicles(filters) {
    vehiclesState.filters = {
        ...vehiclesState.filters,
        ...filters
    };
    vehiclesState.pagination.page = 1;
    loadVehicles();
}

let workOrderBtn = () => {
    const btn = $("btnAddVehicle");
    if (!btn) return;
    btn.href = `vehicleDetails.html?workOrder=${vehiclesState.context.hasWorkOrder}`;
}
function hydrateContextFromURL() {
    const params = new URLSearchParams(window.location.search);
    vehiclesState.context.hasWorkOrder = !!params.get("workOrder");
}

document.addEventListener('DOMContentLoaded', async () => {
    hydrateContextFromURL();
    initVehicleEvents({ onSearchVehicles });
    await Promise.all([loadStatusSelect(), loadVehicles()]);
    if (vehiclesState.context.hasWorkOrder) {
        workOrderBtn();
    }
});