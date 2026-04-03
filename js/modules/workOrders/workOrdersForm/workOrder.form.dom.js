import { formatDecimalInput, formatWithCommas, formatOnFocus, formatOnBlur } from "../../../utils/formatters.js";
import { $, existsById, qs, qsa, showElement } from "../../../utils/dom.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            txtAmount: $("txtAmount"),
            cmbPaymentMethod: $("paymentMethod"),
            dtEstimated: $("dtEstimated"),
            boxServ: $("suggestionsService"),
            boxSparePart: $("suggestionsSpareParts"),
            txtSearchSparePart: $("txtSearchSparePart"),
            txtAddService: $("txtAddService"),
            separator: $("separator"),
            loaderAddOrder: $("loaderAddOrder"),
            btnSaveOrder: $("btnSaveOrder"),
            btnAddPayment: $("btnAddPayment"),
            frmWorkOrder: $("frmWorkOrder"),
            txtNotes: $("txtNotes"),
            tBodySpareParts: $("tBodySpareParts"),
            tBodyServices: $("tBodyServices"),
            totalCost: $("totalCost"),
            totalRepairCost: $("totalRepairCost"),
            vehiclePrice: $("vehiclePrice"),
            totalValueSpareParts: $("totalValueSpareParts"),
            totalValueService: $("totalValueService"),
            totalOrder: $("totalOrder"),
            totalPaid: $("totalPaid"),
            due: $("due"),
            firstBread: $("firstBread"),
            secondBread: $("secondBread"),
            paymentForm: qs(".paymentForm"),
            year: $("year"),
            brand: $("brand"),
            model: $("model"),
            vin: $("vin"),
            txts: qsa(".rightColumn .txtInputs"),
            txtTotal: $("txtTotal"),
            btnCompleteOrder: $("btnCompleteOrder"),
            loaderCompleteOrder: $("loaderCompleteOrder"),
            btnGeneratePdf: $("btnGeneratePdf")
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

export const loadViewUpdateOrder = (vin, Refs) => {
    Refs.btnSaveOrder.querySelector("span").textContent = "Actualizar";
    Refs.firstBread.textContent = "Actualizar orden >";
    Refs.firstBread.href = "workOrders.html";
    Refs.secondBread.textContent = vin;
};

export const loadViewSaleInfo = (vin, Refs) => {
    Refs.firstBread.textContent = "Ventas >";
    Refs.firstBread.href = "sales.html";
    Refs.secondBread.textContent = vin;
};

export const renderVehicleData = (data, Refs) => {
    if (!data) return;
    if (Refs.vin) Refs.vin.textContent = data.vin || '-';
    if (Refs.model) Refs.model.textContent = data.model || '-';
    if (Refs.brand) Refs.brand.textContent = data.brand || '-';
    if (Refs.year) Refs.year.textContent = data.year || '-';
};

export const loadViewDom = (Refs) => {
    Refs.txts.forEach(txt => {
        txt.disabled = true;
    });
    Refs.firstBread.textContent = "Ver orden >";
};

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
};

export const renderSparePartSuggestions = (selectedSpareParts, boxSparePart, list, onAddSparePart) => {
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
        suggestedPrice.textContent = formatWithCommas(p.suggestedPrice);
        containerImg.appendChild(img);
        containerImgName.append(containerImg, name);
        div.append(containerImgName, suggestedPrice);
        div.addEventListener('click', () => onAddSparePart(p));
        boxSparePart.appendChild(div);
    });
    showElement(boxSparePart);
};

export const renderServiceSuggestions = (selectedServices, boxServ, list, onAddService) => {
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
};

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
    priceCell.textContent = formatWithCommas(data.priceApplied);
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

export const createTrashOption = ({
    row,
    item,
    arraySelected,
    arrayDelete,
    onDelete,
    renderButton,
    tBody
}) => {
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
        onDelete(item, arraySelected, arrayDelete, row, tBody, renderButton);
        row.querySelector(SELECTORS.TD_PRICE).classList.remove("finalPrice");
    });

    return btn;
};

export const reindexTable = (tBody) => {
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
};

export const renderImportButton = (tBody, onImport, tBodyServices, tBodySpareParts) => {
    if (!tBody) return;

    tBody.querySelectorAll(SELECTORS.BTN_IMPORT).forEach(b => b.remove());

    const rows = [...tBody.querySelectorAll('tr')];
    let targetRow = rows.find(r =>
        r.querySelector(SELECTORS.TD_NAME)?.textContent.trim() === '' && r.querySelector(SELECTORS.TD_PRICE)?.textContent.trim() === ''
    );

    if (!targetRow) {
        addRowToBothTables(tBodyServices, tBodySpareParts);
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
};

export const renderTotalsPanel = ({ total, due, totalPaid }, Refs) => {
    if (Refs.totalPaid) {
        Refs.totalPaid.textContent = formatWithCommas(totalPaid);
    }
    if (Refs.due) {
        Refs.due.textContent = formatWithCommas(due);
    }
    if (Refs.totalOrder) {
        Refs.totalOrder.textContent = formatWithCommas(total);
    }
};

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
};

export const renderTotals = ({
    servicesTotal,
    sparePartsTotal,
    total,
    totalPaid,
    due,
    orderTotal
}, Refs) => {
    renderTotalServices(servicesTotal, Refs.totalValueService);
    renderTotalSpareParts(sparePartsTotal, Refs.totalValueSpareParts);
    renderTotalRepairCost(total, Refs.totalRepairCost, Refs.txtTotal);
    renderTotalsPanel({ total, due, totalPaid }, Refs);
    renderOrderTotal(orderTotal, Refs.totalCost);
};

export const renderTotalServices = (servicesTotal, spanTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(servicesTotal);
};

export const renderTotalSpareParts = (sparePartsTotal, spanTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(sparePartsTotal);
};

export const renderTotalRepairCost = (total, spanTotal, txtTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(total);
    if (txtTotal) txtTotal.value = formatWithCommas(total);
};

export const loadExtraInputs = (notes, date, Refs) => {
    if (Refs.dtEstimated) Refs.dtEstimated.value = date;
    if (Refs.txtNotes) Refs.txtNotes.value = notes || '';
};

export const renderOrderTotal = (orderTotal, spanTotal) => {
    if (spanTotal) spanTotal.textContent = formatWithCommas(orderTotal);
};

export const renderVehiclePrice = (vehiclePrice, spanVehiclePrice) => {
    if (spanVehiclePrice) spanVehiclePrice.textContent = formatWithCommas(vehiclePrice) || 0.00;
};

const createEmptyRow = () => {
    const tr = document.createElement('tr');
    const tdName = document.createElement('td');
    tdName.classList.add(SELECTORS.TD_NAME.slice(1));
    const tdPrice = document.createElement('td');
    tdPrice.classList.add(SELECTORS.TD_PRICE.slice(1));
    const tdTrash = document.createElement("td");
    tdTrash.classList.add(SELECTORS.TD_TRASH.slice(1));
    tr.append(tdName, tdPrice, tdTrash);
    return tr;
};

export const addRowToBothTables = (tBodyServices, tBodySpareParts) => {
    if (tBodyServices) tBodyServices.appendChild(createEmptyRow());
    if (tBodySpareParts) tBodySpareParts.appendChild(createEmptyRow());
};
