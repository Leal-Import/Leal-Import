// payments.dom.js
import { $ } from '../../utils/dom.js';
import { formatWithCommas } from '../../utils/formatters.js';
import { getMethodNameById } from '../logic/payments.logic.js';

/* ======================================================
   Render principal
====================================================== */
export function renderPayments({
    payments = [],
    totals,
    onDeletePayment,
    paymentsToDelete,
    showReceiptBtn = false,
    createReceiptButton,
    isView
}) {
    const container = $("paymentsList");
    if (!container) return;

    container.innerHTML = '';

    payments.forEach((payment, index) => {
        container.appendChild(
            createPaymentRow({
                payment,
                payments,
                totals,
                index,
                onDeletePayment,
                paymentsToDelete,
                showReceiptBtn,
                createReceiptButton,
                isView
            })
        );
    });
}

/* ======================================================
   Crear fila individual
====================================================== */
function createPaymentRow({
    payment,
    payments,
    totals,
    index,
    onDeletePayment,
    paymentsToDelete,
    showReceiptBtn,
    createReceiptButton,
    isView
}) {
    const paymentItem = document.createElement('div');
    paymentItem.className = 'paymentItem';
    paymentItem.dataset.index = index + 1;

    /* ===== INFO ===== */
    const paymentInfo = document.createElement('div');
    paymentInfo.className = 'paymentInfo';

    const method = document.createElement('div');
    method.className = 'paymentMethod';
    method.textContent = getMethodNameById(payment.idPaymentMethod);

    const amount = document.createElement('div');
    amount.className = 'paymentAmount';
    amount.textContent = payment.amount > 0
        ? `$${formatWithCommas(payment.amount)}`
        : '';

    paymentInfo.append(method, amount);

    /* ===== ACCIONES ===== */
    const actions = document.createElement('div');
    actions.className = 'paymentItemActions';

    if (!isView) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btnTrash';
        deleteBtn.innerHTML = `<img src="../../media/appMedia/trashIcon.png">`;

        deleteBtn.addEventListener('click', () =>
            onDeletePayment(payments, index, totals, paymentsToDelete)
        );

        actions.appendChild(deleteBtn);
    }

    if (showReceiptBtn && createReceiptButton) {
        actions.appendChild(
            createReceiptButton(index, payment.paymentURL, payment)
        );
    }

    paymentItem.append(paymentInfo, actions);
    return paymentItem;
}
