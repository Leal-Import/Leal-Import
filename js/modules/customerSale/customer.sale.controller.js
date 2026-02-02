import { getCustomers } from "../../service/customers.service.js";
import { insertCustomers } from "../../core/dom/customers.sale.dom.js";
import { customerSaleState } from "../../core/state/customers.sale.state.js";
import { qs, showMessage } from "../../utils/dom.js";
import { createPagination } from "../../pagination/pagination.controller.js";
import { initCustomerSaleEvents } from "./customer.sale.event.js";

const pagination = createPagination({
    initialSize: customerSaleState.pagination.size,
    onChange: ({ page, size }) => {
        customerSaleState.pagination.page = page;
        customerSaleState.pagination.size = size;
        loadCustomers();
    }
});


let loadCustomers = async () => {
    try {
        const { page, size } = customerSaleState.pagination;
        const { search } = customerSaleState.filters;
        const data = await getCustomers(
            page - 1,
            size,
            search || ''
        );

        customerSaleState.list = data.content;
        customerSaleState.pagination.total = data.page.totalElements;
        customerSaleState.pagination.totalPages = data.page.totalPages;
        insertCustomers(qs(".containerCustomers"), customerSaleState.list, customerSaleState.type);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        console.error("Error al cargar los clientes:", error);
        showMessage('Error', 'No se pudieron cargar los clientes. Inténtalo de nuevo más tarde.', 'error');
    }
}


const hydrateContextFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    customerSaleState.type = type;
}

export function onSearchCustomer(filters) {
    customerSaleState.filters = {
        ...customerSaleState.filters,
        ...filters
    };
    customerSaleState.pagination.page = 1;
    loadCustomers();
}

document.addEventListener("DOMContentLoaded", async () => {
    hydrateContextFromURL();
    initCustomerSaleEvents({ onSearchCustomer });
    await loadCustomers();
})