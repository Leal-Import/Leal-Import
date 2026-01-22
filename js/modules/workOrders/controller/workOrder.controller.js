// modules/workOrders/workOrders.controller.js


import { insertWorkOrders } from "../../../core/dom/workOrder.dom.js";
import { workOrdersState } from "../../../core/state/workOrders.state.js";
import { createPagination } from "../../../pagination/pagination.controller.js";
import { getVehiclesWOrders, getWOStatus } from "../../../service/workOrders.service.js";

import { fillSelect, qs, showMessage } from "../../../utils/dom.js";
import { initWorkOrdersEvents } from "../event/workOrder.event.js";

const containerData = qs('.cardContainer');

/* ===============================
   CARGA DE ÓRDENES DE TRABAJO
================================ */

const pagination = createPagination({
    initialSize: workOrdersState.pagination.size,
    onChange: ({ page, size }) => {
        workOrdersState.pagination.page = page;
        workOrdersState.pagination.size = size;
        loadWorkOrders();
    }
});

const loadStateWorkOrders = async () => {
    try {
        const states = await getWOStatus();
        workOrdersState.stateList = states;

        fillSelect('cmbSearchByStatus', workOrdersState.stateList, 'idOrdersStatus', 'ordersStatus');
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los estados de las órdenes', 'error');
        console.error(error);
    }
};

async function loadWorkOrders() {
    try {
        const { page, size } = workOrdersState.pagination;
        const { search, idStatus } = workOrdersState.filters;

        const data = await getVehiclesWOrders(page - 1, size, search || '', idStatus || '');

        workOrdersState.list = data.content;
        workOrdersState.pagination.total = data.page.totalElements;
        workOrdersState.pagination.totalPages = data.page.totalPages;

        insertWorkOrders(containerData, workOrdersState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar las órdenes de trabajo', 'error');
        console.error(error);
    }
}

/* ===============================
   FILTROS
================================ */

export function onSearchWorkOrder(filters) {
    workOrdersState.filters = {
        ...workOrdersState.filters,
        ...filters
    };

    workOrdersState.pagination.page = 1;
    loadWorkOrders();
}

/* ===============================
   INIT
================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initWorkOrdersEvents({
        onSearchWorkOrder,
    });

    await Promise.all([loadWorkOrders(), loadStateWorkOrders()]);
});
