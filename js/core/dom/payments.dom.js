
// payments.dom.js
import { $ } from '../../utils/dom.js';
import { formatWithCommas } from '../../utils/formatters.js';
import { getMethodNameById } from '../logic/payments.logic.js';

/* ======================================================
   Render principal
====================================================== */
export function renderPayments({ payments = [], totals, onAmountChange, onMethodChange, onDeletePayment, paymentsToDelete, showReceiptBtn = false, createReceiptButton }) {
    const container = $("paymentsList");
    if (!container) return;
    container.innerHTML = '';
    payments.forEach((payment, index) => {
        const item = createPaymentRow({ payment, totals, payments, index, onAmountChange, onMethodChange, onDeletePayment, paymentsToDelete, showReceiptBtn, createReceiptButton })
        container.appendChild(item);
    });
}

/* ======================================================
   Crear fila individual
====================================================== */
function createPaymentRow({ payment, totals, payments, index, onAmountChange, onMethodChange, onDeletePayment, paymentsToDelete, showReceiptBtn, createReceiptButton }) {
    const paymentItem = document.createElement('div');
    paymentItem.classList.add('paymentItem');
    paymentItem.dataset.index = index + 1;
    /* ===== MONTO ===== */
    const amount = document.createElement('div');
    amount.classList.add('paymentAmount');

    if (payment.amount > 0) {
        amount.textContent = `$${formatWithCommas(payment.amount)}`;
    }

    /* ===== MÉTODO ===== */
    const method = document.createElement('div');
    method.classList.add('paymentMethod');
    method.textContent = getMethodNameById(payment.idPaymentMethod);
    let actions = document.createElement('div');
    actions.classList.add('paymentItemActions');
    
    const paymentInfo = document.createElement('div');
    paymentInfo.classList.add('paymentInfo');
    paymentInfo.appendChild(method);
    paymentInfo.appendChild(amount);
    
    paymentItem.appendChild(paymentInfo);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.classList.add('btnTrash');
    deleteBtn.innerHTML = `<img src="../../media/appMedia/trashIcon.png">`;
    deleteBtn.addEventListener("click", () => onDeletePayment(payments, index, totals, paymentsToDelete))
    actions.appendChild(deleteBtn);
    
    if (showReceiptBtn && createReceiptButton) {
        const receiptBtn = createReceiptButton(index, payment.paymentURL, payment);
        actions.appendChild(receiptBtn);
    }
    paymentItem.appendChild(actions);
    
    return paymentItem;
}