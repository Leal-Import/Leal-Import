// payments.logic.js
import { existsById } from "../../utils/dom.js";
import { safeParseFloat } from "../../utils/validators.js";
import { paymentsState } from "../state/payments.state.js";

export function addPayment(
    state, {
        id = null,
        idPayment = null,
        amount = 0,
        idPaymentMethod = null,
        paymentURL = null
    }
) {
    if (!state?.payments) return null;
    if (existsById(state.payments, id, 'id')) return null;

    const payment = {
        id: idPayment ?? crypto.randomUUID(),
        idPayment,
        amount: safeParseFloat(amount),
        idPaymentMethod,
        paymentURL
    };

    state.payments.push(payment);
    return payment;
}

export function getMethodNameById(idPaymentMethod) {
    if (!idPaymentMethod) return 'Desconocido';

    const method = paymentsState.paymentMethods
        .find(m => m.idPaymentMethod === idPaymentMethod);

    return method?.methodName || 'Desconocido';
}
