// modules/workOrderHistory/workOrderHistory.controller.js

import { insertWorkOrderHistory, loadStats, loadVehicleInfo } from "../../../core/dom/workOrder.history.dom.js";
import { workOrderHistoryState } from "../../../core/state/workOrder.history.state.js";
import { createPagination } from "../../../pagination/pagination.controller.js";
import { getDetailsOrders, getDashboardWorkorder } from "../../../service/workOrder.history.service.js";
import { getWOStatus } from "../../../service/workOrders.service.js";

import { $, asUUID, fillSelect, showFloatingMenu, showMessage } from "../../../utils/dom.js";
import { initWorkOrderHistoryEvents } from "../event/workOrder.history.event.js";

const containerData = $('woDetailsTBody');
const btnAddOrder = $('openModalCustomer');

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
        fillSelect('cmbSearchByStatus', workOrderHistoryState.stateList, 'idOrdersStatus', 'ordersStatus');
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los estados del historial', 'error');
        console.error(error);
    }
};

const loadDashboard = async () => {
    try {
        const data = await getDashboardWorkorder(workOrderHistoryState.context.idVehicle);
        loadStats(data);
        loadVehicleInfo(data);
    } catch (error) {
        showMessage("Error", "No se pudieron cargar las estadisticas de ordenes del vehiculo.", "error");
        console.error(error)
    }
}

async function loadWorkOrderHistory() {
    try {
        const { page, size } = workOrderHistoryState.pagination;
        const { search, idStatus } = workOrderHistoryState.filters;

        const data = await getDetailsOrders(workOrderHistoryState.context.idVehicle, page - 1, size, search || '', idStatus || '');

        workOrderHistoryState.list = data.content;
        workOrderHistoryState.pagination.total = data.page.totalElements;
        workOrderHistoryState.pagination.totalPages = data.page.totalPages;

        insertWorkOrderHistory(containerData, workOrderHistoryState.list, handleOrdersActions);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudo cargar el historial de órdenes', 'error');
        console.error(error);
    }
}

const handleOrdersActions = (e, order) => {
    e.stopPropagation();

    const woId = order.idWorkOrder ?? Math.random().toString(36).slice(2);

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
}

let viewWorkOrder = (idWorkOrder, idVehicle) => {
    window.location.href = `addWorkOrder.html?idWorkOrder=${idWorkOrder}&idVehicle=${idVehicle}&isView=true`;
}

let editWorkOrder = (idWorkOrder, idVehicle) => {
    window.location.href = `addWorkOrder.html?idWorkOrder=${idWorkOrder}&idVehicle=${idVehicle}`;
}

/* ===============================
   FILTROS
================================ */

function onSearchWorkOrderHistory(filters) {
    workOrderHistoryState.filters = {
        ...workOrderHistoryState.filters,
        ...filters
    };

    workOrderHistoryState.pagination.page = 1;
    loadWorkOrderHistory();
}

/* ===============================
   INIT
================================ */

const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    workOrderHistoryState.context.idVehicle = asUUID(params.get('idVehicle'));
};

const loadBtnAdd = () => {
    btnAddOrder.href = `addWorkOrder.html?idVehicle=${workOrderHistoryState.context.idVehicle}`;
};

document.addEventListener('DOMContentLoaded', async () => {
    hydrateContextFromURL();
    loadBtnAdd();
    initWorkOrderHistoryEvents({
        onSearchWorkOrderHistory
    });

    await Promise.all([
        loadWorkOrderHistory(),
        loadWorkOrderHistoryStatus(),
        loadDashboard()
    ]);
});
