import { updateModalContent } from "../../../core/dom/picAmounts.dom.js";
import { $, qs } from "../../../utils/dom.js";
import { initModalListeners } from "../event/picsAmount.event.js";

const inputIdField = $('currentReceiptInputId');
const modalContainer = qs('.containerModal');

let paymentsState = null;


export let clearCurrentFile = () => {
    const paymentId = modalContainer.dataset.paymentId;
    if (!paymentId) return;

    // 🔑 Buscar el payment real en el estado
    const payment = state.payments
        .find(p => String(p.id) === String(paymentId));

    if (!payment) return;

    // 🔥 LIMPIEZA REAL
    payment.file = null;

    // Limpieza visual
    const inputElement = document.getElementById(inputIdField.value);
    if (inputElement) inputElement.value = '';

    const btn = inputElement?.nextElementSibling;
    btn?.classList.remove("receipt-loaded");

    closeModalAndClean();
};


export let selectFile = (e, payment) => {
    const file = e.target.files[0];
    if (!file) return;

    const inputId = inputIdField.value;
    const paymentRow = $(inputId).closest('.paymentRow');
    // Guardar archivo en selectedAmounts
    payment.file = file;
    updateModalContent(null, payment);

    // Actualizar botón del abono para indicar que hay archivo
    $(inputId).dataset.payId = payment.id;
    const btn = paymentRow.querySelector('.btnVoucher');
    btn.classList.add('receipt-loaded');
}

export const closeModalAndClean = () => {
    qs(".containerModal").classList.add('hide');
    inputIdField.value = '';
};

export const onClickBtnSelect = () => {
    const inputElement = $(inputIdField.value);
    if (inputElement) {
        // Limpiamos el valor para forzar el evento 'change' si selecciona el mismo archivo
        inputElement.value = '';
        inputElement.click(); // Abre el selector de archivos
    }
}

export const initializeModalListeners = (state) => {
    paymentsState = state; // 👈 inyección de estado
    initModalListeners({ clearCurrentFile, closeModalAndClean, onClickBtnSelect });
}