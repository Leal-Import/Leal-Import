/*Esta funcion inicializa los listeners del modal de comprobantes */
export function setupModalListeners() {
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

            // Si el modal estaba abierto para ESTE input, actualizamos la previsualización
            if (!modalContainer.classList.contains('hide') && inputElement.id === inputIdField.value) {
                // Re-ejecutamos la lógica de visualización del modal
                updateModalContent(inputElement, clipButton);
            }
        }
    });
}

/* Esta funcion crea el boton para abrir el modal del comprobante de pago */
export let createBtnUrl = (index, receiptUrl, selectedAmounts) => {
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
    console.log(selectedAmounts)
    receiptInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const inputId = document.getElementById('currentReceiptInputId').value;
        const paymentRow = document.getElementById(inputId).closest('.paymentRow');
        const logicalId = paymentRow.dataset.logicalId;

        // Guardar archivo en selectedAmounts
        const item = selectedAmounts.find(a => a.id === logicalId);
        if (item) item.file = file;
        else selectedAmounts.push({ id: logicalId, file: file });
        console.log(selectedAmounts)
        // Actualizar botón del abono para indicar que hay archivo
        const btn = paymentRow.querySelector('.btnVoucher');
        btn.classList.add('receipt-loaded');
        console.log(selectedAmounts);
    });

    // Botón principal (Ahora abre el MODAL)
    const receiptButton = document.createElement("button");
    receiptButton.type = "button";
    receiptButton.classList.add("btnVoucher");
    receiptButton.innerHTML = `<span class="icon">+</span>`; // Ícono de clip (Añadir/Cambiar)

    // === LISTENERS ===

    // El botón principal AHORA abre tu función de modal
    receiptButton.addEventListener("click", (e) => {
        e.preventDefault();
        openReceiptModal(receiptInput, receiptButton, selectedAmounts);
    });

    // 🔑 Ya no necesitamos el listener 'change' aquí. El modal lo gestionará.

    receiptContainer.append(receiptInput, receiptButton);

    if (receiptUrl && receiptUrl.startsWith('http')) {
        // Asumimos que si hay una URL remota, el botón debe verse como 'cargado'
        receiptButton.classList.add("receipt-loaded");
        receiptButton.setAttribute("data-receipt-url", receiptUrl);
    }

    return receiptContainer;
}

// Función para abrir el modal de comprobante
function openReceiptModal(inputElement, buttonElement) {
    const modalContainer = document.querySelector('.containerModal'); // Usa la clase o ID del contenedor
    const inputIdField = document.getElementById('currentReceiptInputId');
    const abonoIndex = inputElement.closest('.paymentRow').getAttribute('data-index');

    // 1. CONEXIÓN: Guardar el ID del input dinámico al que hace referencia el modal
    inputIdField.value = inputElement.id;
    document.getElementById('modalAbonoTitle').textContent = `(Abono ${abonoIndex})`;

    // 2. ACTUALIZAR VISUALES del modal (Muestra el archivo actual o el placeholder)
    updateModalContent(inputElement, buttonElement);

    // 3. Mostrar el modal
    modalContainer.classList.remove('hide');
}

// Función para actualizar el contenido del modal según el estado del input
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