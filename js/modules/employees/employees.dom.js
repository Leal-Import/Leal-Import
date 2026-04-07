// modules/employees/employees.view.js
import { fillForm, $, qs, qsa } from '../../utils/dom.js';

export const DOMRefs = {
    refs: {},
    init() {
        this.refs = {
            employeesTableBody: $('employeesTableBody'),
            modalEmployees: $('modalEmployees'),
            frmEmployees: $('frmEmployees'),
            loaderEmployees: $("loaderEmployees"),
            btnCloseModalEmployee: $("btnCloseModalEmployee"),
            modalEmployeePrivileges: $('modalEmployeePrivileges'),
            btnCloseModalEmployeePrivileges: $("btnCloseModalEmployeePrivileges"),
            employeePrivilegesName: $("employeePrivilegesName"),
            employeePrivilegesRole: $("employeePrivilegesRole"),
            employeePrivilegesList: $("employeePrivilegesList"),
            employeePrivilegeButtons: $("employeePrivilegeButtons"),
            btnOpenModalEmployees: $("btnOpenModalEmployees"),
            txtEmployeePhone: $('txtEmployeePhone'),
            txtSearchData: $('txtSearchData'),
            cmbSearchByRole: $("cmbSearchByRole"),
            cmbSearchByStatus: $("cmbSearchByStatus"),
            btnAddEmployee: $("btnAddEmployee"),
            btnAddEmployeeLoader: $("btnAddEmployeeLoader"),
            titleModal: qs('.titleModal'),
            campsModal: qsa('#frmEmployees .txtInputs')
        };
        return this.refs;
    }
};

export const resetEmployeesFilters = (refs) => {
    const { txtSearchData, cmbSearchByRole, cmbSearchByStatus } = refs;
    txtSearchData.value = '';
    cmbSearchByRole.value = '';
    cmbSearchByStatus.value = 'ACTIVE';
};

const createCell = (text) => {
    const td = document.createElement('td');
    td.textContent = text ?? '';
    return td;
};

const createActionsCell = (employee, onActions) => {
    const td = document.createElement('td');
    const button = document.createElement('button');

    button.className = 'actionButton';
    button.type = 'button';
    button.textContent = '⋯';

    button.addEventListener('click', e => onActions(e, employee));

    td.appendChild(button);
    return td;
};

export const fillEmployeesForm = (employee) => {
    fillForm('#frmEmployees', {
        txtFullName: employee.fullName,
        txtEmployeeEmail: employee.email,
        txtEmployeePhone: employee.phoneEmployee,
        txtUsername: employee.user.username,
        cmbUserRole: employee.idRole
    });
};

export const renderEmployeePrivileges = (employee, allPrivileges, privilegesEl, buttonsEl, onRemove, onAdd) => {
    const directPrivileges = employee && Array.isArray(employee.directPrivileges) ? employee.directPrivileges : [];
    const currentPrivilegeIds = directPrivileges.map(privilege => privilege.idPrivilege).filter(Boolean);
    const availablePrivileges = Array.isArray(allPrivileges)
        ? allPrivileges.filter(privilege => !currentPrivilegeIds.includes(privilege.idPrivilege))
        : [];

    privilegesEl.classList.toggle('empty', directPrivileges.length === 0);
    privilegesEl.innerHTML = '';

    if (!employee) {
        privilegesEl.textContent = 'Selecciona un empleado para ver sus permisos.';
    } else if (directPrivileges.length === 0) {
        privilegesEl.textContent = 'Este empleado no tiene permisos directos asignados.';
    } else {
        const fragment = document.createDocumentFragment();
        directPrivileges.forEach(privilege => {
            const item = document.createElement('div');
            item.className = 'privilegeTag';

            const text = document.createElement('span');
            text.textContent = privilege.name;

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btnRemovePrivilege';
            removeButton.title = `Remover ${privilege.name}`;
            removeButton.innerHTML = '&times;';
            removeButton.addEventListener('click', () => onRemove(privilege));

            item.appendChild(text);
            item.appendChild(removeButton);
            fragment.appendChild(item);
        });
        privilegesEl.appendChild(fragment);
    }

    buttonsEl.innerHTML = '';
    if (!employee) {
        return;
    }

    if (availablePrivileges.length === 0) {
        const note = document.createElement('div');
        note.className = 'modalNewPasswordSubtitle';
        note.textContent = 'No hay permisos disponibles para asignar.';
        buttonsEl.appendChild(note);
        return;
    }

    const fragment = document.createDocumentFragment();
    availablePrivileges.forEach(privilege => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btnSecondary';
        button.textContent = `+ ${privilege.name}`;
        button.addEventListener('click', () => onAdd(privilege));
        fragment.appendChild(button);
    });
    buttonsEl.appendChild(fragment);
};

export const rewriteModalElements = (button, title, text) => {
    title.textContent = `${text} Empleado`;
    button.querySelector("span").textContent = text;
};

export const insertEmployees = (container, employees, onActions) => {
    container.innerHTML = '';

    if (!employees || employees.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');

        td.colSpan = 5;
        td.textContent = 'No hay datos disponibles';

        tr.appendChild(td);
        container.closest(".table").classList.add("noDataMessage");
        container.appendChild(tr);
        return;
    }
    container.closest(".table").classList.remove("noDataMessage");

    const fragment = document.createDocumentFragment();

    employees.forEach(emp => {
        const tr = document.createElement('tr');

        tr.appendChild(createCell(emp.fullName));
        tr.appendChild(createCell(emp.email));
        tr.appendChild(createCell(emp.phoneEmployee));
        tr.appendChild(createCell(emp.roleName));
        tr.appendChild(createActionsCell(emp, onActions));

        fragment.appendChild(tr);
    });

    container.appendChild(fragment);
};

