import { resetSparePartsState, sparePartsState } from '../../../core/state/spareParts.state.js';
import { createPagination } from '../../../pagination/pagination.controller.js';
import { showMessage, fillSelect, showElement, hideElement } from '../../../utils/dom.js';
import { initSparePartsEvents } from '../event/spareParts.events.js';
import { getSpareParts, getStatus } from '../../../service/spareParts.service.js';
import { DOMRefs, insertSpareParts } from '../../../core/dom/spareParts.dom.js';
import { initSession } from '../../../utils/api.utils.js';

const pagination = createPagination({
    initialSize: sparePartsState.pagination.size,
    onChange: ({ page, size }) => {
        sparePartsState.pagination.page = page;
        sparePartsState.pagination.size = size;
        loadSpareParts();
    }
});

const loadStatusSelect = async() => {
    try {
        const status = await getStatus();
        sparePartsState.statusList = status;
        fillSelect("cmbSearchByStatus", status, 'idPartsState', 'state', null, "Todos");
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los estados de los repuestos',
            'error'
        );
        console.error(error);
    }
};

export const loadSpareParts = async() => {
    try {
        showElement(DOMRefs.refs.loaderSpareParts);
        const { page, size } = sparePartsState.pagination;
        const { search, idState } = sparePartsState.filters;

        const data = await getSpareParts(
            page - 1,
            size,
            search || '',
            idState || ''
        );

        sparePartsState.list = data.content;
        sparePartsState.pagination.total = data.page.totalElements;
        sparePartsState.pagination.totalPages = data.page.totalPages;

        insertSpareParts(DOMRefs.refs.cardContainer, sparePartsState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los repuestos', 'error');
        console.error(error);
    } finally {
        hideElement(DOMRefs.refs.loaderSpareParts);
    }
};

export const onSearchSpareParts = (filters) => {
    sparePartsState.filters = {
        ...sparePartsState.filters,
        ...filters
    };
    sparePartsState.pagination.page = 1;
    loadSpareParts();
};

const setupApplication = async() => {
    resetSparePartsState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = (Refs) => {
    initSparePartsEvents({ Refs, onSearchSpareParts });
};

const loadDataFlow = async() => {
    await Promise.all([loadStatusSelect(), loadSpareParts()]);

};

document.addEventListener('DOMContentLoaded', async() => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        initializeUI(refs);

        await loadDataFlow();
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
