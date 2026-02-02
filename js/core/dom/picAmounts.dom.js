import { selectFile } from "../../modules/picsAmounts/controller/picsAmount.controller.js";

/* Esta funcion crea el boton para abrir el modal del comprobante de pago */
export let createBtnUrl = (index, receiptUrl, payment) => {
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

    receiptInput.addEventListener('change', (e) => selectFile(e, payment));

    // Botón principal (Ahora abre el MODAL)
    const receiptButton = document.createElement("button");
    receiptButton.type = "button";
    receiptButton.classList.add('btnAddPayment', 'btnSecondary');
    receiptButton.innerHTML = `<span class="icon">Añadir comprobante</span>`;

    // === LISTENERS ===
    receiptButton.addEventListener("click", (e) => {
        e.preventDefault();
        openReceiptModal(receiptInput, receiptUrl, payment);
    });

    receiptContainer.append(receiptInput, receiptButton);

    if (receiptUrl && receiptUrl.startsWith('http')) {
        receiptButton.classList.add("receipt-loaded");
        receiptButton.innerHTML = `<span class="icon">Ver comprobante</span>`;
    }

    return receiptContainer;
}

// Función para abrir el modal de comprobante
function openReceiptModal(inputElement, receiptUrl, payment) {
    const modalContainer = document.querySelector('.containerModal');
    const inputIdField = document.getElementById('currentReceiptInputId');
    const abonoIndex = inputElement.closest('.paymentItem').getAttribute('data-index');

    // 1. CONEXIÓN: Guardar el ID del input dinámico
    inputIdField.value = inputElement.id;
    modalContainer.dataset.paymentId = payment.id;
    document.getElementById('modalAbonoTitle').textContent = `${abonoIndex}`;

    // 2. ACTUALIZAR VISUALES del modal
    updateModalContent(receiptUrl, payment);

    // 3. Mostrar el modal
    modalContainer.classList.remove('hide');
}

// Función para actualizar el contenido del modal según el estado del input
export function updateModalContent(receiptUrl, payment) {
    const previewArea = document.getElementById('modalPreviewArea');
    const btnClear = document.getElementById('btnClearFile');

    const hasLocalFile = (payment?.file && payment.file instanceof File) || false;
    const hasRemoteUrl = receiptUrl && receiptUrl.startsWith('http');
    const isLoaded = hasLocalFile || hasRemoteUrl;

    // 🔑 CRÍTICO: Limpiar objetos URL anteriores
    const oldPreview = previewArea.querySelector('img, embed');
    if (oldPreview?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(oldPreview.src);
    }

    if (isLoaded) {
        // ✅ HAY ARCHIVO: Mostrar preview
        btnClear.classList.remove('hide');

        let urlToPreview = hasLocalFile
            ? URL.createObjectURL(payment.file)
            : receiptUrl;

        // Determinar tipo de archivo
        const isPdf = urlToPreview.toLowerCase().endsWith('.pdf') ||
            (payment?.file?.type === 'application/pdf');

        // Obtener información del archivo
        const fileName = payment?.file?.name || receiptUrl?.split('/').pop() || 'documento.jpg';
        const fileSize = payment?.file?.size ? formatFileSize(payment.file.size) : 'Tamaño desconocido';

        // 🔑 IMPORTANTE: Añadir clase has-file PRIMERO
        previewArea.classList.add('has-file');

        // Limpiar contenido
        previewArea.innerHTML = '';

        // Crear estructura de preview
        const previewContent = document.createElement('div');
        previewContent.className = 'preview-content';

        const previewImageWrapper = document.createElement('div');
        previewImageWrapper.className = 'preview-image-wrapper';

        // Botón de zoom
        const zoomBtn = document.createElement('button');
        zoomBtn.className = 'zoom-btn';
        zoomBtn.type = 'button';
        zoomBtn.setAttribute('aria-label', 'Ampliar imagen');
        zoomBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM13 10l4 4M13 6l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        // Evento para ampliar imagen
        zoomBtn.addEventListener('click', () => openLightbox(urlToPreview));

        // Crear elemento de preview (img o embed)
        let previewElement;
        if (isPdf) {
            previewElement = document.createElement('embed');
            previewElement.src = urlToPreview;
            previewElement.type = 'application/pdf';
            previewElement.className = 'preview-image';
        } else {
            previewElement = document.createElement('img');
            previewElement.src = urlToPreview;
            previewElement.alt = 'Comprobante';
            previewElement.className = 'preview-image';
        }

        // Overlay con información del archivo
        const previewOverlay = document.createElement('div');
        previewOverlay.className = 'preview-overlay';
        previewOverlay.innerHTML = `
            <div class="file-details">
                <svg class="file-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M9 1H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-6-6z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M9 1v6h6" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <div class="file-info">
                    <span class="file-name">${fileName}</span>
                    <span class="file-size">${fileSize}</span>
                </div>
            </div>
        `;

        // Ensamblar estructura
        previewImageWrapper.appendChild(zoomBtn);
        previewImageWrapper.appendChild(previewElement);
        if (!isPdf) { // Solo mostrar overlay en imágenes
            previewImageWrapper.appendChild(previewOverlay);
        }

        previewContent.appendChild(previewImageWrapper);
        previewArea.appendChild(previewContent);

    } else {
        // ❌ NO HAY ARCHIVO: Mostrar estado vacío
        btnClear.classList.add('hide');

        // 🔑 IMPORTANTE: Remover clase has-file
        previewArea.classList.remove('has-file');

        // Restaurar estructura de estado vacío
        previewArea.innerHTML = `
            <div class="empty-state">
                <div class="upload-icon-wrapper">
                    <div class="upload-icon"></div>
                </div>
                <div class="upload-content">
                    <h3 class="upload-title">Selecciona tu comprobante</h3>
                    <p class="upload-description">Arrastra y suelta tu archivo aquí o haz clic en el botón</p>
                    <p class="upload-formats">JPG, PNG o PDF • Máximo 10MB</p>
                </div>
            </div>
        `;
    }
}

// Función auxiliar para formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Función para abrir lightbox (vista ampliada)
function openLightbox(imageUrl) {
    let lightbox = document.getElementById('voucherLightbox');

    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'voucherLightbox';
        lightbox.className = 'voucherLightbox';
        lightbox.innerHTML = `
            <div class="lightboxContent" onclick="event.stopPropagation()">
                <button class="lightboxClose" onclick="closeLightbox()"></button>
                <img id="lightboxImage" class="lightboxImage" alt="Comprobante ampliado">
            </div>
        `;
        document.body.appendChild(lightbox);

        lightbox.addEventListener('click', closeLightbox);
    }

    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = imageUrl;
    lightbox.classList.add('active');

    document.addEventListener('keydown', handleEscapeKey);
}

// Función para cerrar lightbox
function closeLightbox() {
    const lightbox = document.getElementById('voucherLightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handler para tecla Escape
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
}

// Hacer closeLightbox global
window.closeLightbox = closeLightbox;