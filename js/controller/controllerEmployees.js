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
    putEmployee,
    patchEmployee
} from '../service/serviceEmployees.js';

import { createPagination } from '../pagination.js'

const modalEmployees = document.getElementById("modalEmployees");
const frmEmployees = document.getElementById("frmEmployees");
const txtPhone = document.getElementById("txtEmployeePhone");
const btnAddEmployee = document.getElementById("btnAddEmployee");
const titleModal = document.querySelector(".titleModal");
const txtSearchData = document.getElementById("txtSearchData");
const selectSearchRoles = document.getElementById("cmbSearchByRole");
const cmbSearchByStatus = document.getElementById("cmbSearchByStatus");

// Configurar el modal para agregar empleados
setupModal("#OpenModalEmployees", "#modalEmployees", "#closeAddEmployee", "#frmEmployees", "Agregar empleado");

let loadEmployees = async ({ page, size, filters }) => {
    try {
        const data = await getActiveEmployees(
            page - 1,           // backend normalmente es 0-based
            size,
            filters.search || '',
            filters.role || '',
            filters.status || ''
        );
        insertEmployees(data.content);
        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1, // volvemos a 1-based
            size: data.page.size
        });
    } catch (error) {
        showMessage("Error critico", error, "error")
    }
}

const pagination = createPagination({
    initialSize: 15,
    onChange: loadEmployees
});


let currentId = null;
let searchTimeout = null;

document.addEventListener("DOMContentLoaded", async () => {
    await loadRolesSelect();
    pagination.update({});
});


let filterData = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        pagination.update({
            page: 1,
            filters: {
                search: txtSearchData.value.trim(),
                role: selectSearchRoles.value,
                status: cmbSearchByStatus.value
            }
        });
    }, 1500);
}

txtSearchData.addEventListener('input', () => {
    filterData();
})

selectSearchRoles.addEventListener('change', async () => {
    filterData();
})

cmbSearchByStatus.addEventListener('change', () => {
    filterData();
})

let insertEmployees = (employees) => {
    const fragment = document.createDocumentFragment();
    const container = document.getElementById("employeesTableBody");
    container.innerHTML = "";
    if (employees.length == 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5; // Número de columnas de tu tabla
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message"); // opcional para estilos
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";
        document.querySelector('.containerTable table').style.height = "100%"
        tr.appendChild(td);
        fragment.appendChild(tr);
    } else {
        employees.forEach(employee => {
            const tr = document.createElement("tr");
            const tdName = document.createElement("td");
            const tdEmail = document.createElement("td");
            const tdPhone = document.createElement("td");
            const tdRole = document.createElement("td");
            const tdActions = document.createElement("td");

            tdName.textContent = employee.fullName;
            tdEmail.textContent = employee.email;
            tdPhone.textContent = employee.phoneEmployee;
            tdRole.textContent = employee.roleName || 'Error al cargar rol';
            let btnText = "";
            let status = "";
            if (employee.status == "T") {
                btnText = "Desactivar empleado";
                status = "F";
            } else {
                btnText = "Activar empleado";
                status = "T";
            }


            const actionButton = document.createElement('button');
            actionButton.textContent = '⋯';
            actionButton.classList.add('actionButton');
            tdActions.appendChild(actionButton);

            actionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                showFloatingMenu(event, [
                    { label: 'Editar empleado', onClick: () => editEmployee(employee), id: 'btnUpdateEmp' },
                    { label: btnText, onClick: () => disable(employee.username, status), id: 'btnDeleteEmp' },
                    { label: 'Ver detalles', onClick: () => viewEmployee(employee), id: 'btnViewEmp' }
                ]);
            });

            tr.append(tdName, tdEmail, tdPhone, tdRole, tdActions);
            fragment.appendChild(tr);
        });
    }
    container.appendChild(fragment);
}

let editEmployee = (employee) => {
    currentId = employee.idEmployee;
    console.log(employee)
    fillForm('#frmEmployees', {
        txtFullName: employee.fullName,
        txtEmployeeEmail: employee.email,
        txtEmployeePhone: employee.phoneEmployee,
        txtUsername: employee.username,
        cmbUserRole: employee.idRole
    });
    btnAddEmployee.value = "Actualizar empleado";
    titleModal.textContent = "Actualizar empleado";
    toggleModal(modalEmployees, true);
}

let disable = async (username, status) => {
    let message = "";
    if(status == "T") message = "Empleado activado con exito";
    else message = "Empleado desactivado con exito";
    const response = await patchEmployee(username, status);
    if(response) await showMessage("Empleado", message, "success");
    pagination.update({});
}

let viewEmployee = (employee) => {
    enableFormUI("#frmEmployees"); // ensure consistent state before disabling
    fillForm('#frmEmployees', {
        txtFullName: employee.fullName,
        txtEmployeeEmail: employee.email,
        txtEmployeePhone: employee.phoneEmployee,
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
        phoneEmployee: txtEmployeePhone,
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
        pagination.update({});
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
        fillSelect('cmbUserRole', rolesList, 'idRole', 'roleName', "Selecciona un rol");
        fillSelect('cmbSearchByRole', rolesList, 'idRole', 'roleName', "Buscar por rol");
    } catch (error) {
        console.error('Error al cargar roles en el select:', error);
    }
}

