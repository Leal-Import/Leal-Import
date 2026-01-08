// modules/employees/employees.controller.js

import { employeesState } from '../../core/state/employees.state.js';
import { insertEmployees, renderRolesSelects, fillEmployeesForm } from '../../core/dom/employees.dom.js';
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
import { showFloatingMenu, showMessage, toggleModal, setFormReadOnly, $ } from '../../utils/dom.js';

const tableBody = $('employeesTableBody');
const modalEmployees = $('modalEmployees');
const form = $('frmEmployees');

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
            tableBody,
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
    }
}

export async function onSubmitEmployee(e) {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    const employee = mapEmployeeForm(formData);
    const error = validateEmployee(employee);

    if (error) {
        showMessage('Error', error, 'warning');
        return;
    }

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
        toggleModal(modalEmployees, false);
        form.reset();
        employeesState.selectedId = null;
        pagination.update({});

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

export function onSearchEmployee(filters) {
    employeesState.filters = {
        ...employeesState.filters,
        ...filters
    };
    employeesState.pagination.page = 1;
    loadEmployees();
}

/* ===============================
   INIT
================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initEmployeeEvents({ onSubmitEmployee, onSearchEmployee, onReset: () => employeesState.selectedId = null });
    await Promise.all([loadRoles(), loadEmployees()]);
});
