// modules/sales/sales.controller.js

import { insertSales, selectLineButton, DOMRefs, resetSalesFilters } from "./sales.dom.js";
import { resetSalesListState, salesListState } from "./sales.state.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { getSales, getStateSales } from "./sales.service.js";
import { fillSelect, hideElement, showElement, toggleModal, createModuleInitializer } from "../../utils/dom.js";
import { initSalesEvents } from "./sales.event.js";
import { handleApiError } from "../../utils/api.utils.js";

/* ===============================
   CARGA DE VENTAS
================================ */

const pagination = createPagination({
    initialSize: salesListState.pagination.size,
    onChange: ({ page, size }) => {
        salesListState.pagination.page = page;
        salesListState.pagination.size = size;
        loadSales();
    }
});

const loadStateSales = async() => {
    try {
        const status = await getStateSales();
        salesListState.stateList = status;
        fillSelect('cmbSearchByStatus', salesListState.stateList, 'idStatusSale', 'statusName', null, "Buscar por estado");
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los estados de las ventas. Por favor, inténtalo de nuevo.');
    }
};

const loadSales = async() => {
    try {
        showElement(DOMRefs.refs.loaderSales);
        const { page, size } = salesListState.pagination;
        const { search, idState, productType, startDate, endDate } = salesListState.filters;

        const data = await getSales(page - 1, size, search || '', idState || '', productType || '', startDate || '', endDate || '');

        salesListState.list = data.content;
        salesListState.pagination.total = data.page.totalElements;
        salesListState.pagination.totalPages = data.page.totalPages;
        insertSales(DOMRefs.refs.panelContainer, salesListState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar las ventas. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderSales);
    }
};

const onClickBtnFilter = (btn) => {
    selectLineButton(btn, DOMRefs.refs.selectedLines);
};

/* ===============================
   FILTROS
================================ */

const onSearchSale = (filters) => {
    salesListState.filters = {
        ...salesListState.filters,
        ...filters
    };
    salesListState.pagination.page = 1;
    loadSales();
};

/* ===============================
   INIT
================================ */

const initializeUI = (Refs) => {
    resetSalesFilters(Refs);
    initSalesEvents({ Refs, onSearchSale, onClickBtnFilter, onOpenModal: () => toggleModal(Refs.modalAskSale, true), onCloseModal: () => toggleModal(Refs.modalAskSale, false) });
};

const loadDataFlow = async() => {
    await Promise.all([loadSales(), loadStateSales()]);
};

const init = createModuleInitializer({
    resetState: resetSalesListState,
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
