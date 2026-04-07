// modules/workOrderHistory/workOrderHistory.controller.js

import { DOMRefs, insertWorkOrderHistory, loadStats, loadVehicleInfo, resetWorkOrderHistoryFilters } from "./workOrder.history.dom.js";
import { resetWorkOrderHistoryState, workOrderHistoryState } from "./workOrder.history.state.js";
import { createPagination } from "../../../pagination/pagination.controller.js";
import { getDetailsOrders, getDashboardWorkorder } from "./workOrder.history.service.js";
import { getWOStatus } from "../workOrders.service.js";

import { asUUID, buildParams, fillSelect, hideElement, showElement, showMessage, createModuleInitializer } from "../../../utils/dom.js";
import { navigateTo, ROUTES } from "../../../utils/router.js";
import { initWorkOrderHistoryEvents } from "./workOrder.history.event.js";
import { showFloatingMenu } from "../../../utils/floatingMenu.js";
import { handleApiError } from "../../../utils/api.utils.js";

/* ===============================
   CARGA DE HISTORIAL DE ÓRDENES
================================ */

const pagination = createPagination({
    initialSize: workOrderHistoryState.pagination.size,
    onChange: ({ page, size }) => {
        workOrderHistoryState.pagination.page = page;
        workOrderHistoryState.pagination.size = size;
        loadWorkOrderHistory();
    }
});

const loadWorkOrderHistoryStatus = async () => {
    try {
        const states = await getWOStatus();
        workOrderHistoryState.stateList = states;
        fillSelect('cmbSearchByStatus', workOrderHistoryState.stateList, 'idWorkOrdersStatus', 'statusName', null, "Buscar por estado");
    } catch (error) {
        await handleApiError(error);
    }
};

const loadDashboard = async () => {
    try {
        const data = await getDashboardWorkorder(workOrderHistoryState.context.idVehicle);
        loadStats(data, DOMRefs.refs);
        loadVehicleInfo(data, DOMRefs.refs);
    } catch (error) {
        await handleApiError(error);
    }
};

const loadWorkOrderHistory = async () => {
    try {
        showElement(DOMRefs.refs.loaderWorkOrders);
        const { page, size } = workOrderHistoryState.pagination;
        const { search, idStatus } = workOrderHistoryState.filters;

        const data = await getDetailsOrders(workOrderHistoryState.context.idVehicle, page - 1, size, search || '', idStatus || '');

        workOrderHistoryState.list = data.content;
        workOrderHistoryState.pagination.total = data.page.totalElements;
        workOrderHistoryState.pagination.totalPages = data.page.totalPages;

        insertWorkOrderHistory(DOMRefs.refs.woDetailsTBody, workOrderHistoryState.list, handleOrdersActions, DOMRefs.refs.tableHistory);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error);
    } finally {
        hideElement(DOMRefs.refs.loaderWorkOrders);
    }
};

const handleOrdersActions = (e, order) => {
    e.stopPropagation();

    const woId = order.idWorkOrder ?? crypto.randomUUID();
    const options = [
        {
            label: "Ver orden",
            id: `btnViewWO-${woId}`,
            onClick: () => viewWorkOrder(order.idWorkOrder, order.idVehicle)
        }
    ];
    if (order.statusName !== "Cancelada") {
        options.push({
            label: "Editar orden",
            id: `btnEditWO-${woId}`,
            privilege: "WRITE_WORK_ORDERS",
            onClick: () => editWorkOrder(order.idWorkOrder, order.idVehicle)
        });
    }

    showFloatingMenu(e, options);
};

const viewWorkOrder = (idWorkOrder, idVehicle) => {
    const params = buildParams({
        idWorkOrder,
        idVehicle,
        idCustomer: workOrderHistoryState.context.idCustomer,
        isView: true
    });
    navigateTo(ROUTES.WORK_ORDER_FORM, Object.fromEntries(params.entries()));
};

const editWorkOrder = (idWorkOrder, idVehicle) => {
    const params = buildParams({
        idWorkOrder,
        idVehicle,
        idCustomer: workOrderHistoryState.context.idCustomer
    });
    navigateTo(ROUTES.WORK_ORDER_FORM, Object.fromEntries(params.entries()));
};

/* ===============================
   FILTROS
================================ */

const onSearchWorkOrderHistory = (filters) => {
    workOrderHistoryState.filters = {
        ...workOrderHistoryState.filters,
        ...filters
    };

    workOrderHistoryState.pagination.page = 1;
    loadWorkOrderHistory();
};

/* ===============================
   INIT
================================ */

const hydrateContextFromURL = async () => {
    const params = new URLSearchParams(window.location.search);
    const idVehicle = asUUID(params.get('idVehicle'));

    if (!idVehicle) {
        await showMessage('Error', 'Vehículo no especificado', 'error');
        navigateTo(ROUTES.WORK_ORDERS);
        return false;
    }

    workOrderHistoryState.context.idVehicle = idVehicle;
    workOrderHistoryState.context.idCustomer = asUUID(params.get('idCustomer'));
    return true;
};

const loadBtnAdd = () => {
    const params = buildParams({
        idVehicle: workOrderHistoryState.context.idVehicle,
        idCustomer: workOrderHistoryState.context.idCustomer
    });
    DOMRefs.refs.btnAddOrder.href = `${new URL(ROUTES.WORK_ORDER_FORM, window.location.origin).toString()}?${params.toString()}`;
};

const initializeUI = (Refs) => {
    resetWorkOrderHistoryFilters(Refs);
    loadBtnAdd();
    initWorkOrderHistoryEvents({ Refs, onSearchWorkOrderHistory });
};

const loadDataFlow = async () => {
    await Promise.all([loadWorkOrderHistory(), loadWorkOrderHistoryStatus(), loadDashboard()]);
};

const init = createModuleInitializer({
    resetState: async () => {
        resetWorkOrderHistoryState();
        const isContextValid = await hydrateContextFromURL();
        if (!isContextValid) throw new Error('Failed to hydrate context');
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
