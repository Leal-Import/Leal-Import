// ordenes_trabajo.rewrite.js
// Reescritura completa - módulo Órdenes de Trabajo
// Mantén los imports tal como los usas en tu proyecto:
import { getPaymentMethods } from '../service/serviceConfiguration.js'
import { getServices, postWorkOrder } from '../service/serviceAddWorkOrder.js'
import { getSpareParts } from '../service/serviceSpareParts.js'
import {
    formatWithCommas,
    allowDecimal,
    fillSelect,
    showMessage,
    getInputsValues,
    highlightAndFocus
} from '../utils.js';

/*
  Resumen:
  - Módulo modular, validaciones, DOM dinámico para servicios/repuestos/abonos,
  - Modal para comprobantes, FormData con imágenes y POST a postWorkOrder.
*/

// ---------- Selectores y estado ----------
const txtAddService = document.getElementById("txtAddService");
const boxServ = document.getElementById("suggestionsService");

const txtAddSparePart = document.getElementById("txtSearchSparePart");
const boxSparePart = document.getElementById("suggestionsSpareParts");

const frmAddWorkOrder = document.getElementById("frmWorkOrder");

// URL params
const params = new URLSearchParams(window.location.search);
let customerName = params.get("customerName") || null;
let vin = params.get("vin") || null;
let idCustomer = params.get("idCustomer") || null;
let vehiclePrice = params.get("totalPrice") || 0;
let idSale = params.get("idSale") || null;

// Local state
const selectedServices = []; // { id|null, name, price }
const selectedSpareParts = []; // { id, name, unitPrice, quantity }
let paymentMethodsList = [];
let rowsServices = 0;
let rowsSpareParts = 0;

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', async () => {
    initStaticRows();
    await loadPayMethods();
    setupModalListeners();
    bindEvents();
    loadDataVehicle();
    createInitialPaymentField(); // crea el primer campo de abono
    calculateAllTotals();
});

// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function safeParseFloat(v) { const n = parseFloat(String(v || '').replace(/[$,\s]/g, '')); return isNaN(n) ? 0 : n; }

// ---------- Load helpers ----------
async function loadPayMethods() {
    try {
        const data = await getPaymentMethods();
        paymentMethodsList = data || [];
    } catch (err) {
        console.error('loadPayMethods', err);
    }
}

function loadDataVehicle() {
    if ($('vin')) $('vin').textContent = vin || '-';
    if ($('vehiclePrice')) $('vehiclePrice').textContent = `$${formatWithCommas(vehiclePrice || 0)}`;
}

// ---------- Build static rows (si tu html requiere filas vacías) ----------
function initStaticRows() {
    const tBodys = qsa('.tBodyData');
    tBodys.forEach(tBody => {
        // Si ya tiene filas suficientes, no duplicar
        if (tBody.querySelectorAll('tr').length >= 7) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 7; i++) {
            const tr = document.createElement('tr');
            const tdName = document.createElement('td'); tdName.className = 'tdName';
            const tdPrice = document.createElement('td'); tdPrice.className = 'tdPrice';
            tr.append(tdName, tdPrice);
            frag.appendChild(tr);
        }
        tBody.appendChild(frag);
    });
}

// ---------- Events binding ----------
function bindEvents() {
    // Servicios - búsqueda
    txtAddService?.addEventListener('input', debounce(async (e) => {
        const q = e.target.value.trim();
        if (!q) { hideElement(boxServ); return; }
        try {
            const res = await getServices(q);
            renderServiceSuggestions(res.content || []);
        } catch (err) { console.error(err); }
    }, 350));

    txtAddService?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (!val) return;
            addService({ id: null, name: val, price: 0 });
            e.target.value = '';
            hideElement(boxServ);
        }
    });

    // Repuestos - búsqueda
    txtAddSparePart?.addEventListener('input', debounce(async (e) => {
        const q = e.target.value.trim();
        if (!q) { hideElement(boxSparePart); return; }
        try {
            const res = await getSpareParts(q);
            renderSparePartSuggestions(res.content || []);
        } catch (err) { console.error(err); }
    }, 350));

    // Click global para cerrar suggestions/modal
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#suggestionsService')) hideElement(boxServ);
        if (!e.target.closest('#suggestionsSpareParts')) hideElement(boxSparePart);
        if (e.target && e.target.classList && e.target.classList.contains('containerModal')) {
            e.target.classList.add('hide'); e.target.classList.remove('show');
        }
    });

    // Submit
    frmAddWorkOrder?.addEventListener('submit', handleSubmit);
}

// ---------- Suggestions render ----------
function renderServiceSuggestions(list) {
    if (!boxServ) return;
    boxServ.innerHTML = '';
    list.forEach(s => {
        if (selectedServices.some(x => x.id && x.id === s.idService)) return;
        const div = document.createElement('div'); div.className = 'suggestionItem';
        div.textContent = s.nameService;
        div.addEventListener('click', () => addService({ id: s.idService, name: s.nameService, price: 0 }));
        boxServ.appendChild(div);
    });
    showElement(boxServ);
}

function renderSparePartSuggestions(list) {
    if (!boxSparePart) return;
    boxSparePart.innerHTML = '';
    list.forEach(p => {
        if (selectedSpareParts.some(x => x.id === p.idSparePart)) return;
        const div = document.createElement('div'); div.className = 'suggestionItem';
        div.innerHTML = `${p.nameSpareParts} - $${formatWithCommas(p.suggestedPrice)}`;
        div.addEventListener('click', () => addSparePart({ id: p.idSparePart, name: p.nameSpareParts, unitPrice: p.suggestedPrice }));
        boxSparePart.appendChild(div);
    });
    showElement(boxSparePart);
}

// ---------- Small UI helpers ----------
function showElement(el) { if (!el) return; el.classList.remove('hide'); el.classList.add('show'); }
function hideElement(el) { if (!el) return; el.classList.remove('show'); el.classList.add('hide'); }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }

// ---------- Servicios logic ----------
function addService(service) {
    // validar duplicados por id o nombre
    if (service.id && selectedServices.some(s => s.id === service.id)) { showMessage('warning', 'El servicio ya fue añadido'); return; }
    if (!service.id && selectedServices.some(s => s.name.toLowerCase() === service.name.toLowerCase())) { showMessage('warning', 'El servicio ya fue añadido'); return; }

    const obj = { id: service.id || null, name: service.name, price: service.price || 0 };
    if (!appendServiceToDOM(obj)) return;
    selectedServices.push(obj);
    txtAddService.value = '';
    hideElement(boxServ);
    calculateTotalService();
}

function appendServiceToDOM(service) {
    const tBody = $('tBodyServices'); if (!tBody) return false;
    const emptyRow = qsa('#tBodyServices tr').find(r => r.querySelector('.tdName').textContent.trim() === '');
    if (!emptyRow) { showMessage('warning', 'No hay filas disponibles para agregar servicios.'); return false; }

    const index = rowsServices;
    const nameCell = emptyRow.querySelector('.tdName');
    const priceCell = emptyRow.querySelector('.tdPrice');

    nameCell.textContent = service.name;
    priceCell.textContent = (service.price || 0).toFixed(2);
    priceCell.setAttribute('contenteditable', 'true');

    // limpiar inputs ocultos previos
    emptyRow.querySelectorAll('input[type=hidden]').forEach(i => i.remove());

    if (service.id) {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = `servicios[${index}].id`;
        inp.value = service.id;
        inp.classList.add('hidden-service-id');
        emptyRow.appendChild(inp);
    } else {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = `servicios[${index}].name`;
        inp.value = service.name;
        inp.classList.add('hidden-service-name');
        emptyRow.appendChild(inp);
    }

    const inpPrice = document.createElement('input');
    inpPrice.type = 'hidden';
    inpPrice.name = `servicios[${index}].price`;
    inpPrice.value = (service.price || 0);
    inpPrice.classList.add('hidden-service-price');
    emptyRow.appendChild(inpPrice);

    // boton eliminar
    const btn = document.createElement('button'); btn.className = 'btnTrash'; btn.type = 'button';
    const img = document.createElement('img');
    img.src = '../../media/appMedia/trashIcon.png';
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        nameCell.textContent = ''; priceCell.textContent = ''; priceCell.removeAttribute('contenteditable');
        inpPrice.remove(); emptyRow.querySelectorAll('.hidden-service-id, .hidden-service-name').forEach(i => i.remove()); btn.remove();
        const key = service.id || service.name;
        const idx = selectedServices.findIndex(s => (s.id === key || s.name === key));
        if (idx > -1) selectedServices.splice(idx, 1);
        reindexServices();
        calculateTotalService();
    });
    emptyRow.appendChild(btn);

    // listener para editar precio (preservando cursor)
    priceCell.addEventListener('input', (e) => {
        restrictToDecimal(e);
        const v = safeParseFloat(priceCell.textContent);
        inpPrice.value = v;
        calculateTotalService();
    });

    rowsServices++;
    reindexServices();
    return true;
}

function reindexServices() {
    const rows = qsa('#tBodyServices tr');
    let idx = 0; const active = []; const empty = [];
    rows.forEach(r => {
        const nameCell = r.querySelector('.tdName');
        if (nameCell && nameCell.textContent.trim() !== '') {
            const hidId = r.querySelector('.hidden-service-id'); if (hidId) hidId.name = `servicios[${idx}].id`;
            const hidName = r.querySelector('.hidden-service-name'); if (hidName) hidName.name = `servicios[${idx}].name`;
            const hidPrice = r.querySelector('.hidden-service-price'); if (hidPrice) hidPrice.name = `servicios[${idx}].price`;
            active.push(r); idx++;
        } else empty.push(r);
    });
    const frag = document.createDocumentFragment(); active.forEach(r => frag.appendChild(r)); empty.forEach(r => frag.appendChild(r));
    const tbody = $('tBodyServices'); tbody.innerHTML = ''; tbody.appendChild(frag);
    rowsServices = idx;
}

function calculateTotalService() {
    const tds = qsa('#tBodyServices tr .tdPrice');
    let total = 0;
    tds.forEach(td => { const v = safeParseFloat(td.textContent); if (!isNaN(v)) total += v; });
    const el = $('totalValueService'); if (el) el.textContent = `$${formatWithCommas(total)}`;
    calculateRepairCost();
}

// ---------- Repuestos logic ----------
function addSparePart(p) {
    if (selectedSpareParts.some(x => x.id === p.id)) { showMessage('warning', 'El repuesto ya fue añadido'); return; }
    const data = { id: p.id, name: p.name, unitPrice: p.unitPrice || 0, quantity: 1 };
    if (!appendSparePartToDOM(data)) return;
    selectedSpareParts.push(data);
    txtAddSparePart.value = '';
    hideElement(boxSparePart);
    calculateTotalSpareParts();
}

function appendSparePartToDOM(part) {
    const tBody = $('tBodySpareParts'); if (!tBody) return false;
    const emptyRow = qsa('#tBodySpareParts tr').find(r => r.querySelector('.tdName').textContent.trim() === '');
    if (!emptyRow) { showMessage('warning', 'No hay filas disponibles para repuestos.'); return false; }

    const index = rowsSpareParts;
    const nameCell = emptyRow.querySelector('.tdName');
    const priceCell = emptyRow.querySelector('.tdPrice');

    nameCell.textContent = part.name;
    priceCell.setAttribute("contenteditable", "true");
    priceCell.textContent = `$${formatWithCommas(part.unitPrice.toFixed(2))}`;

    emptyRow.querySelectorAll('input[type=hidden]').forEach(i => i.remove());

    const inpId = document.createElement('input');
    inpId.type = 'hidden';
    inpId.name = `repuestos[${index}].id`;
    inpId.value = part.id;
    inpId.classList.add('hidden-part-id');
    emptyRow.appendChild(inpId);
    const inpUnit = document.createElement('input');
    inpUnit.type = 'hidden';
    inpUnit.name = `repuestos[${index}].unitPrice`;
    inpUnit.value = part.unitPrice;
    inpUnit.classList.add('hidden-part-unitPrice');
    emptyRow.appendChild(inpUnit);

    // boton eliminar
    const btn = document.createElement('button');
    btn.className = 'btnTrash';
    btn.type = 'button';
    const img = document.createElement('img');
    img.src = '../../media/appMedia/trashIcon.png';
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        nameCell.textContent = '';
        priceCell.textContent = '';
        inpId.remove();
        inpUnit.remove();
        btn.remove();
        const idx = selectedSpareParts.findIndex(s => s.id === part.id); if (idx > -1) selectedSpareParts.splice(idx, 1);
        reindexSpareParts();
        calculateTotalSpareParts();
    });
    priceCell.addEventListener("input", (e) => {
        restrictToDecimal(e);
        const v = safeParseFloat(priceCell.textContent);
        inpUnit.value = v;
        calculateTotalSpareParts();
    })
    emptyRow.appendChild(btn);

    rowsSpareParts++;
    reindexSpareParts();
    return true;
}

function reindexSpareParts() {
    const rows = qsa('#tBodySpareParts tr');
    let idx = 0; const active = []; const empty = [];
    rows.forEach(r => {
        const name = r.querySelector('.tdName');
        if (name && name.textContent.trim() !== '') {
            const hidId = r.querySelector('.hidden-part-id'); if (hidId) hidId.name = `repuestos[${idx}].id`;
            const hidUnit = r.querySelector('.hidden-part-unitPrice'); if (hidUnit) hidUnit.name = `repuestos[${idx}].unitPrice`;
            active.push(r); idx++;
        } else empty.push(r);
    });
    const frag = document.createDocumentFragment(); active.forEach(r => frag.appendChild(r)); empty.forEach(r => frag.appendChild(r));
    const tbody = $('tBodySpareParts'); tbody.innerHTML = ''; tbody.appendChild(frag);
    rowsSpareParts = idx;
}

function calculateTotalSpareParts() {
    const prices = qsa('#tBodySpareParts tr .tdPrice');
    let total = 0;
    prices.forEach(p => { const v = safeParseFloat(p.textContent); if (!isNaN(v)) total += v; });
    const el = $('totalValueSpareParts'); if (el) el.textContent = `$${formatWithCommas(total)}`;
    calculateRepairCost();
}

// ---------- Totales ----------
function calculateRepairCost() {
    const totalValueService = safeParseFloat(($('totalValueService') || {}).textContent);
    const totalValueSpareParts = safeParseFloat(($('totalValueSpareParts') || {}).textContent);
    const sum = totalValueService + totalValueSpareParts;
    if ($('totalRepairCost')) $('totalRepairCost').textContent = `$${formatWithCommas(sum)}`;
    if ($('totalValueSparePartsDown')) $('totalValueSparePartsDown').textContent = `$${formatWithCommas(sum)}`;
    if ($('txtTotal')) $('txtTotal').value = `$${formatWithCommas(sum)}`;
    calculateTotal();
}

function calculateTotal() {
    const totalRepairCost = safeParseFloat(($('totalRepairCost') || {}).textContent);
    const vehiclePriceEl = safeParseFloat(($('vehiclePrice') || {}).textContent);
    if ($('totalCost')) $('totalCost').textContent = `$${formatWithCommas(totalRepairCost + vehiclePriceEl)}`;
}

function calculateAllTotals() { calculateTotalService(); calculateTotalSpareParts(); calculateRepairCost(); calculateTotal(); }

// ---------- Cursor / decimal preserve ----------
function saveCursorPosition(element) {
    const sel = window.getSelection();
    if (sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(element);
    pre.setEnd(range.endContainer, range.endOffset);
    return pre.toString().length;
}
function restoreCursorPosition(element, caretPos) {
    const range = document.createRange();
    const sel = window.getSelection();
    let found = false;
    element.childNodes.forEach(node => {
        if (found) return;
        if (node.nodeType === 3) {
            const ln = node.nodeValue.length;
            if (caretPos <= ln) {
                range.setStart(node, caretPos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                found = true;
            } else caretPos -= ln;
        }
    });
    if (!found) {
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}
function restrictToDecimal(event) {
    const el = event.target;
    const originalCaret = saveCursorPosition(el);
    let value = el.textContent;
    let cleaned = value.replace(/[^0-9.]/g, '');
    const prevLen = value.length;

    const parts = cleaned.split('.');
    let intPart = parts[0].replace(/^0+(?=\d)/, '') || '0';
    let decPart = parts[1] || '';
    cleaned = intPart + (parts.length > 1 ? '.' + decPart : '');

    if (parts.length > 1 && decPart.length > 2) cleaned = intPart + '.' + decPart.substring(0, 2);

    if (el.textContent !== cleaned) {
        el.textContent = cleaned;
        const newLen = cleaned.length;
        const diff = prevLen - newLen;
        let newCaret = Math.max(0, Math.min(originalCaret - diff, newLen));
        setTimeout(() => restoreCursorPosition(el, newCaret), 0);
    }
}

// ---------- Pagos dinámicos ----------
function createInitialPaymentField(amount = 0, paymentMethodId = null, receiptUrl = null) {
    const amountContainer = document.querySelector('.amounts');
    if (!amountContainer) return;
    const index = amountContainer.children.length + 1;

    const div = document.createElement('div');
    div.className = 'containerAmount';
    div.setAttribute('data-index', index);
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Abono ${index}`;
    input.className = 'txtInputs amountInput';
    input.id = `amountInput${index}`;
    if (amount > 0) input.value = formatWithCommas(amount);
    allowDecimal(input); input.addEventListener('input', managePaymentsAndCalculateDebt);

    const select = document.createElement('select');
    select.className = 'txtInputs paymentTypeSelect';
    select.id = `paymentTypeSelect${index}`;

    const receiptContainer = document.createElement('div');
    receiptContainer.className = 'receiptContainer';
    const receiptInput = document.createElement('input');
    receiptInput.type = 'file'; receiptInput.accept = 'image/*,application/pdf';
    receiptInput.className = 'receiptInput';
    receiptInput.id = `receiptInput${index}`;
    receiptInput.hidden = true;
    const receiptButton = document.createElement('button');
    receiptButton.type = 'button';
    receiptButton.className = 'btnVoucher';
    receiptButton.innerHTML = `<span class="icon">+</span>`;

    receiptButton.addEventListener('click', (e) => { e.preventDefault(); openReceiptModal(receiptInput, receiptButton); });

    receiptContainer.append(receiptInput, receiptButton);
    div.append(input, select, receiptContainer);
    amountContainer.appendChild(div);

    // llenar select con métodos
    fillSelect(select.id, paymentMethodsList, 'idPaymentMethod', 'methodName', 'Metodo de pago');
    if (paymentMethodId) select.value = paymentMethodId;
    if (receiptUrl && receiptUrl.startsWith('http')) {
        receiptButton.classList.add('receipt-loaded');
        receiptButton.setAttribute('data-receipt-url', receiptUrl);
    }
}

function managePaymentsAndCalculateDebt() {
    const amountContainer = document.querySelector('.amounts');
    if (!amountContainer) return;
    let payments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    // eliminar campos vacíos excepto el primero
    payments.forEach((p, idx) => {
        const input = p.querySelector('.amountInput');
        const val = safeParseFloat(input.value);
        if (idx > 0 && val === 0) p.remove();
    });

    payments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    payments.forEach((p, i) => {
        p.setAttribute('data-index', i + 1);
        const inp = p.querySelector('.amountInput'); inp.placeholder = `Abono ${i + 1}`;
        p.querySelector('.paymentTypeSelect').id = `paymentTypeSelect${i + 1}`;
        p.querySelector('.receiptInput').id = `receiptInput${i + 1}`;
    });

    let totalPaid = 0;
    payments.forEach(p => totalPaid += safeParseFloat(p.querySelector('.amountInput').value));

    const txtTotal = safeParseFloat(($('txtTotal') || {}).value);
    const debt = txtTotal - totalPaid;
    const dueText = $('due');
    if (dueText) { dueText.textContent = `$${formatWithCommas(debt)}`; dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)'; }

    const last = payments[payments.length - 1];
    if (last) {
        const lastVal = safeParseFloat(last.querySelector('.amountInput').value);
        if (lastVal > 0) createInitialPaymentField();
    }
}

// ---------- Modal comprobantes ----------
function setupModalListeners() {
    const modalContainer = document.querySelector('.containerModal');
    const btnClose = document.getElementById('closeVoucherModal');
    const btnSelectFile = document.getElementById('btnSelectFile');
    const btnClearFile = document.getElementById('btnClearFile');
    const inputIdField = document.getElementById('currentReceiptInputId');

    const closeModalAndClean = () => {
        if (modalContainer) modalContainer.classList.add('hide');
        if (inputIdField) inputIdField.value = '';
    };
    btnClose?.addEventListener('click', closeModalAndClean);

    btnSelectFile?.addEventListener('click', () => {
        const inputElement = document.getElementById(inputIdField.value);
        if (inputElement) { inputElement.value = ''; inputElement.click(); }
    });

    btnClearFile?.addEventListener('click', () => {
        const inputElement = document.getElementById(inputIdField.value);
        if (inputElement) {
            inputElement.value = '';
            const clipButton = inputElement.nextElementSibling;
            clipButton.classList.remove('receipt-loaded');
            clipButton.removeAttribute('data-receipt-url');
            // si tienes función saveSaleState, llámala aquí
            closeModalAndClean();
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('receiptInput')) {
            const inputElement = e.target;
            const clipButton = inputElement.nextElementSibling;
            if (inputElement.files && inputElement.files.length > 0) {
                clipButton.classList.add('receipt-loaded');
                clipButton.setAttribute('data-receipt-url', inputElement.files[0].name);
            } else {
                clipButton.classList.remove('receipt-loaded');
                clipButton.removeAttribute('data-receipt-url');
            }
            if (modalContainer && !modalContainer.classList.contains('hide') && inputElement.id === (document.getElementById('currentReceiptInputId') || {}).value) updateModalContent(inputElement, clipButton);
        }
    });
}

function openReceiptModal(inputElement, buttonElement) {
    const modalContainer = document.getElementById('modalVoucher'); if (!modalContainer) return;
    const inputIdField = document.getElementById('currentReceiptInputId'); inputIdField.value = inputElement.id;
    const abonoIndex = inputElement.closest('.containerAmount')?.getAttribute('data-index') || '?';
    document.getElementById('modalAbonoTitle').textContent = `(Abono ${abonoIndex})`;
    updateModalContent(inputElement, buttonElement);
    modalContainer.classList.remove('hide');
}

function updateModalContent(inputElement, buttonElement) {
    const previewArea = document.getElementById('modalPreviewArea');
    const btnClear = document.getElementById('btnClearFile');
    const placeholder = document.getElementById('previewPlaceholder');
    const remoteUrl = buttonElement.getAttribute('data-receipt-url');
    const hasLocalFile = inputElement && inputElement.files && inputElement.files.length > 0;
    const hasRemoteUrl = remoteUrl && remoteUrl.startsWith('http');

    previewArea.innerHTML = '';
    if (hasLocalFile || hasRemoteUrl) {
        btnClear.classList.remove('hide');
        const urlToPreview = hasLocalFile ? URL.createObjectURL(inputElement.files[0]) : remoteUrl;
        const isPdf = urlToPreview.toLowerCase().endsWith('.pdf');
        const el = document.createElement(isPdf ? 'embed' : 'img');
        el.src = urlToPreview;
        if (!isPdf) { el.style.maxWidth = '100%'; el.style.maxHeight = '400px'; }
        else { el.type = 'application/pdf'; el.style.width = '100%'; el.style.height = '400px'; }
        previewArea.appendChild(el);
    } else {
        btnClear.classList.add('hide');
        if (placeholder) previewArea.appendChild(placeholder);
        else {
            const p = document.createElement('p');
            p.id = 'previewPlaceholder';
            p.textContent = 'No hay comprobante cargado.';
            previewArea.appendChild(p);
        }
    }
}

// ---------- Submit (FormData + POST) ----------
async function handleSubmit(e) {
    e.preventDefault();

    if (!vin) { showMessage('warning', 'Por favor, seleccione un vehículo para la orden.'); return; }

    const formValues = getInputsValues(frmAddWorkOrder);
    const { dtEstimated, txtNotes } = formValues;
    if (!dtEstimated) {
        highlightAndFocus(document.getElementById('dtEstimated'));
        showMessage('warning', 'Por favor, ingrese la fecha estimada de la orden');
        return;
    }

    // recolectar pagos
    const amountContainers = Array.from(document.querySelectorAll('.containerAmount'));
    const amountData = [];
    const imagesAmounts = [];

    for (let i = 0; i < amountContainers.length - 1; i++) {
        const amountInput = amountContainers[i].querySelector('.amountInput');
        const paymentTypeSelect = amountContainers[i].querySelector('.paymentTypeSelect');
        const receiptInput = amountContainers[i].querySelector('.receiptInput');

        const amountValue = safeParseFloat(amountInput.value);
        if (amountValue <= 0) {
            highlightAndFocus(amountInput);
            showMessage('warning', `Por favor, ingrese un monto válido para el abono ${i + 1}.`);
            return;
        }
        if (!paymentTypeSelect.value) {
            highlightAndFocus(paymentTypeSelect);
            showMessage('warning', `Por favor, seleccione un método de pago para el abono ${i + 1}.`);
            return;
        }
        if (!receiptInput || (receiptInput.files && receiptInput.files.length === 0)) {
            highlightAndFocus(receiptInput);
            showMessage('warning', `Por favor, seleccione un comprobante para el abono ${i + 1}.`);
            return;
        }

        amountData.push({
            amount: amountValue,
            idPaymentMethod: paymentTypeSelect.value,
            idEmployee: '490250a0-d247-4b7a-b862-3f38b79d798b'
        });
        imagesAmounts.push(receiptInput.files[0] || null);
    }

    // servicios
    const services = [];
    const tBodyServices = $('tBodyServices');
    const activeServices = tBodyServices ? Array.from(tBodyServices.querySelectorAll('tr')).filter(r => r.querySelector('.tdName').textContent.trim() !== '') : [];
    for (const r of activeServices) {
        const idInput = r.querySelector('.hidden-service-id');
        const nameInput = r.querySelector('.hidden-service-name');
        const priceInput = r.querySelector('.hidden-service-price');

        if ((idInput || nameInput) && priceInput) {
            const obj = {
                idService: idInput ? idInput.value : null,
                nameService: nameInput ? nameInput.value : r.querySelector('.tdName').textContent.trim(),
                priceApplied: safeParseFloat(priceInput.value)
            };
            if (obj.priceApplied < 0) { showMessage('warning', `El precio del servicio '${obj.nameService}' es inválido.`); return; }
            services.push(obj);
        }
    }

    // repuestos
    const spareParts = [];
    const tBodyParts = $('tBodySpareParts');
    const activeParts = tBodyParts ? Array.from(tBodyParts.querySelectorAll('tr')).filter(r => r.querySelector('.tdName').textContent.trim() !== '') : [];
    for (const r of activeParts) {
        const idInput = r.querySelector('.hidden-part-id');
        const unitPriceInput = r.querySelector('.hidden-part-unitPrice');
        if (idInput && unitPriceInput) spareParts.push({
            idSparePart: idInput.value,
            priceApplied: safeParseFloat(unitPriceInput.value)
        });
    }

    // construir FormData
    const fd = new FormData();
    const totalSalePrice = ($('totalCost')?.textContent || '0').replace(/[$,\s]/g, '');
    const workOrderData = {
        idOrderType: 'fb067db1-cec4-11f0-b459-94bb4356b639',
        salePrice: totalSalePrice,
        idCustomer,
        notes: txtNotes || '',
        estimatedDate: dtEstimated,
        services,
        spareParts,
        idEmployee: '490250a0-d247-4b7a-b862-3f38b79d798b',
        payments: amountData
    };
    fd.append('workOrderData', JSON.stringify(workOrderData));
    imagesAmounts.forEach(file => fd.append('paymentImages', file));

    try {
        let response = await postWorkOrder(fd, vin, idSale);
        await showMessage('success', 'Orden de trabajo registrada con éxito.', "success");
        if (response && idSale) {
            window.location.href = "sales.html";
        } else {
            window.location.href = "workOrders.html";
        }
        // opcional: limpiar o redirigir
    } catch (err) {
        console.error('postWorkOrder', err);
        showMessage('error', err?.message || 'Error al registrar la orden');
    }
}
