import { postCustomer, putCustomer, getCustomers, patchCustomer } from './customers.service.js';
import { customersListState, resetCustomersListState } from './customers.state.js';
import { toggleModal, showMessage, setFormReadOnly, showElement, hideElement, disableElement, removeDisable, createModuleInitializer } from '../../utils/dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateCustomer, mapCustomerForm } from './customers.logic.js';
import { initCustomerEvents } from './customers.events.js';
import { DOMRefs, fillCustomerForm, insertCustomers, resetCustomersFilters, rewriteModalText } from './customers.dom.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';
import { handleApiError } from '../../utils/api.utils.js';

const STATUS = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };

const pagination = createPagination({
    initialSize: customersListState.pagination.size,
    onChange: ({ page, size }) => {
        customersListState.pagination.page = page;
        customersListState.pagination.size = size;
        loadCustomers();
    }
});

export const loadCustomers = async () => {
    try {
        showElement(DOMRefs.refs.loaderCustomers);
        const { page, size } = customersListState.pagination;
        const { search, status } = customersListState.filters;
        const data = await getCustomers(
            page - 1,
            size,
            search || '',
            status || ''
        );

        customersListState.list = data.content;
        customersListState.pagination.total = data.page.totalElements;
        customersListState.pagination.totalPages = data.page.totalPages;
        insertCustomers(
            DOMRefs.refs.CustomersTableBody,
            customersListState.list,
            handleCustomerActions,
            DOMRefs.refs.tableCustomers
        );

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

const handleCustomerActions = (event, customer) => {
    event.stopPropagation();

    showFloatingMenu(event, [
        {
            label: 'Actualizar cliente',
            privilege: 'WRITE_CUSTOMERS',
            onClick: () => editCustomer(customer)
        },
        {
            label: 'Ver detalles',
            onClick: () => viewCustomer(customer)
        },
        {
            label: customer.status === STATUS.ACTIVE
                ? 'Desactivar cliente'
                : 'Activar cliente',
            privilege: 'WRITE_CUSTOMERS',
            onClick: () =>
                toggleCustomerStatus(
                    customer.idCustomer,
                    customer.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE
                )
        }
    ]);
};

const toggleCustomerStatus = async (id, status) => {
    try {
        await patchCustomer(id, status);
        showMessage('Cliente', status === STATUS.ACTIVE ? 'Cliente activado' : 'Cliente desactivado', 'success');

        await loadCustomers();
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el estado del cliente. Por favor, inténtalo de nuevo.');
    }
};

const editCustomer = (customer) => {
    customersListState.selectedId = customer.idCustomer;
    fillCustomerForm(customer);
    rewriteModalText(DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.titleModal, "Actualizar");
    setFormReadOnly('#frmCustomers', false);
    toggleModal(DOMRefs.refs.modalCustomers, true);
};

const viewCustomer = (customer) => {
    customersListState.selectedId = null;
    fillCustomerForm(customer);
    rewriteModalText(DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.titleModal, "Ver");
    setFormReadOnly('#frmCustomers', true);
    toggleModal(DOMRefs.refs.modalCustomers, true);
};

const onOpenModal = () => {
    customersListState.selectedId = null;
    DOMRefs.refs.frmCustomers.reset();
    rewriteModalText(DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.titleModal, "Agregar");
    setFormReadOnly('#frmCustomers', false);
    toggleModal(DOMRefs.refs.modalCustomers, true);
};

const onCloseModal = () => {
    customersListState.selectedId = null;
    toggleModal(DOMRefs.refs.modalCustomers, false);
};

const onSubmitCustomer = async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmCustomers));
    const customer = mapCustomerForm(formData);
    const error = validateCustomer(customer);
    if (error) {
        showMessage('Error', error, 'warning');
        return;
    }
    showElement(DOMRefs.refs.loaderAddCustomer);
    DOMRefs.refs.campsModal.forEach(disableElement);
    disableElement(DOMRefs.refs.btnAddNewCustomer);
    try {
        if (customersListState.selectedId) {
            await putCustomer(customer, customersListState.selectedId);
            await showMessage('Exito', 'Cliente actualizado exitosamente', 'success', true);
        } else {
            await postCustomer(customer);
            await showMessage('Exito', 'Cliente agregado exitosamente', 'success', true);
        }

        toggleModal(DOMRefs.refs.modalCustomers, false);
        customersListState.selectedId = null;
    } catch (err) {
        await handleApiError(err, 'No se pudo guardar el cliente. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderAddCustomer);
        DOMRefs.refs.campsModal.forEach(removeDisable);
        DOMRefs.refs.frmCustomers.reset();
        removeDisable(DOMRefs.refs.btnAddNewCustomer);
        pagination.update({});
    }
};

const onSearchCustomer = (filters) => {
    customersListState.filters = {
        ...customersListState.filters,
        ...filters
    };
    customersListState.pagination.page = 1;
    loadCustomers();
};

const initializeUI = (Refs) => {
    resetCustomersFilters(Refs);
    initCustomerEvents({ Refs, onSubmitCustomer, onSearchCustomer, onOpenModal, onCloseModal });
};

const loadDataFlow = async () => {
    await loadCustomers();
};

const init = createModuleInitializer({
    resetState: resetCustomersListState,
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
