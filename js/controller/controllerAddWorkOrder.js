import { getPaymentMethods } from '../service/serviceConfiguration.js'
import {
    formatWithCommas,
    allowDecimal,
    fillSelect
} from '../utils.js';


const params = new URLSearchParams(window.location.search);
let customerName = params.get("customerName") || null;
let vin = params.get("vin") || null;
let idCustomer = params.get("idCustomer") || null;
let vehiclePrice = params.get("totalPrice");
let vehicleSale = params.get("vehicleSale");

document.addEventListener("DOMContentLoaded", async () => {
    loadDataVehicle()
    await loadPayMethods();
    loadRowsTables();
    createInitialPaymentField()
})

let loadRowsTables = () => {
    const tBodys = document.querySelectorAll(".tBodyData");
    tBodys.forEach(tBody => {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i <= 10; i++) {
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