// modules/sales/sales.controller.js

import { salesState } from "../../core/state/sales.state.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { getSales, getStateSales } from "../../service/sales.service.js";
import { showMessage } from "../../utils.js";

const tableBody = $('salesTableBody');
const modalSales = $('modalSales');

/* ===============================
   CARGA DE VENTAS
================================ */

const pagination = createPagination({
    initialSize: salesState.pagination.size,
    onChange: ({ page, size }) => {
        salesState.pagination.page = page;
        salesState.pagination.size = size;
        loadSales();
    }
});

let loadStateSales = async () => {
    try {
        const status = await getStateSales();
        salesState.stateList = status;
        fillSelect('cmbSearchByStatus', salesState.stateList, 'idStateSale', 'stateName');
    } catch (error) {
        showMessage('Error al cargar los estados', error, 'error');
        console.error('Error al cargar estados:', error);
    }
};

export async function loadSales() {
    try {
        const { page, size } = salesState.pagination;
        const { search, idState, productType } = salesState.filters;

        const data = await getSales(
            page - 1,
            size,
            search || '',
            idState || '',
            productType || ''
        );

        salesState.list = data.content;
        salesState.pagination.total = data.page.totalElements;
        salesState.pagination.totalPages = data.page.totalPages;

        insertSales(
            tableBody,
            salesState.list,
            handleSaleActions
        );

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar las ventas',
            'error'
        );
        console.error(error);
    }
}

/* ===============================
   FILTROS
================================ */

export function onSearchSale(filters) {
    salesState.filters = {
        ...salesState.filters,
        ...filters
    };
    salesState.pagination.page = 1;
    loadSales();
}

/* ===============================
   INIT
================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initSalesEvents({
        onSearchSale
    });
    Promise.all([loadSales, loadStateSales]);
});
