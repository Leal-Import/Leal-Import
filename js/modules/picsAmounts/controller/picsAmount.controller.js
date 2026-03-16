import { updateModalContent, DOMRefs, closeLightbox } from "../../../core/dom/picAmounts.dom.js";
import { picsAmountState } from "../../../core/state/picsAmount.state.js";
import { $, hideElement } from "../../../utils/dom.js";
import { initModalListeners } from "../event/picsAmount.event.js";

export let clearCurrentFile = () => {
    const paymentId = DOMRefs.refs.modalContainer.dataset.paymentId;
    if (!paymentId) return;

    // 🔑 Buscar el payment real en el estado
    const payment = picsAmountState.paymentsState.payments
        .find(p => String(p.id) === String(paymentId));

    if (!payment) return;

    // 🔥 LIMPIEZA REAL
    payment.file = null;

    // Limpieza visual
    const inputElement = $(DOMRefs.refs.currentReceiptInputId.value);
    if (inputElement) inputElement.value = '';

    const btn = inputElement?.nextElementSibling;
    btn?.classList.remove("receipt-loaded");
    btn.innerHTML = `<span class="icon">Añadir comprobante</span>`;
    updateModalContent(null, payment, DOMRefs.refs);
};


export let selectFile = (e, payment) => {
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
}

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
}

export const initializeModalListeners = (state, isViewingReceipt) => {
    picsAmountState.paymentsState = state; // 👈 inyección de estado
    picsAmountState.isViewingReceipt = isViewingReceipt;
    const refs = DOMRefs.init();
    initModalListeners({ Refs: refs, clearCurrentFile, closeModalAndClean, onClickBtnSelect, onCloseLightbox: () => closeLightbox(refs.voucherLightbox) });
    if (picsAmountState.isViewingReceipt) {
        hideElement(refs.btnClearFile);
        hideElement(refs.btnSelectFile);
    }
}