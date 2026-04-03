import { resetVehiclesState, vehiclesState } from './vehicles.state.js';
import { DOMRefs, insertVehicles, resetVehiclesFilters } from './vehicles.dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { getVehicles, getStatus } from './vehicles.service.js';
import { showMessage, fillSelect, showElement, hideElement } from '../../utils/dom.js';
import { initVehicleEvents } from './vehicles.events.js';
import { initSession } from '../../utils/api.utils.js';

const pagination = createPagination({
    initialSize: vehiclesState.pagination.size,
    onChange: ({ page, size }) => {
        vehiclesState.pagination.page = page;
        vehiclesState.pagination.size = size;
        loadVehicles();
    }
});

const loadStatusSelect = async () => {
    try {
        const status = await getStatus();
        vehiclesState.statusList = status;
        fillSelect('cmbSearchByStatus', vehiclesState.statusList, 'idStatus', 'statusName', null, 'Buscar por estado');
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los estados del vehiculo',
            'error'
        );
        console.error(error);
    }
};

const loadVehicles = async () => {
    try {
        showElement(DOMRefs.refs.loaderVehicles);
        const { page, size } = vehiclesState.pagination;
        const { search, year, statusId, statusExist } = vehiclesState.filters;
        const data = await getVehicles(
            page - 1,
            size,
            search || '',
            statusId || '',
            year || '',
            statusExist || ''
        );

        vehiclesState.list = data.content;
        vehiclesState.pagination.total = data.page.totalElements;
        vehiclesState.pagination.totalPages = data.page.totalPages;

        insertVehicles(DOMRefs.refs.cardContainer, vehiclesState.list, vehiclesState.context.hasWorkOrder);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los vehículos', 'error');
        console.error(error);
    } finally {
        hideElement(DOMRefs.refs.loaderVehicles);
    }
};

const onSearchVehicles = (filters) => {
    vehiclesState.filters = {
        ...vehiclesState.filters,
        ...filters
    };
    vehiclesState.pagination.page = 1;
    loadVehicles();
};

const workOrderBtn = () => {
    if (!DOMRefs.refs.btnAddVehicle) return;
    DOMRefs.refs.btnAddVehicle.href = `vehicleDetails.html?workOrder=${vehiclesState.context.hasWorkOrder}`;
};
const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    vehiclesState.context.hasWorkOrder = !!params.get("workOrder");
};

const setupApplication = async () => {
    resetVehiclesState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    // 3. Hidratar contexto desde URL
    hydrateContextFromURL();

    return true;
};

const initializeUI = (Refs) => {
    resetVehiclesFilters(Refs);
    initVehicleEvents({ Refs, onSearchVehicles });
    if (vehiclesState.context.hasWorkOrder) {
        workOrderBtn();
    }
};

const loadDataFlow = async () => {
    await Promise.all([loadStatusSelect(), loadVehicles()]);
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Configurar aplicación
        const isReady = await setupApplication();
        if (!isReady) return;

        // 2. Inicializar referencias del DOMRefs
        const refs = DOMRefs.init();

        // 3. Inicializar componentes UI
        initializeUI(refs);

        // 4. Cargar datos según el flujo
        await loadDataFlow();
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
