import {
    setupModal,
    getInputsValues,
    showMessage,
    isValidEmail,
    isValidPhone,
    highlightAndFocus,
    formatPhoneNumber,
    fillSelect,
    showFloatingMenu
} from '../utils.js';

import {
    getActiveEmployees,
    postEmployee,
    getRoles
} from '../service/serviceEmployees.js';

const modalEmployees = document.getElementById("modalEmployees");
const frmEmployees = document.getElementById("frmEmployees");
const txtPhone = document.getElementById("txtEmployeePhone");

// Configurar el modal para agregar empleados
setupModal("#OpenModalEmployees", "#modalEmployees", "#closeAddEmployee", "#frmEmployees");

document.addEventListener("DOMContentLoaded", () => {
    /* Eventos al cargar la pagina */
    loadRolesSelect();
    loadEmployees();
})

let loadEmployees = async () => {
    try {
        const data = await getActiveEmployees();
        insertEmployees(data);
    } catch (error) {
        showMessage("Error critico", error, "error")
    }
}

let insertEmployees = (employees) => {
    console.log(employees)
    const fragment = document.createDocumentFragment();
    const container = document.getElementById("employeesTableBody");
    container.innerHTML = "";
    employees.forEach(employee => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdEmail = document.createElement("td");
        const tdPhone = document.createElement("td");
        const tdRole = document.createElement("td");
        const tdActions = document.createElement("td");

        tdName.textContent = employee.fullName;
        tdEmail.textContent = employee.email;
        tdPhone.textContent = employee.phoneEmploye;
        tdRole.textContent = rolesList.find(r => r.idRole === employee.idRole)?.roleName || 'Error al cargar rol';

        const actionButton = document.createElement('button');
        actionButton.textContent = '⋯';
        actionButton.classList.add('actionButton');
        tdActions.appendChild(actionButton);

        actionButton.addEventListener('click', (event) => {
            event.stopPropagation();
            showFloatingMenu(event, [
                { label: 'Editar empleado', onClick: () => editEmployee(employee) },
                { label: 'Eliminar empleado', onClick: () => deleteEmployee(employee.id) },
                { label: 'Ver detalles', onClick: () => viewEmployee(employee.id) },
            ]);
        });

        tr.append(tdName, tdEmail, tdPhone, tdRole, tdActions);
        fragment.appendChild(tr);
    });
    container.appendChild(fragment);
}

txtPhone.addEventListener('input', () => {
    formatPhoneNumber(txtPhone);
})

frmEmployees.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = getInputsValues(frmEmployees);

    const {
        txtFullName,
        txtEmployeeEmail,
        txtEmployeePhone,
        cmbUserRole,
        txtUsername
    } = formData;

    if (!txtFullName || !txtEmployeeEmail || !txtEmployeePhone || !cmbUserRole || !txtUsername) {
        showMessage('Por favor, complete todos los campos requeridos.', 'Campos vacios', 'warning');
        return;
    }

    if (!isValidEmail(txtEmployeeEmail)) {
        highlightAndFocus(document.getElementById('txtEmployeeEmail'));
        showMessage('Por favor, escribir un email valido.', 'Email invalido', 'warning');
        return;
    }

    if (!isValidPhone(txtEmployeePhone)) {
        highlightAndFocus(txtPhone);
        showMessage('Por favor, escribir un numero telefonico valido.', 'Teléfono invalido', 'warning');
        return;
    }

    const employeeData = {
        fullName: txtFullName,
        email: txtEmployeeEmail,
        phoneEmploye: txtEmployeePhone,
        username: txtUsername,
        idRole: cmbUserRole,
    };

    try {
        const result = await postEmployee(employeeData);
        showMessage('¡Empleado agregado con éxito!', 'Exito', 'success');
        loadEmployees();

    } catch (error) {
        console.error("Error al agregar empleado:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el empleado.';
        showMessage(errorMessage, 'error', 'error');
    } finally {
        modalEmployees.classList.add('hide');
        frmEmployees.reset();
    }

});

let rolesList = [];
let loadRolesSelect = async () => {
    try {
        const roles = await getRoles();
        rolesList = roles; // Guardamos para mapear luego
        fillSelect('cmbUserRole', rolesList, 'idRole', 'roleName');
    } catch (error) {
        console.error('Error al cargar roles en el select:', error);
    }
}