import { $, qs } from "../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus, formatWithCommas } from "../../utils/formatters.js";
import { verifyIds } from "../logic/spareParts.sales.logic.js";
import { spareSaleState } from "../state/spareParts.sales.state.js";


export function insertSpareParts(
    spareParts,
    container,
    verifyIds,
    onAddSparePart
) {
    if (!container) return;

    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    if (!spareParts || spareParts.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message");
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);

        const tableEl = document.querySelector(".table");
        if (tableEl) tableEl.style.height = "100%";

        container.appendChild(fragment);
        return;
    }

    for (const sparePart of spareParts) {
        if (verifyIds?.(sparePart.idSpareParts)) continue;

        const tr = document.createElement("tr");
        const tdImage = document.createElement("td");
        const image = document.createElement("img");
        const name = document.createElement("td");
        const cost = document.createElement("td");
        const suggestedPriceTd = document.createElement("td");

        image.src = sparePart.photoUrl || "";
        name.textContent = sparePart.nameSpareParts || sparePart.sparePartName;
        cost.textContent = `$${formatWithCommas(sparePart.total || sparePart.totalCost || 0)}`;
        suggestedPriceTd.textContent = `$${formatWithCommas(sparePart.suggestedPrice || sparePart.priceApplied || 0)}`;

        tr.classList.add("tableRow");
        image.classList.add("imgSparePart");

        tdImage.appendChild(image);
        tr.append(tdImage, name, cost, suggestedPriceTd);
        if (createBtnAdd) {
            const btn = createBtnAdd(sparePart, tr, onAddSparePart);
            tr.appendChild(btn);
        }

        fragment.appendChild(tr);
    }

    container.appendChild(fragment);
}


let createBtnAdd = (sparePart, tr, onAddSparePart) => {
    const btnAddSparePart = document.createElement("button");
    btnAddSparePart.classList.add("btnPrimary", "btnAddPart");
    btnAddSparePart.textContent = "+";
    btnAddSparePart.addEventListener("click", () => onAddSparePart(sparePart, tr));
    return btnAddSparePart;
}

export function createRowTable(container, sparePart, onDeleteSparePart, onWritePrice) {
    if (!container) return;
    // Remover row 'no data' si existe
    const rowNoData = container.querySelector(".rowNoData");
    if (rowNoData) rowNoData.remove();
    const idSparePart = sparePart.idSparePart;
    const name = sparePart.name;
    const priceApplied = sparePart.priceApplied;
    const idSaleItem = sparePart.idSaleItem || null;

    const tr = document.createElement("tr");
    const partName = document.createElement("td");
    const tdPrice = document.createElement("td");

    partName.textContent = name;
    tdPrice.textContent = "$" + formatWithCommas(priceApplied);

    partName.classList.add("sparePartName");
    tdPrice.classList.add("finalPrice");
    tr.classList.add("tableRow");

    let btnTrash = createTrashOption(container, tr, idSparePart, idSaleItem, onDeleteSparePart);
    if (addEventsPrice) addEventsPrice(tdPrice, idSparePart, onWritePrice);
    tr.append(partName, tdPrice);
    if (btnTrash) tr.appendChild(btnTrash);
    container.appendChild(tr);

}

let addEventsPrice = (price, id, onWritePrice) => {
    price.contentEditable = "plaintext-only";  // ← FIX DEL CURSOR
    formatDecimalInput(price);

    price.addEventListener("input", () => onWritePrice(price, id));

    price.addEventListener("focus", (e) => {
        formatOnFocus(e);
    });

    price.addEventListener("blur", (e) => {
        formatOnBlur(e);
    });
}

let createTrashOption = (container, tr, id, idSaleItem, onDeleteSparePart) => {
    const btnTrash = document.createElement("button");
    btnTrash.classList.add("btnTrash");
    btnTrash.type = "button";
    const iconImg = document.createElement("img");

    iconImg.src = "../../media/appMedia/trashIcon.png";

    btnTrash.appendChild(iconImg);
    btnTrash.addEventListener("click", () => onDeleteSparePart(container, tr, id, idSaleItem));
    return btnTrash;
}

export let createNoDataSelectedMessage = (container) => {
    const trNoData = document.createElement("tr");
    trNoData.classList.add("rowNoData");
    const tdNoData = document.createElement("td");
    tdNoData.classList.add("noDataMessage");
    tdNoData.colSpan = 3;
    tdNoData.textContent = "No hay repuestos seleccionados";
    trNoData.appendChild(tdNoData);
    container.appendChild(trNoData);
}

export let loadCustomerName = (customerName) => {
    $("customerName").textContent = customerName;
}

export let loadBtnOrder = (customerId, customerName, idSale) => {
    let url = `sparePartsDetails.html?sale=true&idCustomer=${customerId}&customerName=${encodeURIComponent(customerName)}`;

    if (idSale != null && idSale !== '') {
        url += `&idSale=${idSale}`;
    }

    window.location.href = url;
};


export let loadDomData = (notes) => {
    $("txtNotes").value = notes;
    qs(".btnSubmitData").value = "Actualizar venta";
}

export function renderTotals({ total, due }) {
    const containerTotal = $("containerTotal");
    const containerDue = $("containerAmountDue");
    const totalText = $("total");
    const dueText = $("due");

    if (totalText) totalText.textContent = `$${formatWithCommas(total)}`;

    if (dueText) {
        dueText.textContent = `$${formatWithCommas(due)}`;
        dueText.style.color =
            due > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    }
    const isUpper = total > 0;
    if (!isUpper) {
        containerTotal?.classList.remove("show");
        containerDue?.classList.remove("show");
        containerTotal?.classList.add("hide");
        containerDue?.classList.add("hide");
    } else {
        containerTotal?.classList.add("show");
        containerDue?.classList.add("show");
        containerTotal?.classList.remove("hide");
        containerDue?.classList.remove("hide");
    }
}