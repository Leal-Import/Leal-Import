// payments.logic.js

import { safeParseFloat } from "../../utils/validators.js";

/* ===== CRUD DE PAYMENTS ===== */

export function addPayment(state, {
    amount = 0,
    idPaymentMethod = null,
    paymentURL = null,
    idPayment = null
}) {
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
