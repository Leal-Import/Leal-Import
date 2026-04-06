import { getCustomers } from "../../customers/customers.service.js";
import { DOMRefs, insertCustomers, resetCustomerSaleFilters } from "./customers.sale.dom.js";
import { customerSalesFormState, resetCustomerSalesFormState } from "./customers.sale.state.js";
import { hideElement, showElement, createModuleInitializer } from "../../../utils/dom.js";
import { createPagination } from "../../../pagination/pagination.controller.js";
import { initCustomerSaleEvents } from "./customer.sale.event.js";
import { hydrateContextFromURL } from "./customer.sale.logic.js";
import { handleApiError } from "../../../utils/api.utils.js";

const pagination = createPagination({
    initialSize: customerSalesFormState.pagination.size,
    onChange: ({ page, size }) => {
        customerSalesFormState.pagination.page = page;
        customerSalesFormState.pagination.size = size;
        loadCustomers();
    }
});

const loadCustomers = async () => {
    try {
        showElement(DOMRefs.refs.loaderCustomers);
        const { page, size } = customerSalesFormState.pagination;
        const { search } = customerSalesFormState.filters;
        const data = await getCustomers(
            page - 1,
            size,
            search || ''
        );

        customerSalesFormState.list = data.content;
        customerSalesFormState.pagination.total = data.page.totalElements;
        customerSalesFormState.pagination.totalPages = data.page.totalPages;
        insertCustomers(DOMRefs.refs.cardContainer, customerSalesFormState.list, customerSalesFormState.type, customerSalesFormState.context.id, customerSalesFormState.sparePart);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los clientes');
    } finally {
        hideElement(DOMRefs.refs.loaderCustomers);
    }
};

export const onSearchCustomer = (filters) => {
    customerSalesFormState.filters = {
        ...customerSalesFormState.filters,
        ...filters
    };
    customerSalesFormState.pagination.page = 1;
    loadCustomers();
};

const initializeUI = (Refs) => {
    resetCustomerSaleFilters(Refs.txtSearchData);
    initCustomerSaleEvents({ Refs, onSearchCustomer });
};

const loadDataFlow = async () => {
    await loadCustomers();
};

const init = createModuleInitializer({
    resetState: async () => {
        resetCustomerSalesFormState();
        const contextReady = await hydrateContextFromURL(customerSalesFormState);
        if (!contextReady) throw new Error('Failed to hydrate context');
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
