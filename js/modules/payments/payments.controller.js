// payments.controller.js

import {
    addPayment,
} from '../../core/logic/payments.logic.js';
import { DOMRefs, renderPayments, resetDomPayments } from '../../core/dom/payments.dom.js';
import { getPaymentMethods } from '../../service/configuration.service.js';
import { paymentsState } from '../../core/state/payments.state.js';
import { fillSelect } from '../../utils/dom.js';

/* Aca se cargan todos los metodos de pago */
export async function loadPayMethods(Refs) {
    try {
        const roles = await getPaymentMethods();
        // Tu API puede devolver array o { content: [...] }
        paymentsState.paymentMethods = Array.isArray(roles) ? roles : (roles?.content || []);
        const cmbPaymentMethod = Refs.paymentMethod;
        if(cmbPaymentMethod){
            fillSelect(cmbPaymentMethod, paymentsState.paymentMethods, "idPaymentMethod", "methodName", null, "Metodo de pago");
        }
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        paymentsState.paymentMethods = [];
    }
}

export async function initPaymentsController({ totalCalculator, onStateChange, createReceiptBtn, isView }) {
    try {
        const refs = DOMRefs.init();
    
        await loadPayMethods(refs);
        paymentsState.onSaveState = onStateChange;
        paymentsState.onCalculateTotal = totalCalculator;
        paymentsState.onCreateButton = createReceiptBtn;
        paymentsState.context.isView = isView;    
    } catch (error) {
        throw new Error("Error al inicializar el controlador de pagos: " + error.message);
    }
}


/* ======================================================
   Acciones públicas
====================================================== */

export function addNewPayment({ state, totals, payment }) {
    addPayment(state, payment || {});
    totals.totalPaid = state.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    renderPaymentsController(state.payments, totals, state.paymentsToDelete);
    paymentsState.onSaveState?.();
    paymentsState.onCalculateTotal();
}

const onDeletePayment = (payments, index, totals, paymentsToDelete) => {
    if (index === -1) return;
    const payment = payments[index];
    if (payment.idPayment) {
        paymentsToDelete.push(payment.idPayment);
    }
    payments.splice(index, 1);
    totals.totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    renderPaymentsController(payments, totals, paymentsToDelete);
    paymentsState.onSaveState?.();
    paymentsState.onCalculateTotal();
}

export const onResetPayments = (state, totals) => {
    // 1. Limpiar payments (manteniendo referencia)
    state.payments.length = 0;

    // 2. Resetear totales
    totals.totalPaid = 0;
    totals.due = 0;
    totals.total = 0;
}

export const onResetDomPayments = () => {
    resetDomPayments(DOMRefs.refs);
}

function renderPaymentsController(payments, totals, paymentsToDelete) {
    renderPayments({
        payments: payments,
        totals,
        onDeletePayment,
        paymentsToDelete,
        showReceiptBtn: true,
        createReceiptButton: paymentsState.onCreateButton,
        isView: paymentsState.context.isView,
        container: DOMRefs.refs.paymentsList
    });
}
