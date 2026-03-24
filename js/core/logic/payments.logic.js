// payments.logic.js
import { existsById } from "../../utils/dom.js";
import { safeParseFloat } from "../../utils/validators.js";
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
