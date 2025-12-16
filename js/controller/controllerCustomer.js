import {
    getCustomers,
    postCustomer,
    putCustomer
} from '../service/serviceCustomers.js';
import {
    setupModal,
    getInputsValues,
    showMessage,
    showFloatingMenu,
    isValidPhone,
    highlightAndFocus,
    formatPhoneNumber,
    fillForm,
    toggleModal,
    enableFormUI,
    setFormReadOnly,
    formatDUIInput
} from '../utils.js';

import { createPagination } from '../pagination.js'

const modalCustomers = document.getElementById("modalCustomers");
const frmCustomers = document.getElementById("frmCustomers");
const txtPhone = document.getElementById("txtCustomerPhone");
const btnAddCustomer = document.getElementById("btnAddNewCustomer");
const titleModal = modalCustomers?.querySelector('.titleModal');
const txtCustomerDUI = document.getElementById("txtCustomerDUI");
const txtSearchCustomer = document.getElementById("txtSearchData");

let searchTimeout = null;

txtCustomerDUI.addEventListener('input', () => {
    formatDUIInput(txtCustomerDUI);
});

// Configurar el modal para agregar clientes
setupModal("#openModalCustomer", "#modalCustomers", "#closeAddCustomer", "#frmCustomers", "Agregar cliente");

let currentId = null;

let loadCustomers = async ({ page, size, filters }) => {
    try {
        const data = await getCustomers(
            page - 1,
            size,
            filters.search || ''
        );
        insertCustomers(data.content);
        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1, // volvemos a 1-based
            size: data.page.size
        });
    } catch (error) {
        showMessage("Error crítico", error.message || error, "error");
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    pagination.update({});
});

txtSearchCustomer.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        pagination.update({
            page: 1,
            filters: {
                search: txtSearchCustomer.value.trim()
            }
        })
    }, 1500)
})

const pagination = createPagination({ initialSize: 10, onChange: loadCustomers });

let insertCustomers = (customers) => {
    const fragment = document.createDocumentFragment();
    const container = document.getElementById("CustomersTableBody");
    if (!container) return;
    container.innerHTML = "";

    if (customers.length == 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5; // Número de columnas de tu tabla
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message"); // opcional para estilos
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);
        document.querySelector(".table").style.height = "100%";
    } else {
        customers.forEach(customer => {
            const tr = document.createElement("tr");
            const tdName = document.createElement("td");
            const tdDui = document.createElement("td");
            const tdPhone = document.createElement("td");
            const tdActions = document.createElement("td");

            tdName.textContent = customer.fullName;
            tdDui.textContent = customer.dui;
            tdPhone.textContent = customer.personalPhone;

            const actionButton = document.createElement('button');
            actionButton.textContent = '⋯';
            actionButton.classList.add('actionButton');
            tdActions.appendChild(actionButton);

            const custId = customer.idClient ?? customer.id ?? Math.random().toString(36).slice(2);

            actionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                // showFloatingMenu en utils.js genera sufijo en ids, maneja posicion y limpieza
                showFloatingMenu(event, [
                    { label: 'Editar cliente', onClick: () => editCustomer(customer), id: `btnUpdateCust-${custId}` },
                    { label: 'Desactivar cliente', onClick: () => deleteCustomer(customer.idClient), id: `btnDeleteCust-${custId}` },
                    { label: 'Ver detalles', onClick: () => viewCustomer(customer), id: `btnViewCust-${custId}` }
                ]);
            });

            tr.append(tdName, tdDui, tdPhone, tdActions);
            fragment.appendChild(tr);
        });

    }
    container.appendChild(fragment);
};

let editCustomer = (customer) => {
    currentId = customer.idClient;
    btnAddCustomer.value = "Actualizar cliente";
    if (titleModal) titleModal.textContent = "Actualizar cliente";
    fillData(customer);
};

let fillData = (customer) => {
    enableFormUI('#frmCustomers');
    fillForm('#frmCustomers', {
        txtFullName: customer.fullName,
        txtCustomerDUI: customer.dui,
        txtCustomerPhone: customer.personalPhone
    });
    toggleModal(modalCustomers, true);
}

let deleteCustomer = (customerId) => {
    if (!customerId) return;
    if (!confirm('¿Desea desactivar este cliente?')) return;
    // TODO: llamar servicio para desactivar/eliminar
    console.log('Desactivar cliente id:', customerId);
    showMessage('Funcionalidad no implementada aún', 'Info', 'info');
};

let viewCustomer = (customer) => {
    fillData(customer);
    setFormReadOnly('#frmCustomers', true);
    if (titleModal) titleModal.textContent = "Detalles del cliente";
};

txtPhone.addEventListener('input', () => {
    formatPhoneNumber(txtPhone);
});

frmCustomers.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = getInputsValues(frmCustomers);

    const {
        txtFullName,
        txtCustomerDUI,
        txtCustomerPhone
    } = formData;

    // Validaciones según DTO
    const nameTrim = txtFullName || '';
    if (!nameTrim || nameTrim.length < 3 || nameTrim.length > 75) {
        highlightAndFocus(document.getElementById('txtFullName'));
        showMessage('El nombre debe tener entre 3 y 75 caracteres.', 'Nombre inválido', 'warning');
        return;
    }
    // nombre solo letras, espacios y acentos y apóstrofes
    const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’ ]{3,75}$/;
    if (!namePattern.test(nameTrim)) {
        highlightAndFocus(document.getElementById('txtFullName'));
        showMessage('El nombre contiene caracteres no válidos.', 'Nombre inválido', 'warning');
        return;
    }

    // DUI formato XXXXXXXX-Y
    const dui = txtCustomerDUI || '';
    const duiPattern = /^[0-9]{8}-[0-9]$/;
    if (!duiPattern.test(dui)) {
        highlightAndFocus(document.getElementById('txtCustomerDUI'));
        showMessage('El DUI debe tener el formato XXXXXXXX-Y', 'DUI inválido', 'warning');
        return;
    }

    // Teléfono: usar isValidPhone (quita guiones/espacios internamente)
    if (!isValidPhone(txtCustomerPhone || '')) {
        highlightAndFocus(document.getElementById('txtCustomerPhone'));
        showMessage('Número de teléfono inválido (9 dígitos, comienza con 2,6 o 7).', 'Teléfono inválido', 'warning');
        return;
    }

    const customerData = {
        fullName: txtFullName,
        dui: txtCustomerDUI,
        personalPhone: txtCustomerPhone
    };

    try {
        if (currentId != null) {
            await putCustomer(customerData, currentId);
            showMessage('Cliente actualizado con éxito', 'Éxito', 'success');
        } else {
            await postCustomer(customerData);
            showMessage('Cliente agregado con éxito', 'Éxito', 'success');
        }
        pagination.update({});
    } catch (error) {
        console.error('Error al guardar cliente:', error);
        showMessage(error.message || 'Error desconocido', 'Error', 'error');
    } finally {
        toggleModal(modalCustomers, false);
        frmCustomers.reset();
        enableFormUI('#frmCustomers');
        btnAddCustomer.value = "Agregar Clientes";
        if (titleModal) titleModal.textContent = "Agregar cliente";
        currentId = null;
    }
});



