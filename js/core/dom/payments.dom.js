
// payments.dom.js
import { $, fillSelect } from '../../utils/dom.js';
import { formatDecimalInput, formatOnBlur, formatOnFocus, formatWithCommas } from '../../utils/formatters.js';

/* ======================================================
   Render principal
====================================================== */
export function renderPayments({ payments = [], totals, paymentsMethods = [], onAmountChange, onMethodChange, onDeletePayment, paymentsToDelete, showReceiptBtn = false, createReceiptButton }) {
    const container = $("amounts");
    if (!container) return;
    container.innerHTML = '';
    payments.forEach((payment, index) => {
        const row = createPaymentRow({ payment, totals, payments, index, onAmountChange, onMethodChange, onDeletePayment, paymentsToDelete, showReceiptBtn, createReceiptButton })
        container.appendChild(row.tr);
        fillSelect(row.select, paymentsMethods, "idPaymentMethod", "methodName", payment.idPaymentMethod, "Metodo de pago");
    });
}

/* ======================================================
   Crear fila individual
====================================================== */
function createPaymentRow({ payment, totals, payments, index, onAmountChange, onMethodChange, onDeletePayment, paymentsToDelete, showReceiptBtn, createReceiptButton }) {
    const tr = document.createElement('tr');
    tr.classList.add('paymentRow');
    tr.dataset.index = index + 1;
    /* ===== MONTO ===== */
    const tdAmount = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('txtInputs', 'amountInput');
    input.placeholder = `Abono ${index + 1}`;

    if (payment.amount > 0) {
        input.value = `$${formatWithCommas(payment.amount)}`;
    }

    tdAmount.appendChild(input);
    formatDecimalInput(input);
    input.addEventListener("input", (e) => onAmountChange?.(payments, index, e.target.value, totals));
    input.addEventListener("focus", (e) => formatOnFocus(e, true));
    input.addEventListener("blur", (e) => formatOnBlur(e, true));

    /* ===== MÉTODO ===== */
    const tdMethod = document.createElement('td');
    const select = document.createElement('select');
    select.classList.add('txtInputs', 'paymentTypeSelect');
    select.id = `Method${index}`;
    tdMethod.appendChild(select);

    select.addEventListener("change", (e) => onMethodChange?.(payments, index, e.target.value))

    /* ===== ACCIONES ===== */
    const tdActions = document.createElement('td');
    const actions = document.createElement('div');
    actions.classList.add('actionsPayments');

    if (showReceiptBtn && createReceiptButton) {
        const receiptBtn = createReceiptButton(index, payment.paymentURL, payment);
        actions.appendChild(receiptBtn);
    }

    if (index !== 0) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('btnTrash');
        deleteBtn.innerHTML = `<img src="../../media/appMedia/trashIcon.png">`;
        deleteBtn.addEventListener("click", () => onDeletePayment(payments, index, totals, paymentsToDelete))
        actions.appendChild(deleteBtn);
    }

    tdActions.appendChild(actions);

    tr.append(tdAmount, tdMethod, tdActions);

    return {
        tr,
        select
    };
}
