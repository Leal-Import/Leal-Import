// payments.dom.js
import { $, qs } from '../../utils/dom.js';

import { formatWithCommas } from '../../utils/formatters.js';
import { getMethodNameById } from '../logic/payments.logic.js';

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            paymentsList: $('paymentsList'),
            paymentMethod: $('paymentMethod'),
            txtAmount: $('txtAmount'),
            txtTotal: $('txtTotal'),
            txtCommission: $('txtCommission'),
            txtNotes: $('txtNotes'),
            btnCancelEdit: $('btnCancelEdit'),
            btnAddPayment: $('btnAddPayment'),
            separatorDiv: qs('.separatorDiv')
        };
        return this.refs;
    }
};

const createPaymentRow = ({
    payment,
    payments,
    totals,
    index,
    onDeletePayment,
    paymentsToDelete,
    showReceiptBtn,
    createReceiptButton,
    isView,
    onEditPayment
}) => {
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
        ? formatWithCommas(payment.amount)
        : '';

    paymentInfo.append(method, amount);

    /* ===== ACCIONES ===== */
    const actions = document.createElement('div');
    actions.className = 'paymentItemActions';

    if (!isView) {
        const paymentUpActions = document.createElement('div');
        paymentUpActions.className = 'paymentUpActions';
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btnTrash';
        btnDelete.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;

        btnDelete.addEventListener('click', () => onDeletePayment(payments, index, totals, paymentsToDelete));

        // Botón editar (agregarlo ANTES del delete)
        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.className = 'btnEdit'; // nuevo estilo que vas a crear
        btnEdit.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

        btnEdit.addEventListener('click', () => onEditPayment(payments, index));
        paymentUpActions.append(btnEdit, btnDelete);
        actions.appendChild(paymentUpActions);
    }

    if (showReceiptBtn && createReceiptButton) {
        actions.appendChild(createReceiptButton(index, payment.paymentURL, payment));
    }

    paymentItem.append(paymentInfo, actions);
    return paymentItem;
};

/* ======================================================
   Render principal
====================================================== */
export const renderPayments = ({
    payments = [],
    totals,
    onDeletePayment,
    paymentsToDelete,
    showReceiptBtn = false,
    createReceiptButton,
    isView,
    container,
    onEditPayment
}) => {
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
                isView,
                onEditPayment
            })
        );
    });
};

export const resetDomPayments = (Refs) => {
    const { txtAmount, paymentMethod, txtTotal, txtCommission, txtNotes, paymentsList } = Refs;
    txtAmount.value = '';
    paymentMethod.value = '';
    txtTotal.value = '';
    txtCommission.value = '';
    txtNotes.value = '';
    if (Refs.paymentsList) paymentsList.innerHTML = '';
};

export const cleanPaymentCamps = (txtAmount, paymentMethod) => {
    txtAmount.value = '';
    paymentMethod.value = '';
};
