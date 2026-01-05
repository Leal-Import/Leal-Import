// payments.controller.js

import {
    addPayment,
} from '../../core/logic/payments.logic.js';
import { renderPayments } from '../../core/dom/payments.dom.js';
import { getPaymentMethods } from '../../service/configuration.service.js';
import { paymentsState } from '../../core/state/payments.state.js';

/* Aca se cargan todos los metodos de pago */
export async function loadPayMethods() {
    try {
        const roles = await getPaymentMethods();
        // Tu API puede devolver array o { content: [...] }
        paymentsState.paymentMethods = Array.isArray(roles) ? roles : (roles?.content || []);
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        paymentsState.paymentMethods = [];
    }
}

export async function initPaymentsController({ state, totals, totalCalculator, onStateChange, createReceiptBtn }) {
    await loadPayMethods();
    paymentsState.onSaveState = onStateChange;
    paymentsState.onCalculateTotal = totalCalculator;
    render(state.payments, totals, createReceiptBtn);
}


/* ======================================================
   Acciones públicas
====================================================== */

export function addNewPayment({ state, totals, createReceiptBtn, payment }) {
    addPayment(state, payment || {});
    render(state.payments, totals, createReceiptBtn);
    totals.totalPaid = state.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    paymentsState.onSaveState?.();
}

let onDeletePayment = (payments, index, totals) => {
    if (index === -1) return;
    const payment = payments[index];
    if (payment.idPayment) {
        payments.paymentsToDelete.push(payment.idPayment);
    }
    payments.splice(index, 1);
    totals.totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    render(payments, totals);
    paymentsState.onSaveState?.();
    paymentsState.onCalculateTotal();
}

let onAmountChange = (payments, index, value, totals) => {
    const payment = payments[index];
    if (!payment) return;
    payment.amount = value;
    totals.totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    paymentsState.onSaveState?.();
    paymentsState.onCalculateTotal();
}

let onMethodChange = (payments, index, value) => {
    const payment = payments[index];
    if (!payment) return;
    payment.idPaymentMethod = value;
    paymentsState.onSaveState?.();
    paymentsState.onCalculateTotal();
}


export function render(payments, totals, createReceiptBtn) {
    renderPayments({
        payments: payments,
        totals,
        paymentsMethods: paymentsState.paymentMethods,
        onAmountChange,
        onMethodChange,
        onDeletePayment,
        showReceiptBtn: true,
        createReceiptButton: createReceiptBtn
    });
}
