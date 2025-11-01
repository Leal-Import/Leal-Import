import {
    setupModal,
    getInputsValues,
    showMessage,
    isValidEmail,
    isValidPhone,
    highlightAndFocus,
    formatPhoneNumber
} from '../utils.js';

import {
    getActiveEmployees,
    postEmployee
} from '../service/serviceEmployees.js';

const modalEmployees = document.getElementById("modalEmployees");
const frmEmployees = document.getElementById("frmEmployees");
const txtPhone = document.getElementById("txtEmployeePhone");
// Configurar el modal para agregar empleados
setupModal("#OpenModalEmployees", "#modalEmployees", "#closeAddEmployee", "#frmEmployees");

document.addEventListener("DOMContentLoaded", () => {
    /* Eventos al cargar la pagina */
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
        tdEmail.textContent = employee.employeeEmail;
        tdPhone.textContent = employee.employeePhone;
        tdRole.textContent = employee.employeeRole;
        tr.append(tdName, tdEmail, tdPhone, tdRole);
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
        employeeEmail: txtEmployeeEmail,
        employeePhone: txtEmployeePhone,
        employeeRole: cmbUserRole,
        username: txtUsername,
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