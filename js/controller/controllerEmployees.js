import {
    setupModal,
    getInputsValues,
    showMessage,
    isValidEmail,
    isValidPhone,
    highlightAndFocus,
    formatPhoneNumber,
    fillSelect,
    showFloatingMenu,
    toggleModal,
    fillForm,
    enableFormUI,
    setFormReadOnly
} from '../utils.js';

import {
    getActiveEmployees,
    postEmployee,
    getRoles,
    putEmployee
} from '../service/serviceEmployees.js';

const modalEmployees = document.getElementById("modalEmployees");
const frmEmployees = document.getElementById("frmEmployees");
const txtPhone = document.getElementById("txtEmployeePhone");
const btnAddEmployee = document.getElementById("btnAddEmployee");
const titleModal = document.querySelector(".titleModal");

// Configurar el modal para agregar empleados
setupModal("#OpenModalEmployees", "#modalEmployees", "#closeAddEmployee", "#frmEmployees", "Agregar empleado");

let currentId = null;

document.addEventListener("DOMContentLoaded", async () => {
    /* Eventos al cargar la pagina */
    await loadRolesSelect();
    await loadEmployees();
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
                { label: 'Editar empleado', onClick: () => editEmployee(employee), id: 'btnUpdateEmp' },
                { label: 'Desactivar empleado', onClick: () => deleteEmployee(employee.idEmployee), id: 'btnDeleteEmp' },
                { label: 'Ver detalles', onClick: () => viewEmployee(employee), id: 'btnViewEmp' }
            ]);
        });

        tr.append(tdName, tdEmail, tdPhone, tdRole, tdActions);
        fragment.appendChild(tr);
    });
    container.appendChild(fragment);
}

let editEmployee = (employee) => {
    currentId = employee.idEmployee;
    fillForm('#frmEmployees', {
        txtFullName: employee.fullName,
        txtEmployeeEmail: employee.email,
        txtEmployeePhone: employee.phoneEmploye,
        txtUsername: employee.username,
        cmbUserRole: employee.idRole
    });
    btnAddEmployee.value = "Actualizar empleado";
    titleModal.textContent = "Actualizar empleado";
    toggleModal(modalEmployees, true);
}

let deleteEmployee = (employeeId) => {
    console.log("Eliminando empleado ID:", employeeId);
    // Podés mostrar un modal de confirmación aquí
}

let viewEmployee = (employee) => {
    enableFormUI("#frmEmployees"); // ensure consistent state before disabling
    fillForm('#frmEmployees', {
        txtFullName: employee.fullName,
        txtEmployeeEmail: employee.email,
        txtEmployeePhone: employee.phoneEmploye,
        txtUsername: employee.username,
        cmbUserRole: employee.idRole
    });
    setFormReadOnly("#frmEmployees", true);
    if (titleModal) titleModal.textContent = "Detalles del empleado";
    toggleModal(modalEmployees, true);
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
        if (currentId != null) {
            await putEmployee(employeeData, currentId);
            showMessage('¡Empleado actualizado con éxito!', 'Exito', 'success');
        } else {
            await postEmployee(employeeData);
            showMessage('¡Empleado agregado con éxito!', 'Exito', 'success');
        }
        loadEmployees();
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar el empleado.';
        showMessage(errorMessage, 'error', 'error');
    } finally {
        modalEmployees.classList.add('hide');
        btnAddEmployee.value = "Agregar empleado";
        titleModal.textContent = "Agregar nuevo empleado";
        currentId = null;
    }

});

let rolesList = [];
let loadRolesSelect = async () => {
    try {
        const roles = await getRoles();
        console.log(roles);
        rolesList = roles; // Guardamos para mapear luego
        fillSelect('cmbUserRole', rolesList, 'idRole', 'roleName');
    } catch (error) {
        console.error('Error al cargar roles en el select:', error);
    }
}
