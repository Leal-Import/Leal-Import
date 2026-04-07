import { resetSparePartsListState, sparePartsListState } from './spareParts.state.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { fillSelect, showElement, hideElement, createModuleInitializer } from '../../utils/dom.js';
import { initSparePartsEvents } from './spareParts.events.js';
import { getSpareParts, getStatus } from './spareParts.service.js';
import { DOMRefs, insertSpareParts, resetSparePartsFilters } from './spareParts.dom.js';
import { handleApiError } from '../../utils/api.utils.js';

const pagination = createPagination({
    initialSize: sparePartsListState.pagination.size,
    onChange: ({ page, size }) => {
        sparePartsListState.pagination.page = page;
        sparePartsListState.pagination.size = size;
        loadSpareParts();
    }
});

const loadStatusSelect = async () => {
    try {
        const status = await getStatus();
        sparePartsListState.statusList = status;
        fillSelect("cmbSearchByStatus", status, 'idStatus', 'statusName', null, "Buscar por estado");
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los estados de los repuestos. Por favor, inténtalo de nuevo.');
    }
};

export const loadSpareParts = async () => {
    try {
        showElement(DOMRefs.refs.loaderSpareParts);
        const { page, size } = sparePartsListState.pagination;
        const { search, idState, startDate, endDate } = sparePartsListState.filters;

        const data = await getSpareParts(
            page - 1,
            size,
            search || '',
            idState || '',
            startDate || '',
            endDate || ''
        );

        sparePartsListState.list = data.content;
        sparePartsListState.pagination.total = data.page.totalElements;
        sparePartsListState.pagination.totalPages = data.page.totalPages;
        insertSpareParts(DOMRefs.refs.cardContainer, sparePartsListState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los repuestos. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderSpareParts);
    }
};

export const onSearchSpareParts = (filters) => {
    sparePartsListState.filters = {
        ...sparePartsListState.filters,
        ...filters
    };
    sparePartsListState.pagination.page = 1;
    loadSpareParts();
};

const initializeUI = (Refs) => {
    resetSparePartsFilters(Refs);
    initSparePartsEvents({ Refs, onSearchSpareParts });
};

const loadDataFlow = async () => {
    await Promise.all([loadStatusSelect(), loadSpareParts()]);
};

const init = createModuleInitializer({
    resetState: resetSparePartsListState,
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
