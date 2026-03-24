import { updateModalContent, DOMRefs, closeLightbox, setReceiptBtnState } from "../../../core/dom/picAmounts.dom.js";
import { picsAmountState } from "../../../core/state/picsAmount.state.js";
import { $, hideElement } from "../../../utils/dom.js";
import { initModalListeners } from "../event/picsAmount.event.js";

export const clearCurrentFile = () => {
    const paymentId = DOMRefs.refs.modalContainer.dataset.paymentId;
    if (!paymentId) return;

    const payment = picsAmountState.paymentsState.payments
        .find(p => String(p.id) === String(paymentId));
    if (!payment) return;

    payment.file = null;

    const inputElement = $(DOMRefs.refs.currentReceiptInputId.value);
    if (inputElement) inputElement.value = '';

    const btn = inputElement?.nextElementSibling;
    if (btn) setReceiptBtnState(btn, btn.querySelector('.icon'), false); // ← guard + helper

    updateModalContent(null, payment, DOMRefs.refs);
};

export const selectFile = (e, payment) => {
    const file = e.target.files[0];
    if (!file) return;

    const inputId = DOMRefs.refs.currentReceiptInputId.value;
    const paymentItem = $(inputId).closest('.paymentItem');
    // Guardar archivo en selectedAmounts
    payment.file = file;
    updateModalContent(null, payment, DOMRefs.refs);

    // Actualizar botón del abono para indicar que hay archivo
    $(inputId).dataset.payId = payment.id;
    const btn = paymentItem.querySelector('.btnAddPayment');
    btn.classList.add('receipt-loaded');
    btn.innerHTML = `<span class="icon">Ver comprobante</span>`;
};

export const closeModalAndClean = () => {
    hideElement(DOMRefs.refs.modalContainer);
    DOMRefs.refs.currentReceiptInputId.value = '';
};

export const onClickBtnSelect = () => {
    const inputElement = $(DOMRefs.refs.currentReceiptInputId.value);
    if (inputElement) {
        // Limpiamos el valor para forzar el evento 'change' si selecciona el mismo archivo
        inputElement.value = '';
        inputElement.click(); // Abre el selector de archivos
    }
};

export const initializeModalListeners = (state, isViewingReceipt) => {
    try {
        injectState(state, isViewingReceipt);
        const refs = DOMRefs.init();
        initializeUi(refs);
        applyViewMode(refs, isViewingReceipt);
    } catch (error) {
        throw new Error(`Error initializing modal listeners: ${error}`, { cause: error });
    }
};

const injectState = (state, isViewingReceipt) => {
    picsAmountState.paymentsState = state;
    picsAmountState.isViewingReceipt = isViewingReceipt;
};

const initializeUi = (refs) => {
    initModalListeners({
        Refs: refs,
        clearCurrentFile,
        onCloseModalAndClean: closeModalAndClean,
        onClickBtnSelect,
        onCloseLightbox: () => closeLightbox(refs.voucherLightbox)
    });
};

const applyViewMode = (refs, isViewingReceipt) => {
    if (!isViewingReceipt) return;
    hideElement(refs.btnClearFile);
    hideElement(refs.btnSelectFile);
};
