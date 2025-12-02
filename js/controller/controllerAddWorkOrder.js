import { getPaymentMethods } from '../service/serviceConfiguration.js'
import {
    formatWithCommas,
    allowDecimal,
    fillSelect,
    showMessage
} from '../utils.js';

const txtAddService = document.getElementById("txtAddService");

const params = new URLSearchParams(window.location.search);
let customerName = params.get("customerName") || null;
let vin = params.get("vin") || null;
let idCustomer = params.get("idCustomer") || null;
let vehiclePrice = params.get("totalPrice");
let vehicleSale = params.get("vehicleSale");

let rowsServices = 0;

document.addEventListener("DOMContentLoaded", async () => {
    loadDataVehicle()
    await loadPayMethods();
    loadRowsTables();
    createInitialPaymentField()
})

txtAddService.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const serviceValue = e.target.value.trim();

        if (serviceValue !== "") {
            addNewService(serviceValue);
            // 4. Limpiar el input después de agregar
            e.target.value = "";
        }
    }
});

let addNewService = (value) => {
    const rows = document.querySelectorAll("#tBodyServices tr");

    // Asumiendo que 'rowsServices' es un índice numérico válido (ej. 0, 1, 2)
    const currentRow = rows[rowsServices];
    //const 

    if (!currentRow) {
        console.error(`Error: No se encontró la fila con el índice ${rowsServices}.`);
        // Aquí podrías llamar a una función para *crear* una nueva fila si no existe.
        return;
    }

    // 2. CORRECCIÓN: Usar .textContent para asignar el valor
    const nameCell = currentRow.querySelector(".tdName");
    const priceCell = currentRow.querySelector(".tdPrice");

    if (nameCell && priceCell) {
        const btnTrash = document.createElement("button");
        const buttonIcon = document.createElement("img");
        buttonIcon.src = "../../media/appMedia/trashIcon.png";
        btnTrash.classList.add("btnTrash");
        btnTrash.appendChild(buttonIcon);
        nameCell.textContent = value;
        priceCell.textContent = "0";
        priceCell.setAttribute("contenteditable", "true");
        btnTrash.addEventListener("click", () => {
            nameCell.textContent = "";
            priceCell.textContent = "";
            priceCell.removeAttribute("contenteditable");
            btnTrash.remove()
            calculateTotalService();
        })
        priceCell.addEventListener("input", (e) => {
            restrictToDecimal(e);
            calculateTotalService();
        });
        currentRow.appendChild(btnTrash)
        // 3. Opcional: Aumentar el índice si tienes más filas preexistentes
        rowsServices++;
    } else {
        showMessage("Error", "No se encontraron las celdas .tdName o .tdPrice en la fila.", "error");
    }
}

let calculateRepairCost = () => {
    const totalRepairCost = document.getElementById("totalRepairCost");
    const totalValueService = document.getElementById("totalValueService");
    const totalValueSpareParts = document.getElementById("totalValueSpareParts");
    const totalValueSparePartsDown = document.getElementById("totalValueSparePartsDown");

    const totalservices = parseFloat(totalValueService.textContent.replace(/[$,\s]/g, '').trim());
    const totalSpareParts = parseFloat(totalValueSpareParts.textContent.replace(/[$,\s]/g, '').trim());

    totalRepairCost.textContent = `$${formatWithCommas(totalservices + totalSpareParts)}`;
    totalValueSparePartsDown.textContent = `$${formatWithCommas(totalservices + totalSpareParts)}`;

    calculateTotal();
}

let calculateTotal = () => {
    const totalCost = document.getElementById("totalCost");
    const totalRepairCost = document.getElementById("totalRepairCost");
    const vehiclePrice = document.getElementById("vehiclePrice");

    const totalR = parseFloat(totalRepairCost.textContent.replace(/[$,\s]/g, '').trim());
    const totalV = parseFloat(vehiclePrice.textContent.replace(/[$,\s]/g, '').trim());

    totalCost.textContent = `$${formatWithCommas(totalR + totalV)}`;
}

let calculateTotalService = () => {
    const tdPrices = document.querySelectorAll("#tBodyServices tr .tdPrice");

    const totalValueService = document.getElementById("totalValueService");
    let total = 0;

    tdPrices.forEach(tdPrice => {
        // 2. Limpiar el texto: Eliminar $, comas (,), y espacios.
        const cleanedValue = tdPrice.textContent.replace(/[$,\s]/g, '').trim();

        // 3. Convertir el valor limpio a un número
        let value = parseFloat(cleanedValue);

        // 4. Asegurar que el valor es un número válido antes de sumar
        if (!isNaN(value)) {
            total += value;
        }
        // Nota: Si el valor está vacío o es '0', parseFloat(cleanedValue) será 0, lo cual es correcto.
    });

    // 5. Mostrar el total formateado
    totalValueService.textContent = `$${formatWithCommas(total)}`;

    calculateRepairCost();
}

// =========================================================
// Funciones Auxiliares para el Cursor (NECESARIAS)
// =========================================================

// Guarda la posición del cursor (cuántos caracteres hay antes de él)
function saveCursorPosition(element) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
}

// Restaura la posición del cursor
function restoreCursorPosition(element, caretPos) {
    let range = document.createRange();
    let selection = window.getSelection();
    let found = false;

    element.childNodes.forEach(node => {
        if (node.nodeType === 3) { // TEXT_NODE
            let nodeLength = node.nodeValue.length;
            if (caretPos <= nodeLength) {
                range.setStart(node, caretPos);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                found = true;
                return;
            } else {
                caretPos -= nodeLength;
            }
        }
    });

    // Fallback: si no se encuentra, ir al final
    if (!found) {
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function restrictToDecimal(event) {
    const element = event.target;

    // 1. Guardar posición del cursor antes de cualquier modificación
    const originalCaretPos = saveCursorPosition(element);

    let value = element.textContent;
    let cleanedValue = value.replace(/[^0-9.]/g, '');
    
    // El valor que usaremos para calcular el ajuste del cursor
    const previousLength = value.length; 

    // ----------------------------------------------------------------------------------
    // 2. Controlar ceros a la izquierda y múltiples puntos (Anti-Zero)
    // ----------------------------------------------------------------------------------

    let parts = cleanedValue.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';

    // A. Eliminar ceros a la izquierda si son seguidos por otro dígito.
    integerPart = integerPart.replace(/^0+(?=\d)/, '');

    // B. CORRECCIÓN: Si el valor está totalmente vacío después de limpiar ('', '.', '0.'), 
    // lo forzamos a '0' o '0.', pero no llamamos al cálculo aquí.
    if (integerPart === '') {
        // Si el valor era solo un punto (ej: '.', parts.length > 1), lo tratamos como '0.'
        if (parts.length > 1) { 
            integerPart = '0';
        } else {
            integerPart = '0';
        }
    }
    
    // Reconstruir cleanedValue con el punto y la parte decimal
    cleanedValue = integerPart;
    if (parts.length > 1) {
        cleanedValue += '.';
        cleanedValue += decimalPart;
    }

    // Si el valor resultante está vacío (porque borraron todo), forzamos el textContent a vacío y salimos limpio.
    if (cleanedValue === '') {
        element.textContent = '';
        // No hay return, permitiendo que el listener llame a calculateTotalService().
        return; 
    }

    // Volver a dividir para la parte decimal, ya que se modificó la parte entera
    parts = cleanedValue.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '';

    // ----------------------------------------------------------------------------------
    // 3. Restringir a un máximo de dos decimales (Truncamiento y No Salto)
    // ----------------------------------------------------------------------------------

    let truncatedValue = cleanedValue;

    if (parts.length > 1 && decimalPart.length > 2) {
        
        const expectedCaretPosForThirdDigit = integerPart.length + 1 + 3; 
        
        if (originalCaretPos === expectedCaretPosForThirdDigit) {
            // Caso A: El usuario acaba de escribir el tercer dígito. TRUNCA y EVITA SALTO.
            truncatedValue = integerPart + '.' + decimalPart.substring(0, 2);
            
            if (element.textContent !== truncatedValue) {
                element.textContent = truncatedValue;
            }
            
            // ELIMINAMOS EL RETURN: El navegador mantiene el cursor en la posición de fallo, 
            // y el listener llama a calculateTotalService().
        } else {
            // Caso B: Truncamiento por pegado o edición interna
            truncatedValue = integerPart + '.' + decimalPart.substring(0, 2);
        }
    }

    // ----------------------------------------------------------------------------------
    // 4. Aplicar el valor limpio y restaurar el cursor
    // ----------------------------------------------------------------------------------
    
    if (element.textContent !== truncatedValue) {
        element.textContent = truncatedValue;

        // Calcular el cambio en la longitud total
        const newLength = element.textContent.length;
        const lengthDifference = previousLength - newLength;

        // Ajustar la posición: Si eliminamos N caracteres *antes* del cursor, movemos el cursor N posiciones atrás.
        let newCaretPos = originalCaretPos - lengthDifference;

        // Asegurar límites
        newCaretPos = Math.max(0, Math.min(newCaretPos, newLength));

        // Ejecutar de forma asíncrona para asegurar la restauración
        setTimeout(() => {
            restoreCursorPosition(element, newCaretPos);
        }, 0);
    }
}

let loadRowsTables = () => {
    const tBodys = document.querySelectorAll(".tBodyData");
    tBodys.forEach(tBody => {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i <= 6; i++) {
            let tr = document.createElement("tr");
            let name = document.createElement("td");
            let price = document.createElement("td");
            name.classList.add("tdName");
            price.classList.add("tdPrice");
            tr.append(name, price);
            fragment.appendChild(tr)
        }
        tBody.appendChild(fragment);
        console.log(tBody)
    });
}

document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("containerModal")) {
        e.target.classList.add("hide");
        e.target.classList.remove("show");
    }
});

let paymentMethodsList = [];
let loadPayMethods = async () => {
    try {
        const roles = await getPaymentMethods();
        paymentMethodsList = roles; // Guardamos para mapear luego
    } catch (error) {
        console.error('Error al cargar roles en el select:', error);
    }
}

let loadDataVehicle = () => {
    document.getElementById("vin").textContent = vin;
    document.getElementById("vehiclePrice").textContent = `$${formatWithCommas(vehiclePrice)}`
}

function createInitialPaymentField(amount = 0, paymentMethodId = null, receiptUrl = null) {
    const amountContainer = document.querySelector(".amounts");

    // 1. Crear elementos
    const index = amountContainer.children.length + 1;

    const div = document.createElement("div");
    div.classList.add("containerAmount");
    div.setAttribute("data-index", index);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Abono ${index}`;
    input.classList.add("txtInputs", "amountInput");
    input.id = `amountInput${index}`;

    if (amount > 0) {
        input.value = formatWithCommas(amount);
    }

    allowDecimal(input);
    input.addEventListener("input", managePaymentsAndCalculateDebt);

    const select = document.createElement("select");
    select.classList.add("txtInputs", "paymentTypeSelect");
    select.id = `paymentTypeSelect${index}`;

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
};

function addNewPaymentField() {
    const amountContainer = document.querySelector(".amounts");

    // Si el último campo está vacío → NO crear otro
    const lastInput = amountContainer.lastElementChild.querySelector(".amountInput");
    const lastValue = parseFloat(lastInput.value.replace(/[$,]/g, "")) || 0;

    if (lastValue === 0) return;

    // 🔑 Usamos la función auxiliar que asegura el ID y llena el select
    createInitialPaymentField();

}

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