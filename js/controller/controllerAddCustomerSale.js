import { getCustomers } from "../service/customers.service.js";

const params = new URLSearchParams(window.location.search);

const type = params.get("type");

document.addEventListener("DOMContentLoaded", async () => {
    await loadCustomers();
})

let loadCustomers = async () => {
    const customers = await getCustomers();
    insertCustomers(customers.content);
}

let insertCustomers = (customers) => {
    const container = document.querySelector(".containerCustomers");
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (customers.length == 0) {
        const div = document.createElement("div");

        div.textContent = "No hay datos disponibles";
        div.classList.add("no-data-message"); // opcional para estilos
        div.style.textAlign = "center";
        div.style.padding = "15px";
        div.style.color = "#777";

        fragment.appendChild(div);
    } else {
        customers.forEach(customer => {
            const customerLink = document.createElement("a");
            const customerName = document.createElement("h2");
            const dui = document.createElement("span");
            const phone = document.createElement("phone");

            if (type == "sparePart") customerLink.href = `sparePartSale.html?idCustomer=${customer.idCustomer}&customerName=${customer.fullName}`;
            else if (type == "vehicle") customerLink.href = `vehicleSale.html?idCustomer=${customer.idCustomer}&customerName=${customer.fullName}`;

            customerLink.classList.add("customer");
            customerName.classList.add("customerName");
            dui.classList.add("dui");
            phone.classList.add("phone");

            customerName.textContent = customer.fullName;
            dui.textContent = `Dui: ${customer.dui}`;
            phone.textContent = `Telefono: ${customer.personalPhone}`;

            customerLink.append(customerName, dui, phone);
            fragment.appendChild(customerLink);
        });
    }

    container.appendChild(fragment);
}