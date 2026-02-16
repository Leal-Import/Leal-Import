import { formatDecimalInput, formatWithCommas, formatOnFocus, formatOnBlur } from "../../utils/formatters.js";
import { $, existsById, hideElement, qs, qsa, showElement } from "../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            txtAmount: $("txtAmount"),
            cmbPaymentMethod: $("paymentMethod"),
            dtEstimated: $("dtEstimated"),
            boxServ: $("suggestionsService"),
            boxSparePart: $("suggestionsSpareParts"),
            tBodySpareParts: $("tBodySpareParts"),
            tBodyServices: $("tBodyServices"),
            txtAddSparePart: $("txtSearchSparePart"),
            txtAddService: $("txtAddService"),
            loaderAddOrder: $("loaderAddOrder"),
            btnSaveOrder: $("btnSaveOrder"),
            btnCompleteOrder: $("btnCompleteOrder"),
            loaderCompleteOrder: $("loaderCompleteOrder")
        };
        return this.refs;
    }
};

const SELECTORS = {
    TD_NAME: '.tdName',
    TD_PRICE: '.tdPrice',
    TD_TRASH: '.tdTrash',
    TBODY_DATA: '.tBodyData',
    BTN_IMPORT: '.btnImport',
    BTN_TRASH: '.btnTrash'
};

export const loadViewUpdateOrder = (vin) => {
    $("btnSaveOrder").querySelector("span").textContent = "Actualizar";
    $("firstBread").textContent = "Actualizar orden >";
    $("firstBread").href = "workOrders.html";
    $("secondBread").textContent = vin;
}

export const loadViewSaleInfo = (vin) => {
    qs(".btnSubmitData").value = "Agregar orden + venta";
    $("firstBread").textContent = "Ventas >";
    $("firstBread").href = "sales.html";
    $("secondBread").textContent = vin;
}

export const renderVehicleData = (data) => {
    if (!data) return;
    if ($('vin')) $('vin').textContent = data.vin || '-';
    if ($('model')) $('model').textContent = data.model || '-';
    if ($('brand')) $('brand').textContent = data.brand || '-';
    if ($('year')) $('year').textContent = data.year || '-';
}

export const loadViewDom = (onCompleteOrder) => {
    const txts = qsa(".rightColumn .txtInputs");
    txts.forEach(txt => {
        txt.disabled = true;
    })
    hideElement(qs(".paymentForm"));
    hideElement($("txtSearchSparePart"));
    hideElement($("txtAddService"));
    $("firstBread").textContent = "Ver orden >";
    const btnCompleteOrder = createCompleteBtn(onCompleteOrder);
    $("btnSaveOrder").replaceWith(btnCompleteOrder);
}

const createCompleteBtn = (onCompleteOrder) => {
    const btn = document.createElement("button");
    const text = document.createElement("span");
    const loader = document.createElement("div");
    loader.classList.add("loader", "hide");
    loader.id = "loaderCompleteOrder";
    btn.id = "btnCompleteOrder";
    btn.type = "button";
    btn.classList.add("btnPrimary");
    text.textContent = "Completar orden";
    btn.append(text, loader);
    btn.addEventListener("click", onCompleteOrder)
    return btn;
}

export const cleanPaymentCamps = () => {
    const amountInput = $('txtAmount');
    const methodSelect = $('paymentMethod');
    if (amountInput) amountInput.value = '';
    if (methodSelect) methodSelect.value = '';
}

const MIN_STATIC_ROWS = 7;
export const initStaticRows = () => {
    const tBodys = qsa(SELECTORS.TBODY_DATA);
    tBodys.forEach(tBody => {
        if (tBody.querySelectorAll('tr').length >= MIN_STATIC_ROWS) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < MIN_STATIC_ROWS; i++) {
            frag.appendChild(createEmptyRow());
        }
        tBody.appendChild(frag);
    });
}

export function renderSparePartSuggestions(selectedSpareParts, boxSparePart, list, onAddSparePart) {
    if (!boxSparePart) return;
    boxSparePart.innerHTML = '';
    list.forEach(p => {
        if (existsById(selectedSpareParts, p.idSpareParts, 'idSparePart')) return;
        const div = document.createElement('div');
        div.classList.add('suggestionItem');
        div.classList.add('suggestionPart');
        const containerImgName = document.createElement('div');
        containerImgName.classList.add('containerImgNameSuggest');
        const containerImg = document.createElement('div');
        containerImg.classList.add('containerImgSuggest');
        const img = document.createElement('img');
        const name = document.createElement('span');
        const suggestedPrice = document.createElement('span');
        img.src = p.imageUrl;
        name.textContent = p.nameSpareParts;
        suggestedPrice.textContent = `$${formatWithCommas(p.suggestedPrice)}`
        containerImg.appendChild(img);
        containerImgName.append(containerImg, name)
        div.append(containerImgName, suggestedPrice);
        div.addEventListener('click', () => onAddSparePart(p));
        boxSparePart.appendChild(div);
    });
    showElement(boxSparePart);
}

export function renderServiceSuggestions(selectedServices, boxServ, list, onAddService) {
    if (!boxServ) return;
    boxServ.innerHTML = '';
    list.forEach(s => {
        if (existsById(selectedServices, s.idService, 'idService')) return;
        const div = document.createElement('div');
        div.className = 'suggestionItem';
        div.textContent = s.nameService;
        div.addEventListener('click', () => onAddService(s));
        boxServ.appendChild(div);
    });
    showElement(boxServ);
}

const findOrCreateEmptyRow = (tBody) => {
    let emptyRow = [...tBody.querySelectorAll('tr')]
        .find(r => r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '');
    
    if (!emptyRow) {
        emptyRow = createEmptyRow();
        tBody.appendChild(emptyRow);
    }
    
    return emptyRow;
};

const setupPriceCell = (priceCell, data, onWritePrice, isView) => {
    priceCell.textContent = `$${formatWithCommas(data.priceApplied)}`;
    priceCell.classList.add('finalPrice');
    
    if (!isView) {
        priceCell.setAttribute('contenteditable', 'true');
        formatDecimalInput(priceCell);
        priceCell.addEventListener('input', (e) => onWritePrice(e, data));
        priceCell.addEventListener('focus', formatOnFocus);
        priceCell.addEventListener('blur', formatOnBlur);
    }
};

export const appendToDom = ({
    tBody,
    data,
    arraySelected,
    arrayDelete,
    onWritePrice,
    onDelete,
    renderButton,
    isView
}) => {
    if (!tBody) return false;

    const row = findOrCreateEmptyRow(tBody);
    if (!row) return false;

    const nameCell = row.querySelector(SELECTORS.TD_NAME);
    const priceCell = row.querySelector(SELECTORS.TD_PRICE);
    const tdTrash = row.querySelector(SELECTORS.TD_TRASH);

    nameCell.textContent = data.name;
    setupPriceCell(priceCell, data, onWritePrice, isView);

    if (!isView) {
        const btn = createTrashOption({
            row,
            item: data,
            arraySelected,
            arrayDelete,
            onDelete,
            renderButton,
            tBody
        });
        tdTrash.appendChild(btn);
    }

    return true;
};

export function createTrashOption({
    row,
    item,
    arraySelected,
    arrayDelete,
    onDelete,
    renderButton,
    tBody
}) {
    const btn = document.createElement('button');
    btn.classList.add(SELECTORS.BTN_TRASH.slice(1));
    btn.type = 'button';
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        </svg>
    `;

    btn.addEventListener('click', () => {
        onDelete(item, arraySelected, arrayDelete, row, tBody, renderButton)
        row.querySelector(SELECTORS.TD_PRICE).classList.remove("finalPrice");
    });

    return btn;
}

export function reindexTable(tBody) {
    if (!tBody) return;

    const rows = [...tBody.querySelectorAll('tr')];
    const active = [];
    const empty = [];

    rows.forEach(row => {
        const nameCell = row.querySelector(SELECTORS.TD_NAME);
        if (nameCell && nameCell.textContent.trim() !== '') {
            active.push(row);
        } else {
            empty.push(row);
        }
    });

    const frag = document.createDocumentFragment();
    [...active, ...empty].forEach(r => frag.appendChild(r));

    tBody.innerHTML = '';
    tBody.appendChild(frag);
}

export function renderImportButton(tBody, onImport) {
    if (!tBody) return;

    tBody.querySelectorAll(SELECTORS.BTN_IMPORT).forEach(b => b.remove());

    const rows = [...tBody.querySelectorAll('tr')];
    let targetRow = rows.find(r =>
        r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '' && r.querySelector(SELECTORS.TD_PRICE)?.textContent.trim() === ''
    );

    if (!targetRow) {
        addRowToBothTables();
        targetRow = [...tBody.querySelectorAll('tr')]
            .find(r => r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '' && r.querySelector(SELECTORS.TD_PRICE)?.textContent.trim() === '');
    }

    if (!targetRow) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add(SELECTORS.BTN_IMPORT.slice(1));
    btn.textContent = 'IMPORTAR';
    btn.addEventListener('click', onImport);

    targetRow.appendChild(btn);
}


export function renderTotalsPanel({ total, due, totalPaid }) {
    const dueText = $("due");
    const paidText = $('totalPaid');
    const totalText = $('totalOrder');
    if (paidText) {
        paidText.textContent = `$${formatWithCommas(totalPaid)}`
    }
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(due)}`;
    }
    if (totalText) {
        totalText.textContent = `$${formatWithCommas(total)}`;
    }
}

export const cleanRow = (row) => {
    const tdName = row.querySelector(SELECTORS.TD_NAME);
    const tdPrice = row.querySelector(SELECTORS.TD_PRICE);
    const btnTrash = row.querySelector(SELECTORS.BTN_TRASH);
    
    if (tdName) tdName.textContent = "";
    if (tdPrice) {
        tdPrice.textContent = "";
        tdPrice.removeAttribute("contenteditable");
    }
    if (btnTrash) btnTrash.remove();
}

export const renderTotals = ({
    servicesTotal,
    sparePartsTotal,
    total,
    totalPaid,
    due,
    orderTotal,
    vehiclePrice
}) => {
    renderTotalServices(servicesTotal);
    renderTotalSpareParts(sparePartsTotal)
    renderTotalRepairCost(total);
    renderTotalsPanel({ total, due, totalPaid });
    renderOrderTotal(orderTotal);
    renderVehiclePrice(vehiclePrice);
}

export const renderTotalServices = (servicesTotal) => {
    const totalService = $('totalValueService');
    if (totalService) totalService.textContent = `$${formatWithCommas(servicesTotal)}`;
}

export const renderTotalSpareParts = (sparePartsTotal) => {
    const totalSpareParts = $('totalValueSpareParts');
    if (totalSpareParts) totalSpareParts.textContent = `$${formatWithCommas(sparePartsTotal)}`;
}

export const renderTotalRepairCost = (total) => {
    const totalRepairCost = $('totalRepairCost');
    const txtTotal = $('txtTotal');
    if (totalRepairCost) totalRepairCost.textContent = `$${formatWithCommas(total)}`;
    if (txtTotal) txtTotal.value = `$${formatWithCommas(total)}`;
}

export const loadExtraInputs = (notes, date) => {
    const dtEstimated = $("dtEstimated");
    const txtNotes = $("txtNotes");
    
    if (dtEstimated) dtEstimated.value = date;
    if (txtNotes) txtNotes.value = notes || '';
}

export const renderOrderTotal = (orderTotal) => {
    const element = $("totalCost");
    if (element) element.textContent = `$${formatWithCommas(orderTotal)}`;
}

export const renderVehiclePrice = (vehiclePrice) => {
    const element = $("vehiclePrice");
    if (element) element.textContent = `$${formatWithCommas(vehiclePrice)}`;
}

function createEmptyRow() {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td'); 
    tdName.classList.add(SELECTORS.TD_NAME.slice(1));
    const tdPrice = document.createElement('td'); 
    tdPrice.classList.add(SELECTORS.TD_PRICE.slice(1));
    const tdTrash = document.createElement("td");
    tdTrash.classList.add(SELECTORS.TD_TRASH.slice(1));
    tr.append(tdName, tdPrice, tdTrash);
    return tr;
}

export function addRowToBothTables() {
    const tBodyServices = $('tBodyServices');
    const tBodyParts = $('tBodySpareParts');
    if (tBodyServices) tBodyServices.appendChild(createEmptyRow());
    if (tBodyParts) tBodyParts.appendChild(createEmptyRow());
}