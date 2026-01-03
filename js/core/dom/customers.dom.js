import { fillForm, toggleModal, $ } from "../../utils/dom.js";


export function insertCustomers(container, customers, onActions) {
    const fragment = document.createDocumentFragment();
    if (!container) return;
    container.innerHTML = "";

    if (customers.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
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

            actionButton.addEventListener('click', (e) => {
                onActions(e, customer);
            });

            tr.append(tdName, tdDui, tdPhone, tdActions);
            fragment.appendChild(tr);
        });
    }
    container.appendChild(fragment);
}

export function fillCustomerForm(customer, text) {
    fillForm('#frmCustomers', {
        txtFullName: customer.fullName,
        txtCustomerDUI: customer.dui,
        txtCustomerPhone: customer.personalPhone
    });
    $('btnAddNewCustomer').value = text;
    modalCustomers.querySelector('.titleModal').textContent = text;
    toggleModal(modalCustomers, true);
}

export function resetCustomerForm(frm, modal) {
    frm.reset();
    modal.style.display = 'none';
}
