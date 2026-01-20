import { formatDecimalInput, formatWithCommas, formatOnFocus, formatOnBlur } from "../../utils/formatters.js";
import { $, existsById, qs, qsa, showElement } from "../../utils/dom.js";

export const loadViewUpdateOrder = (vin) => {
    qs(".btnSubmitData").value = "Actualizar";
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

export const initStaticRows = () => {
    const tBodys = qsa('.tBodyData');
    tBodys.forEach(tBody => {
        // Si ya tiene filas suficientes, no duplicar
        if (tBody.querySelectorAll('tr').length >= 7) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 7; i++) {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td');
            tdName.className = 'tdName';
            const tdPrice = document.createElement('td');
            tdPrice.className = 'tdPrice';
            tr.append(tdName, tdPrice);
            frag.appendChild(tr);
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

export const appendToDom = ({
    tBody,
    data,
    arraySelected,
    arrayDelete,
    onWritePrice,
    onDelete,
    renderButton
}) => {
    if (!tBody) return false;

    // Buscar fila vacía
    let emptyRow = [...tBody.querySelectorAll('tr')]
        .find(r => r.querySelector('.tdName')?.textContent.trim() === '');

    // Si no existe, crearla
    if (!emptyRow) {
        addRowToBothTables();
        emptyRow = [...tBody.querySelectorAll('tr')]
            .find(r => r.querySelector('.tdName')?.textContent.trim() === '');
    }

    if (!emptyRow) return false;

    const nameCell = emptyRow.querySelector('.tdName');
    const priceCell = emptyRow.querySelector('.tdPrice');
    nameCell.textContent = data.name;
    priceCell.textContent = `$${formatWithCommas(data.priceApplied)}`;
    priceCell.setAttribute('contenteditable', 'true');

    // Botón eliminar
    if (createTrashOption) {
        const btn = createTrashOption({
            row: emptyRow,
            item: data,
            arraySelected,
            arrayDelete,
            onDelete,
            renderButton,
            tBody
        });
        emptyRow.appendChild(btn);
    }

    // Eventos de edición de precio
    formatDecimalInput(priceCell);

    priceCell.addEventListener('input', (e) => onWritePrice(e, data));

    priceCell.addEventListener('focus', formatOnFocus);
    priceCell.addEventListener('blur', formatOnBlur);

    return true;
}


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
    btn.className = 'btnTrash';
    btn.type = 'button';
    const img = document.createElement('img');
    img.src = '../../media/appMedia/trashIcon.png';
    btn.appendChild(img);

    btn.addEventListener('click', () => onDelete(item, arraySelected, arrayDelete, row, tBody, renderButton));

    return btn;
}

export function reindexTable(tBody) {
    if (!tBody) return;

    const rows = [...tBody.querySelectorAll('tr')];
    const active = [];
    const empty = [];

    rows.forEach(row => {
        const nameCell = row.querySelector('.tdName');
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

    tBody.querySelectorAll('.btnImport').forEach(b => b.remove());

    const rows = [...tBody.querySelectorAll('tr')];
    let targetRow = rows.find(r =>
        r.querySelector('.tdName')?.textContent.trim() === ''
    );

    if (!targetRow) {
        addRowToBothTables();
        targetRow = [...tBody.querySelectorAll('tr')]
            .find(r => r.querySelector('.tdName')?.textContent.trim() === '');
    }

    if (!targetRow) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btnImport';
    btn.textContent = 'IMPORTAR';
    btn.addEventListener('click', onImport);

    targetRow.appendChild(btn);
}


export function renderTotalsPanel({ total, due, totalPaid }) {
    const containerTotal = $("containerTotal");
    const containerDue = $("containerAmountDue");
    const totalText = $("total");
    const dueText = $("due");
    const paidText = $('totalPaid');
    if (totalText) {
        totalText.textContent = `$${formatWithCommas(total)}`;
        totalText.classList.add("show")
    }
    if (paidText) {
        paidText.textContent = `$${formatWithCommas(totalPaid)}`
        paidText.style.color =
            totalPaid > 0 ? 'var(--success-color)' : 'var(--text-muted)'
    }

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

export const cleanRow = (row) => {
    const tdName = row.querySelector(".tdName");
    const tdPrice = row.querySelector(".tdPrice");
    tdName.textContent = "";
    tdPrice.textContent = "";
    tdPrice.removeAttribute("contenteditable");
    row.querySelector(".btnTrash").remove();
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
    if ($('totalRepairCost')) $('totalRepairCost').textContent = `$${formatWithCommas(total)}`;
    if ($('txtTotal')) $('txtTotal').value = `$${formatWithCommas(total)}`;
}

export const loadExtraInputs = (notes, date) => {
    $("dtEstimated").value = date;
    $("txtNotes").value = notes || '';
}

export const renderOrderTotal = (orderTotal) => {
    $("totalCost").textContent = `$${formatWithCommas(orderTotal)}`;
}

export const renderVehiclePrice = (vehiclePrice) => {
    $("vehiclePrice").textContent = `$${formatWithCommas(vehiclePrice)}`;
}
