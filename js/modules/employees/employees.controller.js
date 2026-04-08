// modules/employees/employees.controller.js

import { employeesListState, resetEmployeesListState } from './employees.state.js';
import { insertEmployees, fillEmployeesForm, renderEmployeePrivileges, DOMRefs, rewriteModalElements, resetEmployeesFilters } from './employees.dom.js';
import { createPagination } from '../../pagination/pagination.controller.js';
import { validateEmployee, mapEmployeeForm } from './employees.logic.js';
import { getActiveEmployees, postEmployee, putEmployee, getRoles, patchEmployee, addPrivilegeToEmployee, removePrivilegeFromEmployee } from './employees.service.js';
import { initEmployeeEvents } from './employees.events.js';
import { showMessage, toggleModal, setFormReadOnly, hideElement, showElement, disableElement, removeDisable, fillSelect, createModuleInitializer, qsa } from '../../utils/dom.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';
import { handleApiError } from '../../utils/api.utils.js';

/* ===============================
   CARGA DE EMPLEADOS
================================ */

const STATUS = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };

const employeePrivilegesState = {
    selectedEmployee: null,
    allPrivileges: []
};

const getAllPrivilegesFromRoles = (roles) => {
    if (!Array.isArray(roles)) {
        return [];
    }

    const adminRole = roles.find(role => role.roleName === 'Administrador');
    const privilegesFromAdmin = adminRole
        ? (adminRole.privileges || adminRole.privilegeList || adminRole.rolePrivileges || [])
        : null;

    if (Array.isArray(privilegesFromAdmin) && privilegesFromAdmin.length > 0) {
        return privilegesFromAdmin;
    }

    const privilegeCandidates = roles.flatMap(role => {
        return [
            ...(Array.isArray(role.privileges) ? role.privileges : []),
            ...(Array.isArray(role.privilegeList) ? role.privilegeList : []),
            ...(Array.isArray(role.rolePrivileges) ? role.rolePrivileges : [])
        ];
    });

    const uniquePrivileges = [];
    const seenIds = new Set();
    privilegeCandidates.forEach(privilege => {
        if (privilege && privilege.idPrivilege && !seenIds.has(privilege.idPrivilege)) {
            seenIds.add(privilege.idPrivilege);
            uniquePrivileges.push(privilege);
        }
    });

    return uniquePrivileges;
};

const updateEmployeeInList = (updatedEmployee) => {
    employeesListState.list = employeesListState.list.map(employee =>
        employee.idEmployee === updatedEmployee.idEmployee ? updatedEmployee : employee
    );
};

const getSelectedEmployee = () => employeePrivilegesState.selectedEmployee;

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
    const options = [
        {
            label: 'Actualizar empleado',
            privilege: 'WRITE_EMPLOYEES',
            onClick: () => editEmployee(employee)
        },
        {
            label: 'Editar permisos',
            privilege: 'WRITE_EMPLOYEES',
            onClick: () => openEmployeePrivilegesModal(employee)
        },
        {
            label: 'Ver detalles',
            onClick: () => viewEmployee(employee)
        }
    ];

    if (employee.roleName !== 'Administrador') {
        options.push({
            label: employee.user.status === STATUS.ACTIVE
                ? 'Desactivar empleado'
                : 'Activar empleado',
            privilege: 'WRITE_EMPLOYEES',
            onClick: () =>
                toggleEmployeeStatus(
                    employee.user.idUser,
                    employee.user.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE
                )
        });
    }

    showFloatingMenu(event, options);
};

/* ===============================
   EDITAR / VER
================================ */

const editEmployee = (employee) => {
    employeesListState.selectedId = employee.idEmployee;
    fillEmployeesForm(employee);
    rewriteModalElements(DOMRefs.refs.btnAddEmployee, DOMRefs.refs.titleModal, 'Actualizar');
    setFormReadOnly('#frmEmployees', false);
    disableElement(DOMRefs.refs.txtUsername);
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

const openEmployeePrivilegesModal = async (employee) => {
    employeePrivilegesState.selectedEmployee = employee;
    if (employeesListState.roles.length === 0) {
        await loadRoles();
    }
    employeePrivilegesState.allPrivileges = getAllPrivilegesFromRoles(employeesListState.roles);

    DOMRefs.refs.employeePrivilegesName.textContent = employee.fullName;
    DOMRefs.refs.employeePrivilegesRole.textContent = employee.roleName;
    renderEmployeePrivileges(
        employee,
        employeePrivilegesState.allPrivileges,
        DOMRefs.refs.employeePrivilegesList,
        DOMRefs.refs.employeePrivilegeButtons,
        onRemoveEmployeePrivilege,
        onAddEmployeePrivilege
    );

    toggleModal(DOMRefs.refs.modalEmployeePrivileges, true);
};

const onClosePrivilegesModal = () => {
    employeePrivilegesState.selectedEmployee = null;
    toggleModal(DOMRefs.refs.modalEmployeePrivileges);
};

const onAddEmployeePrivilege = async (privilege) => {
    const employee = getSelectedEmployee();
    if (!employee) return;

    const controls = qsa('#modalEmployeePrivileges button');
    controls.forEach(disableElement);
    try {
        await addPrivilegeToEmployee(employee.idEmployee, privilege.idPrivilege);

        const updatedEmployee = {
            ...employee,
            directPrivileges: [...(employee.directPrivileges || []), privilege]
        };
        employeePrivilegesState.selectedEmployee = updatedEmployee;
        updateEmployeeInList(updatedEmployee);

        await showMessage('Éxito', 'Permiso agregado correctamente.', 'success', true);
        renderEmployeePrivileges(
            updatedEmployee,
            employeePrivilegesState.allPrivileges,
            DOMRefs.refs.employeePrivilegesList,
            DOMRefs.refs.employeePrivilegeButtons,
            onRemoveEmployeePrivilege,
            onAddEmployeePrivilege
        );
    } catch (error) {
        await handleApiError(error, 'No se pudo agregar el permiso al empleado. Por favor, inténtalo de nuevo.');
    } finally {
        controls.forEach(removeDisable);
    }
};

const onRemoveEmployeePrivilege = async (privilege) => {
    const employee = getSelectedEmployee();
    if (!employee) return;

    const controls = qsa('#modalEmployeePrivileges button');
    controls.forEach(disableElement);
    try {
        await removePrivilegeFromEmployee(employee.idEmployee, privilege.idPrivilege);

        const updatedEmployee = {
            ...employee,
            directPrivileges: (employee.directPrivileges || []).filter(p => p.idPrivilege !== privilege.idPrivilege)
        };
        employeePrivilegesState.selectedEmployee = updatedEmployee;
        updateEmployeeInList(updatedEmployee);

        await showMessage('Éxito', 'Permiso eliminado correctamente.', 'success', true);
        renderEmployeePrivileges(
            updatedEmployee,
            employeePrivilegesState.allPrivileges,
            DOMRefs.refs.employeePrivilegesList,
            DOMRefs.refs.employeePrivilegeButtons,
            onRemoveEmployeePrivilege,
            onAddEmployeePrivilege
        );
    } catch (error) {
        await handleApiError(error, 'No se pudo eliminar el permiso del empleado. Por favor, inténtalo de nuevo.');
    } finally {
        controls.forEach(removeDisable);
    }
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
    initEmployeeEvents({ Refs, onSubmitEmployee, onSearchEmployee, onCloseModal, onOpenModal, onClosePrivilegesModal });
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
