// payments.logic.js

import { existsById } from "../../utils/dom.js";
import { safeParseFloat } from "../../utils/validators.js";

/* ===== CRUD DE PAYMENTS ===== */

export function addPayment(state, {
    id = null,
    amount = 0,
    idPaymentMethod = null,
    paymentURL = null,
    idPayment = null
}) {
    if (existsById(state.payments, id, 'id')) return null;
    const payment = {
        id: idPayment || crypto.randomUUID(),
        idPayment: idPayment || null,
        amount: safeParseFloat(amount),
        idPaymentMethod,
        paymentURL
    };

    state.payments.push(payment);
    return payment;
}
/* ===== SERIALIZACIÓN ===== */

export function buildPaymentsPayload(state) {
    return {
        payments: state.payments.map(p => ({
            idPayment: p.idPayment,
            idPaymentMethod: p.idPaymentMethod,
            amount: p.amount,
            paymentURL: p.paymentURL
        })),
        paymentsToDelete: state.paymentsToDelete
    };
}
