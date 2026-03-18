import { selectFile } from "../../modules/picsAmounts/controller/picsAmount.controller.js";
import { $, hideElement, qs, showElement, toggleModal } from "../../utils/dom.js";
import { picsAmountState } from "../state/picsAmount.state.js";

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            currentReceiptInputId: $('currentReceiptInputId'),
            modalContainer: qs('.containerModal'),
            btnSelectFile: $('btnSelectFile'),
            btnClearFile: $('btnClearFile'),
            modalPreviewArea: $('modalPreviewArea'),
            modalAbonoTitle: $('modalAbonoTitle'),
            voucherLightbox: $('voucherLightbox'),
            btnCloseLightbox: qs('.btnCloseLightBox'),
            btnCloseVoucherModal: $('btnCloseVoucherModal')
        };
        return this.refs;
    }
};

/* Esta funcion crea el boton para abrir el modal del comprobante de pago */
export const createBtnUrl = (index, receiptUrl, payment) => {
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

    if (receiptUrl && receiptUrl.startsWith('http') || (payment?.file && payment.file instanceof File)) {
        receiptButton.classList.add("receiptLoaded");
        receiptButton.innerHTML = `<span class="icon">Ver comprobante</span>`;
    }

    return receiptContainer;
};

// Función para abrir el modal de comprobante
const openReceiptModal = (inputElement, receiptUrl, payment) => {
    const Refs = DOMRefs.init();
    const modalContainer = Refs.modalContainer;
    const inputIdField = Refs.currentReceiptInputId;
    const abonoIndex = inputElement.closest('.paymentItem').getAttribute('data-index');

    // 1. CONEXIÓN: Guardar el ID del input dinámico
    inputIdField.value = inputElement.id;
    modalContainer.dataset.paymentId = payment.id;
    Refs.modalAbonoTitle.textContent = `${abonoIndex}`;

    // 2. ACTUALIZAR VISUALES del modal
    updateModalContent(receiptUrl, payment, Refs);

    // 3. Mostrar el modal
    toggleModal(modalContainer, true);
};

// Función para actualizar el contenido del modal según el estado del input
export const updateModalContent = (receiptUrl, payment, Refs) => {
    const previewArea = Refs.modalPreviewArea;
    const btnClear = Refs.btnClearFile;

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
        if (!picsAmountState.isViewingReceipt) showElement(btnClear);

        const urlToPreview = hasLocalFile
            ? URL.createObjectURL(payment.file)
            : receiptUrl;

        // Determinar tipo de archivo
        const isPdf = urlToPreview.toLowerCase().endsWith('.pdf') ||
            (payment?.file?.type === 'application/pdf');

        // Obtener información del archivo
        const fileName = payment?.file?.name || receiptUrl?.split('/').pop() || 'documento.jpg';
        const fileSize = payment?.file?.size ? formatFileSize(payment.file.size) : 'Tamaño desconocido';

        // 🔑 IMPORTANTE: Añadir clase has-file PRIMERO
        previewArea.classList.add('hasFile');

        // Limpiar contenido
        previewArea.innerHTML = '';

        // Crear estructura de preview
        const previewContent = document.createElement('div');
        previewContent.className = 'previewContent';

        const previewImageWrapper = document.createElement('div');
        previewImageWrapper.className = 'previewImageWrapper';

        // Botón de zoom
        const zoomBtn = document.createElement('button');
        zoomBtn.className = 'zoomBtn';
        zoomBtn.type = 'button';
        zoomBtn.setAttribute('aria-label', 'Ampliar imagen');
        zoomBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM13 10l4 4M13 6l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;

        // Evento para ampliar imagen
        zoomBtn.addEventListener('click', () => openLightbox(urlToPreview, Refs.voucherLightbox));

        // Crear elemento de preview (img o embed)
        let previewElement;
        if (isPdf) {
            previewElement = document.createElement('embed');
            previewElement.src = urlToPreview;
            previewElement.type = 'application/pdf';
            previewElement.className = 'previewImage';
        } else {
            previewElement = document.createElement('img');
            previewElement.src = urlToPreview;
            previewElement.alt = 'Comprobante';
            previewElement.className = 'previewImage';
        }

        // Overlay con información del archivo
        const previewOverlay = document.createElement('div');
        previewOverlay.className = 'previewOverlay';

        previewOverlay.innerHTML = `
        <div class="fileDetails">
        <svg class="fileIcon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M9 1H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-6-6z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M9 1v6h6" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <div class="fileInfo">
                    <span class="fileName">${fileName}</span>
                    <span class="fileSize">${fileSize}</span>
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
        if (picsAmountState.isViewingReceipt) hideElement(previewOverlay.querySelector('.fileSize'));

    } else {
        // ❌ NO HAY ARCHIVO: Mostrar estado vacío
        hideElement(btnClear);

        // 🔑 IMPORTANTE: Remover clase has-file
        previewArea.classList.remove('hasFile');

        // Restaurar estructura de estado vacío
        previewArea.innerHTML = `
            <div class="emptyState">
                <div class="uploadIconWrapper">
                    <div class="uploadIcon"></div>
                </div>
                <div class="uploadContent">
                    <h3 class="uploadTitle">Selecciona tu comprobante</h3>
                    <p class="uploadDescription">Arrastra y suelta tu archivo aquí o haz clic en el botón</p>
                    <p class="uploadFormats">JPG, PNG o PDF • Máximo 10MB</p>
                </div>
            </div>
        `;
    }
};

// Función auxiliar para formatear tamaño de archivo
const  formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Función para cerrar lightbox
export const closeLightbox = (lightbox) => {
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    document.removeEventListener('keydown',(e) => handleEscapeKey(e, lightbox));
};

// Handler para tecla Escape
const handleEscapeKey = (e, lightbox) => {
    if (e.key === 'Escape') {
        closeLightbox(lightbox);
    }
};

// Función para abrir lightbox (vista ampliada)
const openLightbox = (imageUrl, lightbox) => {
    const lightboxImage = $('lightboxImage');
    lightboxImage.src = imageUrl;
    lightbox.classList.add('active');

    document.addEventListener('keydown',(e) => handleEscapeKey(e, lightbox));
};

