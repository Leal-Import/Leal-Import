// payments.logic.js
import { highlightAndFocus } from "../../utils/dom.js";
import { isValidDecimal, safeParseFloat } from "../../utils/validators.js";
import { paymentsState } from "./payments.state.js";
import { uploadImage } from "../../core/integrations/cloudinary/cloudinary-image.service.js";

const normalizePayment = (payment) => {

    const localId = payment.localId || payment.idPayment || payment.id || crypto.randomUUID();

    return {
        localId,
        idPayment: payment.idPayment ?? null,
        amount: safeParseFloat(payment.amount),
        idPaymentMethod: payment.idPaymentMethod ?? null,
        paymentURL: payment.paymentURL ?? null,
        paymentMethod: payment.paymentMethod ?? getMethodNameById(payment) ?? null,
        employeeName: payment.employeeName ?? null,
        paymentDate: payment.paymentDate ?? null,
        paymentNumber: payment.paymentNumber ?? null,
        file: payment.file instanceof File
            ? payment.file
            : null
    };
};

export const addPayment = (state, payment) => {
    if (!state?.payments) return null;

    const normalized = normalizePayment(payment);

    const alreadyExists = state.payments.some(
        current => current.localId === normalized.localId
    );

    if (alreadyExists) {
        return null;
    }

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
    return payments.map(payment => ({
        idPayment: payment.idPayment ?? null,
        amount: Number(payment.amount),
        idPaymentMethod: payment.idPaymentMethod,
        receipt: payment.receipt ?? null
    }));
};

export const uploadPaymentReceipts = (payments = []) => Promise.all(
    payments.map(uploadPaymentReceipt)
);

const uploadPaymentReceipt = async (payment) => {
    if (!(payment.file instanceof File)) {
        return;
    }

    payment.receipt = await uploadImage(payment.file);
    payment.paymentURL = payment.receipt.url;
};
