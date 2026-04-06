// modules/employees/employees.controller.js

import { employeesListState, resetEmployeesListState } from './employees.state.js';
import { insertEmployees, fillEmployeesForm, DOMRefs, rewriteModalElements, resetEmployeesFilters } from './employees.dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateEmployee, mapEmployeeForm } from './employees.logic.js';
import { getActiveEmployees, postEmployee, putEmployee, getRoles, patchEmployee } from './employees.service.js';
import { initEmployeeEvents } from './employees.events.js';
import { showMessage, toggleModal, setFormReadOnly, hideElement, showElement, disableElement, removeDisable, fillSelect, createModuleInitializer } from '../../utils/dom.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';
import { handleApiError } from '../../utils/api.utils.js';

/* ===============================
   CARGA DE EMPLEADOS
================================ */

const STATUS = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };

const pagination = createPagination({
    initialSize: employeesListState.pagination.size,
    onChange: ({ page, size }) => {
        employeesListState.pagination.page = page;
        employeesListState.pagination.size = size;
        loadEmployees();
    }
});

export const loadRoles = async () => {
    try {
        const roles = await getRoles();
        employeesListState.roles = roles;
        fillSelect('cmbUserRole', roles, 'idRole', 'roleName', null, 'Selecciona un rol');
        fillSelect('cmbSearchByRole', roles, 'idRole', 'roleName', null, 'Buscar por rol');
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los roles. Algunas funciones podrían no estar disponibles.');
    }
};

export const loadEmployees = async () => {
    try {
        showElement(DOMRefs.refs.loaderEmployees);
        const { page, size } = employeesListState.pagination;
        const { search, idRole, status } = employeesListState.filters;
        const data = await getActiveEmployees(
            page - 1,
            size,
            search || '',
            idRole || '',
            status || ''
        );

        employeesListState.list = data.content;
        employeesListState.pagination.total = data.page.totalElements;
        employeesListState.pagination.totalPages = data.page.totalPages;

        insertEmployees(
            DOMRefs.refs.employeesTableBody,
            employeesListState.list,
            handleEmployeeActions
        );

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });
    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los empleados');
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
        if (employeesListState.selectedId) {
            await putEmployee(employee, employeesListState.selectedId);
            showMessage('Exito', 'Empleado actualizado exitosamente', 'success');
        } else {
            await postEmployee(employee);
            showMessage('Exito', 'Empleado agregado exitosamente', 'success');
        }

    } catch (err) {
        await handleApiError(err, 'No se pudo guardar el empleado. Por favor, inténtalo de nuevo.');
    } finally {
        DOMRefs.refs.frmEmployees.reset();
        DOMRefs.refs.campsModal.forEach(removeDisable);
        employeesListState.selectedId = null;
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
            label: employee.user.status === STATUS.ACTIVE
                ? 'Desactivar empleado'
                : 'Activar empleado',
            onClick: () =>
                toggleEmployeeStatus(
                    employee.user.idUser,
                    employee.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE
                )
        }
    ]);
};

/* ===============================
   EDITAR / VER
================================ */

const editEmployee = (employee) => {
    employeesListState.selectedId = employee.idEmployee;
    fillEmployeesForm(employee);
    rewriteModalElements(DOMRefs.refs.btnAddEmployee, DOMRefs.refs.titleModal, 'Actualizar');
    setFormReadOnly('#frmEmployees', false);
    toggleModal(DOMRefs.refs.modalEmployees, true);
};

const viewEmployee = (employee) => {
    employeesListState.selectedId = null;
    fillEmployeesForm(employee);
    setFormReadOnly('#frmEmployees', true);
    rewriteModalElements(DOMRefs.refs.btnAddEmployee, DOMRefs.refs.titleModal, 'Ver');
    toggleModal(DOMRefs.refs.modalEmployees, true);
};

const onCloseModal = () => {
    employeesListState.selectedId = null;
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

const toggleEmployeeStatus = async (userId, status) => {
    try {
        await patchEmployee(userId, status);
        showMessage('Empleado', status === STATUS.ACTIVE ? 'Empleado activado' : 'Empleado desactivado', 'success');

        loadEmployees();
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el estado del empleado. Por favor, inténtalo de nuevo.');
    }
};

/* ===============================
   FILTROS
================================ */

const onSearchEmployee = async (filters) => {
    employeesListState.filters = {
        ...employeesListState.filters,
        ...filters
    };
    employeesListState.pagination.page = 1;
    await loadEmployees();
};

/* ===============================
   INIT
================================ */

const initializeUI = (Refs) => {
    resetEmployeesFilters(Refs);
    initEmployeeEvents({ Refs, onSubmitEmployee, onSearchEmployee, onCloseModal, onOpenModal });
};

const loadDataFlow = async () => {
    await Promise.all([loadRoles(), loadEmployees()]);
};

const init = createModuleInitializer({
    resetState: resetEmployeesListState,
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
