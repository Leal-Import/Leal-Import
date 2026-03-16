// payments.logic.js
import { existsById } from "../../utils/dom.js";
import { safeParseFloat } from "../../utils/validators.js";
import { paymentsState } from "../state/payments.state.js";

export const addPayment = (
    state, {
        id = null,
        idPayment = null,
        amount = 0,
        idPaymentMethod = null,
        paymentURL = null
    }
) => {
    if (!state?.payments) return null;
    const resolvedId = id ?? idPayment ?? crypto.randomUUID();
    if (existsById(state.payments, resolvedId, 'id')) return null;

    const payment = {
        id: resolvedId,
        idPayment,
        amount: safeParseFloat(amount),
        idPaymentMethod,
        paymentURL
    };

    state.payments.push(payment);
    return payment;
};

export const getMethodNameById = (idPaymentMethod) => {
    if (!idPaymentMethod) return 'Desconocido';

    const method = paymentsState.paymentMethods
        .find(m => m.idPaymentMethod === idPaymentMethod);

    return method?.methodName || 'Desconocido';
};
