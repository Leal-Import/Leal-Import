import {
    getSparePartById,
    getSpareParts,
    postSparePart
} from '../service/serviceSparePartsSale.js'
import { managePaymentsAndCalculateDebt, loadPayMethods, createInitialPaymentField, formatOnBlur, formatOnFocus, verifySelects } from '../controller/salesHelpers/payments.js'
import { createRowTable } from '../controller/salesHelpers/loadRowTableSales.js'
import {
    formatWithCommas,
    allowDecimal,
    getInputsValues,
    showMessage,
    highlightAndFocus
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
const idSale = sanitizeParam(params.get("idSale"));

const saleKey = `saleSpareState_customer_${customerId}`;

const btnAddPart = document.getElementById("btnAddPart");

/* Estado local */
let selectedIds = [];

/* ---------------------------
Helpers
--------------------------- */
function sanitizeParam(param) {
    return param === null || param === "null" || param === "undefined" ? null : param;
}

let addEventsPrice = (price) => {
    price.contentEditable = "plaintext-only";  // ← FIX DEL CURSOR
    allowDecimal(price);

    price.addEventListener("input", () => {
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


let createTrashOption = async (container, tr, id) => {
    const btnTrash = document.createElement("button");
    btnTrash.classList.add("btnTrash");
    btnTrash.type = "button";
    const iconImg = document.createElement("img");

    iconImg.src = "../../media/appMedia/trashIcon.png";

    btnTrash.appendChild(iconImg);

    btnTrash.addEventListener("click", async () => {
        console.log(selectedIds);
        const deleteId = selectedIds.findIndex(idS => String(idS) === String(id));
        if (deleteId !== -1) selectedIds.splice(deleteId, 1);
        tr.remove();
        calculateTotal();
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
        await loadSpareParts();
    });
    await loadSpareParts();
    return btnTrash;
}

/* ---------------------------
DOMContentLoaded
--------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
    await loadPayMethods();

    // Cargar estado guardado (si existe)
    const saved = await loadSaleState();
    if (saved && saved.selectedParts && saved.payments && saved.notes !== undefined && !idSale) {
        await loadSavedData(saved.selectedParts, saved.payments, saved.notes);
    } else if (idSale) {
        await loadSale()
        createInitialPaymentField(0, null, null, null, null, null, calculateTotal);
    } else {
        // si no hay saved, crear primer campo de abono vacío
        ensureInitialPaymentField();
    }
    console.log(selectedIds)
    // Cargar inventario de repuestos
    await loadSpareParts();

    // mostrar nombre cliente
    const customerEl = document.getElementById("customerName");
    if (customerEl) customerEl.textContent = customerName;

    // Asegurar que el primer campo tenga behavior decimal y listener
    const firstAmount = document.querySelector('.amounts .amountInput');
    if (firstAmount) {
        allowDecimal(firstAmount);
        firstAmount.addEventListener("input", () => {
            managePaymentsAndCalculateDebt(saveSaleState, null, calculateTotal);
        });
        firstAmount.closest('.containerAmount')?.setAttribute('data-index', '1');
    }

    verifySelects();
    // input notas guarda estado
    document.getElementById("txtNotes")?.addEventListener("input", saveSaleState);
});

let loadSale = async () => {
    const sale = await getSparePartById(idSale);
    document.getElementById("txtNotes").value = sale.notes;
    document.querySelector(".btnSubmitData").value = "Actualizar"
    sale.payments.forEach(payment => {
        createInitialPaymentField(payment.amount, payment.idPaymentMethod, null, payment.idPayment, null, null, calculateTotal);
    });
    sale.sparePartItems.forEach(async item => {
        await createRowTable("tBodySelected", item.idSaleItem, item.sparePartName, item.priceApplied, createTrashOption, addEventsPrice, "sparePartName", "finalPrice", calculateTotal)
    })
}

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
            let idSelected;
            selectedIds.forEach(id => {
                if (id == sparePart.idSpareParts) idSelected = true;
            });
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

            btnAddSparePart.addEventListener("click", async () => {
                selectedIds.push(sparePart.idSpareParts);
                await createRowTable("tBodySelected", sparePart.idSpareParts, sparePart.nameSpareParts, sparePart.suggestedPrice, createTrashOption, addEventsPrice, "sparePartName", "finalPrice", calculateTotal);
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
            idEmployee: "810b89d1-2ff4-47e2-9e5b-8404ac05c899" /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
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

    if (amountData.length == 0) {
        showMessage(`Por favor, ingrese al menos un abono`, 'Sin abonos', 'warning');
        return;
    }

    const saleData = {
        idCustomer: customerId,
        notes: txtNotes || "",
        idEmployee: "810b89d1-2ff4-47e2-9e5b-8404ac05c899", /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
        payments: amountData,
        sparePartItems
    }

    try {
        if (idSale != null) {

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
        createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal);
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

async function loadSavedData(parts, payments, notes) {
    // parts: [{id,name,price}], payments: [{amount, paymentMethodId, receiptUrl}], notes: string

    // 1. Inicializar selectedIds con los IDs guardados (Síncrono)
    selectedIds = parts.map(p => p.id);

    // 2. Crear las filas de repuestos y esperar a que todas las operaciones asíncronas
    //    (como la creación de la fila y la carga de datos) terminen.
    const partCreationPromises = parts.map(sparePart => {
        return createRowTable(
            "tBodySelected",
            sparePart.id,
            sparePart.name,
            sparePart.price,
            createTrashOption,
            addEventsPrice,
            "sparePartName",
            "finalPrice",
            calculateTotal
        );
    });

    await Promise.all(partCreationPromises);
    // >> Ahora selectedIds está lleno con los IDs guardados.

    // 3. Añadir nuevo repuesto si viene por parámetro
    if (newPartId && !selectedIds.includes(newPartId)) {
        selectedIds.push(newPartId);
        await createRowTable(
            "tBodySelected",
            newPartId,
            newPartName,
            suggestedPrice,
            createTrashOption,
            addEventsPrice,
            "sparePartName",
            "finalPrice",
            calculateTotal
        );
    }
    // >> selectedIds ahora incluye los IDs guardados y el posible nuevo ID.

    // 4. Restaurar abonos (Pagos)
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = "";

    const paymentsNormalized = (payments || []).map(p => {
        return {
            amount: p.amount || 0,
            paymentMethodId: p.paymentMethodId,
            receiptUrl: p.receiptUrl || null
        };
    });

    if (paymentsNormalized.length === 0) {
        createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal);
    } else {
        let lastValueWasZero = false;
        paymentsNormalized.forEach((payment) => {
            createInitialPaymentField(payment.amount, payment.paymentMethodId, payment.receiptUrl, null, saveSaleState, null, calculateTotal);
            lastValueWasZero = (payment.amount === 0);
        });
        // Si el último abono tiene valor, añadimos un campo vacío extra
        if (!lastValueWasZero) createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal);
    }

    // 5. Restaurar notas
    const notesInput = document.getElementById("txtNotes");
    if (notesInput) notesInput.value = notes || "";

    // 6. Recalcular y guardar el estado final
    managePaymentsAndCalculateDebt(saveSaleState, null, calculateTotal);

    // 7. El console.log ahora reflejará el estado final y completo de selectedIds
    console.log(selectedIds);
}

let cleanWindow = () => {

    // 2. Limpiar variables y estado local
    localStorage.removeItem(saleKey);

    frmSparePartSale.reset(); // Restablece todos los inputs del formulario

    // 4. Limpiar el contenedor de abonos dinámicos
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = ''; // Elimina todos los abonos

    // 5. 🔑 Crear el primer campo de abono vacío usando la función auxiliar
    createInitialPaymentField(0, null, null, null, saveSaleState, null, calculateTotal);

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
