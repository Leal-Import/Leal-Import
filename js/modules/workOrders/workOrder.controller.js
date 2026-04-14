// modules/workOrders/workOrders.controller.js

import { DOMRefs, insertWorkOrders, renderStats, resetWorkOrdersFilters } from "./workOrder.dom.js";
import { resetWorkOrdersListState, workOrdersListState } from "./workOrders.state.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { getVehiclesWOrders, getWOStatus, getOrderStats } from "./workOrders.service.js";

import { fillSelect, hideElement, showElement, createModuleInitializer } from "../../utils/dom.js";
import { initWorkOrdersEvents } from "./workOrder.event.js";
import { handleApiError } from "../../utils/api.utils.js";

/* ===============================
   CARGA DE ÓRDENES DE TRABAJO
================================ */

const pagination = createPagination({
    initialSize: workOrdersListState.pagination.size,
    onChange: ({ page, size }) => {
        workOrdersListState.pagination.page = page;
        workOrdersListState.pagination.size = size;
        loadWorkOrders();
    }
});

const loadStateWorkOrders = async () => {
    try {
        const states = await getWOStatus();
        workOrdersListState.stateList = states;
        fillSelect('cmbSearchByStatus', workOrdersListState.stateList, 'idWorkOrdersStatus', 'statusName', null, "Todas");
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los estados de las órdenes de trabajo. Por favor, inténtalo de nuevo.');
    }
};

const loadOrderStats = async () => {
    try {
        const stats = await getOrderStats();
        workOrdersListState.stats = stats;
        renderStats(workOrdersListState.stats, DOMRefs.refs);
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar las estadísticas de las órdenes de trabajo. Por favor, inténtalo de nuevo.');
    }
};

const loadWorkOrders = async () => {
    try {
        showElement(DOMRefs.refs.loaderWorkOrders);
        const { page, size } = workOrdersListState.pagination;
        const { search, idStatus } = workOrdersListState.filters;

        const data = await getVehiclesWOrders(page - 1, size, search || '', idStatus || '');

        workOrdersListState.list = data.content;
        workOrdersListState.pagination.total = data.page.totalElements;
        workOrdersListState.pagination.totalPages = data.page.totalPages;

        insertWorkOrders(DOMRefs.refs.cardContainer, workOrdersListState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar las órdenes de trabajo. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderWorkOrders);
    }
};

/* ===============================
   FILTROS
================================ */

const onSearchWorkOrder = (filters) => {
    workOrdersListState.filters = {
        ...workOrdersListState.filters,
        ...filters
    };

    workOrdersListState.pagination.page = 1;
    loadWorkOrders();
};

const initializeUI = (Refs) => {
    resetWorkOrdersFilters(Refs);
    initWorkOrdersEvents({ Refs, onSearchWorkOrder });
};

const loadDataFlow = async () => {
    await Promise.all([loadWorkOrders(), loadStateWorkOrders(), loadOrderStats()]);
};

const init = createModuleInitializer({
    resetState: resetWorkOrdersListState,
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
