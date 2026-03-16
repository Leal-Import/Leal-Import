// payments.dom.js
import { $ } from '../../utils/dom.js';
import { formatWithCommas } from '../../utils/formatters.js';
import { getMethodNameById } from '../logic/payments.logic.js';

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            paymentsList: $('paymentsList'),
            paymentMethod: $('paymentMethod'),
            txtAmount: $('txtAmount'),
            paymentMethod: $('paymentMethod'),
            txtTotal: $('txtTotal'),
            txtCommission: $('txtCommission'),
            txtNotes: $('txtNotes')
        };
        return this.refs;
    }
};

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
    isView,
    container
}) {
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
        deleteBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;

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

export const resetDomPayments = (Refs) => {
    if (Refs.txtAmount) Refs.txtAmount.value = '';
    if (Refs.paymentMethod) Refs.paymentMethod.value = '';
    if (Refs.txtTotal) Refs.txtTotal.value = '';
    if (Refs.txtCommission) Refs.txtCommission.value = '';
    if (Refs.txtNotes) Refs.txtNotes.value = '';
    if (Refs.paymentsList) Refs.paymentsList.innerHTML = '';
}