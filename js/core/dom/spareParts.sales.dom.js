import { $ } from "../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus, formatWithCommas } from "../../utils/formatters.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            tableBody: $('tBodyInventory'),
            tBodySelected: $('tBodySelected'),
            loaderSpareParts: $('loaderSpareParts'),
            loaderAddSale: $('loaderAddSale'),
            btnSaveSale: $('btnSaveSale'),
            frmSparePartSale: $("frmSparePartSale"),
            btnAddPayment: $("btnAddPayment"),
            txtSearchData: $("txtSearchData"),
            btnOrderPart: $("btnOrderPart"),
            txtNotes: $("txtNotes"),
            txtAmount: $("txtAmount"),
            customerName: $("customerName"),
            due: $("due"),
            totalPaid: $("totalPaid"),
            totalSale: $("totalSale"),
            paymentMethod: $("paymentMethod"),
            tableInventory: $("tableInventory"),
        };

        return this.refs;
    }
};


export function insertSpareParts(
    spareParts,
    container,
    tableInventory,
    verifyIds,
    onAddSparePart
) {
    if (!container || !tableInventory) return;

    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    if (!spareParts || spareParts.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("noDataMessage");
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);

        tableInventory.style.height = "100%";

        container.appendChild(fragment);
        return;
    }

    for (const sparePart of spareParts) {
        tableInventory.style.height = "fit-content";
        if (verifyIds?.(sparePart.idSpareParts)) continue;

        const tr = document.createElement("tr");
        const tdImage = document.createElement("td");
        const image = document.createElement("img");
        const name = document.createElement("td");
        const cost = document.createElement("td");
        const suggestedPriceTd = document.createElement("td");

        console.log(sparePart);
        image.src = sparePart.photoUrl || "";
        name.textContent = sparePart.nameSpareParts || sparePart.sparePartName;
        cost.textContent = `$${formatWithCommas(sparePart.total || sparePart.totalCost || 0)}`;
        suggestedPriceTd.textContent = `$${formatWithCommas(sparePart.suggestedPrice || sparePart.priceApplied || 0)}`;

        tr.classList.add("tableRow");
        image.classList.add("imgTable");

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


function createBtnAdd (sparePart, tr, onAddSparePart) { 
    const btnAddSparePart = document.createElement("button");
    btnAddSparePart.classList.add("btnAddItem");
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
    const tdTrash = document.createElement("td");

    partName.textContent = name;
    tdPrice.textContent = "$" + formatWithCommas(priceApplied);

    partName.classList.add("sparePartName");
    tdPrice.classList.add("finalPrice");
    tr.classList.add("tableRow");

    let btnTrash = createTrashOption(container, tr, idSparePart, idSaleItem, onDeleteSparePart);
    if (btnTrash) tdTrash.appendChild(btnTrash);
    if (addEventsPrice) addEventsPrice(tdPrice, idSparePart, onWritePrice);
    tr.append(partName, tdPrice, tdTrash);
    container.appendChild(tr);

}

const addEventsPrice = (price, id, onWritePrice) => {
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

const createTrashOption = (container, tr, id, idSaleItem, onDeleteSparePart) => {
    const btnTrash = document.createElement("button");
    btnTrash.className = "btnTrash";
    btnTrash.type = "button";

    btnTrash.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        </svg>
    `;

    btnTrash.addEventListener("click", () => onDeleteSparePart(container, tr, id, idSaleItem));
    return btnTrash;
}

export const createNoDataSelectedMessage = (container) => {
    const trNoData = document.createElement("tr");
    trNoData.classList.add("rowNoData");
    const tdNoData = document.createElement("td");
    tdNoData.classList.add("noDataMessage");
    tdNoData.colSpan = 3;
    tdNoData.textContent = "No hay repuestos seleccionados";
    trNoData.appendChild(tdNoData);
    container.appendChild(trNoData);
}

export const loadCustomerName = (spancustomerName, customerName) => {
    spancustomerName.textContent = customerName;
}

export const loadBtnOrder = (customerId, customerName, idSale) => {
    let url = `sparePartsDetails.html?sale=true&idCustomer=${customerId}&customerName=${encodeURIComponent(customerName)}`;

    if (idSale != null && idSale !== '') {
        url += `&idSale=${idSale}`;
    }

    window.location.href = url;
};


export const loadDomData = (txtNotes, btnSaveSale, notes) => {
    txtNotes.value = notes;
    btnSaveSale.querySelector("span").textContent = "Actualizar venta";
}

export const loadNotes = (txtNotes, notes) => {
    txtNotes.value = notes;
}

//A esto todavia le falta diseño
export function renderTotals({ total, due, totalPaid }, Refs) {
    if (Refs.totalPaid) {
        Refs.totalPaid.textContent = `$${formatWithCommas(totalPaid)}`
    }
    if (Refs.due) {
        Refs.due.textContent = `$${formatWithCommas(due)}`;
    }
    if (Refs.totalSale) {
        Refs.totalSale.textContent = `$${formatWithCommas(total)}`;
    }
}

export const cleanPaymentCamps = (txtAmount, paymentMethod) => {
    if (txtAmount) txtAmount.value = '';
    if (paymentMethod) paymentMethod.value = '';
}
