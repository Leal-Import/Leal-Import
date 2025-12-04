import {
    getSpareParts,
    postSparePart
} from '../service/serviceSparePartsSale.js'
import { getPaymentMethods } from '../service/serviceConfiguration.js'
import {
    formatWithCommas,
    allowDecimal,
    getInputsValues,
    showMessage
} from '../utils.js'

/* ---------------------------
   Parámetros y constantes
   --------------------------- */
const params = new URLSearchParams(window.location.search);
const customerName = params.get('customerName') || "Nombre del cliente";
const customerId = params.get('idCustomer') || null;
const newPartId = sanitizeParam(params.get('sparePartId'));
const newPartName = sanitizeParam(params.get('sparePartName'));
const suggestedPrice = sanitizeParam(params.get('suggestedPrice'));
const frmSparePartSale = document.getElementById("frmSparePartSale");

let currentId = null;

const saleKey = `saleState_cliente_${customerId}`;

const btnAddPart = document.getElementById("btnAddPart");

/* Estado local */
let selectedIds = [];
let paymentMethodsList = [];

/* ---------------------------
   Helpers
   --------------------------- */
function sanitizeParam(param) {
    return param === null || param === "null" || param === "undefined" ? null : param;
}

function setCursorToEnd(element) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function parseCurrencyStringToNumber(text) {
    if (!text) return 0;
    const clean = String(text).replace(/[$,]/g, "").trim();
    return parseFloat(clean) || 0;
}

/* Rellena un <select> con métodos de pago (usa la estructura esperada por tu API) */
function fillPaymentSelect(selectElement, selectedValue = null) {
    if (!selectElement) return;
    selectElement.innerHTML = "";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Seleccionar método";
    selectElement.appendChild(defaultOpt);

    (paymentMethodsList || []).forEach(method => {
        const option = document.createElement("option");
        // Asumo que la API usa idPaymentMethod y paymentMethod (ajusta si tu API usa nombres distintos)
        option.value = method.idPaymentMethod ?? method.id ?? "";
        option.textContent = method.paymentMethod ?? method.methodName ?? method.name ?? "Método";
        if (selectedValue && String(selectedValue) === String(option.value)) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });

    selectElement.dataset.filled = "true";
}

/* ---------------------------
   Cargar métodos de pago
   --------------------------- */
async function loadPayMethods() {
    try {
        const roles = await getPaymentMethods();
        // Tu API puede devolver array o { content: [...] }
        paymentMethodsList = Array.isArray(roles) ? roles : (roles?.content || []);
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        paymentMethodsList = [];
    }
}

/* ---------------------------
   DOMContentLoaded
   --------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
    await loadPayMethods();

    // Cargar estado guardado (si existe)
    const saved = loadSaleState();
    if (saved && saved.selectedParts && saved.payments && saved.notes !== undefined) {
        loadSavedData(saved.selectedParts, saved.payments, saved.notes);
    } else {
        // si no hay saved, crear primer campo de abono vacío
        ensureInitialPaymentField();
    }

    // Cargar inventario de repuestos
    await loadSpareParts();

    // mostrar nombre cliente
    const customerEl = document.getElementById("customerName");
    if (customerEl) customerEl.textContent = customerName;

    // Asegurar que el primer campo tenga behavior decimal y listener
    const firstAmount = document.querySelector('.amounts .amountInput');
    if (firstAmount) {
        allowDecimal(firstAmount);
        firstAmount.addEventListener("input", managePaymentsAndCalculateDebt);
        firstAmount.closest('.containerAmount')?.setAttribute('data-index', '1');
    }

    // input notas guarda estado
    document.getElementById("txtNotes")?.addEventListener("input", saveSaleState);
});

/* ---------------------------
   Cargar repuestos e insertarlos
   --------------------------- */
async function loadSpareParts() {
    try {
        const spareParts = await getSpareParts();
        const list = Array.isArray(spareParts) ? spareParts : (spareParts?.content || []);
        insertSpareParts(list);
    } catch (err) {
        console.error('Error cargando repuestos:', err);
        insertSpareParts([]);
    }
}

function insertSpareParts(spareParts) {
    const container = document.getElementById("tBodyInventory");
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
    } else {
        spareParts.forEach(sparePart => {
            let idSelected
            selectedIds.forEach(id => {
                if (id == sparePart.idSpareParts) idSelected = true;
            });
            console.log(selectedIds, idSelected, sparePart.idSpareParts)
            if (idSelected) return;

            const tr = document.createElement("tr");
            const tdImage = document.createElement("td");
            const image = document.createElement("img");
            const name = document.createElement("td");
            const cost = document.createElement("td");
            const suggestedPriceTd = document.createElement("td");
            const btnAddSparePart = document.createElement("button");

            image.src = sparePart.photoUrl || "";
            name.textContent = sparePart.nameSpareParts || "Sin nombre";
            cost.textContent = `$${formatWithCommas(sparePart.total || 0)}`;
            suggestedPriceTd.textContent = `$${formatWithCommas(sparePart.suggestedPrice || 0)}`;

            tr.classList.add("tableRow");
            btnAddSparePart.classList.add("btnPrimary", "btnAddPart");
            image.classList.add("imgSparePart");
            btnAddSparePart.textContent = "+";

            tdImage.appendChild(image);
            tr.append(tdImage, name, cost, suggestedPriceTd, btnAddSparePart);
            fragment.appendChild(tr);

            btnAddSparePart.addEventListener("click", () => {
                console.log(sparePart.idSparePart, sparePart.idSpareParts)
                selectedIds.push(sparePart.idSpareParts);
                createRowSparePart(sparePart.idSpareParts, sparePart.nameSpareParts, sparePart.suggestedPrice);
                tr.remove();
                saveSaleState();
            });
        });
    }

    container.appendChild(fragment);
}

frmSparePartSale.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = getInputsValues(frmSparePartSale);

    const {
        txtNotes
    } = formData;

    const amountData = [];

    const amounts = document.querySelectorAll('.containerAmount');

    for (let i = 0; i < amounts.length - 1; i++) {
        const amountInput = amounts[i].querySelector('.amountInput');
        const paymentTypeSelect = amounts[i].querySelector('.paymentTypeSelect');
        const amountValue = parseFloat(amountInput.value.replace(/[$,]/g, ""));

        if (isNaN(amountValue) || amountValue <= 0) {
            highlightAndFocus(amountInput);
            showMessage(`Por favor, ingrese un monto válido para el abono ${i + 1}.`, 'Monto inválido', 'warning');
            return;
        }
        if (paymentTypeSelect.value == "") {
            highlightAndFocus(paymentTypeSelect);
            showMessage(`Por favor, seleccione un método de pago para el abono ${i + 1}.`, 'Método de pago requerido', 'warning');
            return;
        }
        amountData.push({
            amount: amountValue,
            idPaymentMethod: paymentTypeSelect.value,
            idEmployee: "490250a0-d247-4b7a-b862-3f38b79d798b" /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
        });
    }

    const sparePartItems = [];
    const spareParts = document.querySelectorAll("#tBodySelected tr[data-id]")
    for (let i = 0; i < spareParts.length; i++) {
        const id = spareParts[i].dataset.id;
        const price = spareParts[i].querySelector(".finalPrice");
        const amountValue = parseFloat(price.textContent.replace(/[$,]/g, ""));

        if (isNaN(amountValue) || amountValue <= 0) {
            showMessage(`Por favor, ingrese un total válido para el repuesto ${i + 1}.`, 'total inválido', 'warning');
            return;
        }
        sparePartItems.push({
            idSparePart: id,
            priceApplied: amountValue
        })
    }
    if (sparePartItems.length == 0) {
        showMessage(`Sin repuestos seleccionados`, 'Por favor, seleccione al menos un repuesto', 'warning');
        return;
    }

    const saleData = {
        idCustomer: customerId,
        notes: txtNotes || "",
        idEmployee: "490250a0-d247-4b7a-b862-3f38b79d798b", /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
        payments: amountData,
        sparePartItems
    }

    try {
        if (currentId != null) {

        } else {
            let response = await postSparePart(saleData);
            await showMessage('Venta registrada con éxito.', 'Éxito', 'success');
            cleanWindow();
        }
        window.location.href = "sales.html";
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar la venta.';
        showMessage(errorMessage, 'error', 'error');
    }


})

/* ---------------------------
   Crear fila de repuesto seleccionado
   --------------------------- */
function createRowSparePart(id, name, suggestedPrice) {
    const container = document.getElementById("tBodySelected");
    if (!container) return;

    // Remover row 'no data' si existe
    const rowNoData = container.querySelector(".rowNoData");
    if (rowNoData) rowNoData.remove();

    const tr = document.createElement("tr");
    const partName = document.createElement("td");
    const price = document.createElement("td");
    const btnTrash = document.createElement("button");
    const iconImg = document.createElement("img");

    iconImg.src = "../../media/appMedia/trashIcon.png";

    partName.textContent = name;
    price.textContent = `$${formatWithCommas(suggestedPrice)}`;
    price.setAttribute("contenteditable", true);

    tr.setAttribute("data-id", id);
    partName.classList.add("sparePartName");
    price.classList.add("finalPrice");
    btnTrash.classList.add("btnTrash");
    tr.classList.add("tableRow");

    price.addEventListener("input", formatAndRestrictPrice);

    btnTrash.appendChild(iconImg);
    tr.append(partName, price, btnTrash);
    container.appendChild(tr);

    btnTrash.addEventListener("click", async () => {
        const deleteId = selectedIds.findIndex(idS => String(idS) === String(id));
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
    });

    calculateTotal();
}

/* ---------------------------
   Formateo y restricción de precio (contenteditable)
   --------------------------- */
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
    saveSaleState();
}

/* ---------------------------
   Cálculos: total, pagado, deuda
   --------------------------- */
function calculateTotal() {
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

    if (totalText) totalText.textContent = `$${formatWithCommas(total)}`;
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(due)}`;
        dueText.style.color = due > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    }

    if (total === 0) {
        containerDue?.classList.remove("show");
        containerTotal?.classList.remove("show");
    } else {
        containerDue?.classList.add("show");
        containerTotal?.classList.add("show");
    }

    return total;
}

function calculatePaid() {
    let totalPaid = 0;
    const amountInputs = document.querySelectorAll(".amounts .amountInput");
    amountInputs.forEach(input => {
        const cleanValue = (input.value || "").toString().replace(/[$,]/g, "") || "0";
        totalPaid += parseFloat(cleanValue) || 0;
    });
    return totalPaid;
}

/* ---------------------------
   Manejo de abonos dinámicos
   --------------------------- */
function managePaymentsAndCalculateDebt() {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    // Eliminar abonos vacíos excepto el primero
    let allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    allPayments.forEach((payment, idx) => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat((input?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (idx > 0 && value === 0) payment.remove();
    });

    // Refrescar nodos y renumerar
    allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));
    allPayments.forEach((payment, i) => {
        const number = i + 1;
        payment.setAttribute("data-index", number);
        const input = payment.querySelector(".amountInput");
        if (input) input.placeholder = `Abono ${number}`;

        // Asegurar que los selects estén llenos
        const select = payment.querySelector(".paymentTypeSelect");
        if (select && !select.dataset.filled) {
            fillPaymentSelect(select);
        }
    });

    // Recalcular total pagado
    let totalPaid = 0;
    allPayments.forEach(payment => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat((input?.value || "").toString().replace(/[$,]/g, "")) || 0;
        totalPaid += value;
    });

    // Si el último abono tiene valor → crear otro campo vacío
    const lastPayment = allPayments[allPayments.length - 1];
    if (lastPayment) {
        const lastInput = lastPayment.querySelector(".amountInput");
        const lastValue = parseFloat((lastInput?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (lastValue > 0) addNewPaymentField();
    } else {
        // No hay campos, crear uno
        createInitialPaymentField();
    }

    // Calcular deuda y actualizar UI
    const totalSale = calculateTotal();
    const debt = totalSale - totalPaid;
    const dueText = document.getElementById("due");
    if (dueText) {
        dueText.textContent = `$${formatWithCommas(debt)}`;
        dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    }

    saveSaleState();
}

/* Crear nuevo campo de abono con select relleno */
function addNewPaymentField() {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    const lastChild = amountContainer.lastElementChild;
    if (lastChild) {
        const lastInput = lastChild.querySelector(".amountInput");
        const lastValue = parseFloat((lastInput?.value || "").toString().replace(/[$,]/g, "")) || 0;
        if (lastValue === 0) return; // si ultimo está vacío, no crear
    }

    const index = amountContainer.children.length + 1;
    // crear field usando la función que centraliza comportamiento
    createInitialPaymentField(0, null, null);
    saveSaleState();
}

/* Asegura existe al menos un campo de abono vacio */
function ensureInitialPaymentField() {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;
    if (amountContainer.children.length === 0) {
        createInitialPaymentField(0, null, null);
    }
}

/* ---------------------------
   Crear campo de abono (input + select + comprobante botón)
   --------------------------- */
function createInitialPaymentField(amount = 0, paymentMethodId = null, receiptUrl = null) {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;

    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);

    // Input monto
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    input.id = `amountInput${index}`;

    if (amount > 0) {
        input.value = `$${formatWithCommas(amount)}`;
    }

    allowDecimal(input);
    input.addEventListener("input", managePaymentsAndCalculateDebt);

    // Select metodo pago
    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");
    select.id = `paymentTypeSelect${index}`;
    select.addEventListener("change", saveSaleState);

    // Llenar select con métodos de pago cargados
    fillPaymentSelect(select, paymentMethodId);

    // Ensamblar
    div.append(input, select);
    amountContainer.appendChild(div);

    // Si vino con amount sin formato, formatearlo
    if (amount > 0 && input.value && !input.value.startsWith('$')) {
        input.value = `$${formatWithCommas(parseCurrencyStringToNumber(input.value))}`;
    }
}

/* ---------------------------
   Guardar / Cargar estado en localStorage
   --------------------------- */
function loadSaleState() {
    const raw = localStorage.getItem(saleKey);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Estado guardado corrupto:", e);
        return null;
    }
}

function loadSavedData(parts, payments, notes) {
    // parts: [{id,name,price}], payments: [{amount, paymentMethodId, receiptUrl}], notes: string
    selectedIds = parts.map(p => p.id);

    // Restaurar repuestos seleccionados
    parts.forEach(part => {
        createRowSparePart(part.id, part.name, part.price);
    });

    // Si hay nuevo repuesto por param
    if (newPartId && !selectedIds.includes(newPartId)) {
        selectedIds.push(newPartId);
        createRowSparePart(newPartId, newPartName, suggestedPrice || 0);
    }

    // Restaurar abonos
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = "";

    // payments puede venir como array de números (compatibilidad) o como objetos
    const paymentsNormalized = (payments || []).map(p => {
        if (typeof p === 'number') return { amount: p, paymentMethodId: null, receiptUrl: null };
        return {
            amount: p.amount || 0,
            paymentMethodId: p.paymentMethodId || p.paymentMethod || null,
            receiptUrl: p.receiptUrl || null
        };
    });

    if (paymentsNormalized.length === 0) {
        createInitialPaymentField(0, null, null);
    } else {
        let lastValueWasZero = false;
        paymentsNormalized.forEach((payment, index) => {
            createInitialPaymentField(payment.amount, payment.paymentMethodId, payment.receiptUrl);
            lastValueWasZero = (payment.amount === 0);
        });
        // Si el último abono tiene valor, añadimos un campo vacío extra
        if (!lastValueWasZero) createInitialPaymentField(0, null, null);
    }

    // Restaurar notas
    const notesInput = document.getElementById("txtNotes");
    if (notesInput) notesInput.value = notes || "";

    managePaymentsAndCalculateDebt();
}

let cleanWindow = () => {
    // 1. Ocultar la Ficha del Vehículo (Columna Izquierda)
    document.querySelector(".viewVechicleContainer").classList.add("hide");

    // 2. Limpiar variables y estado local
    localStorage.removeItem(saleKey);

    frmSparePartSale.reset(); // Restablece todos los inputs del formulario

    // 4. Limpiar el contenedor de abonos dinámicos
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = ''; // Elimina todos los abonos

    // 5. 🔑 Crear el primer campo de abono vacío usando la función auxiliar
    createInitialPaymentField();

    // 6. Restablecer la deuda a cero
    document.getElementById("due").textContent = "$0";
    document.getElementById("due").style.color = 'var(--danger-color)';
};

function saveSaleState() {

    // selected parts
    const parts = [];
    document.querySelectorAll("#tBodySelected tr[data-id]").forEach(tr => {
        const id = tr.getAttribute("data-id");
        const name = tr.querySelector(".sparePartName")?.textContent || "";
        const priceText = tr.querySelector(".finalPrice")?.textContent.replace(/[$,]/g, "") || "0";
        const price = parseFloat(priceText) || 0;
        parts.push(
            { id, name, price });
    });
    selectedIds = parts.map(p => p.id);

    // pagos: objeto con amount y paymentMethodId y opcional receiptUrl
    const payments = [...document.querySelectorAll(".containerAmount")].map(div => {
        const input = div.querySelector(".amountInput");
        const select = div.querySelector(".paymentTypeSelect");
        const voucherBtn = div.querySelector(".btnVoucher");
        const amount = parseFloat((input?.value || "").toString().replace(/[$,]/g, "")) || 0;
        const paymentMethodId = select?.value || null;
        const receiptUrl = voucherBtn?.dataset?.receiptUrl || null;
        return { amount, paymentMethodId, receiptUrl };
    });

    const notes = document.getElementById("txtNotes")?.value || "";

    const state = {
        selectedParts: parts,
        payments,
        notes
    };

    localStorage.setItem(saleKey, JSON.stringify(state));
}

/* ---------------------------
   Botón agregar repuesto (redirección)
   --------------------------- */
if (btnAddPart) {
    btnAddPart.addEventListener("click", (e) => {
        e.preventDefault();
        saveSaleState();
        window.location.href = `sparePartsDetails.html?sale=true&idCustomer=${customerId}&customerName=${encodeURIComponent(customerName)}`;
    });
}

/* ---------------------------
   Inicializar row 'No hay repuestos seleccionados' si aplica
   --------------------------- */
(function ensureNoDataRow() {
    const container = document.getElementById("tBodySelected");
    if (!container) return;
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
})();

/* ---------------------------
   Export (si necesitas exponer funciones)
   --------------------------- */
// export { saveSaleState, loadSaleState } // descomenta si se importan desde otro módulo
