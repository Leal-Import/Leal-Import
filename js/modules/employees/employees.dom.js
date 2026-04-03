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
    cmbSearchByStatus.value = '';
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
        txtUsername: employee.username.username,
        cmbUserRole: employee.idRole
    });
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

