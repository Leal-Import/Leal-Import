// modules/workOrders/workOrders.controller.js


import { DOMRefs, insertWorkOrders } from "../../../core/dom/workOrder.dom.js";
import { workOrdersState } from "../../../core/state/workOrders.state.js";
import { createPagination } from "../../../pagination/pagination.controller.js";
import { getVehiclesWOrders, getWOStatus } from "../../../service/workOrders.service.js";
import { initSession } from "../../../utils/api.utils.js";

import { fillSelect, hideElement, showElement, showMessage } from "../../../utils/dom.js";
import { initWorkOrdersEvents } from "../event/workOrder.event.js";

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
        showElement(DOMRefs.refs.loaderWorkOrders);
        const { page, size } = workOrdersState.pagination;
        const { search, idStatus } = workOrdersState.filters;

        const data = await getVehiclesWOrders(page - 1, size, search || '', idStatus || '');

        workOrdersState.list = data.content;
        workOrdersState.pagination.total = data.page.totalElements;
        workOrdersState.pagination.totalPages = data.page.totalPages;

        insertWorkOrders(DOMRefs.refs.cardContainer, workOrdersState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar las órdenes de trabajo', 'error');
        console.error(error);
    } finally {
        hideElement(DOMRefs.refs.loaderWorkOrders);
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


const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = async (Refs) => {
    initWorkOrdersEvents({ Refs, onSearchWorkOrder });
};

const loadDataFlow = async () => {
    await Promise.all([loadWorkOrders(), loadStateWorkOrders()]);
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        initializeUI(refs);

        await loadDataFlow();
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
