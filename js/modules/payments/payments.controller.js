// payments.controller.js

import {
    addPayment,
} from '../../core/logic/payments.logic.js';
import { renderPayments } from '../../core/dom/payments.dom.js';
import { getPaymentMethods } from '../../service/configuration.service.js';
import { paymentsState } from '../../core/state/payments.state.js';
import { $, fillSelect } from '../../utils/dom.js';

/* Aca se cargan todos los metodos de pago */
export async function loadPayMethods() {
    try {
        const roles = await getPaymentMethods();
        // Tu API puede devolver array o { content: [...] }
        paymentsState.paymentMethods = Array.isArray(roles) ? roles : (roles?.content || []);
        fillSelect($("paymentMethod"), paymentsState.paymentMethods, "idPaymentMethod", "methodName", null, "Metodo de pago");
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        paymentsState.paymentMethods = [];
    }
}

export async function initPaymentsController({ totalCalculator, onStateChange, createReceiptBtn }) {
    await loadPayMethods();
    paymentsState.onSaveState = onStateChange;
    paymentsState.onCalculateTotal = totalCalculator;
    paymentsState.onCreateButton = createReceiptBtn;
}


/* ======================================================
   Acciones públicas
====================================================== */

export function addNewPayment({ state, totals, payment }) {
    addPayment(state, payment || {});
    totals.totalPaid = state.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    render(state.payments, totals, state.paymentsToDelete);
    paymentsState.onSaveState?.();
    paymentsState.onCalculateTotal();
}

let onDeletePayment = (payments, index, totals, paymentsToDelete) => {
    if (index === -1) return;
    const payment = payments[index];
    if (payment.idPayment) {
        paymentsToDelete.push(payment.idPayment);
    }
    payments.splice(index, 1);
    totals.totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    render(payments, totals, paymentsToDelete);
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

export let onResetPayments = (state, totals) => {
    // 1. Limpiar payments (manteniendo referencia)
    state.payments.length = 0;

    // 2. Resetear totales
    totals.totalPaid = 0;
    totals.due = 0;
    totals.total = 0;
}

export function render(payments, totals, paymentsToDelete) {
    renderPayments({
        payments: payments,
        totals,
        paymentsMethods: paymentsState.paymentMethods,
        onAmountChange,
        onMethodChange,
        onDeletePayment,
        paymentsToDelete,
        showReceiptBtn: true,
        createReceiptButton: paymentsState.onCreateButton
    });
}
