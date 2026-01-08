import { sparePartsState } from '../../../core/state/spareParts.state.js';
import { createPagination } from '../../../pagination/pagination.controller.js';
import { showMessage, qs, fillSelect } from '../../../utils/dom.js';
import { initSparePartsEvents } from '../event/spareParts.events.js';
import { getSpareParts, getStatus } from '../../../service/spareParts.service.js';
import { insertSpareParts} from '../../../core/dom/spareParts.dom.js'

const tableBody = qs('.cardContainer');

const pagination = createPagination({
    initialSize: sparePartsState.pagination.size,
    onChange: ({ page, size }) => {
        sparePartsState.pagination.page = page;
        sparePartsState.pagination.size = size;
        loadSpareParts();
    }
});

async function loadStatusSelect() {
    try {
        const status = await getStatus();
        sparePartsState.statusList = status;
        fillSelect("cmbSearchByStatus", status, 'idPartsState', 'state')
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los estados de los repuestos',
            'error'
        );
        console.error(error);
    }
}

export async function loadSpareParts() {
    try {
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

        insertSpareParts(tableBody, sparePartsState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', 'No se pudieron cargar los repuestos', 'error');
        console.error(error);
    }
}

export function onSearchSpareParts(filters) {
    sparePartsState.filters = {
        ...sparePartsState.filters,
        ...filters
    };
    sparePartsState.pagination.page = 1;
    loadSpareParts();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!tableBody) return;
    initSparePartsEvents({ onSearchSpareParts });
    await Promise.all([loadStatusSelect(), loadSpareParts()]);
});
