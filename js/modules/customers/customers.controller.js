import { postCustomer, putCustomer, getCustomers, patchCustomer } from '../../service/customers.service.js';
import { customersState } from '../../core/state/customers.state.js';
import { $, toggleModal, showMessage, showFloatingMenu, setFormReadOnly } from '../../utils/dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateCustomer, mapCustomerForm } from '../../core/logic/customers.logic.js';
import { initCustomerEvents } from './customers.events.js';
import { fillCustomerForm, insertCustomers } from '../../core/dom/customers.dom.js';

const tableBody = $('CustomersTableBody');
const modalCustomers = $('modalCustomers');
const form = $('frmCustomers');

const pagination = createPagination({
    initialSize: customersState.pagination.size,
    onChange: ({ page, size }) => {
        customersState.pagination.page = page;
        customersState.pagination.size = size;
        loadCustomers();
    }
});

export async function loadCustomers() {
    try {
        const { page, size } = customersState.pagination;
        const { search } = customersState.filters;
        const data = await getCustomers(
            page - 1,
            size,
            search || ''
        );

        customersState.list = data.content;
        customersState.pagination.total = data.page.totalElements;
        customersState.pagination.totalPages = data.page.totalPages;

        insertCustomers(
            tableBody,
            customersState.list,
            handleCustomerActions
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
            'No se pudieron cargar los clientes',
            'error'
        );
        console.error(error);
    }
}

function handleCustomerActions(event, customer) {
    event.stopPropagation();

    showFloatingMenu(event, [
        {
            label: 'Editar cliente',
            onClick: () => editCustomer(customer)
        },
        {
            label: customer.status === 'T'
                ? 'Desactivar cliente'
                : 'Activar cliente',
            onClick: () =>
                toggleCustomerStatus(
                    customer.idCustomer,
                    customer.status === 'T' ? 'F' : 'T'
                )
        },
        {
            label: 'Ver detalles',
            onClick: () => viewCustomer(customer)
        }
    ]);
}


async function toggleCustomerStatus(id, status) {
    try {
        await patchCustomer(id, status);
        showMessage('Cliente', status === 'T' ? 'Cliente activado' : 'Cliente desactivado', 'success');

        loadCustomers();
    } catch (error) {
        showMessage(
            'Error',
            'No se pudo cambiar el estado',
            'error'
        );
        console.error(error);
    }
}

function editCustomer(customer) {
    customersState.selectedId = customer.idCustomer;
    fillCustomerForm(customer, "Actualizar cliente");
    setFormReadOnly('#frmCustomers', false);
}

function viewCustomer(customer) {
    customersState.selectedId = null;
    fillCustomerForm(customer, "Ver cliente");
    setFormReadOnly('#frmCustomers', true);
}


export async function onSubmitCustomer(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
        const customer = mapCustomerForm(formData);
        const error = validateCustomer(customer);

        if (error) {
            showMessage('Error', error, 'warning');
            return;
        }

        if (customersState.selectedId) {
            await putCustomer(customer, customersState.selectedId);
            showMessage('Exito', 'Cliente actualizado exitosamente', 'success');
        } else {
            await postCustomer(customer);
            showMessage('Exito', 'Cliente agregado exitosamente', 'success');
        }

        toggleModal(modalCustomers, false);
        pagination.update({});

    } catch (err) {
        console.error(err);
        showMessage('Error', err.message || 'Error al guardar cliente', 'error');
    } finally {
        customersState.selectedId = null;
    }
}

export function onSearchCustomer(filters) {
    customersState.filters = {
        ...customersState.filters,
        ...filters
    };
    customersState.pagination.page = 1;
    loadCustomers();
}

document.addEventListener('DOMContentLoaded', async () => {
    initCustomerEvents();
    await loadCustomers();
});