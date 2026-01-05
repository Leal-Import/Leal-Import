// modules/sales/sales.controller.js

import { insertSales, selectLineButton, opeAskModal, closeAskModal } from "../../core/dom/sales.dom.js";
import { salesState } from "../../core/state/sales.state.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { getSales, getStateSales } from "../../service/sales.service.js";
import { fillSelect, showMessage } from "../../utils.js";
import { qs } from "../../utils/dom.js";
import { initSalesEvents } from "./sales.event.js";

const containerData = qs('.panelContainer');

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
            containerData,
            salesState.list
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
            error,
            'error'
        );
        console.error(error);
    }
}

let onClickBtnFilter = (e) => selectLineButton(e);
let onOpenModal = () => opeAskModal();
let onCloseModal = () => closeAskModal();
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
        onSearchSale,
        onClickBtnFilter,
        onOpenModal,
        onCloseModal
    });
    Promise.all([loadSales(), loadStateSales()]);
});
