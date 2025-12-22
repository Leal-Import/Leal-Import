// ordenes_trabajo.rewrite.js
// Reescritura completa - módulo Órdenes de Trabajo
// Mantén los imports tal como los usas en tu proyecto:
import { createBtnUrl, setupModalListeners } from '../controller/salesHelpers/picsAmounts.js'
import { managePaymentsAndCalculateDebt, createInitialPaymentField, loadPayMethods, verifySelects} from '../controller/salesHelpers/payments.js'
import {
    getServices,
    postWorkOrder,
    getDataVehicleById,
    getSpareParts,
    getWorkOrderById,
    putWorkOrder
} from '../service/serviceAddWorkOrder.js'
import { appendToDom } from '../controller/salesHelpers/loadTablesWO.js'
import {
    formatWithCommas,
    showMessage,
    getInputsValues,
    highlightAndFocus,
    allowDecimal,
    validateDate,
    initSession,
    getCurrentEmployeeId
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
const dtEstimated = document.getElementById("dtEstimated");

// URL params
const params = new URLSearchParams(window.location.search);
let customerName = params.get("customerName") || null;
let idVehicle = params.get("idVehicle") || null;
let idCustomer = params.get("idCustomer") || null;
let vehiclePrice = params.get("totalPrice") || 0;
let idSale = params.get("idSale") || null;

const isNewPart = params.get("isNewPart") === "true";
const newPartId = params.get("newSparePartId");
const newPartName = params.get("newSparePartName");
const newSuggestedPrice = params.get("newSuggestedPrice");
const idWorkOrder = params.get("idWorkOrder") || null;

// Local state
const selectedServices = []; // { id|null, name, price }
const selectedSpareParts = []; // { id, name, unitPrice, quantity }
const sparePartsToDelete = [];
const servicesToDelete = [];
const paymentsToDelete = [];
let rowsServices = 0;
let rowsSpareParts = 0;

let createTrashOptionSpare = (id, idWoItem, nameCell, priceCell) => {
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
        priceCell.removeAttribute("contenteditable");
        btn.remove();
        if (idWoItem) sparePartsToDelete.push(idWoItem);
        const idx = selectedSpareParts.findIndex(s => s.id === id);
        if (idx > -1) selectedSpareParts.splice(idx, 1);
        reindexSpareParts();
        calculateTotalSpareParts();
        calculateAmountDue();
        updateImportButtonPosition();
    });
    return btn;
}

let createTrashOptionService = (id, idWoItem, nameCell, priceCell) => {
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
        priceCell.removeAttribute('contenteditable');
        btn.remove();
        if (idWoItem) servicesToDelete.push(idWoItem);
        const idx = selectedServices.findIndex(s => s.id === id);
        if (idx > -1) selectedServices.splice(idx, 1);
        reindexServices();
        calculateTotalService();
        calculateAmountDue();
    });
    return btn;
}

let extraMethodsSpare = () => {
    reindexSpareParts();
    updateImportButtonPosition();
}

let loadInfoPage = () => {
    if (idSale) {
        $("firstBread").textContent = "Ventas >";
        $("firstBread").href = "sales.html"
    }
    if(idWorkOrder){
        document.querySelector(".btnSubmitData").value = "Actualizar";
    }
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', async () => {
    const user = await initSession();
    if(!user)return;

    initStaticRows();
    loadInfoPage();
    await loadPayMethods();
    setupModalListeners();
    bindEvents();
    await loadDataVehicle();
    if (idWorkOrder) {
        await loadWorkOrder();
        validateDate(dtEstimated, dtEstimated.value);
    } else {
        validateDate(dtEstimated, new Date())
    }
    createInitialPaymentField(0, null, null, null, null, createBtnUrl, calculateRepairCost); // crea el primer campo de abono
    // ejecutar verifySelects inicialmente y también está atento a cambios dinámicos
    verifySelects();
    observeAmountsContainer(); // observa cambios en los abonos (dinámicos)
    // Si venimos de "añadir repuesto", revisar params para agregarlo automáticamente
    tryAddSpareFromUrl();
    if (isNewPart && idWorkOrder) {
        addNewPartToTable();
    } else if (isNewPart) {
        restoreOrderState();
        addNewPartToTable();
        saveCurrentOrderState();
    }
    calculateAllTotals();
});

let loadWorkOrder = async () => {
    const workOrder = await getWorkOrderById(idWorkOrder);
    workOrder.payments.forEach(payment => {
        createInitialPaymentField(payment.amount, payment.idPaymentMethod, payment.paymentURL, payment.idPayment, null, createBtnUrl, calculateRepairCost, paymentsToDelete)
    })
    loadSavedSpareParts(workOrder.spareParts);
    loadSavedServices(workOrder.services);

    document.getElementById("txtNotes").value = workOrder.notes || "";
    document.getElementById("dtEstimated").value = workOrder.estimatedDate || "";
}

// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function safeParseFloat(v) { const n = parseFloat(String(v || '').replace(/[$,\s]/g, '')); return isNaN(n) ? 0 : n; }


let loadDataVehicle = async () => {
    console.log(idVehicle)
    const vehicleData = await getDataVehicleById(idVehicle)
    if ($('vin')) $('vin').textContent = vehicleData.vin || '-';
    if ($('vehiclePrice')) $('vehiclePrice').textContent = `$${formatWithCommas(vehiclePrice || 0)}`;
    if ($('model')) $('model').textContent = vehicleData.model;
    if ($('brand')) $('brand').textContent = vehicleData.brand;
    if ($('year')) $('year').textContent = vehicleData.year

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
        div.addEventListener('click', () => addService({
            id: s.idService,
            name: s.nameService,
            price: 0
        }));
        boxServ.appendChild(div);
    });
    showElement(boxServ);
}

function renderSparePartSuggestions(list) {
    if (!boxSparePart) return;
    boxSparePart.innerHTML = '';
    console.log(list)
    list.forEach(p => {
        if (selectedSpareParts.some(x => x.id === p.idSpareParts)) return;
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
        div.addEventListener('click', () => addSparePart({
            id: p.idSpareParts,
            name: p.nameSpareParts,
            unitPrice: p.suggestedPrice
        }));
        console.log(div)
        boxSparePart.appendChild(div);
    });
    showElement(boxSparePart);
}

// ---------- Small UI helpers ----------
function showElement(el) { if (!el) return; el.classList.remove('hide'); el.classList.add('show'); }
function hideElement(el) { if (!el) return; el.classList.remove('show'); el.classList.add('hide'); }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }

// Ubica y coloca el botón IMPORTAR en la primera fila vacía de repuestos
function updateImportButtonPosition() {
    const tBody = $('tBodySpareParts');
    if (!tBody) return;
    // Primero eliminar cualquier btn-importar existente
    qsa('.btnImport').forEach(b => b.remove());

    const rows = Array.from(tBody.querySelectorAll('tr'));
    // buscar primera fila vacía
    for (const r of rows) {
        const name = r.querySelector('.tdName')?.textContent.trim() || '';
        if (name === '') {
            // crear celda para botón (solo si no existe)
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btnImport';
            btn.textContent = 'IMPORTAR';
            btn.addEventListener('click', () => {
                saveCurrentOrderState();
                const params = new URLSearchParams({
                    workOrder: true,
                    idWorkOrder,
                    idSale,
                    customerName,
                    idVehicle,
                    idCustomer,
                    totalPrice: vehiclePrice
                })
                window.location.href = `../../pages/sparePartsDetails.html?${params.toString()}`;
            });
            r.appendChild(btn);
            return;
        }
    }
    // Si no hay fila vacía, crear una más en ambas tablas y reintentarlo
    addRowToBothTables();
    updateImportButtonPosition();
}

// ---------- Servicios logic ----------
function addService(service) {
    // validar duplicados por id o nombre
    if (service.id && selectedServices.some(s => s.id === service.id)) { showMessage('warning', 'El servicio ya fue añadido'); return; }
    if (!service.id && selectedServices.some(s => s.name.toLowerCase() === service.name.toLowerCase())) { showMessage('warning', 'El servicio ya fue añadido'); return; }

    const obj = { id: service.id || null, name: service.name, price: service.price || 0, idWo: service.idWoService };
    // si append falla porque no hay fila vacía, appendServiceToDOM ahora añadirá filas y reintentará
    if (!appendToDom("#tBodyServices", obj, rowsServices, calculateTotalService, reindexServices, createTrashOptionService)) return;
    selectedServices.push(obj);
    txtAddService.value = '';
    hideElement(boxServ);
    calculateTotalService();
    calculateAmountDue();
}

function reindexServices() {
    const rows = qsa('#tBodyServices tr');
    let idx = 0;
    const active = [];
    const empty = [];
    rows.forEach(r => {
        const nameCell = r.querySelector('.tdName');
        if (nameCell && nameCell.textContent.trim() !== '') {
            const hidId = r.querySelector('.hidden-service-id'); if (hidId) hidId.name = `servicios[${idx}].id`;
            const hidName = r.querySelector('.hidden-service-name'); if (hidName) hidName.name = `servicios[${idx}].name`;
            const hidPrice = r.querySelector('.hidden-service-price'); if (hidPrice) hidPrice.name = `servicios[${idx}].price`;
            active.push(r); idx++;
        } else empty.push(r);
    });
    const frag = document.createDocumentFragment();
    active.forEach(r => frag.appendChild(r));
    empty.forEach(r => frag.appendChild(r));
    const tbody = $('tBodyServices');
    tbody.innerHTML = '';
    tbody.appendChild(frag);
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
    if (selectedSpareParts.some(x => x.id === p.id)) return;
    const data = {
        id: p.id,
        name: p.name,
        price: p.unitPrice || 0,
        idWo: p.idWorkOrder || null
    };
    if (!appendToDom("#tBodySpareParts", data, rowsSpareParts, calculateTotalSpareParts, extraMethodsSpare, createTrashOptionSpare)) return;
    selectedSpareParts.push(data);
    txtAddSparePart.value = '';
    hideElement(boxSparePart);
    calculateTotalSpareParts();
    calculateAmountDue();
    updateImportButtonPosition(); // mover el botón IMPORTAR a la siguiente fila vacía
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
    if ($('txtTotal')) $('txtTotal').value = `$${formatWithCommas(sum)}`;
    calculateTotal();
    return sum;
}

function calculateTotal() {
    const totalRepairCost = safeParseFloat(($('totalRepairCost') || {}).textContent);
    const vehiclePriceEl = safeParseFloat(($('vehiclePrice') || {}).textContent);
    if ($('totalCost')) $('totalCost').textContent = `$${formatWithCommas(totalRepairCost + vehiclePriceEl)}`;
}

function calculateAllTotals() { calculateTotalService(); calculateTotalSpareParts(); calculateRepairCost(); calculateTotal(); }

let calculateAmountDue = () => {
    const amountContainer = document.querySelector('.amounts');
    let payments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    let totalPaid = 0;
    payments.forEach(p => totalPaid += safeParseFloat(p.querySelector('.amountInput').value));
    const txtTotal = safeParseFloat(($('txtTotal') || {}).value);
    const debt = txtTotal - totalPaid;
    const dueText = $('due');
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(debt)}`; dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    }
}

// observe amounts container to react to dynamic changes (improves verifySelects reliability)
function observeAmountsContainer() {
    const container = document.querySelector('.amounts');
    if (!container || window.__amountsObserver) return;
    const observer = new MutationObserver(() => {
        verifySelects();
    });
    observer.observe(container, { childList: true, subtree: true });
    window.__amountsObserver = observer;
}

// ---------- Submit (FormData + POST) ----------
async function handleSubmit(e) {
    e.preventDefault();

    if (!idVehicle) { showMessage('warning', 'Por favor, seleccione un vehículo para la orden.'); return; }

    const formValues = getInputsValues(frmAddWorkOrder);
    const currentIdEmployee = await getCurrentEmployeeId();

    const {
        dtEstimated,
        txtNotes
    } = formValues;
    if (!dtEstimated) {
        highlightAndFocus($('dtEstimated'));
        showMessage('Fecha estimada faltante', 'Por favor, ingrese la fecha estimada de la orden', 'warning');
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
        const idAmount = amountContainers[i].dataset.id || null;

        const amountValue = safeParseFloat(amountInput.value);
        if (amountValue <= 0) {
            highlightAndFocus(amountInput);
            showMessage('Monto no valido', `Por favor, ingrese un monto válido para el abono ${i + 1}.`, 'warning');
            return;
        }
        if (!paymentTypeSelect.value) {
            highlightAndFocus(paymentTypeSelect);
            showMessage('Metodo de pago faltante', `Por favor, seleccione un método de pago para el abono ${i + 1}.`, 'warning');
            return;
        }
        if (!idWorkOrder) {
            if (!receiptInput || (receiptInput.files && receiptInput.files.length === 0)) {
                showMessage('Comprobante faltante', `Por favor, seleccione un comprobante para el abono ${i + 1}.`, 'warning');
                return;
            }
        }
        if (!currentIdEmployee) {
        showMessage('Su sesión ha expirado. Por favor recargue la página.', 'Sesión inválida', 'error');
        return false;
    }

        let obj = {
            amount: amountValue,
            idPaymentMethod: paymentTypeSelect.value,
            idEmployee: currentIdEmployee
        }
        if (idAmount) obj.idPayment = idAmount;
        amountData.push(obj);
        let imgs = {
            file: receiptInput.files[0] || null,
            isOld: amountContainers[i].dataset.id ? true : false
        }
        if (idAmount) imgs.idPayment = idAmount;
        imagesAmounts.push(imgs);
    }

    if (amountData.length == 0) {
        showMessage('Ningun abono registrado', 'Por favor, registrar al menos un abono', 'warning');
        return;
    }

    // servicios
    const services = [];
    const tBodyServices = $('tBodyServices');
    const activeServices = tBodyServices ? Array.from(tBodyServices.querySelectorAll('tr')).filter(r => r.querySelector('.tdName').textContent.trim() !== '') : [];
    for (const r of activeServices) {
        const idService = r.dataset.id;
        const nameService = r.querySelector('.tdName');
        const tdPrice = r.querySelector('.tdPrice');
        if ((idService || nameService) && tdPrice) {
            const obj = {
                idService: idService ? idService : null,
                nameService: nameService.textContent,
                priceApplied: safeParseFloat(tdPrice.textContent)
            };
            if (r.dataset.idWo) obj.idWorkOrderService = r.dataset.idWo;
            if (obj.priceApplied < 0) { showMessage('warning', `El precio del servicio '${obj.nameService}' es inválido.`); return; }
            services.push(obj);
        }
    }

    // repuestos
    const spareParts = [];
    const tBodyParts = $('tBodySpareParts');
    const activeParts = tBodyParts ? Array.from(tBodyParts.querySelectorAll('tr')).filter(r => r.querySelector('.tdName').textContent.trim() !== '') : [];
    for (const r of activeParts) {
        const idPart = r.dataset.id;
        const tdPrice = r.querySelector('.tdPrice');
        let obj = {
            idSparePart: idPart,
            priceApplied: safeParseFloat(tdPrice.textContent)
        }
        console.log(r, r.dataset.idWo)
        if (r.dataset.idWo) obj.idWorkOrderSpareParts = r.dataset.idWo;
        if (idPart && tdPrice) spareParts.push(obj);
    }

    if (spareParts.length == 0 && services.length == 0) {
        showMessage('Ningun servicio ni repuesto seleccionado', 'Por favor, seleccionar al menos un servicio o un repuesto', 'warning');
        return;
    }

    // construir FormData
    const fd = new FormData();
    const workOrderData = {
        idCustomer,
        notes: txtNotes || '',
        estimatedDate: dtEstimated,
        services,
        spareParts,
        idEmployee: currentIdEmployee,
        payments: amountData
    };
    if (idWorkOrder != null) {
        workOrderData.saveOrUpdateItems = workOrderData.spareParts;
        delete workOrderData.spareParts;
        workOrderData.saveOrUpdateService = workOrderData.services;
        delete workOrderData.services;
        workOrderData.saveOrUpdatePayments = workOrderData.payments;
        delete workOrderData.payments;
        workOrderData.serviceToDelete = servicesToDelete;
        workOrderData.itemsToDelete = sparePartsToDelete;
        workOrderData.paymentsToDelete = paymentsToDelete;
    }
    fd.append('workOrderData', JSON.stringify(workOrderData));
    imagesAmounts.forEach(objFile => {
        if (idWorkOrder) {
            if (objFile.isOld) {
                if (objFile.file == undefined) return;
                fd.append(objFile.idPayment, objFile.file);
            } else {
                fd.append("newPaymentImages", objFile.file);
            }
        } else {
            fd.append('paymentImages', objFile.file);
        }
    });

    try {
        let response;
        if (idWorkOrder != null) {
            response = await putWorkOrder(fd, idWorkOrder);
            await showMessage('Orden actualizada', 'Orden de trabajo actualizada con éxito.', "success");
        } else {
            response = await postWorkOrder(fd, idVehicle, idSale);
            await showMessage('Orden registrada', 'Orden de trabajo registrada con éxito.', "success");
        }
        if (response && idSale) {
            window.location.href = "sales.html";
        } else {
            window.location.href = "workOrders.html";
        }
        localStorage.removeItem("pendingOrder");
    } catch (err) {
        console.error('postWorkOrder', err);
        showMessage('error', err?.message || 'Error al registrar la orden', 'error');
    }
}

// ---------- Detectar repuesto agregado desde otra página ----------
function tryAddSpareFromUrl() {
    const newSpareId = params.get('newSpareId');
    const newSpareName = params.get('newSpareName');
    const newSparePrice = params.get('newSparePrice');

    if (newSpareId && newSpareName) {
        // Si ya existe, no duplicar
        if (!selectedSpareParts.some(s => s.id === newSpareId)) {
            addSparePart({
                id: newSpareId,
                name: newSpareName,
                unitPrice: safeParseFloat(newSparePrice || 0)
            });
        } else {
            updateImportButtonPosition();
        }
        // opcional: limpiar parámetros de URL (si quieres)
    } else {
        // asegurar que el botón IMPORTAR se posicione si no hay nuevo repuesto
        updateImportButtonPosition();
    }
}

function saveCurrentOrderState() {
    const orderState = {
        spareParts: getCurrentSpareParts(),
        services: getCurrentServices(),
        amounts: getCurrentAmounts(),
        description: document.getElementById("txtNotes")?.value || "",
        estimatedDate: document.getElementById("dtEstimated")?.value
    };

    localStorage.setItem("pendingOrder", JSON.stringify(orderState));
}

function getCurrentSpareParts() {
    const rows = document.querySelectorAll("#tBodySpareParts tr");
    const data = [];

    rows.forEach(row => {
        const id = row.querySelector(".hidden-part-id")?.value || null;
        const name = row.querySelector(".tdName")?.textContent || null;
        const price = row.querySelector(".hidden-part-unitPrice")?.value || null;

        if (id) {
            data.push({ id, name, price });
        }
    });

    return data;
}

function getCurrentServices() {
    const rows = document.querySelectorAll("#tBodyServices tr");
    const data = [];

    rows.forEach(row => {
        const id = row.querySelector(".hidden-service-id")?.value || null;
        const name = row.querySelector(".tdName")?.textContent || null;
        const price = row.querySelector(".hidden-service-price")?.value || null;

        if (id) {
            data.push({ id, name, price });
        }
    });

    return data;
}

function getCurrentAmounts() {
    const containers = document.querySelectorAll(".containerAmount");
    const data = [];

    containers.forEach(c => {
        const method = c.querySelector(".paymentTypeSelect")?.value || null;
        const amount = c.querySelector(".amountInput")?.value || null;

        if (method && amount) {
            data.push({ method, amount });
        }
    });

    return data;
}

function restoreOrderState() {
    const saved = localStorage.getItem("pendingOrder");
    if (!saved) return;

    const state = JSON.parse(saved);

    loadSavedSpareParts(state.spareParts);
    loadSavedServices(state.services);
    loadSavedAmounts(state.amounts);

    document.getElementById("txtNotes").value = state.description || "";
    document.getElementById("dtEstimated").value = state.estimatedDate || "";
}

function addNewPartToTable() {
    if (!newPartId || !newPartName) return;
    console.log(newSuggestedPrice)
    addSparePart({
        id: newPartId,
        name: newPartName,
        unitPrice: newSuggestedPrice
    });
}


// Helper: limpia filas activas de una tabla (no elimina la estructura de filas vacías)
function clearActiveRows(tbodySelector) {
    const tbody = document.querySelector(tbodySelector);
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(r => {
        const nameCell = r.querySelector('.tdName');
        if (nameCell && nameCell.textContent.trim() !== '') {
            // limpiar texto y celdas relacionadas
            nameCell.textContent = '';
            const priceCell = r.querySelector('.tdPrice');
            if (priceCell) {
                priceCell.textContent = '';
                priceCell.removeAttribute('contenteditable');
            }
            // eliminar inputs ocultos y botones asociados
            r.querySelectorAll('input[type="hidden"]').forEach(i => i.remove());
            const btn = r.querySelector('.btnTrash');
            if (btn) btn.remove();
            const importBtn = r.querySelector('.btnImport');
            if (importBtn) importBtn.remove();
        }
    });
}

// Restaurar repuestos guardados
function loadSavedSpareParts(sparePartsArray) {
    if (!Array.isArray(sparePartsArray) || sparePartsArray.length === 0) {
        // Asegurar posicion del boton IMPORTAR si no hay repuestos guardados
        updateImportButtonPosition();
        return;
    }

    // Limpiar filas activas actuales y estado
    clearActiveRows('#tBodySpareParts');
    selectedSpareParts.length = 0;
    rowsSpareParts = 0;
    reindexSpareParts(); // orden inicial

    // Añadir cada repuesto usando tu función pública (respeta validaciones)
    sparePartsArray.forEach(item => {
        const id = item.id || item.idSpareParts || item.idSpare || item.idWorkOrderSpareParts || null;
        const name = item.name || item.nameSpareParts || item.nameSparePart || item.nameSpare || item.nameSparePartName || item.sparePartName || '';
        const unitPrice = safeParseFloat(item.unitPrice || item.price || item.priceApplied || item.suggestedPrice || item.subtotal || 0);
        const idWorkOrder = item.idWorkOrderSpareParts || null;

        // Usa addSparePart para respetar toda la lógica existente (dup checks, reindex, totals)
        addSparePart({
            id,
            name,
            unitPrice,
            idWorkOrder
        });

        // si la fuente guardó cantidad/subtotal podrías restaurarlas aquí (opcional)
        // por ahora solo restaura id, nombre y precio unitario
    });

    // Actualizar UI final
    reindexSpareParts();
    updateImportButtonPosition();
    calculateTotalSpareParts();
    calculateAllTotals();
    verifySelects();
}

// Restaurar servicios guardados
function loadSavedServices(servicesArray) {
    if (!Array.isArray(servicesArray) || servicesArray.length === 0) {
        return;
    }

    // Limpiar filas activas actuales y estado
    clearActiveRows('#tBodyServices');
    selectedServices.length = 0;
    rowsServices = 0;
    reindexServices();

    servicesArray.forEach(item => {
        const id = item.idService || null;
        // intentar distintos nombres posibles
        const name = item.nameService || null;
        const price = safeParseFloat(item.price || item.priceApplied || item.servicePrice || 0);
        const idWoService = item.idWorkOrderService || null;
        // Llamar addService respetando duplicados y la lógica de tu app
        addService({
            id,
            name,
            price,
            idWoService
        });
    });

    // Actualizar UI
    reindexServices();
    calculateTotalService();
    calculateAllTotals();
    verifySelects();
}

// Restaurar abonos / amounts
function loadSavedAmounts(amountsArray) {
    const container = document.querySelector('.amounts');
    if (!container) return;

    // Limpiar todos los existentes y crear sólo el placeholder base
    container.innerHTML = '';
    // Si no hay amounts guardados, crear el campo inicial vacío
    if (!Array.isArray(amountsArray) || amountsArray.length === 0) {
        createInitialPaymentField(0, null, null, null, null, createBtnUrl, calculateRepairCost);
        verifySelects();
        return;
    }

    // Crear campos para cada amount guardado
    amountsArray.forEach((a, i) => {
        // createInitialPaymentField crea el campo y llena el select con paymentMethodsList
        // Pasamos amount y paymentMethodId si los tenemos
        const amt = safeParseFloat(a.amount || a.value || a.amountValue || 0);
        const method = a.method || a.paymentMethodId || a.idPaymentMethod || null;

        createInitialPaymentField(amt, method, null, null, null, createBtnUrl, calculateRepairCost);

        // si existiera una URL de comprobante en 'a.receiptUrl' podríamos marcar el botón:
        const lastIndex = container.children.length;
        const lastDiv = container.querySelector(`.containerAmount[data-index="${lastIndex}"]`);
        if (lastDiv && a.receiptUrl) {
            // buscar el btnVoucher y marcarlo
            const btn = lastDiv.querySelector('.btnVoucher');
            if (btn) {
                btn.classList.add('receipt-loaded');
                btn.setAttribute('data-receipt-url', a.receiptUrl);
            }
        }
    });

    // Añadir un campo vacío al final para permitir nuevos abonos (si no lo agregó la función)
    const payments = Array.from(container.querySelectorAll('.containerAmount'));
    const last = payments[payments.length - 1];
    if (last) {
        const lastVal = safeParseFloat(last.querySelector('.amountInput')?.value);
        if (!lastVal || lastVal === 0) {
            // aseguramos que siempre exista un campo vacío al final
            // (createInitialPaymentField dentro del loop habrá creado uno con valor; aquí agregamos vacía)
            createInitialPaymentField(0, null, null, null, null, createBtnUrl, calculateRepairCost);
        }
    } else {
        createInitialPaymentField(0, null, null, null, null, createBtnUrl, calculateRepairCost);
    }

    // Recalcular y verificar
    managePaymentsAndCalculateDebt(null, createBtnUrl, calculateRepairCost);
    verifySelects();
}
