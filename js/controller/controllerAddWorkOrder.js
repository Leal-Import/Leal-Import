// ordenes_trabajo.rewrite.js
// Reescritura completa - módulo Órdenes de Trabajo
// Mantén los imports tal como los usas en tu proyecto:
import { createBtnUrl, setupModalListeners } from '../controller/salesHelpers/picsAmounts.js'
import { calculateDebt, createInitialPaymentField, loadPayMethods } from '../controller/salesHelpers/payments.js'
import {
    getServices,
    postWorkOrder,
    getDataVehicleById,
    getSpareParts,
    getWorkOrderById,
    putWorkOrder
} from '../service/serviceAddWorkOrder.js'
import { appendToDom, addRowToBothTables } from '../controller/salesHelpers/loadTablesWO.js'
import {
    formatWithCommas,
    showMessage,
    getInputsValues,
    highlightAndFocus,
    validateDate,
    initSession,
    getCurrentEmployeeId,
    safeParseFloat,
    $,
    qsa
} from '../utils.js';

/*
  Resumen:
  - Módulo modular, validaciones, DOM dinámico para servicios/repuestos/abonos,
  - Modal para comprobantes, FormData con imágenes y POST a postWorkOrder.
*/

/* Buscadores o inputs txt y las cajas de las sugerencias */
const txtAddService = document.getElementById("txtAddService");
const boxServ = document.getElementById("suggestionsService");

const txtAddSparePart = document.getElementById("txtSearchSparePart");
const boxSparePart = document.getElementById("suggestionsSpareParts");


const frmAddWorkOrder = document.getElementById("frmWorkOrder");
const dtEstimated = document.getElementById("dtEstimated");

/* Parametros de la url */
const params = new URLSearchParams(window.location.search);
let customerName = params.get("customerName") || null;
let idVehicle = params.get("idVehicle") || null;
let idCustomer = params.get("idCustomer") === "null" ? null : params.get("idCustomer");
let vehiclePrice = params.get("totalPrice") || 0;
let idSale = params.get("idSale") === "null" ? null : params.get("idSale");
let idWorkOrder = params.get("idWorkOrder") === "null" ? null : params.get("idWorkOrder");
const isView = params.get("isView") === "true";

/* Parametros de un repuesto importado */
const isNewPart = params.get("isNewPart") === "true";
const newPartId = params.get("newSparePartId");
const newPartName = params.get("newSparePartName");
const newSuggestedPrice = params.get("newSuggestedPrice");

// Arrays que llevan el control de añadir actualizar o eliminar
const selectedServices = [];
const selectedSpareParts = [];
let selectedAmounts = [];
const sparePartsToDelete = [];
const servicesToDelete = [];
const paymentsToDelete = [];


/* Variables que sirven para contar las filas */
let rowsServices = 0;
let rowsSpareParts = 0;

// ---------- Utilities ----------


// ---------- Small UI helpers ----------
function showElement(el) { if (!el) return; el.classList.remove('hide'); el.classList.add('show'); }
function hideElement(el) { if (!el) return; el.classList.remove('show'); el.classList.add('hide'); }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }


const btnAddPayment = document.getElementById("btnAddPayment");

btnAddPayment.addEventListener("click", () => {
    addPaymentRow();
});

function addPaymentRow() {
    createInitialPaymentField(
        0,          // monto
        null,       // metodo pago
        null,       // comprobante
        null,       // idPayment
        null,
        createBtnUrl,
        calculateRepairCost,
        paymentsToDelete,
        selectedAmounts
    );
}

let createTrashOption = (id, idWoItem, nameCell, priceCell, tr, arrayDelete, arraySelected, extraMethods) => {
    // boton eliminar
    const btn = document.createElement('button');
    btn.className = 'btnTrash';
    btn.type = 'button';
    const img = document.createElement('img');
    img.src = '../../media/appMedia/trashIcon.png';
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        tr.removeAttribute("data-id");
        tr.removeAttribute('data-id-wo');
        nameCell.textContent = '';
        priceCell.textContent = '';
        priceCell.removeAttribute("contenteditable");
        btn.remove();
        if (idWoItem) arrayDelete.push(idWoItem);
        const idx = arraySelected.findIndex(item => {
            // existente (tabla intermedia)
            if (idWoItem) {
                return (
                    item.idWorkOrderService === idWoItem ||
                    item.idWorkOrderSpareParts === idWoItem
                );
            }
            // nuevo (solo id lógico)
            return item.id === id;
        });
        if (idx !== -1) {
            arraySelected.splice(idx, 1);
        }

        extraMethods();
        calculateDebt(null, calculateRepairCost);
    });
    return btn;
}

let extraMethodsDeleteSpare = () => {
    reindexSpareParts();
    calculateTotalSpareParts();
    updateImportButtonPosition();
}

let extraMethodsDeleteServices = () => {
    reindexServices();
    calculateTotalService();
}

/* Estos son metodos extra que se ejecuta cuando escribo en la celda de precios de la tabla de repuestos */
let extraMethodsSpare = () => {
    reindexSpareParts();
    updateImportButtonPosition();
}

/* Este metodo carga la pagina cuando la orden de trabajo se va actualizar y verifica si tambien ya se habia añadido una venta del vehiculo a reparar */
let loadInfoPage = () => {
    if (idSale) {
        $("firstBread").textContent = "Ventas >";
        $("firstBread").href = "sales.html"
    }
    if (idWorkOrder) {
        document.querySelector(".btnSubmitData").value = "Actualizar";
    }
}

/* Se carga el DOM */
document.addEventListener('DOMContentLoaded', async () => {
    const user = await initSession();
    if (!user) return;

    initStaticRows();
    loadInfoPage();
    await loadPayMethods();
    setupModalListeners();
    bindEvents();
    if (isNewPart) {
        await loadDataVehicle();
        restoreOrderState();
        addNewPartToTable();
    } else if (idWorkOrder) {
        await loadWorkOrder();
    } else {
        createInitialPaymentField(0, null, null, null, null, createBtnUrl, calculateRepairCost, paymentsToDelete, selectedAmounts); // crea el primer campo de abono
        await loadDataVehicle();
        validateDate(dtEstimated, new Date())
    }
    if (isView) loadViewData();
    else validateDate(dtEstimated, dtEstimated.value)
    // Si venimos de "añadir repuesto", revisar params para agregarlo automáticamente
    tryAddSpareFromUrl();
    calculateAllTotals();
});


/* En este metodo se cargara toda la informacion cuando esta interfaz este en modo solo ver */
let loadViewData = () => {
    $("btnCompleteOrder").classList.remove("hide");
    $("btnSendData").classList.add("hide");
    qsa(".containerInput").forEach(inp => {
        inp.classList.add("hide");
    })
}

/* Aca se carga la orden de trabajo gracias al id que se manda por parametro */
let loadWorkOrder = async () => {
    const workOrder = await getWorkOrderById(idWorkOrder);

    renderVehicleData(workOrder.vehicleInfo);

    loadSavedAmounts(workOrder.payments);
    loadSavedSpareParts(workOrder.spareParts);
    loadSavedServices(workOrder.services);
    document.getElementById("txtNotes").value = workOrder.notes || "";
    document.getElementById("dtEstimated").value = workOrder.estimatedDate || "";
}


let loadDataVehicle = async () => {
    const vehicleData = await getDataVehicleById(idVehicle)
    renderVehicleData(vehicleData);
}


// Este metodo sirve para crear las filas iniciales en cada tabla
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

/* Esta funcion inicializa varios eventos como la busqueda de servicios, repuestos y mandar los datos del form */
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
            addService({ idService: null, name: val, price: 0 });
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

/* Esta funcion inserta los datos solo del vehiculo en la interfaz  */
const renderVehicleData = (data) => {
    if (!data) return;
    if ($('vin')) $('vin').textContent = data.vin || '-';
    if ($('model')) $('model').textContent = data.model || '-';
    if ($('brand')) $('brand').textContent = data.brand || '-';
    if ($('year')) $('year').textContent = data.year || '-';
}

/* Esta funcion crea las sugerencias de los servicios */
function renderServiceSuggestions(list) {
    if (!boxServ) return;
    boxServ.innerHTML = '';
    list.forEach(s => {
        if (selectedServices.some(x => x.idService && x.idService === s.idService)) return;
        const div = document.createElement('div');
        div.className = 'suggestionItem';
        div.textContent = s.nameService;
        div.addEventListener('click', () => addService({
            idService: s.idService,
            name: s.nameService,
            price: 0
        }));
        boxServ.appendChild(div);
    });
    showElement(boxServ);
}

/* Esta funcion crea las sugerencias de los repuestos */
function renderSparePartSuggestions(list) {
    if (!boxSparePart) return;
    boxSparePart.innerHTML = '';
    list.forEach(p => {
        if (selectedSpareParts.some(x => x.idSparePart === p.idSpareParts)) return;
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
            idSparePart: p.idSpareParts,
            name: p.nameSpareParts,
            price: p.suggestedPrice
        }));
        boxSparePart.appendChild(div);
    });
    showElement(boxSparePart);
}

/* Ubica y coloca el botón IMPORTAR en la primera fila vacía de repuestos */
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

/* Esta funcion lleva la logica para añadir servicios cuando se le hace click a la sugerencia */
function addService(service) {
    // validar duplicados por id o nombre
    if (service.idService && selectedServices.some(s => s.idService === service.idService)) { showMessage('warning', 'El servicio ya fue añadido'); return; }
    if (!service.idService && selectedServices.some(s => s.name.toLowerCase() === service.name.toLowerCase())) { showMessage('warning', 'El servicio ya fue añadido'); return; }

    const obj = {
        id: crypto.randomUUID(),
        idService: service.idService || null,
        name: service.name,
        price: service.price || 0,
        idWorkOrderService: service.idWorkOrderService
    };
    // si append falla porque no hay fila vacía, appendServiceToDOM ahora añadirá filas y reintentará
    if (!appendToDom("tBodyServices", obj, rowsServices, calculateTotalService, reindexServices, createTrashOption, calculateDebt, calculateRepairCost, servicesToDelete, selectedServices, extraMethodsDeleteServices)) return;
    selectedServices.push(obj);
    txtAddService.value = '';
    hideElement(boxServ);
    calculateTotalService();
    calculateDebt(null, calculateRepairCost);
}

/* Esta funcion lleva la logica para añadir repuestos cuando se le hace click a la sugerencia */
function addSparePart(spare) {
    if (selectedSpareParts.some(x => x.idSparePart === spare.idSparePart)) return;
    const data = {
        id: crypto.randomUUID(),
        idSparePart: spare.idSparePart || null,
        name: spare.name,
        price: spare.price || 0,
        idWorkOrderSpareParts: spare.idWorkOrderSpareParts || null
    };
    if (!appendToDom("tBodySpareParts", data, rowsSpareParts, calculateTotalSpareParts, extraMethodsSpare, createTrashOption, calculateDebt, calculateRepairCost, sparePartsToDelete, selectedSpareParts, extraMethodsDeleteSpare)) return;
    selectedSpareParts.push(data);
    txtAddSparePart.value = '';
    hideElement(boxSparePart);
    calculateTotalSpareParts();
    calculateDebt(null, calculateRepairCost);
    updateImportButtonPosition(); // mover el botón IMPORTAR a la siguiente fila vacía
}

/* Esta funcion reordena los servicios */
function reindexServices() {
    const rows = qsa('#tBodyServices tr');
    let idx = 0;
    const active = [];
    const empty = [];
    rows.forEach(r => {
        const nameCell = r.querySelector('.tdName');
        if (nameCell && nameCell.textContent.trim() !== '') {
            const hidId = r.querySelector('.hidden-service-id');
            if (hidId) hidId.name = `servicios[${idx}].id`;
            const hidName = r.querySelector('.hidden-service-name');
            if (hidName) hidName.name = `servicios[${idx}].name`;
            const hidPrice = r.querySelector('.hidden-service-price');
            if (hidPrice) hidPrice.name = `servicios[${idx}].price`;
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

/* Esta funcion reordena los repuestos */
function reindexSpareParts() {
    const rows = qsa('#tBodySpareParts tr');
    let idx = 0;
    const active = [];
    const empty = [];
    rows.forEach(r => {
        const name = r.querySelector('.tdName');
        if (name && name.textContent.trim() !== '') {
            const hidId = r.querySelector('.hidden-part-id');
            if (hidId) hidId.name = `repuestos[${idx}].id`;
            const hidUnit = r.querySelector('.hidden-part-unitPrice');
            if (hidUnit) hidUnit.name = `repuestos[${idx}].unitPrice`;
            active.push(r); idx++;
        } else empty.push(r);
    });
    const frag = document.createDocumentFragment();
    active.forEach(r => frag.appendChild(r));
    empty.forEach(r => frag.appendChild(r));
    const tbody = $('tBodySpareParts');
    tbody.innerHTML = '';
    tbody.appendChild(frag);
    rowsSpareParts = idx;
}

/* Esta funcion calcula el total de los servicios */
function calculateTotalService() {
    const tds = qsa('#tBodyServices tr .tdPrice');
    let total = 0;
    tds.forEach(td => { const v = safeParseFloat(td.textContent); if (!isNaN(v)) total += v; });
    const el = $('totalValueService'); if (el) el.textContent = `$${formatWithCommas(total)}`;
    calculateRepairCost();
}

/* Esta funcion calcula el total de los repuestos */
function calculateTotalSpareParts() {
    const prices = qsa('#tBodySpareParts tr .tdPrice');
    let total = 0;
    prices.forEach(p => { const v = safeParseFloat(p.textContent); if (!isNaN(v)) total += v; });
    const el = $('totalValueSpareParts'); if (el) el.textContent = `$${formatWithCommas(total)}`;
    calculateRepairCost();
}

/* Esta funcion calcula el costo de la reparacion */
function calculateRepairCost() {
    const totalValueService = safeParseFloat(($('totalValueService') || {}).textContent);
    const totalValueSpareParts = safeParseFloat(($('totalValueSpareParts') || {}).textContent);
    const sum = totalValueService + totalValueSpareParts;
    if ($('totalRepairCost')) $('totalRepairCost').textContent = `$${formatWithCommas(sum)}`;
    if ($('txtTotal')) $('txtTotal').value = `$${formatWithCommas(sum)}`;
    calculateTotal();
    return sum;
}

/* Esta funcion calcula el total de todo sumando el cuanto vendi el vehiculo y el costo total de la reparacion normalmente es importante cuando la orden de trabajo viene luego de una venta */
function calculateTotal() {
    const totalRepairCost = safeParseFloat(($('totalRepairCost') || {}).textContent);
    const vehiclePriceEl = safeParseFloat(($('vehiclePrice') || {}).textContent);
    if ($('totalCost')) $('totalCost').textContent = `$${formatWithCommas(totalRepairCost + vehiclePriceEl)}`;
}

/* Esta funcion lo calcula todo */
function calculateAllTotals() { calculateTotalService(); calculateTotalSpareParts(); calculateRepairCost(); calculateTotal(); }

/* Este es el handle o el evento que se ejecuta cuando se manda el form de la orden */
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
const amountData = [];
const imagesAmounts = [];

for (let i = 0; i < selectedAmounts.length; i++) {
    const item = selectedAmounts[i];

    // Validaciones básicas
    if (!item.amount || item.amount <= 0) {
        showMessage('Monto no válido', `Por favor, ingrese un monto válido para el abono ${i + 1}.`, 'warning');
        return;
    }
    if (!item.idPaymentMethod) {
        showMessage('Método de pago faltante', `Por favor, seleccione un método de pago para el abono ${i + 1}.`, 'warning');
        return;
    }
    if (!idWorkOrder && !item.file) {
        showMessage('Comprobante faltante', `Por favor, seleccione un comprobante para el abono ${i + 1}.`, 'warning');
        return;
    }
    if (!currentIdEmployee) {
        showMessage('Su sesión ha expirado. Por favor recargue la página.', 'Sesión inválida', 'error');
        return false;
    }

    // Datos para enviar al backend
    amountData.push({
        amount: item.amount,
        idPaymentMethod: item.idPaymentMethod,
        idPayment: item.idPayment || null,
        idEmployee: currentIdEmployee
    });

    // Archivos / URLs de comprobante
    imagesAmounts.push({
        file: item.file || null,           // Archivo local
        paymentURL: item.paymentURL || '', // Archivo remoto si ya existe
        isOld: !!item.paymentURL,          // Indica si ya está subido
        idPayment: item.idPayment || null
    });
}

// Validación final
if (amountData.length === 0) {
    showMessage('Ningún abono registrado', 'Por favor, registre al menos un abono', 'warning');
    return;
}

    // servicios
    const services = [];
    for (const service of selectedServices) {
        const idService = service.idService;
        const nameService = service.name;
        const price = service.price;
        if (idService || nameService) {
            const obj = {
                idService: idService ? idService : null,
                nameService,
                priceApplied: safeParseFloat(price)
            };
            if (service.idWorkOrderService) obj.idWorkOrderService = service.idWorkOrderService;
            if (obj.priceApplied <= 0) { showMessage('Precio invalido', `El precio del servicio '${obj.nameService}' debe ser mayor a 0.`, 'warning'); return; }
            services.push(obj);
        }
    }
    // repuestos
    const spareParts = [];
    for (const sparePart of selectedSpareParts) {
        const idPart = sparePart.idSparePart;
        const price = sparePart.price;
        let obj = {
            idSparePart: idPart,
            priceApplied: safeParseFloat(price)
        }
        if (sparePart.idWorkOrderSpareParts) obj.idWorkOrderSpareParts = sparePart.idWorkOrderSpareParts;
        if (idPart && price) spareParts.push(obj);
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
                console.log(objFile)
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

/* Esta funcion añadade un repuesto que se importo gracias a los parametros que vienen de la url*/
function tryAddSpareFromUrl() {
    const newSpareId = params.get('newSpareId');
    const newSpareName = params.get('newSpareName');
    const newSparePrice = params.get('newSparePrice');

    if (newSpareId && newSpareName) {
        // Si ya existe, no duplicar
        if (!selectedSpareParts.some(s => s.idSparePart === newSpareId)) {
            addSparePart({
                idSparePart: newSpareId,
                name: newSpareName,
                price: safeParseFloat(newSparePrice || 0)
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

/* Este es un borrador de la orden que se ejecuta cuando se va a importar un repuesto */
function saveCurrentOrderState() {
    const orderState = {
        spareParts: selectedSpareParts,
        services: selectedServices,
        amounts: selectedAmounts,
        description: document.getElementById("txtNotes")?.value || "",
        estimatedDate: document.getElementById("dtEstimated")?.value
    };

    localStorage.setItem("pendingOrder", JSON.stringify(orderState));
}

/* Esta funcion carga los datos guardados */
function restoreOrderState() {
    const saved = localStorage.getItem("pendingOrder");
    if (!saved) return;
    
    const state = JSON.parse(saved);

    loadSavedSpareParts(state.spareParts);
    console.log(state.services);
    loadSavedServices(state.services);
    loadSavedAmounts(state.amounts);

    document.getElementById("txtNotes").value = state.description || "";
    document.getElementById("dtEstimated").value = state.estimatedDate || "";
}

function addNewPartToTable() {
    if (!newPartId || !newPartName) return;
    addSparePart({
        idSparePart: newPartId,
        name: newPartName,
        price: newSuggestedPrice
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
        const idSparePart = item.idSparePart || item.idSpare || null;
        const name = item.name || item.nameSpareParts || item.nameSparePart || item.nameSpare || item.nameSparePartName || item.sparePartName || '';
        const price = safeParseFloat(item.unitPrice || item.price || item.priceApplied || item.suggestedPrice || item.subtotal || 0);
        const idWorkOrderSpareParts = item.idWorkOrderSpareParts || null;

        // Usa addSparePart para respetar toda la lógica existente (dup checks, reindex, totals)
        addSparePart({
            idSparePart,
            name,
            price,
            idWorkOrderSpareParts
        });

        // si la fuente guardó cantidad/subtotal podrías restaurarlas aquí (opcional)
        // por ahora solo restaura id, nombre y precio unitario
    });

    // Actualizar UI final
    reindexSpareParts();
    updateImportButtonPosition();
    calculateTotalSpareParts();
    calculateAllTotals();
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
        const idService = item.idService || null;
        // intentar distintos nombres posibles
        const name = item.nameService || item.name || null;
        const price = safeParseFloat(item.price || item.priceApplied || item.servicePrice || 0);
        const idWorkOrderService = item.idWorkOrderService || null;
        // Llamar addService respetando duplicados y la lógica de tu app
        addService({
            idService,
            name,
            price,
            idWorkOrderService
        });
    });

    // Actualizar UI
    reindexServices();
    calculateTotalService();
    calculateAllTotals();
}

// Restaurar abonos / amounts
function loadSavedAmounts(amountsArray) {
    const container = document.querySelector('.amounts');
    if (!container) return;
    // Limpiar todos los existentes y crear sólo el placeholder base
    container.innerHTML = '';
    selectedAmounts = []; // Reiniciamos para evitar duplicados

    // Si no hay amounts guardados, crear el campo inicial vacío
    if (!Array.isArray(amountsArray) || amountsArray.length === 0) {
        createInitialPaymentField(0, null, null, null, null, createBtnUrl, calculateRepairCost, paymentsToDelete, selectedAmounts);
        return;
    }

    // 1️⃣ Ordenar por paymentNumber si existe
    const sortedAmounts = [...amountsArray].sort((a, b) => (a.paymentNumber || 0) - (b.paymentNumber || 0));

    // 2️⃣ Crear campos para cada amount guardado
    sortedAmounts.forEach((a) => {
        const amt = safeParseFloat(a.amount || a.value || a.amountValue || 0);
        const method = a.method || a.paymentMethodId || a.idPaymentMethod || null;
        const url = a.paymentURL || a.url || null;
        const idPayment = a.idPayment || null;

        // Crear la fila en DOM y actualizar selectedAmounts dentro de la función
        createInitialPaymentField(
            amt,
            method,
            url,
            idPayment, // Pasamos idPayment para mantener referencia
            null,
            createBtnUrl,
            calculateRepairCost,
            paymentsToDelete,
            selectedAmounts
        );
    });

    // Recalcular y verificar
    calculateDebt(null, calculateRepairCost);
}
