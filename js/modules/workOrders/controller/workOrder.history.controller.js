// modules/workOrderHistory/workOrderHistory.controller.js

import { DOMRefs, insertWorkOrderHistory, loadStats, loadVehicleInfo } from "../../../core/dom/workOrder.history.dom.js";
import { resetWorkOrderHistoryState, workOrderHistoryState } from "../../../core/state/workOrder.history.state.js";
import { createPagination } from "../../../pagination/pagination.controller.js";
import { getDetailsOrders, getDashboardWorkorder } from "../../../service/workOrder.history.service.js";
import { getWOStatus } from "../../../service/workOrders.service.js";
import { initSession } from "../../../utils/api.utils.js";

import { asUUID, fillSelect, hideElement, showElement, showFloatingMenu, showMessage } from "../../../utils/dom.js";
import { initWorkOrderHistoryEvents } from "../event/workOrder.history.event.js";

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

const loadWorkOrderHistoryStatus = async() => {
    try {
        const states = await getWOStatus();
        workOrderHistoryState.stateList = states;
        fillSelect('cmbSearchByStatus', workOrderHistoryState.stateList, 'idOrdersStatus', 'ordersStatus', null, "Todas");
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los estados del historial', 'error');
        console.error(error);
    }
};

const loadDashboard = async() => {
    try {
        const data = await getDashboardWorkorder(workOrderHistoryState.context.idVehicle);
        loadStats(data, DOMRefs.refs);
        loadVehicleInfo(data, DOMRefs.refs);
    } catch (error) {
        showMessage("Error", "No se pudieron cargar las estadisticas de ordenes del vehiculo.", "error");
        console.error(error);
    }
};

const loadWorkOrderHistory = async() => {
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
        showMessage('Error', 'No se pudo cargar el historial de órdenes', 'error');
        console.error(error);
    } finally {
        hideElement(DOMRefs.refs.loaderWorkOrders);
    }
};

const handleOrdersActions = (e, order) => {
    e.stopPropagation();

    const woId = order.idWorkOrder ?? crypto.randomUUID();

    showFloatingMenu(e, [
        {
            label: "Ver orden",
            id: `btnViewWO-${woId}`,
            onClick: () => viewWorkOrder(order.idWorkOrder, order.idVehicle)
        },
        {
            label: "Editar orden",
            id: `btnEditWO-${woId}`,
            onClick: () => editWorkOrder(order.idWorkOrder, order.idVehicle)
        }
    ]);
};

const viewWorkOrder = (idWorkOrder, idVehicle) => {
    window.location.href = `addWorkOrder.html?idWorkOrder=${idWorkOrder}&idVehicle=${idVehicle}&isView=true`;
};

const editWorkOrder = (idWorkOrder, idVehicle) => {
    window.location.href = `addWorkOrder.html?idWorkOrder=${idWorkOrder}&idVehicle=${idVehicle}`;
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

const hydrateContextFromURL = async() => {
    const params = new URLSearchParams(window.location.search);
    const idVehicle = asUUID(params.get('idVehicle'));

    if (!idVehicle) {
        await showMessage('Error', 'Vehículo no especificado', 'error');
        window.location.href = 'workOrders.html';
        return false;
    }

    workOrderHistoryState.context.idVehicle = idVehicle;
    workOrderHistoryState.context.idCustomer = asUUID(params.get('idCustomer'));
    return true;
};

const loadBtnAdd = () => {
    DOMRefs.refs.btnAddOrder.href = `addWorkOrder.html?idVehicle=${workOrderHistoryState.context.idVehicle}&idCustomer=${workOrderHistoryState.context.idCustomer}`;
};

const setupApplication = async() => {
    resetWorkOrderHistoryState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    const isContextValid = await hydrateContextFromURL();
    if (!isContextValid) return false;

    return true;
};

const initializeUI = (Refs) => {
    loadBtnAdd();
    initWorkOrderHistoryEvents({ Refs, onSearchWorkOrderHistory });
};

const loadDataFlow = async() => {
    await Promise.all([loadWorkOrderHistory(), loadWorkOrderHistoryStatus(), loadDashboard()]);
};

document.addEventListener('DOMContentLoaded', async() => {
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
