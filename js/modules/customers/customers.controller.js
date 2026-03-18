import { postCustomer, putCustomer, getCustomers, patchCustomer } from '../../service/customers.service.js';
import { customersState, resetCustomersState } from '../../core/state/customers.state.js';
import { toggleModal, showMessage, showFloatingMenu, setFormReadOnly, showElement, hideElement, disableElement, removeDisable } from '../../utils/dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateCustomer, mapCustomerForm } from '../../core/logic/customers.logic.js';
import { initCustomerEvents } from './customers.events.js';
import { DOMRefs, fillCustomerForm, insertCustomers, rewriteModalText } from '../../core/dom/customers.dom.js';
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

export const loadCustomers = async () => {
    try {
        showElement(DOMRefs.refs.loaderCustomers);
        const { page, size } = customersState.pagination;
        const { search, status } = customersState.filters;
        const data = await getCustomers(
            page - 1,
            size,
            search || '',
            status || ''

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
};

const handleCustomerActions = (event, customer) => {
    event.stopPropagation();

    showFloatingMenu(event, [
        {
            label: 'Actualizar cliente',
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
        showMessage(
            'Error',
            'No se pudo cambiar el estado',
            'error'
        );
        console.error(error);
    }
};

const editCustomer = (customer) => {
    customersState.selectedId = customer.idCustomer;
    fillCustomerForm(customer);
    rewriteModalText(DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.titleModal, "Actualizar");
    setFormReadOnly('#frmCustomers', false);
    toggleModal(DOMRefs.refs.modalCustomers, true);
};

const viewCustomer = (customer) => {
    customersState.selectedId = null;
    fillCustomerForm(customer);
    rewriteModalText(DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.titleModal, "Ver");
    setFormReadOnly('#frmCustomers', true);
    toggleModal(DOMRefs.refs.modalCustomers, true);
};

const onOpenModal = () => {
    customersState.selectedId = null;
    DOMRefs.refs.frmCustomers.reset();
    rewriteModalText(DOMRefs.refs.btnAddNewCustomer, DOMRefs.refs.titleModal, "Agregar");
    setFormReadOnly('#frmCustomers', false);
    toggleModal(DOMRefs.refs.modalCustomers, true);
};

const onCloseModal = () => {
    customersState.selectedId = null;
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
        DOMRefs.refs.campsModal.forEach(removeDisable);
        customersState.selectedId = null;
        DOMRefs.refs.frmCustomers.reset();
        removeDisable(DOMRefs.refs.btnAddNewCustomer);
        pagination.update({});
        toggleModal(DOMRefs.refs.modalCustomers, false);
    }
};

const onSearchCustomer = (filters) => {
    customersState.filters = {
        ...customersState.filters,
        ...filters
    };
    customersState.pagination.page = 1;
    loadCustomers();
};

const setupApplication = async () => {
    resetCustomersState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = (Refs) => {
    initCustomerEvents({ Refs, onSubmitCustomer, onSearchCustomer, onOpenModal, onCloseModal });
};

const loadDataFlow = async () => {
    await loadCustomers();
};

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
