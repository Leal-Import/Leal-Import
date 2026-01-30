// modules/employees/employees.view.js
import { fillForm, toggleModal, $, fillSelect } from '../../utils/dom.js';

const modalEmployees = $('modalEmployees');

export function fillEmployeesForm(employee, text) {
    fillForm('#frmEmployees', {
        txtFullName: employee.fullName,
        txtEmployeeEmail: employee.email,
        txtEmployeePhone: employee.phoneEmployee,
        txtUsername: employee.username.username,
        cmbUserRole: employee.idRole
    });
    $('btnAddEmployee').value = text;
    modalEmployees.querySelector('.titleModal').textContent = text;
    toggleModal(modalEmployees, true);
}

export function renderRolesSelects(roles) {
    fillSelect('cmbUserRole', roles, 'idRole', 'roleName', null, 'Selecciona un rol');
    fillSelect('cmbSearchByRole', roles, 'idRole', 'roleName', null, 'Selecciona un rol');
}

export function insertEmployees(container, employees, onActions) {
    container.innerHTML = '';

    if (!employees || employees.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');

        td.colSpan = 5;
        td.className = 'no-data-message';
        td.textContent = 'No hay datos disponibles';

        tr.appendChild(td);
        container.appendChild(tr);
        return;
    }

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
}

/* ======================
   Helpers internos DOM
====================== */

function createCell(text) {
    const td = document.createElement('td');
    td.textContent = text ?? '';
    return td;
}

function createActionsCell(employee, onActions) {
    const td = document.createElement('td');
    const button = document.createElement('button');

    button.className = 'actionButton';
    button.type = 'button';
    button.textContent = '⋯';

    button.addEventListener('click', e => onActions(e, employee));

    td.appendChild(button);
    return td;
}
