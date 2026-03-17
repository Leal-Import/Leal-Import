import { fillForm, $, qs, qsa } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            CustomersTableBody: $('CustomersTableBody'),
            modalCustomers: $('modalCustomers'),
            frmCustomers: $('frmCustomers'),
            loaderAddCustomer: $("loaderAddCustomer"),
            loaderCustomers: $("loaderCustomers"),
            btnAddNewCustomer: $("btnAddNewCustomer"),
            txtCustomerPhone: $("txtCustomerPhone"),
            txtCustomerDUI: $("txtCustomerDUI"),
            txtSearchData: $("txtSearchData"),
            cmbSearchByStatus: $("cmbSearchByStatus"),
            tableCustomers: qs(".table"),
            btnCloseModalCustomer: $("btnCloseModalCustomer"),
            btnOpenModalCustomer: $("btnOpenModalCustomer"),
            titleModal: qs(".titleModal"),
            campsModal: qsa("#frmCustomers .txtInputs")
        };
        return this.refs;
    }
};

export const insertCustomers = (container, customers, onActions, tableCustomers) => {
    const fragment = document.createDocumentFragment();
    if (!container) return;
    container.innerHTML = "";

    if (customers.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        tr.appendChild(td);
        fragment.appendChild(tr);
        tableCustomers.classList.add("noDataMessage");
    } else {
        tableCustomers.classList.remove("noDataMessage");
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

            actionButton.addEventListener('click', (e) => onActions(e, customer));

            tr.append(tdName, tdDui, tdPhone, tdActions);
            fragment.appendChild(tr);
        });
    }
    container.appendChild(fragment);
};

export const fillCustomerForm = (customer) => {
    fillForm('#frmCustomers', {
        txtFullName: customer.fullName,
        txtCustomerDUI: customer.dui,
        txtCustomerPhone: customer.personalPhone
    });
};

export const rewriteModalText = (button, title, text) => {
    title.textContent = `${text} cliente`;
    button.querySelector("span").textContent = text;
};
