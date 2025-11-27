import { getSpareParts } from '../service/serviceSpareParts.js'
import {
    formatWithCommas,
    allowDecimal
} from '../utils.js'

const params = new URLSearchParams(window.location.search);
const customerName = params.get('customerName') || "Nombre del cliente";
const customerId = params.get('idCustomer') || null;
const newPartId = params.get('sparePartId') || null;
const newPartName = params.get('sparePartName') || null;
const suggestedPrice = params.get('suggestedPrice') || null;
const saleKey = `saleState_cliente_${customerId}`;

const btnAddPart = document.getElementById("btnAddPart");


let selectedIds = [];

document.addEventListener("DOMContentLoaded", async () => {
    const saved = loadSaleState();
    if (saved.selectedParts && saved.payments && saved.notes !== undefined) {
        loadSavedData(saved.selectedParts, saved.payments, saved.notes);
    }

    await loadSpareParts();
    document.getElementById("customerName").textContent = customerName;
    const firstAmount = document.querySelector('.amounts .amountInput');
    allowDecimal(firstAmount);
    if (firstAmount) {
        firstAmount.addEventListener("input", managePaymentsAndCalculateDebt);
        firstAmount.closest('.containerAmount').setAttribute('data-index', '1');
    }
})

document.getElementById("txtNotes")?.addEventListener("input", saveSaleState);

let loadSavedData = (parts, payments, notes) => {
    selectedIds = parts.map(p => p.id);

    parts.forEach(part => {
        createRowSparePart(part.id, part.name, part.price);
    });

    if(newPartId && !selectedIds.includes(newPartId)) {
        selectedIds.push(newPartId);
        createRowSparePart(newPartId, newPartName, suggestedPrice);
    }

    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = "";
    payments.forEach((payment, index) => {
        const div = document.createElement("div");
        div.classList.add("containerAmount");
        div.setAttribute("data-index", index + 1);
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Abono ${index + 1}`;
        input.classList.add("txtInputs", "amountInput");
        input.value = payment > 0 ? `$${formatWithCommas(payment)}` : "";
        allowDecimal(input);
        input.addEventListener("input", managePaymentsAndCalculateDebt);
        const select = document.createElement("select");
        select.classList.add("txtInputs", "paymentTypeSelect");
        div.append(input, select);
        amountContainer.appendChild(div);
    });
    const notesInput = document.getElementById("txtNotes");
    if (notesInput) notesInput.value = notes || "";
    managePaymentsAndCalculateDebt();
}

btnAddPart.addEventListener("click", (e) => {
    e.preventDefault();
    saveSaleState();
    window.location.href = `sparePartsDetails.html?sale=true&idCustomer=${customerId}&customerName=${encodeURIComponent(customerName)}`
});

let loadSpareParts = async () => {
    const spareParts = await getSpareParts();
    insertSpareParts(spareParts.content);
}

let insertSpareParts = (spareParts) => {
    const container = document.getElementById("tBodyInventory");
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (spareParts == 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message"); // opcional para estilos
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);
        document.querySelector(".table").style.height = "100%";
    } else {
        spareParts.forEach(sparePart => {
            const idSelected = selectedIds.some(id => id == sparePart.idSparePart);
            if (idSelected) return;

            const tr = document.createElement("tr");
            const tdImage = document.createElement("td");
            const image = document.createElement("img");
            const name = document.createElement("td");
            const cost = document.createElement("td");
            const suggesredPrice = document.createElement("td");
            const btnAddSparePart = document.createElement("button");

            image.src = sparePart.photoUrl;
            name.textContent = sparePart.nameSpareParts;
            cost.textContent = `$${formatWithCommas(sparePart.totalCost)}`;
            suggesredPrice.textContent = `$${formatWithCommas(sparePart.totalCost)}`; //Por el momento esto es totalCost

            tr.classList.add("tableRow");
            btnAddSparePart.classList.add("btnPrimary", "btnAddPart");
            image.classList.add("imgSparePart");

            btnAddSparePart.textContent = "+";

            tdImage.appendChild(image);

            tr.append(tdImage, name, cost, suggesredPrice, btnAddSparePart);
            fragment.appendChild(tr);

            btnAddSparePart.addEventListener("click", () => {
                selectedIds.push(sparePart.idSparePart);
                createRowSparePart(sparePart.idSparePart, sparePart.nameSpareParts, sparePart.totalCost);
                tr.remove();
                saveSaleState();
            })

        });
    }

    container.appendChild(fragment);
}

let createRowSparePart = (id, name, suggesredPrice) => {
    const rowNoData = document.querySelector(".rowNoData");
    const container = document.getElementById("tBodySelected");
    const tr = document.createElement("tr");
    const partName = document.createElement("td");
    const price = document.createElement("td");
    const btnTrash = document.createElement("btnTrash");
    const iconImg = document.createElement("img");

    iconImg.src = "../../media/appMedia/trashIcon.png";

    partName.textContent = name;
    price.textContent = `$${formatWithCommas(suggesredPrice)}`;
    if (rowNoData) rowNoData.remove();

    price.setAttribute("contenteditable", true)
    tr.setAttribute("data-id", id);

    partName.classList.add("sparePartName");
    price.classList.add("finalPrice");
    btnTrash.classList.add("btnTrash");
    tr.classList.add("tableRow");
    price.addEventListener("input", formatAndRestrictPrice)

    btnTrash.appendChild(iconImg);
    tr.append(partName, price, btnTrash);
    container.appendChild(tr);

    btnTrash.addEventListener("click", async () => {
        const deleteId = selectedIds.findIndex(idS => {
            return idS == id;
        });
        if (deleteId !== -1) selectedIds.splice(deleteId, 1);
        tr.remove();
        calculateTotal();
        await loadSpareParts();
        saveSaleState();
        if (container.children.length === 0) {
            const trNoData = document.createElement("tr");
            trNoData.classList.add("rowNoData");
            const tdNoData = document.createElement("td");
            tdNoData.classList.add("noDataMessage");
            tdNoData.colSpan = 3;
            tdNoData.textContent = "No hay repuestos seleccionados";
            trNoData.appendChild(tdNoData);
            container.appendChild(trNoData);
        }
    })
    calculateTotal();
}

function formatAndRestrictPrice(event) {
    const element = event.target;
    let value = element.textContent.replace(/[$,]/g, '').trim();

    if (value.length > 11) value = value.substring(0, 11);
    if (value.match(/[^\d.]/g)) value = value.replace(/[^\d.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');

    if (value === '' || value === '.') {
        element.textContent = '';
        calculateTotal();
        return;
    }

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
        element.textContent = `$${formatWithCommas(numericValue)}`;
    }

    calculateTotal();
    setCursorToEnd(element);
}

let calculateTotal = () => {
    let total = 0;
    const containerTotal = document.getElementById("containerTotal");
    const containerDue = document.getElementById("containerAmountDue");
    const prices = document.querySelectorAll("#tBodySelected .finalPrice");
    const totalText = document.getElementById("total");
    const dueText = document.getElementById("due");

    prices.forEach(priceElement => {
        const priceText = priceElement.textContent;
        const cleanValue = priceText.replace(/[$,]/g, "");
        const value = parseFloat(cleanValue) || 0;

        total += value;
    });

    const moneyPaid = calculatePaid();
    const due = total - moneyPaid;

    totalText.textContent = `$${formatWithCommas(total)}`;
    dueText.textContent = `$${formatWithCommas(due)}`;
    dueText.style.color = due > 0 ? 'var(--danger-color)' : 'var(--success-color)';


    if (total == 0) {
        containerDue.classList.remove("show");
        containerTotal.classList.remove("show");
    } else {
        containerDue.classList.add("show");
        containerTotal.classList.add("show");
    }

    return total;
}


let calculatePaid = () => {
    let totalPaid = 0;
    const amountInputs = document.querySelectorAll(".amounts .amountInput");

    amountInputs.forEach(input => {
        const cleanValue = input.value.replace(/[$,]/g, "") || "0";
        totalPaid += parseFloat(cleanValue);
    });

    return totalPaid;
}

let managePaymentsAndCalculateDebt = () => {
    const amountContainer = document.querySelector(".amounts");
    let allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    const totalSale = calculateTotal();
    let totalPaid = 0;

    // 1. Eliminar abonos vacíos excepto el primero
    allPayments.forEach((payment, idx) => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat(input.value.replace(/[$,]/g, "")) || 0;

        if (idx > 0 && value === 0) {
            payment.remove();
        }
    });

    // Refrescar nodos
    allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    // 2. Renumerar correctamente
    allPayments.forEach((payment, i) => {
        const number = i + 1;
        payment.setAttribute("data-index", number);

        const input = payment.querySelector(".amountInput");
        input.placeholder = `Abono ${number}`;
    });

    // 3. Volver a calcular total pagado
    allPayments.forEach(payment => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat(input.value.replace(/[$,]/g, "")) || 0;
        totalPaid += value;
    });

    // 4. Si el último abono tiene valor → crear otro
    const lastPayment = allPayments[allPayments.length - 1];
    const lastInput = lastPayment.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue > 0) {
        addNewPaymentField();
    }

    // 5. Calcular deuda
    const debt = totalSale - totalPaid;
    const dueText = document.getElementById("due");

    dueText.textContent = `$${formatWithCommas(debt)}`;
    dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)';
};


function addNewPaymentField() {

    const amountContainer = document.querySelector(".amounts");

    // Si el último campo está vacío → NO crear otro
    const lastInput = amountContainer.lastElementChild.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue === 0) return;

    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    allowDecimal(input);
    input.addEventListener("input", managePaymentsAndCalculateDebt);

    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");

    div.append(input, select);
    amountContainer.appendChild(div);
    saveSaleState();
}

function loadSaleState() {
    const raw = localStorage.getItem(saleKey);
    if (!raw) return null;

    return JSON.parse(raw);
}


function saveSaleState() {
    const parts = [];

    document.querySelectorAll("#tBodySelected tr[data-id]").forEach(tr => {
        const id = tr.getAttribute("data-id");
        const name = tr.querySelector(".sparePartName").textContent;

        const priceText = tr.querySelector(".finalPrice").textContent.replace(/[$,]/g, "");
        const price = parseFloat(priceText) || 0;

        parts.push({ id, name, price });
    });

    selectedIds = parts.map(p => p.id);

    const payments = [...document.querySelectorAll(".amountInput")].map(input =>
        parseFloat(input.value.replace(/[$,]/g, "")) || 0
    );

    const notes = document.getElementById("txtNotes")?.value || "";

    const state = {
        selectedParts: parts,
        payments,
        notes
    };

    localStorage.setItem(saleKey, JSON.stringify(state));
}
