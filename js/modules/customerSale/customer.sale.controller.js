import { getCustomers } from "../../service/customers.service.js";
import { DOMRefs, insertCustomers } from "../../core/dom/customers.sale.dom.js";
import { customerSaleState } from "../../core/state/customers.sale.state.js";
import { hideElement, showElement, showMessage } from "../../utils/dom.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { initCustomerSaleEvents } from "./customer.sale.event.js";
import { initSession } from "../../utils/api.utils.js";

const pagination = createPagination({
    initialSize: customerSaleState.pagination.size,
    onChange: ({ page, size }) => {
        customerSaleState.pagination.page = page;
        customerSaleState.pagination.size = size;
        loadCustomers();
    }
});


const loadCustomers = async () => {
    try {
        showElement(DOMRefs.refs.loaderCustomers);
        const { page, size } = customerSaleState.pagination;
        const { search } = customerSaleState.filters;
        const data = await getCustomers(
            page - 1,
            size,
            search || '',
        );

        customerSaleState.list = data.content;
        customerSaleState.pagination.total = data.page.totalElements;
        customerSaleState.pagination.totalPages = data.page.totalPages;
        insertCustomers(DOMRefs.refs.cardContainer, customerSaleState.list, customerSaleState.type, customerSaleState.context.id);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        console.error("Error al cargar los clientes:", error);
        showMessage('Error', 'No se pudieron cargar los clientes. Inténtalo de nuevo más tarde.', 'error');
    } finally {
        hideElement(DOMRefs.refs.loaderCustomers);
    }
}


const hydrateContextFromURL = async () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");

    if (!type) {
        await showMessage('Error', 'Tipo de venta no especificado', 'error');
        // opcional: redirigir
        window.location.href = 'sales.html';
        return false;
    }

    customerSaleState.type = type;
    customerSaleState.context.id = params.get("id");
    return true;
}

export function onSearchCustomer(filters) {
    customerSaleState.filters = {
        ...customerSaleState.filters,
        ...filters
    };
    customerSaleState.pagination.page = 1;
    loadCustomers();
}

const setupApplication = async () => {
    // Validar sesión
    const user = await initSession();
    if (!user) return false;

    // Hidratar contexto desde URL
    const contextReady = await hydrateContextFromURL();
    if (!contextReady) return false;

    return true;
};

const initializeUI = (Refs) => {
    initCustomerSaleEvents({ Refs, onSearchCustomer });
}

const loadDataFlow = async () => {
    await loadCustomers();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Validar sesión y preparar contexto
        const isReady = await setupApplication();
        if (!isReady) return;

        // Inicializar referencias del DOMRefs
        const refs = DOMRefs.init();

        // Inicializar componentes UI
        initializeUI(refs);

        // Cargar datos según el flujo
        await loadDataFlow();
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});