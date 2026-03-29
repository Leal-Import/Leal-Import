// modules/employees/employees.controller.js

import { employeesState, resetEmployeesState } from './employees.state.js';
import { insertEmployees, fillEmployeesForm, DOMRefs, rewriteModalElements, resetEmployeesFilters } from './employees.dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateEmployee, mapEmployeeForm } from './employees.logic.js';
import { getActiveEmployees, postEmployee, putEmployee, getRoles, patchEmployee } from './employees.service.js';
import { initEmployeeEvents } from './employees.events.js';
import { showFloatingMenu, showMessage, toggleModal, setFormReadOnly, hideElement, showElement, disableElement, removeDisable, fillSelect } from '../../utils/dom.js';
import { initSession } from '../../utils/api.utils.js';

/* ===============================
   CARGA DE EMPLEADOS
================================ */

const STATUS = { ACTIVE: 'T', INACTIVE: 'F' };

const pagination = createPagination({
    initialSize: employeesState.pagination.size,
    onChange: ({ page, size }) => {
        employeesState.pagination.page = page;
        employeesState.pagination.size = size;
        loadEmployees();
    }
});

export const loadRoles = async () => {
    try {
        const roles = await getRoles();
        employeesState.roles = roles;
        fillSelect('cmbUserRole', roles, 'idRole', 'roleName', null, 'Selecciona un rol');
        fillSelect('cmbSearchByRole', roles, 'idRole', 'roleName', null, 'Buscar por rol');
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los roles',
            'error'
        );
        console.error(error);
    }
};

export const loadEmployees = async () => {
    try {
        showElement(DOMRefs.refs.loaderEmployees);
        const { page, size } = employeesState.pagination;
        const { search, idRole, status } = employeesState.filters;
        const data = await getActiveEmployees(
            page - 1,
            size,
            search || '',
            idRole || '',
            status || ''
        );

        employeesState.list = data.content;
        employeesState.pagination.total = data.page.totalElements;
        employeesState.pagination.totalPages = data.page.totalPages;

        insertEmployees(
            DOMRefs.refs.employeesTableBody,
            employeesState.list,
            handleEmployeeActions
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
            'No se pudieron cargar los empleados',
            'error'
        );
        console.error(error);
    } finally {
        hideElement(DOMRefs.refs.loaderEmployees);
    }
};

export const onSubmitEmployee = async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmEmployees));

    const employee = mapEmployeeForm(formData);
    const error = validateEmployee(employee);

    if (error) {
        showMessage('Advertencia', error, 'warning');
        return;
    }
    showElement(DOMRefs.refs.btnAddEmployeeLoader);
    DOMRefs.refs.campsModal.forEach(disableElement);
    disableElement(DOMRefs.refs.btnAddEmployee);
    try {
        if (employeesState.selectedId) {
            await putEmployee(employee, employeesState.selectedId);
            showMessage('Exito', 'Empleado actualizado exitosamente', 'success');
        } else {
            await postEmployee(employee);
            showMessage('Exito', 'Empleado agregado exitosamente', 'success');
        }

    } catch (err) {
        console.error(err);
        showMessage('Error', err.message || 'Error al guardar empleado', 'error');
    } finally {
        DOMRefs.refs.frmEmployees.reset();
        DOMRefs.refs.campsModal.forEach(removeDisable);
        employeesState.selectedId = null;
        hideElement(DOMRefs.refs.btnAddEmployeeLoader);
        removeDisable(DOMRefs.refs.btnAddEmployee);
        pagination.update({});
        toggleModal(DOMRefs.refs.modalEmployees, false);
    }
};

/* ===============================
   ACCIONES DE FILA (⋯)
================================ */

const handleEmployeeActions = (event, employee) => {
    event.stopPropagation();

    showFloatingMenu(event, [
        {
            label: 'Actualizar empleado',
            onClick: () => editEmployee(employee)
        },
        {
            label: 'Ver detalles',
            onClick: () => viewEmployee(employee)
        },
        {
            label: employee.status === STATUS.ACTIVE
                ? 'Desactivar empleado'
                : 'Activar empleado',
            onClick: () =>
                toggleEmployeeStatus(
                    employee.username.username,
                    employee.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE
                )
        }
    ]);
};

/* ===============================
   EDITAR / VER
================================ */

const editEmployee = (employee) => {
    employeesState.selectedId = employee.idEmployee;
    fillEmployeesForm(employee);
    rewriteModalElements(DOMRefs.refs.btnAddEmployee, DOMRefs.refs.titleModal, 'Actualizar');
    setFormReadOnly('#frmEmployees', false);
    toggleModal(DOMRefs.refs.modalEmployees, true);
};

const viewEmployee = (employee) => {
    employeesState.selectedId = null;
    fillEmployeesForm(employee);
    setFormReadOnly('#frmEmployees', true);
    rewriteModalElements(DOMRefs.refs.btnAddEmployee, DOMRefs.refs.titleModal, 'Ver');
    toggleModal(DOMRefs.refs.modalEmployees, true);
};

const onCloseModal = () => {
    employeesState.selectedId = null;
    toggleModal(DOMRefs.refs.modalEmployees);
};
const onOpenModal = () => {
    rewriteModalElements(DOMRefs.refs.btnAddEmployee, DOMRefs.refs.titleModal, 'Agregar');
    DOMRefs.refs.frmEmployees.reset();
    setFormReadOnly('#frmEmployees', false);
    toggleModal(DOMRefs.refs.modalEmployees, true);
};

/* ===============================
   ACTIVAR / DESACTIVAR
================================ */

const toggleEmployeeStatus = async (username, status) => {
    try {
        await patchEmployee(username, status);
        showMessage('Empleado', status === STATUS.ACTIVE ? 'Empleado activado' : 'Empleado desactivado', 'success');

        loadEmployees();
    } catch (error) {
        showMessage(
            'Error',
            'No se pudo cambiar el estado',
            'error'
        );
        console.error(error);
    }
};

/* ===============================
   FILTROS
================================ */

const onSearchEmployee = async (filters) => {
    employeesState.filters = {
        ...employeesState.filters,
        ...filters
    };
    employeesState.pagination.page = 1;
    await loadEmployees();
};

/* ===============================
   INIT
================================ */

const setupApplication = async () => {
    resetEmployeesState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = (Refs) => {
    resetEmployeesFilters(Refs);
    initEmployeeEvents({ Refs, onSubmitEmployee, onSearchEmployee, onCloseModal, onOpenModal });
};

const loadDataFlow = async () => {
    await Promise.all([loadRoles(), loadEmployees()]);
};

document.addEventListener('DOMContentLoaded', async () => {
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
