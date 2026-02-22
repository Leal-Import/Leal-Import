// modules/employees/employees.controller.js

import { employeesState } from '../../core/state/employees.state.js';
import { insertEmployees, renderRolesSelects, fillEmployeesForm, DOMRefs } from '../../core/dom/employees.dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import {
    validateEmployee,
    mapEmployeeForm
} from '../../core/logic/employees.logic.js';
import {
    getActiveEmployees,
    postEmployee,
    putEmployee,
    getRoles,
    patchEmployee
} from '../../service/employees.service.js';
import { initEmployeeEvents } from './employees.events.js';
import { showFloatingMenu, showMessage, toggleModal, setFormReadOnly, hideElement, showElement, disableElement, removeDisable } from '../../utils/dom.js';
import { initSession } from '../../utils/api.utils.js';

/* ===============================
   CARGA DE EMPLEADOS
================================ */

const pagination = createPagination({
    initialSize: employeesState.pagination.size,
    onChange: ({ page, size }) => {
        employeesState.pagination.page = page;
        employeesState.pagination.size = size;
        loadEmployees();
    }
});

export async function loadRoles() {
    try {
        const roles = await getRoles();
        employeesState.roles = roles;
        renderRolesSelects(roles);
    } catch (error) {
        showMessage(
            'Error',
            'No se pudieron cargar los roles',
            'error'
        );
        console.error(error);
    }
}

export async function loadEmployees() {
    try {
        showElement(DOMRefs.refs.loaderEmployees)
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
}

export async function onSubmitEmployee(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(DOMRefs.refs.frmEmployees));

    const employee = mapEmployeeForm(formData);
    const error = validateEmployee(employee);

    if (error) {
        showMessage('Error', error, 'warning');
        return;
    }
    showElement(DOMRefs.refs.btnAddEmployeeLoader);
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
        toggleModal(DOMRefs.refs.modalEmployees, false);
        DOMRefs.refs.frmEmployees.reset();
        employeesState.selectedId = null;
        pagination.update({});
        hideElement(DOMRefs.refs.btnAddEmployeeLoader);
        removeDisable(DOMRefs.refs.btnAddEmployee);
    }
}

/* ===============================
   ACCIONES DE FILA (⋯)
================================ */

function handleEmployeeActions(event, employee) {
    event.stopPropagation();

    showFloatingMenu(event, [
        {
            label: 'Editar empleado',
            onClick: () => editEmployee(employee)
        },
        {
            label: employee.status === 'T'
                ? 'Desactivar empleado'
                : 'Activar empleado',
            onClick: () =>
                toggleEmployeeStatus(
                    employee.username,
                    employee.status === 'T' ? 'F' : 'T'
                )
        },
        {
            label: 'Ver detalles',
            onClick: () => viewEmployee(employee)
        }
    ]);
}

/* ===============================
   EDITAR / VER
================================ */

function editEmployee(employee) {
    employeesState.selectedId = employee.idEmployee;
    fillEmployeesForm(employee, "Actualizar empleado");
    setFormReadOnly('#frmEmployees', false);
}

function viewEmployee(employee) {
    employeesState.selectedId = null;
    fillEmployeesForm(employee, "Ver empleado");
    setFormReadOnly('#frmEmployees', true);
}

/* ===============================
   ACTIVAR / DESACTIVAR
================================ */

async function toggleEmployeeStatus(username, status) {
    try {
        await patchEmployee(username, status);
        showMessage('Empleado', status === 'T' ? 'Empleado activado' : 'Empleado desactivado', 'success');

        loadEmployees();
    } catch (error) {
        showMessage(
            'Error',
            'No se pudo cambiar el estado',
            'error'
        );
        console.error(error);
    }
}

/* ===============================
   FILTROS
================================ */

async function onSearchEmployee(filters) {
    employeesState.filters = {
        ...employeesState.filters,
        ...filters
    };
    employeesState.pagination.page = 1;
    await loadEmployees();
}

/* ===============================
   INIT
================================ */

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    return true;
};

const initializeUI = () => {
    initEmployeeEvents({ onSubmitEmployee, onSearchEmployee, onReset: () => employeesState.selectedId = null });
}

const loadDataFlow = async () => {
    await Promise.all([loadRoles(), loadEmployees()]);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        DOMRefs.init();

        initializeUI();

        await loadDataFlow();
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
