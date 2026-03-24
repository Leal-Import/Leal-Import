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
            btnCloseVoucherModal: $('btnCloseVoucherModal'),
            viewAmountContainer: $('viewAmountContainer'),
            amountToPay: $('amountToPay'),
            paymentMethodToPay: $('paymentMethodToPay'),
            registeredBy: $('registeredBy'),
            registrationDate: $('registrationDate')
        };
        return this.refs;
    }
};

export const createBtnUrl = (index, receiptUrl, payment) => {
    const receiptContainer = document.createElement('div');
    receiptContainer.classList.add('receiptContainer');

    const receiptInput = document.createElement('input');
    receiptInput.type = 'file';
    receiptInput.accept = 'image/*';
    receiptInput.classList.add('receiptInput');
    receiptInput.id = `receiptInput${index}`;
    receiptInput.hidden = true;
    receiptInput.addEventListener('change', (e) => selectFile(e, payment));

    const span = document.createElement('span');
    span.classList.add('icon');

    const btnReceipt = document.createElement('button');
    btnReceipt.type = 'button';
    btnReceipt.classList.add('btnAddPayment', 'btnSecondary');
    btnReceipt.appendChild(span);
    btnReceipt.addEventListener('click', (e) => {
        e.preventDefault();
        openReceiptModal(receiptInput, receiptUrl, payment);
    });

    const isLoaded = (receiptUrl?.startsWith('http')) || (payment?.file instanceof File);
    setReceiptBtnState(btnReceipt, span, isLoaded);

    receiptContainer.append(receiptInput, btnReceipt);
    return receiptContainer;
};

export const setReceiptBtnState = (btn, span, isLoaded) => {
    btn.classList.toggle('receiptLoaded', isLoaded);
    span.textContent = isLoaded ? 'Ver comprobante' : 'Añadir comprobante';
};

// Función para abrir el modal de comprobante
const openReceiptModal = (inputElement, receiptUrl, payment) => {
    const { modalContainer, currentReceiptInputId, modalAbonoTitle } = DOMRefs.refs;
    const abonoIndex = inputElement.closest('.paymentItem').getAttribute('data-index');

    // 1. CONEXIÓN: Guardar el ID del input dinámico
    currentReceiptInputId.value = inputElement.id;
    modalContainer.dataset.paymentId = payment.id;
    modalAbonoTitle.textContent = `${abonoIndex}`;

    // 2. ACTUALIZAR VISUALES del modal
    updateModalContent(receiptUrl, payment, DOMRefs.refs);

    if (picsAmountState.isViewingReceipt) showViewData(payment);

    // 3. Mostrar el modal
    toggleModal(modalContainer, true);
};

const showViewData = (payment) => {
    const { viewAmountContainer, amountToPay, paymentMethodToPay, registeredBy, registrationDate } = DOMRefs.refs;
    showElement(viewAmountContainer);
    amountToPay.textContent = payment.amount ? `$${payment.amount.toFixed(2)}` : 'N/A';
    paymentMethodToPay.textContent = payment.paymentMethod || 'Desconocido';
    registeredBy.textContent = payment.employeeName || 'Desconocido';
    registrationDate.textContent = payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : 'Desconocida';
};

// Función para actualizar el contenido del modal según el estado del input
export const updateModalContent = (receiptUrl, payment, Refs) => {
    const { modalPreviewArea, btnClearFile, voucherLightbox } = Refs;

    const hasLocalFile = (payment?.file && payment.file instanceof File) || false;
    const hasRemoteUrl = receiptUrl && receiptUrl.startsWith('http');
    const isLoaded = hasLocalFile || hasRemoteUrl;

    //Limpiar objetos URL anteriores
    const oldPreview = modalPreviewArea.querySelector('img, embed');
    if (oldPreview?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(oldPreview.src);
    }

    if (isLoaded) {
        // si hay archivo se muestra preview
        if (!picsAmountState.isViewingReceipt) showElement(btnClearFile);

        const urlToPreview = hasLocalFile
            ? URL.createObjectURL(payment.file)
            : receiptUrl;

        // Obtener información del archivo
        const fileName = payment?.file?.name || receiptUrl?.split('/').pop() || 'documento.jpg';
        const fileSize = payment?.file?.size ? formatFileSize(payment.file.size) : 'Tamaño desconocido';

        // 🔑 IMPORTANTE: Añadir clase has-file PRIMERO
        modalPreviewArea.classList.add('hasFile');

        // Limpiar contenido
        modalPreviewArea.innerHTML = '';

        // Crear estructura de preview
        const previewContent = document.createElement('div');
        previewContent.classList.add('previewContent');

        const previewImageWrapper = document.createElement('div');
        previewImageWrapper.classList.add('previewImageWrapper');

        // Botón de zoom
        const zoomBtn = document.createElement('button');
        zoomBtn.classList.add('zoomBtn');
        zoomBtn.type = 'button';
        zoomBtn.setAttribute('aria-label', 'Ampliar imagen');
        zoomBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM13 10l4 4M13 6l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;

        // Evento para ampliar imagen
        zoomBtn.addEventListener('click', () => openLightbox(urlToPreview, voucherLightbox));

        const previewElement = document.createElement('img');
        previewElement.src = urlToPreview;
        previewElement.alt = 'Comprobante';
        previewElement.classList.add('previewImage');

        // Overlay con información del archivo
        const previewOverlay = document.createElement('div');
        previewOverlay.classList.add('previewOverlay');

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
        previewImageWrapper.appendChild(previewOverlay);

        previewContent.appendChild(previewImageWrapper);
        modalPreviewArea.appendChild(previewContent);
        if (picsAmountState.isViewingReceipt) hideElement(previewOverlay.querySelector('.fileSize'));

    } else {
        // si no hay archivo se muestra estado vacío
        hideElement(btnClearFile);

        modalPreviewArea.classList.remove('hasFile');

        // Restaurar estructura de estado vacío
        modalPreviewArea.innerHTML = `
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
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

let _escapeHandler = null;
const openLightbox = (imageUrl, lightbox) => {
    const lightboxImage = $('lightboxImage');
    lightboxImage.src = imageUrl;
    lightbox.classList.add('active');

    _escapeHandler = (e) => handleEscapeKey(e, lightbox);
    document.addEventListener('keydown', _escapeHandler);
};

export const closeLightbox = (lightbox) => {
    lightbox?.classList.remove('active');
    if (_escapeHandler) {
        document.removeEventListener('keydown', _escapeHandler);
        _escapeHandler = null;
    }
};

// Handler para tecla Escape
const handleEscapeKey = (e, lightbox) => {
    if (e.key === 'Escape') {
        closeLightbox(lightbox);
    }
};
