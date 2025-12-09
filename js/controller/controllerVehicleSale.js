import { getPaymentMethods } from '../service/serviceConfiguration.js'
import { getVehicles as getVehicleByVin } from '../service/serviceVehicleDetails.js'
import {
    postVehicle,
    getVehiclesAviable,
    putVehicle,
    getSaleById
} from '../service/serviceVehicleSale.js'
import {
    formatWithCommas,
    allowDecimal,
    fillSelect,
    getInputsValues,
    highlightAndFocus,
    cleanNumber,
    showMessage
} from '../utils.js'

const params = new URLSearchParams(window.location.search);
const customerName = params.get('customerName') || "Nombre del cliente";
const customerId = params.get('idCustomer') || null;
const saleKey = `saleState_cliente_${customerId}`;

const txtTotal = document.getElementById("txtTotal");
const txtCommission = document.getElementById("txtCommission");
const frmVehicleSale = document.getElementById("frmVehicleSale");
const btnCreateOrder = document.getElementById("btnCreateOrder");

let vehicleId = params.get('idVehicle') || null;
let idSale = params.get('idSale') || null;
function safeParseFloat(v) { const n = parseFloat(String(v || '').replace(/[$,\s]/g, '')); return isNaN(n) ? 0 : n; }

allowDecimal(txtTotal);
allowDecimal(txtCommission);

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

let paymentMethodsList = [];
let loadPayMethods = async () => {
    try {
        const roles = await getPaymentMethods();
        paymentMethodsList = roles; // Guardamos para mapear luego
    } catch (error) {
        console.error('Error al cargar roles en el select:', error);
    }
}

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
            idEmployee: "955b7a1a-182e-42fe-8d49-34988e7d18ef" /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
        }
        if (amounts[i].dataset.id && idSale) obj.idPayment = amounts[i].dataset.id;
        amountData.push(obj);
        if(!idSale){
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
        salePrice: txtTotal.replace(/[$,]/g, ""),
        idCustomer: customerId,
        commission: cleanNumber(txtCommission) || 0,
        notes: txtNotes || "",
        idEmployee: "955b7a1a-182e-42fe-8d49-34988e7d18ef", /* Esto se manejara por cookie por lo que por el momento se dejara dato quemado */
    }
    const amountOld = [];
    const amountNew = [];
    if (idSale) {
        amountData.forEach(amount => {
            if(amount.idPayment){
                amountOld.push(amount)
            } else {
                amountNew.push(amount)
            }
            saleData.paymentsToUpdate = amountOld;
            saleData.newPayments = amountNew;
        })
    } else {
        saleData.payments = amountData;
    }
    fd.append("vehicleData", JSON.stringify(saleData));
    console.log(amountData)
    imagesAmounts.forEach(objFile => {
        if(idSale){
            if(objFile.isOld){
                if(objFile.file == undefined) return;
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

document.addEventListener("DOMContentLoaded", async () => {
    await loadPayMethods();
    if (idSale) {
        await loadSale();
    } else {
        await loadVehicles();
        await loadSaleState();
    }
    loadLinkAddVehicle();
    setupModalListeners();

    if (vehicleId) {
        await loadVehicle(vehicleId);
    }


    txtTotal.addEventListener("input", managePaymentsAndCalculateDebt);
    txtCommission.addEventListener("input", saveSaleState);
    document.getElementById("txtNotes").addEventListener("input", saveSaleState);


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
    document.getElementById("txtNotes").value = sale.notes;
    document.getElementById("txtCommission").value = sale.commission;
    document.getElementById("due").textContent = `$${formatWithCommas(sale.amountDue)}`;
    document.querySelector(".amounts").innerHTML = '';
    sale.payments.forEach(payment => {
        createInitialPaymentField(payment.amount, payment.idPaymentMethod, payment.paymentURL, payment.idPayment);
    })
    managePaymentsAndCalculateDebt();
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
                await loadVehicle(vehicle.idVehicle);
                saveSaleState();
            })

        });
    }

    container.appendChild(fragment);
}

let loadVehicle = async (id) => {
    const vehicle = await getVehicleByVin(id);
    // Mostrar contenedor de visualización
    document.querySelector(".viewVechicleContainer").classList.remove("hide");

    // Cargar datos del vehículo
    document.getElementById("vehicleVin").textContent = vehicle.vin;
    document.getElementById("vehicleBrand").textContent = vehicle.brand;
    document.getElementById("vehicleModel").textContent = vehicle.model;
    document.getElementById("vehicleYear").textContent = vehicle.year;
    document.getElementById("purchaseDate").textContent = vehicle.purchaseDate;
    document.getElementById("mileaje").textContent = vehicle.mileage;
    document.getElementById("lote").textContent = vehicle.lote.numLote;
    vehicle.lote.linkLote != null ? document.getElementById("lote").href = vehicle.lote.linkLote : null;
    document.getElementById("status").textContent = vehicle.status;
    document.getElementById("suggestedPrice").textContent = `$${formatWithCommas(vehicle.costs.suggestedPrice)}`; // Por el momento es costo total

    document.getElementById("bill").textContent = `$${formatWithCommas(vehicle.costs.bill)}`;
    vehicle.costs.costPhoto.billPhoto != null ? document.getElementById("bill").href = vehicle.costs.costPhoto.billPhoto : null;
    document.getElementById("ship").textContent = `$${formatWithCommas(vehicle.costs.ship)}`;
    vehicle.costs.costPhoto.shipPhoto != null ? document.getElementById("ship").href = vehicle.costs.costPhoto.shipPhoto : null;
    document.getElementById("towTruck").textContent = `$${formatWithCommas(vehicle.costs.towTruck)}`;
    vehicle.costs.costPhoto.shipPhoto != null ? document.getElementById("towTruck").href = vehicle.costs.costPhoto.shipPhoto : null;
    document.getElementById("iva").textContent = `$${formatWithCommas(vehicle.costs.iva)}`;
    document.getElementById("taxes").textContent = `$${formatWithCommas(vehicle.costs.taxes)}`;
    vehicle.costs.costPhoto.taxesPhoto != null ? document.getElementById("taxes").href = vehicle.costs.costPhoto.taxesPhoto : null;
    document.getElementById("transfer").textContent = `$${formatWithCommas(vehicle.costs.transfer)}`;
    document.getElementById("pa").textContent = `$${formatWithCommas(vehicle.costs.pa)}`;
    document.getElementById("stotage").textContent = `$${formatWithCommas(vehicle.costs.storage)}`;
    document.getElementById("total").textContent = `$${formatWithCommas(vehicle.costs.total)}`;

    txtTotal.value = `$${formatWithCommas(vehicle.costs.suggestedPrice)}`; /* Aca por defecto va a ir el precio sugerido */

    loadVehicleImages(vehicle.photos);
}


function formatOnFocus(event) {
    const element = event.target;
    let value = element.value;
    let cleanValue = value.replace('$', '').replace(/,/g, '');
    element.value = cleanValue;
}

function formatOnBlur(event, isInput) {
    const element = isInput ? event : event.target;
    let value = element.value;

    let number = safeParseFloat(value);
    // 2. Formatear el número como moneda
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
    // 3. Actualizar el contenido con el valor formateado
    element.value = formatter.format(number);

}

let loadSaleState = async () => {
    const savedState = localStorage.getItem(saleKey);
    if (!savedState) {
        // Si no hay estado guardado, aseguramos que el contenedor de abonos esté limpio
        document.querySelector(".amounts").innerHTML = '';
        createInitialPaymentField(); // Y creamos el campo inicial limpio
        return;
    }

    const state = JSON.parse(savedState);
    const amountContainer = document.querySelector(".amounts");
    amountContainer.innerHTML = ''; // Limpiamos el abono inicial fijo del HTML

    // 1. Restaurar el vehículo
    if (state.vehicleId) {
        vehicleId = state.vehicleId;
        await loadVehicle(vehicleId);
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
            createInitialPaymentField(payment.amount, payment.paymentMethodId, receiptRef);

            if (payment.amount === 0) lastValueWasZero = true;
            else lastValueWasZero = false;
        });

        // 4. Asegurar un campo vacío al final si el último abono guardado tenía valor
        if (state.payments.length > 0 && !lastValueWasZero) {
            createInitialPaymentField(0, null, null); // Campo vacío para el siguiente abono
        }

    } else {
        // Si no hay vehículo, limpiamos la venta guardada en localStorage
        localStorage.removeItem(saleKey);
        createInitialPaymentField(); // Crear el primer campo limpio
    }

    // 5. Recalcular la deuda para actualizar 'due'
    managePaymentsAndCalculateDebt();
};

function createInitialPaymentField(amount = 0, paymentMethodId = null, receiptUrl = null, idPayment = null) {
    const amountContainer = document.querySelector(".amounts");

    // 1. Crear elementos
    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);
    if (idPayment) div.setAttribute("data-id", idPayment);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    input.id = `amountInput${index}`;

    if (amount > 0) {
        input.value = amount;
        formatOnBlur(input, true);
    }

    allowDecimal(input);
    input.addEventListener("focus", formatOnFocus)
    input.addEventListener("blur", formatOnBlur)
    input.addEventListener("input", managePaymentsAndCalculateDebt);

    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");
    select.id = `paymentTypeSelect${index}`;

    select.addEventListener("change", saveSaleState);

    // === ELEMENTOS PARA EL COMPROBANTE ===
    const receiptContainer = document.createElement("div");
    receiptContainer.classList.add("receiptContainer");

    // Input de archivo oculto (Se usará por el modal para seleccionar el archivo)
    const receiptInput = document.createElement("input");
    receiptInput.type = "file";
    receiptInput.accept = "image/*, application/pdf";
    receiptInput.classList.add("receiptInput");
    receiptInput.id = `receiptInput${index}`;
    receiptInput.setAttribute("hidden", "true");

    // Botón principal (Ahora abre el MODAL)
    const receiptButton = document.createElement("button");
    receiptButton.type = "button";
    receiptButton.classList.add("btnVoucher");
    receiptButton.innerHTML = `<span class="icon">+</span>`; // Ícono de clip (Añadir/Cambiar)

    // === LISTENERS ===

    // El botón principal AHORA abre tu función de modal
    receiptButton.addEventListener("click", (e) => {
        e.preventDefault();
        openReceiptModal(receiptInput, receiptButton);
    });

    // 🔑 Ya no necesitamos el listener 'change' aquí. El modal lo gestionará.

    receiptContainer.append(receiptInput, receiptButton);

    if (receiptUrl && receiptUrl.startsWith('http')) {
        // Asumimos que si hay una URL remota, el botón debe verse como 'cargado'
        receiptButton.classList.add("receipt-loaded");
        receiptButton.setAttribute("data-receipt-url", receiptUrl);
    }


    // === Ensamblar ===
    div.append(input, select, receiptContainer);
    amountContainer.appendChild(div);

    // 2. Llenar el Select
    fillSelect(select.id, paymentMethodsList, "idPaymentMethod", "methodName", "Metodo de pago");

    // 3. Restaurar el método de pago seleccionado
    if (paymentMethodId) {
        select.value = paymentMethodId;
    }
}

// ==========================================================
// A. LÓGICA DE VISUALIZACIÓN DENTRO DEL MODAL
// ==========================================================
function updateModalContent(inputElement, buttonElement) {
    // 🔑 CORRECCIÓN: Obtener las referencias fuera del if/else
    const previewArea = document.getElementById('modalPreviewArea');
    const btnClear = document.getElementById('btnClearFile');
    const placeholder = document.getElementById('previewPlaceholder'); // Referencia al elemento existente

    // Asumimos que la URL remota está en el data-receipt-url del botón clip
    const remoteUrl = buttonElement.getAttribute('data-receipt-url');

    const hasLocalFile = inputElement.files.length > 0;
    const hasRemoteUrl = remoteUrl && remoteUrl.startsWith('http');
    const isLoaded = hasLocalFile || hasRemoteUrl;

    // Limpiamos el contenido del preview area antes de decidir qué mostrar
    previewArea.innerHTML = '';

    if (isLoaded) {
        btnClear.classList.remove('hide');

        let urlToPreview = hasLocalFile
            ? URL.createObjectURL(inputElement.files[0])
            : remoteUrl;

        // 2. Inyectar el elemento de previsualización
        const previewElement = document.createElement(urlToPreview.endsWith('.pdf') ? 'embed' : 'img');

        if (previewElement.tagName === 'IMG') {
            previewElement.src = urlToPreview;
            previewElement.style.maxWidth = '100%';
            previewElement.style.maxHeight = '400px';
        } else {
            // Para PDF o documentos, usar embed
            previewElement.src = urlToPreview;
            previewElement.style.width = '100%';
            previewElement.style.height = '400px';
            previewElement.type = 'application/pdf';
        }
        previewArea.appendChild(previewElement);

    } else {
        // Nada cargado: Añadir el placeholder existente
        btnClear.classList.add('hide');

        // 🔑 CORRECCIÓN: Volvemos a añadir el placeholder al área de preview
        if (placeholder) {
            previewArea.appendChild(placeholder);
        } else {
            // Caso de fallback, si el placeholder fue eliminado del DOM
            let noImageMessage = document.createElement('p');
            noImageMessage.textContent = "No hay comprobante cargado.";
            noImageMessage.id = "previewPlaceholder";
            previewArea.appendChild(noImageMessage);
        }
    }
}

// ==========================================================
// B. LISTENERS DEL MODAL (Se ejecutan una sola vez al cargar la página)
// ==========================================================

function setupModalListeners() {
    const modalContainer = document.querySelector('.containerModal');
    const btnClose = document.getElementById('closeVoucherModal');
    const btnSelectFile = document.getElementById('btnSelectFile');
    const btnClearFile = document.getElementById('btnClearFile');
    const inputIdField = document.getElementById('currentReceiptInputId');

    // Función para cerrar el modal y limpiar el control
    const closeModalAndClean = () => {
        modalContainer.classList.add('hide');
        inputIdField.value = '';
    };

    // --- 1. Cerrar Modal ---
    btnClose.onclick = closeModalAndClean;

    // --- 2. Acción: SELECCIONAR/CAMBIAR ---
    btnSelectFile.onclick = () => {
        const inputElement = document.getElementById(inputIdField.value);
        if (inputElement) {
            // Limpiamos el valor para forzar el evento 'change' si selecciona el mismo archivo
            inputElement.value = '';
            inputElement.click(); // Abre el selector de archivos
        }
    };

    // --- 3. Acción: ELIMINAR ---
    btnClearFile.onclick = () => {
        const inputElement = document.getElementById(inputIdField.value);
        if (inputElement) {
            // A. Limpiar el archivo del navegador
            inputElement.value = '';

            // B. Actualizar visuales del botón clip (buscar por el ID)
            const clipButton = document.querySelector(`#${inputElement.id}`).nextElementSibling;
            clipButton.classList.remove("receipt-loaded");
            clipButton.removeAttribute("data-receipt-url");

            // C. Guardar estado (sin archivo) y cerrar modal
            saveSaleState();
            closeModalAndClean();
        }
    };

    // --- 4. Listener para la SELECCIÓN REAL del archivo (Delegación) ---
    // Este escucha cualquier cambio en cualquier input type="file" con la clase 'receiptInput'
    document.body.addEventListener('change', (e) => {
        if (e.target.classList.contains('receiptInput')) {
            const inputElement = e.target;
            const clipButton = inputElement.nextElementSibling;

            if (inputElement.files.length > 0) {
                // Hay archivo: Marcar el clip como cargado y guardar referencia temporal
                clipButton.classList.add("receipt-loaded");
                clipButton.setAttribute("data-receipt-url", inputElement.files[0].name);
            } else {
                // Cancelación: Limpiar visuales
                clipButton.classList.remove("receipt-loaded");
                clipButton.removeAttribute("data-receipt-url");
            }

            saveSaleState();

            // Si el modal estaba abierto para ESTE input, actualizamos la previsualización
            if (!modalContainer.classList.contains('hide') && inputElement.id === inputIdField.value) {
                // Re-ejecutamos la lógica de visualización del modal
                updateModalContent(inputElement, clipButton);
            }
        }
    });
}

function openReceiptModal(inputElement, buttonElement) {
    const modalContainer = document.querySelector('.containerModal'); // Usa la clase o ID del contenedor
    const inputIdField = document.getElementById('currentReceiptInputId');
    const abonoIndex = inputElement.closest('.containerAmount').getAttribute('data-index');

    // 1. CONEXIÓN: Guardar el ID del input dinámico al que hace referencia el modal
    inputIdField.value = inputElement.id;
    document.getElementById('modalAbonoTitle').textContent = `(Abono ${abonoIndex})`;

    // 2. ACTUALIZAR VISUALES del modal (Muestra el archivo actual o el placeholder)
    updateModalContent(inputElement, buttonElement);

    // 3. Mostrar el modal
    modalContainer.classList.remove('hide');
}

let managePaymentsAndCalculateDebt = () => {
    const amountContainer = document.querySelector(".amounts");
    let allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    const totalSale = document.getElementById("txtTotal").value.replace(/[$,]/g, "") || 0;
    let totalPaid = 0;

    // 1. Eliminar abonos vacíos excepto el primero
    allPayments.forEach((payment, idx) => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat(input.value.replace(/[$,]/g, "")) || 0;

        if (idx > 0 && value === 0) {
            payment.remove();
        }
    });

    // Refrescar nodos
    allPayments = Array.from(amountContainer.querySelectorAll('.containerAmount'));

    // 2. Renumerar correctamente
    allPayments.forEach((payment, i) => {
        const number = i + 1;
        payment.setAttribute("data-index", number);

        const input = payment.querySelector(".amountInput");
        input.placeholder = `Abono ${number}`;
    });

    // 3. Volver a calcular total pagado
    allPayments.forEach(payment => {
        const input = payment.querySelector(".amountInput");
        const value = parseFloat(input.value.replace(/[$,]/g, "")) || 0;
        totalPaid += value;
    });

    // 4. Si el último abono tiene valor → crear otro
    const lastPayment = allPayments[allPayments.length - 1];
    const lastInput = lastPayment.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue > 0) {
        addNewPaymentField();
    }

    // 5. Calcular deuda
    const debt = totalSale - totalPaid;
    const dueText = document.getElementById("due");

    dueText.textContent = `$${formatWithCommas(debt)}`;
    dueText.style.color = debt > 0 ? 'var(--danger-color)' : 'var(--success-color)';

    verifySelects();
};

function addNewPaymentField() {
    const amountContainer = document.querySelector(".amounts");

    // Si el último campo está vacío → NO crear otro
    const lastInput = amountContainer.lastElementChild.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue === 0) return;

    // 🔑 Usamos la función auxiliar que asegura el ID y llena el select
    createInitialPaymentField();

    verifySelects();
    saveSaleState();
}

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

let mainSwiper;
let thumbsSwiper;

function loadVehicleImages(imagesArray) {
    const mainWrapper = document.getElementById("mainSwiperWrapper");
    const thumbsWrapper = document.getElementById("thumbsWrapper");

    mainWrapper.innerHTML = "";
    thumbsWrapper.innerHTML = "";

    imagesArray.forEach(img => {
        mainWrapper.innerHTML += `
            <div class="swiper-slide">
                <img src="${img.photoUrl}" class="mainImage" alt="vehicle image">
            </div>
        `;

        thumbsWrapper.innerHTML += `
            <div class="swiper-slide">
                <img src="${img.photoUrl}" class="thumbImage" alt="thumbnail">
            </div>
        `;
    });

    if (thumbsSwiper) thumbsSwiper.destroy();
    if (mainSwiper) mainSwiper.destroy();

    thumbsSwiper = new Swiper("#thumbsSwiper", {
        spaceBetween: 10,
        slidesPerView: 6,
        freeMode: true,
        watchSlidesProgress: true,
    });

    mainSwiper = new Swiper("#mainSwiper", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        thumbs: {
            swiper: thumbsSwiper,
        },
    });
}

let verifySelects = () => {
    const amounts = document.querySelectorAll(".amounts .containerAmount");
    amounts.forEach(amount => {
        const input = amount.querySelector(".amountInput");
        const select = amount.querySelector(".paymentTypeSelect");

        if (!input || !select) return;

        const rawValue = (input.value || "").trim();
        const numeric = parseFloat(rawValue.replace(/[$,]/g, "")) || 0;

        if (numeric === 0) {
            select.disabled = true;
            select.value = ""; // evita selects colgados
        } else {
            select.disabled = false;
        }
    });
};

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
    createInitialPaymentField();

    // 6. Restablecer la deuda a cero
    document.getElementById("due").textContent = "$0";
    document.getElementById("due").style.color = 'var(--danger-color)';
};