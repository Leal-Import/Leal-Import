import { loadVehicle } from '../controller/salesHelpers/loadInfoVehicle.js'
import { verifySelects, managePaymentsAndCalculateDebt, loadPayMethods, createInitialPaymentField, formatOnFocus, formatOnBlur } from '../controller/salesHelpers/payments.js'
import { createBtnUrl, setupModalListeners } from '../controller/salesHelpers/picsAmounts.js'
import {
    postVehicle,
    getVehiclesAviable,
    putVehicle,
    getSaleById
} from '../service/serviceVehicleSale.js'
import {
    formatWithCommas,
    allowDecimal,
    getInputsValues,
    highlightAndFocus,
    cleanNumber,
    showMessage
} from '../utils.js'

const params = new URLSearchParams(window.location.search);
const customerName = params.get('customerName') || "Nombre del cliente";
const customerId = params.get('idCustomer') || null;
const saleKey = `saleVehicleState_customer_${customerId}`;

const txtTotal = document.getElementById("txtTotal");
const txtCommission = document.getElementById("txtCommission");
const frmVehicleSale = document.getElementById("frmVehicleSale");
const btnCreateOrder = document.getElementById("btnCreateOrder");

let vehicleId = params.get('idVehicle') || null;
let idSale = params.get('idSale') || null;
function safeParseFloat(v) { const n = parseFloat(String(v || '').replace(/[$,\s]/g, '')); return isNaN(n) ? 0 : n; }

const paymentsToDelete = [];

document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("containerModal")) {
        e.target.classList.add("hide");
        e.target.classList.remove("show");
    }
});

btnCreateOrder.addEventListener("click", async (e) => {
    e.preventDefault();
    const data = await createNewSale(true);
    if (data) {
        window.location.href = `addWorkOrder.html?idSale=${data.idSale}&customerName=${customerName}&idVehicle=${data.idVehicle}&idCustomer=${customerId}&totalPrice=${data.price}`;
    }
})

frmVehicleSale.addEventListener("submit", async (e) => {
    e.preventDefault();
    let success = await createNewSale();
    if (success) {
        window.location.href = "sales.html";
    }

});

let createNewSale = async (isWO) => {
    const formData = getInputsValues(frmVehicleSale);

    const {
        txtTotal,
        txtCommission,
        txtNotes
    } = formData;

    if (!vehicleId) {
        showMessage('Por favor, seleccione un vehículo para la venta.', 'Vehículo no seleccionado', 'warning');
        return false;
    }

    if (!txtTotal) {
        highlightAndFocus(document.getElementById('txtTotal'));
        showMessage('Por favor, ingrese el precio total de la venta.', 'Precio total requerido', 'warning');
        return false;
    }

    if (!txtCommission) {
        highlightAndFocus(document.getElementById('txtCommission'));
        showMessage('Por favor, ingrese la comision de la venta.', 'Comisión requerida', 'warning');
        return false;
    }

    const firstAmount = document.getElementById("amountInput1");
    if (firstAmount.value.trim() == "") {
        highlightAndFocus(firstAmount);
        showMessage('Por favor, ingrese al menos un abono para la venta.', 'Abono requerido', 'warning');
        return false;
    }
    const amountData = [];
    const imagesAmounts = [];

    const amounts = document.querySelectorAll('.containerAmount');

    for (let i = 0; i < amounts.length - 1; i++) {
        const amountInput = amounts[i].querySelector('.amountInput');
        const paymentTypeSelect = amounts[i].querySelector('.paymentTypeSelect');
        const receiptInput = amounts[i].querySelector('.receiptInput');
        const amountValue = parseFloat(amountInput.value.replace(/[$,]/g, ""));

        if (isNaN(amountValue) || amountValue <= 0) {
            highlightAndFocus(amountInput);
            showMessage(`Por favor, ingrese un monto válido para el abono ${i + 1}.`, 'Monto inválido', 'warning');
            return false;
        }
        if (paymentTypeSelect.value == "") {
            highlightAndFocus(paymentTypeSelect);
            showMessage(`Por favor, seleccione un método de pago para el abono ${i + 1}.`, 'Método de pago requerido', 'warning');
            return false;
        }
        let obj = {
            amount: amountValue,
            idPaymentMethod: paymentTypeSelect.value,
            idEmployee: "810b89d1-2ff4-47e2-9e5b-8404ac05c899" /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
        }
        if (amounts[i].dataset.id && idSale) obj.idPayment = amounts[i].dataset.id;
        amountData.push(obj);
        if (!idSale) {
            if (receiptInput.files.length == 0) {
                highlightAndFocus(amountInput);
                showMessage(`Por favor, seleccione un comprobante para el abono ${i + 1}.`, 'Comprobante requerido', 'warning');
                return false;
            }
        }
        let imgs = {
            file: receiptInput.files[0],
            isOld: amounts[i].dataset.id ? true : false
        }
        imagesAmounts.push(imgs);
    }

    const fd = new FormData();

    const saleData = {
        salePrice: cleanNumber(txtTotal),
        idCustomer: customerId,
        commission: cleanNumber(txtCommission) || 0,
        notes: txtNotes || "",
        idEmployee: "810b89d1-2ff4-47e2-9e5b-8404ac05c899", /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
    }
    const amountOld = [];
    const amountNew = [];
    if (idSale) {
        amountData.forEach(amount => {
            if (amount.idPayment) {
                amountOld.push(amount)
            } else {
                amountNew.push(amount)
            }
            saleData.paymentsToUpdate = amountOld;
            saleData.newPayments = amountNew;
        })
        saleData.paymentsToDelete = paymentsToDelete;
    } else {
        saleData.payments = amountData;
    }
    fd.append("vehicleData", JSON.stringify(saleData));
    console.log(amountData)
    imagesAmounts.forEach(objFile => {
        if (idSale) {
            if (objFile.isOld) {
                if (objFile.file == undefined) return;
                fd.append("updateImages", objFile.file);
            } else {
                fd.append("newPaymentImages", objFile.file);
            }
        } else {
            fd.append("paymentImages", objFile.file);
        }
    });

    try {
        if (idSale != null) {
            await putVehicle(fd, idSale);
            await showMessage('Venta actualizada correctamente.', 'Exito', 'success');
            return true;
        } else {
            let response = await postVehicle(fd, vehicleId);
            await showMessage('Venta registrada con éxito.', 'Éxito', 'success');
            cancelVehicleSelection();
            if (isWO) {
                return {
                    idVehicle: response.data.idVehicle,
                    price: response.data.salePrice,
                    idSale: response.data.idSale
                };
            } else {
                return true;
            }
        }
    } catch (error) {
        console.error("Error al realizar la operación:", error);
        const errorMessage = error.message || 'Error desconocido al registrar la venta.';
        showMessage(errorMessage, 'error', 'error');
    }
}

let loadLinkAddVehicle = () => {
    const customerId = params.get('idCustomer') || null;
    const customerName = params.get('customerName') || null;
    const btnAddPart = document.getElementById("btnAddPart");
    btnAddPart.href = `vehicleDetails.html?sale=true&idCustomer=${customerId}&customerName=${customerName}`;
}

let getTotal = () => {
    const total = safeParseFloat(txtTotal.value);
    return total;
}

let loadEventsInps = () => {
    txtTotal.addEventListener("input", () => {
        managePaymentsAndCalculateDebt(saveSaleState, createBtnUrl, getTotal)
    });
    txtCommission.addEventListener("input", saveSaleState);
    document.getElementById("txtNotes").addEventListener("input", saveSaleState);
    txtTotal.addEventListener("focus", (e) => {
        formatOnFocus(e, true);
    });
    txtTotal.addEventListener("blur", (e) => {
        formatOnBlur(e, true);
    });
    txtCommission.addEventListener("focus", (e) => {
        formatOnFocus(e, true);
    });
    txtCommission.addEventListener("blur", (e) => {
        formatOnBlur(e, true);
    });

    allowDecimal(txtCommission);
    allowDecimal(txtTotal);
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadPayMethods();
    loadEventsInps();

    if (idSale) {
        await loadSale();
    } else {
        await loadVehicles();
        await loadSaleState();
    }
    loadLinkAddVehicle();
    setupModalListeners();

    if (vehicleId) {
        await loadVehicle(vehicleId, idSale);
    }

    document.getElementById("customerName").textContent = customerName;


    const btnCancel = document.querySelector(".btnCancelVehicle");
    if (btnCancel) {
        btnCancel.addEventListener("click", cancelVehicleSelection);
    }
    verifySelects();
});

let loadSale = async () => {
    const sale = await getSaleById(idSale);
    insertSale(sale);
    const btnCancel = document.querySelector(".btnCancelVehicle");
    const btnAddSale = document.getElementById("btnAddSale");
    btnCancel.classList.add("hide");
    btnCreateOrder.classList.add("hide");
    btnAddSale.value = "Actualizar";
}

let insertSale = (sale) => {
    console.log(sale)
    document.getElementById("txtNotes").value = sale.notes;
    document.getElementById("txtCommission").value = sale.commission;
    document.querySelector(".amounts").innerHTML = '';
    sale.payments.forEach(payment => {
        createInitialPaymentField(payment.amount, payment.idPaymentMethod, payment.paymentURL, payment.idPayment, saveSaleState, createBtnUrl, getTotal, paymentsToDelete);
    })
    managePaymentsAndCalculateDebt(saveSaleState, createBtnUrl, getTotal);
    document.getElementById("due").textContent = `$${formatWithCommas(sale.amountDue)}`;
    document.getElementById("due").style.color = sale.amountDue > 0 ? 'var(--danger-color)' : 'var(--success-color)';
    txtTotal.value = `$${formatWithCommas(sale.fullTotalCost)}`;
}

let loadVehicles = async () => {
    const vehicles = await getVehiclesAviable();
    insertVehicles(vehicles.content);
}

let insertVehicles = (vehicles) => {
    const container = document.getElementById("tBodyInventory");
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    if (vehicles == 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent = "No hay datos disponibles";
        td.classList.add("no-data-message"); // opcional para estilos
        td.style.textAlign = "center";
        td.style.padding = "15px";
        td.style.color = "#777";

        tr.appendChild(td);
        fragment.appendChild(tr);
        document.querySelector(".table").style.height = "100%";
    } else {
        vehicles.forEach(vehicle => {
            //const idSelected = selectedIds.some(id => id == vehicle.vin);
            //if (idSelected) return;

            const tr = document.createElement("tr");
            const tdImage = document.createElement("td");
            const image = document.createElement("img");
            const vin = document.createElement("td");
            const cost = document.createElement("td");
            const suggesredPrice = document.createElement("td");
            const btnAddVehicle = document.createElement("button");

            image.src = vehicle.photoUrl;
            vin.textContent = vehicle.vin;
            cost.textContent = `$${formatWithCommas(vehicle.total)}`;
            suggesredPrice.textContent = `$${formatWithCommas(vehicle.suggestedPrice)}`; /* Por el momento es costo total */

            tr.classList.add("tableRow");
            btnAddVehicle.classList.add("btnPrimary", "btnAddVehicle");
            image.classList.add("imgVehicleTable");

            btnAddVehicle.textContent = "+";

            tdImage.appendChild(image);

            tr.append(tdImage, vin, cost, suggesredPrice, btnAddVehicle);
            fragment.appendChild(tr);

            btnAddVehicle.addEventListener("click", async () => {
                vehicleId = vehicle.idVehicle;
                await loadVehicle(vehicle.idVehicle, idSale);
                saveSaleState();
            })

        });
    }

    container.appendChild(fragment);
}

let loadSaleState = async () => {
    const savedState = localStorage.getItem(saleKey);
    if (!savedState) {
        // Si no hay estado guardado, aseguramos que el contenedor de abonos esté limpio
        document.querySelector(".amounts").innerHTML = '';
        createInitialPaymentField(0, null, null, null, saveSaleState, createBtnUrl, getTotal); // Y creamos el campo inicial limpio
        return;
    }

    const state = JSON.parse(savedState);
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = ''; // Limpiamos el abono inicial fijo del HTML

    // 1. Restaurar el vehículo
    if (state.vehicleId) {
        vehicleId = state.vehicleId;
        await loadVehicle(vehicleId, idSale);
        // Restaurar el precio final si fue modificado
        if (state.finalPrice) {
            txtTotal.value = `$${formatWithCommas(state.finalPrice)}`;
        } else {
            // Si no hay finalPrice, toma el total del vehículo (que se cargó en loadVehicle)
            txtTotal.value = document.getElementById("total").textContent;
        }

        // 2. Restaurar comisión y notas
        if (state.commission) {
            txtCommission.value = formatWithCommas(state.commission);
        }
        if (state.notes) {
            document.getElementById("txtNotes").value = state.notes;
        }

        // 3. Restaurar los campos de abonos
        let lastValueWasZero = false;
        state.payments.forEach((payment, index) => {
            // 🔑 LÓGICA CLAVE: Solo restauramos si es una URL remota completa.
            const receiptRef = payment.receiptUrl && payment.receiptUrl.startsWith('http') ? payment.receiptUrl : null;

            // Aquí pasamos la URL remota (o null)
            createInitialPaymentField(payment.amount, payment.paymentMethodId, receiptRef, null, saveSaleState, createBtnUrl, getTotal);

            if (payment.amount === 0) lastValueWasZero = true;
            else lastValueWasZero = false;
        });

        // 4. Asegurar un campo vacío al final si el último abono guardado tenía valor
        if (state.payments.length > 0 && !lastValueWasZero) {
            createInitialPaymentField(0, null, null, null, saveSaleState, createBtnUrl, getTotal); // Campo vacío para el siguiente abono
        }

    } else {
        // Si no hay vehículo, limpiamos la venta guardada en localStorage
        localStorage.removeItem(saleKey);
        createInitialPaymentField(0, null, null, null, saveSaleState, createBtnUrl, getTotal); // Crear el primer campo limpio
    }

    // 5. Recalcular la deuda para actualizar 'due'
    managePaymentsAndCalculateDebt(saveSaleState, createBtnUrl, getTotal);
};

function saveSaleState() {
    if (idSale) return;
    const payments = [...document.querySelectorAll(".containerAmount")].map(container => {
        const input = container.querySelector(".amountInput");
        const select = container.querySelector(".paymentTypeSelect");
        // Nota: Los inputs de archivo local (receiptInput) solo se usan en la sesión actual
        // y no deben influir en el estado guardado.

        return {
            amount: parseFloat(input.value.replace(/[$,]/g, "")) || 0,
            paymentMethodId: select.value || null,
            receiptUrl: null // 🔑 CAMBIO CLAVE: Ya NO guardamos ninguna referencia de imagen.
        };
    });

    const notes = document.getElementById("txtNotes")?.value || "";
    const commission = parseFloat(document.getElementById("txtCommission")?.value.replace(/[$,]/g, "")) || 0;
    const finalPrice = parseFloat(document.getElementById("txtTotal")?.value.replace(/[$,]/g, "")) || 0;

    const state = {
        vehicleId,
        payments,
        notes,
        commission,
        finalPrice
    };

    localStorage.setItem(saleKey, JSON.stringify(state));
}

// =====================================
//     CONFIGURAR CARRUSEL DE IMÁGENES
// =====================================

let cancelVehicleSelection = () => {
    // 1. Ocultar la Ficha del Vehículo (Columna Izquierda)
    document.querySelector(".viewVechicleContainer").classList.add("hide");

    // 2. Limpiar variables y estado local
    vehicleId = null;
    localStorage.removeItem(saleKey);

    // 3. Limpiar los campos del formulario (Columna Derecha)
    const form = document.querySelector(".formRightColumn");
    form.reset(); // Restablece todos los inputs del formulario

    // 4. Limpiar el contenedor de abonos dinámicos
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = ''; // Elimina todos los abonos

    // 5. 🔑 Crear el primer campo de abono vacío usando la función auxiliar
    createInitialPaymentField(0, null, null, null, saveSaleState, createBtnUrl, getTotal);

    // 6. Restablecer la deuda a cero
    document.getElementById("due").textContent = "$0";
    document.getElementById("due").style.color = 'var(--danger-color)';
};