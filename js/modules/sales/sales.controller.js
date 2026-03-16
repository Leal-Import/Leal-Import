// modules/sales/sales.controller.js

import { insertSales, selectLineButton, DOMRefs } from "../../core/dom/sales.dom.js";
import { salesState } from "../../core/state/sales.state.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { getSales, getStateSales } from "../../service/sales.service.js";
import { fillSelect, hideElement, showElement, showMessage, toggleModal } from "../../utils/dom.js";
import { initSession } from "../../utils/api.utils.js";
import { initSalesEvents } from "./sales.event.js";

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

const loadStateSales = async() => {
    try {
        const status = await getStateSales();
        salesState.stateList = status;
        fillSelect('cmbSearchByStatus', salesState.stateList, 'idStateSale', 'stateName', null, "Todas");
    } catch (error) {
        showMessage('Error al cargar los estados', error, 'error');
        console.error('Error al cargar estados:', error);
    }
};

const loadSales = async() => {
    try {
        showElement(DOMRefs.refs.loaderSales);
        const { page, size } = salesState.pagination;
        const { search, idState, productType } = salesState.filters;

        const data = await getSales(page - 1, size, search || '', idState || '', productType || '');

        salesState.list = data.content;
        salesState.pagination.total = data.page.totalElements;
        salesState.pagination.totalPages = data.page.totalPages;
        insertSales(DOMRefs.refs.panelContainer, salesState.list);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        showMessage('Error', error, 'error');
        console.error(error);
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
    salesState.filters = {
        ...salesState.filters,
        ...filters
    };
    salesState.pagination.page = 1;
    loadSales();
};

/* ===============================
   INIT
================================ */

const setupApplication = async() => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = (Refs) => {
    initSalesEvents({ Refs, onSearchSale, onClickBtnFilter, onOpenModal: () => toggleModal(Refs.modalAskSale, true), onCloseModal: () => toggleModal(Refs.modalAskSale, false) });
};

const loadDataFlow = async() => {
    await Promise.all([loadSales(), loadStateSales()]);
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
