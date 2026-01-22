import {
    getSparePartById,
    getSpareParts,
    postSparePart,
    putSparePart
} from '../service/spareParts.sale.service.js'
import { insertSpareParts } from '../controller/salesHelpers/loadTableSpareParts.js'
import { loadPayMethods, createInitialPaymentField, formatOnBlur, formatOnFocus, calculateDebt } from '../controller/salesHelpers/payments.js'
import { createRowTable } from '../controller/salesHelpers/loadRowTableSales.js'
import {
    formatWithCommas,
    allowDecimal,
    getInputsValues,
    showMessage,
    safeParseFloat,
    initSession,
    getCurrentEmployeeId
} from '../utils.js'

/* ---------------------------
Parámetros y constantes
--------------------------- */
const params = new URLSearchParams(window.location.search);
const customerName = params.get('customerName') || "Nombre del cliente";
const customerId = params.get("idCustomer") === "null" ? null : params.get("idCustomer");
const newPartId = sanitizeParam(params.get('sparePartId'));
const newPartName = sanitizeParam(params.get('sparePartName'));
const suggestedPrice = sanitizeParam(params.get('suggestedPrice'));
const frmSparePartSale = document.getElementById("frmSparePartSale");
const idSale = sanitizeParam(params.get("idSale"));
const isNewPart = params.get("isNewPart") === "true";

let currentIdEmployee = null;

const saleKey = `saleSpareState_customer_${customerId}`;

const btnAddPart = document.getElementById("btnAddPart");

/* Estado local */
const selectedItems = [];
const selectedPayments = [];
const itemsToDelete = [];
const paymentsToDelete = [];

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
        null,
        calculateTotal,
        paymentsToDelete,
        selectedPayments
    );
}

/* ---------------------------
Helpers
--------------------------- */
function sanitizeParam(param) {
    return param === null || param === "null" || param === "undefined" ? null : param;
}

let addEventsPrice = (price, arraySelected, id) => {
    price.contentEditable = "plaintext-only";  // ← FIX DEL CURSOR
    allowDecimal(price);

    price.addEventListener("input", () => {
        const cleanValue = safeParseFloat(price.textContent) || 0;
        const item = arraySelected.find(i => String(i.idSparePart) === String(id));
        if (item) item.priceApplied = cleanValue;
        calculateTotal();
        saveSaleState();
    });

    price.addEventListener("focus", (e) => {
        formatOnFocus(e);
    });

    price.addEventListener("blur", (e) => {
        formatOnBlur(e);
    });
}

let verifyIds = (idSparePart) => {
    return selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
}

let createTrashOption = (container, tr, id, idSaleItem) => {
    const btnTrash = document.createElement("button");
    btnTrash.classList.add("btnTrash");
    btnTrash.type = "button";
    const iconImg = document.createElement("img");

    iconImg.src = "../../media/appMedia/trashIcon.png";

    btnTrash.appendChild(iconImg);
    btnTrash.addEventListener("click", async () => {
        const index = selectedItems.findIndex(item => String(item.idSparePart) === String(id));
        if (index !== -1) selectedItems.splice(index, 1);
        tr.remove();
        calculateTotal();
        saveSaleState();
        if (idSaleItem) itemsToDelete.push(idSaleItem);
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
        await loadSpareParts();
    });
    return btnTrash;
}

let createBtnAdd = (sparePart, tr) => {
    const btnAddSparePart = document.createElement("button");
    btnAddSparePart.classList.add("btnPrimary", "btnAddPart");
    btnAddSparePart.textContent = "+";
    btnAddSparePart.addEventListener("click", () => {
        createRowTable("tBodySelected", sparePart.idSpareParts, sparePart.nameSpareParts, sparePart.suggestedPrice, createTrashOption, addEventsPrice, "sparePartName", "finalPrice", calculateTotal, null, selectedItems);
        tr.remove();
        saveSaleState();
    });
    return btnAddSparePart;
}

/* ---------------------------
DOMContentLoaded
--------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
    const user = await initSession();
    if (!user) return;
    currentIdEmployee = getCurrentEmployeeId();

    await loadPayMethods();

    // Cargar estado guardado (si existe)
    if (isNewPart) {
        const saved = await loadSaleState();
        if (saved && saved.selectedParts && saved.payments && saved.notes !== undefined) {
            await loadSavedData(saved.selectedParts, saved.payments, saved.notes, saved.itemsToDelete, saved.paymentsToDelete);
        }
    } else if (idSale) {
        await loadSale();
        createInitialPaymentField(0, null, null, null, null, null, calculateTotal, paymentsToDelete, selectedPayments);
    } else {
        ensureInitialPaymentField();
    }
    // Cargar inventario de repuestos
    await loadSpareParts();

    // mostrar nombre cliente
    const customerEl = document.getElementById("customerName");
    if (customerEl) customerEl.textContent = customerName;
    // input notas guarda estado
    document.getElementById("txtNotes")?.addEventListener("input", saveSaleState);
});

let loadSale = async () => {
    const sale = await getSparePartById(idSale);
    document.getElementById("txtNotes").value = sale.notes;
    document.querySelector(".btnSubmitData").value = "Actualizar"
    sale.payments.forEach(payment => {
        createInitialPaymentField(payment.amount, payment.idPaymentMethod, null, payment.idPayment, null, null, calculateTotal, paymentsToDelete, selectedPayments);
    });
    sale.sparePartItems.forEach(item => {
        console.log(item)
        createRowTable("tBodySelected", item.idSparePart, item.sparePartName, item.priceApplied, createTrashOption, addEventsPrice, "sparePartName", "finalPrice", calculateTotal, item.idSaleItem, selectedItems)
    })
}

/* ---------------------------
Cargar repuestos e insertarlos
--------------------------- */
async function loadSpareParts() {
    try {
        const spareParts = await getSpareParts();
        const list = Array.isArray(spareParts) ? spareParts : (spareParts?.content || []);
        insertSpareParts(list, "tBodyInventory", createBtnAdd, verifyIds);
    } catch (err) {
        console.error('Error cargando repuestos:', err);
        insertSpareParts([], "tBodyInventory", createBtnAdd, verifyIds);
    }
}

frmSparePartSale.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = getInputsValues(frmSparePartSale);

    const {
        txtNotes
    } = formData;

    const amountData = [];

    for (let i = 0; i < selectedPayments.length; i++) {
        const item = selectedPayments[i];

        // Validaciones básicas
        if (!item.amount || item.amount <= 0) {
            showMessage('Monto no válido', `Por favor, ingrese un monto válido para el abono ${i + 1}.`, 'warning');
            return;
        }
        if (!item.idPaymentMethod) {
            showMessage('Método de pago faltante', `Por favor, seleccione un método de pago para el abono ${i + 1}.`, 'warning');
            return;
        }
        // Datos para enviar al backend
        amountData.push({
            amount: item.amount,
            idPaymentMethod: item.idPaymentMethod,
            idPayment: item.idPayment || null,
            idEmployee: currentIdEmployee
        });
    }

    const sparePartItems = [];
    for (let i = 0; i < selectedItems.length; i++) {
        const id = selectedItems[i].idSparePart;
        const price = safeParseFloat(selectedItems[i].priceApplied);
        const idSaleItem = selectedItems[i].idSaleItem;
        if (isNaN(price) || price <= 0) {
            showMessage(`Por favor, ingrese un total válido para el repuesto ${i + 1}.`, 'total inválido', 'warning');
            return;
        }
        const objI = {
            idSparePart: id,
            priceApplied: price,
            idSaleItem: idSaleItem || null
        }
        sparePartItems.push(objI)
    }
    if (sparePartItems.length == 0) {
        showMessage(`Sin repuestos seleccionados`, 'Por favor, seleccione al menos un repuesto', 'warning');
        return;
    }

    if (amountData.length == 0) {
        showMessage(`Por favor, ingrese al menos un abono`, 'Sin abonos', 'warning');
        return;
    }

    const saleData = {
        idCustomer: customerId,
        notes: txtNotes || "",
        payments: amountData,
        idEmployee: currentIdEmployee,
        sparePartItems
    }

    if (idSale) {
        saleData.itemsToDelete = itemsToDelete;
        saleData.paymentsToDelete = paymentsToDelete;
        saleData.saveOrUpdateItems = saleData.sparePartItems;
        delete saleData.sparePartItems;
        saleData.saveOrUpdatePayments = saleData.payments;
        delete saleData.payments;
    }

    try {
        let response;
        if (idSale != null) {
            response = await putSparePart(saleData, idSale);
            await showMessage('Venta actualizada con exito,', 'Éxito', 'success');
            cleanWindow();
        } else {
            response = await postSparePart(saleData);
            await showMessage('Venta registrada con éxito.', 'Éxito', 'success');
            cleanWindow();
        }
        if (response) window.location.href = "sales.html";
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar la venta.';
        showMessage(errorMessage, 'error', 'error');
    }


})


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

/* Asegura existe al menos un campo de abono vacio */
function ensureInitialPaymentField() {
    const amountContainer = document.querySelector(".amounts");
    if (!amountContainer) return;
    if (amountContainer.children.length === 0) {
        createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal, paymentsToDelete, selectedPayments);
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

async function loadSavedData(parts, payments, notes, itemsToDel, paymentsToDel) {
    // parts: [{id,name,price}], payments: [{amount, paymentMethodId, receiptUrl}], notes: string

    // 2. Crear las filas de repuestos y esperar a que todas las operaciones asíncronas
    //    (como la creación de la fila y la carga de datos) terminen.
    const partCreationPromises = parts.map(sparePart => {
        return createRowTable(
            "tBodySelected",
            sparePart.idSparePart,
            sparePart.name,
            sparePart.priceApplied,
            createTrashOption,
            addEventsPrice,
            "sparePartName",
            "finalPrice",
            calculateTotal,
            sparePart.idSaleItem,
            selectedItems
        );
    });

    itemsToDelete.push(...(itemsToDel || []));
    paymentsToDelete.push(...(paymentsToDel || []));

    await Promise.all(partCreationPromises);
    // >> Ahora selectedItems está lleno con los IDs guardados.

    // 3. Añadir nuevo repuesto si viene por parámetro
    if (newPartId && !selectedItems.some(item => String(item.idSparePart) === String(newPartId))) {
        createRowTable(
            "tBodySelected",
            newPartId,
            newPartName,
            suggestedPrice,
            createTrashOption,
            addEventsPrice,
            "sparePartName",
            "finalPrice",
            calculateTotal,
            null,
            selectedItems
        );
    }
    // >> selectedItems ahora incluye los IDs guardados y el posible nuevo ID.

    // 4. Restaurar abonos (Pagos)
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = "";
    console.log("Restaurando abonos guardados:", payments);
    const paymentsNormalized = (payments || []).map(p => {
        return {
            idPayment: p.idPayment || null,
            amount: p.amount || 0,
            paymentMethodId: p.idPaymentMethod,
            receiptUrl: p.paymentURL || null
        };
    });

    if (paymentsNormalized.length === 0) {
        createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal, paymentsToDelete, selectedPayments);
    } else {
        let lastValueWasZero = false;
        paymentsNormalized.forEach((payment) => {
            createInitialPaymentField(payment.amount, payment.paymentMethodId, payment.receiptUrl, payment.idPayment, saveSaleState, null, calculateTotal, paymentsToDelete, selectedPayments);
            lastValueWasZero = (payment.amount === 0);
        });
        // Si el último abono tiene valor, añadimos un campo vacío extra
        if (!lastValueWasZero) createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal, paymentsToDelete, selectedPayments);
    }

    // 5. Restaurar notas
    const notesInput = document.getElementById("txtNotes");
    if (notesInput) notesInput.value = notes || "";

    // 6. Recalcular y guardar el estado final
    calculateDebt(saveSaleState, calculateTotal)

    // 7. El console.log ahora reflejará el estado final y completo de selectedItems
}

let cleanWindow = () => {

    // 2. Limpiar variables y estado local
    localStorage.removeItem(saleKey);

    frmSparePartSale.reset(); // Restablece todos los inputs del formulario

    // 4. Limpiar el contenedor de abonos dinámicos
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = ''; // Elimina todos los abonos

    // 5. 🔑 Crear el primer campo de abono vacío usando la función auxiliar
    createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal, paymentsToDelete, selectedPayments);

    // 6. Restablecer la deuda a cero
    document.getElementById("due").textContent = "$0";
    document.getElementById("due").style.color = 'var(--danger-color)';
};

function saveSaleState() {
    const notes = document.getElementById("txtNotes")?.value || "";
    const state = {
        selectedParts: selectedItems,
        payments: selectedPayments,
        notes,
        itemsToDelete,
        paymentsToDelete
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
        window.location.href = `sparePartsDetails.html?sale=true&idCustomer=${customerId}&customerName=${encodeURIComponent(customerName)}&idSale=${idSale || ""}`;
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
