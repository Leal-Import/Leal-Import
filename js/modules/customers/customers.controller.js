import { postCustomer, putCustomer, getCustomers, patchCustomer } from '../../service/customers.service.js';
import { customersState } from '../../core/state/customers.state.js';
import { toggleModal, showMessage, showFloatingMenu, setFormReadOnly, showElement, hideElement, disableElement, removeDisable } from '../../utils/dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateCustomer, mapCustomerForm } from '../../core/logic/customers.logic.js';
import { initCustomerEvents } from './customers.events.js';
import { DOMRefs, fillCustomerForm, insertCustomers } from '../../core/dom/customers.dom.js';
import { initSession } from '../../utils/api.utils.js';

const STATUS = { ACTIVE: 'T', INACTIVE: 'F' };

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
        showElement(DOMRefs.refs.loaderCustomers);
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
            DOMRefs.refs.CustomersTableBody,
            customersState.list,
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
        showMessage(
            'Error',
            'No se pudieron cargar los clientes',
            'error'
        );
        console.error(error);
    } finally {
        hideElement(DOMRefs.refs.loaderCustomers);
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
            label: customer.status === STATUS.ACTIVE
                ? 'Desactivar cliente'
                : 'Activar cliente',
            onClick: () =>
                toggleCustomerStatus(
                    customer.idCustomer,
                    customer.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE
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
        showMessage('Cliente', status === STATUS.ACTIVE ? 'Cliente activado' : 'Cliente desactivado', 'success');

        await loadCustomers();
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
    fillCustomerForm(customer, "Actualizar cliente", DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.modalCustomers);
    toggleModal(DOMRefs.refs.modalCustomers, true);
    setFormReadOnly('#frmCustomers', false);
}

function viewCustomer(customer) {
    customersState.selectedId = null;
    fillCustomerForm(customer, "Ver cliente", DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.modalCustomers);
    toggleModal(DOMRefs.refs.modalCustomers, true);
    setFormReadOnly('#frmCustomers', true);
}


export async function onSubmitCustomer(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmCustomers));
    const customer = mapCustomerForm(formData);
    const error = validateCustomer(customer);
    if (error) {
        showMessage('Error', error, 'warning');
        return;
    }
    showElement(DOMRefs.refs.loaderAddCustomer);
    disableElement(DOMRefs.refs.btnAddNewCustomer);
    try {
        if (customersState.selectedId) {
            await putCustomer(customer, customersState.selectedId);
            showMessage('Exito', 'Cliente actualizado exitosamente', 'success');
        } else {
            await postCustomer(customer);
            showMessage('Exito', 'Cliente agregado exitosamente', 'success');
        }


    } catch (err) {
        console.error(err);
        showMessage('Error', err.message || 'Error al guardar cliente', 'error');
    } finally {
        hideElement(DOMRefs.refs.loaderAddCustomer);
        customersState.selectedId = null;
        DOMRefs.refs.frmCustomers.reset();
        removeDisable(DOMRefs.refs.btnAddNewCustomer);
        toggleModal(DOMRefs.refs.modalCustomers, false);
        pagination.update({});
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

const onCleanState = () => customersState.selectedId = null

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = (Refs) => {
    initCustomerEvents({ Refs, onSubmitCustomer, onSearchCustomer, onCleanState });
}

const loadDataFlow = async () => {
    await loadCustomers();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Configurar aplicación
        const isReady = await setupApplication();
        if (!isReady) return;

        // 2. Inicializar referencias del DOMRefs
        const refs = DOMRefs.init();

        // 3. Inicializar componentes UI
        initializeUI(refs);

        // 4. Cargar datos según el flujo
        await loadDataFlow();
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});