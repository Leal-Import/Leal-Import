import { resetVehiclesListState, vehiclesListState } from './vehicles.state.js';
import { DOMRefs, insertVehicles, resetVehiclesFilters } from './vehicles.dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { getVehicles, getStatus } from './vehicles.service.js';
import { fillSelect, showElement, hideElement, createModuleInitializer } from '../../utils/dom.js';
import { initVehicleEvents } from './vehicles.events.js';
import { handleApiError } from '../../utils/api.utils.js';
import { ROUTES } from '../../utils/router.js';

const pagination = createPagination({
    initialSize: vehiclesListState.pagination.size,
    onChange: ({ page, size }) => {
        vehiclesListState.pagination.page = page;
        vehiclesListState.pagination.size = size;
        loadVehicles();
    }
});

const loadStatusSelect = async () => {
    try {
        const status = await getStatus();
        vehiclesListState.statusList = status;
        fillSelect('cmbSearchByStatus', vehiclesListState.statusList, 'idStatus', 'statusName', null, 'Buscar por estado');
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los estados de los vehículos. Por favor, inténtalo de nuevo.');
    }
};

const loadVehicles = async () => {
    try {
        showElement(DOMRefs.refs.loaderVehicles);
        const { page, size } = vehiclesListState.pagination;
        const { search, year, statusId, source, startDate, endDate } = vehiclesListState.filters;
        const data = await getVehicles(
            page - 1,
            size,
            search || '',
            statusId || '',
            year || '',
            source || '',
            startDate,
            endDate
        );

        vehiclesListState.list = data.content;
        vehiclesListState.pagination.total = data.page.totalElements;
        vehiclesListState.pagination.totalPages = data.page.totalPages;

        insertVehicles(DOMRefs.refs.cardContainer, vehiclesListState.list, vehiclesListState.context.hasWorkOrder);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los vehículos. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderVehicles);
    }
};

const onSearchVehicles = (filters) => {
    vehiclesListState.filters = {
        ...vehiclesListState.filters,
        ...filters
    };
    vehiclesListState.pagination.page = 1;
    loadVehicles();
};

const workOrderBtn = () => {
    if (!DOMRefs.refs.btnAddVehicle) return;
    DOMRefs.refs.btnAddVehicle.href = `${ROUTES.VEHICLE_DETAILS}?workOrder=${vehiclesListState.context.hasWorkOrder}`;
};
const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    vehiclesListState.context.hasWorkOrder = !!params.get("workOrder");
};

const initializeUI = (Refs) => {
    resetVehiclesFilters(Refs);
    initVehicleEvents({ Refs, onSearchVehicles });
    if (vehiclesListState.context.hasWorkOrder) {
        workOrderBtn();
    }
};

const loadDataFlow = async () => {
    await Promise.all([loadStatusSelect(), loadVehicles()]);
};

const init = createModuleInitializer({
    resetState: () => {
        resetVehiclesListState();
        hydrateContextFromURL();
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
