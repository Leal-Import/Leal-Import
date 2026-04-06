// payments.logic.js
import { existsById, highlightAndFocus } from "../../utils/dom.js";
import { isValidDecimal, safeParseFloat } from "../../utils/validators.js";
import { paymentsState } from "../state/payments.state.js";

const normalizePayment = (payment) => {
    const resolvedId = payment.id ?? payment.idPayment ?? crypto.randomUUID();
    return {
        id:              resolvedId,
        idPayment:       payment.idPayment       ?? null,
        amount:          safeParseFloat(payment.amount),
        idPaymentMethod: payment.idPaymentMethod ?? null,
        paymentURL:      payment.paymentURL      ?? null,
        paymentMethod:   payment.paymentMethod   ?? getMethodNameById(payment) ?? null,
        employeeName:    payment.employeeName    ?? null,
        paymentDate:     payment.paymentDate     ?? null,
        paymentNumber:   payment.paymentNumber   ?? null,
        file:            null
    };
};

export const addPayment = (state, payment) => {
    if (!state?.payments) return null;

    const normalized = normalizePayment(payment);

    if (existsById(state.payments, normalized.id, 'id')) return null;

    state.payments.push(normalized);
    return normalized;
};

export const getMethodNameById = (payment) => {
    if (payment?.paymentMethod) return payment.paymentMethod;
    if (!payment?.idPaymentMethod) return 'Desconocido';

    const method = paymentsState.paymentMethods
        .find(m => m.idPaymentMethod === payment.idPaymentMethod);
    return method?.methodName ?? 'Desconocido';
};

export const validatePayments = (payments) => {
    for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        if (!isValidDecimal(p.amount) || p.amount <= 0) {
            return `Monto inválido en el abono ${i + 1}.`;
        }
        if (!p.idPaymentMethod) {
            return `Seleccione método de pago en el abono ${i + 1}.`;
        }
    }
    return null;
};

export const validatePayment = (amount, method) => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        highlightAndFocus("txtAmount");
        return "El monto del abono debe ser mayor a cero.";
    }

    if (!method) {
        highlightAndFocus("paymentMethod");
        return "Debe seleccionar un método de pago.";
    }

    return null;
};

export const normalizePayments = (payments) => {
    return payments.map(p => {
        const payment = {
            idPayment: p.id || crypto.randomUUID(),
            amount: Number(p.amount),
            idPaymentMethod: p.idPaymentMethod
        };
        if (p.idPayment) {
            payment.idPayment = p.idPayment;
        }
        return payment;
    });
};
