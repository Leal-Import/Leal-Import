import { asUUID, getNullableParam, highlightAndFocus, showMessage } from "../../../utils/dom.js";
import { isValidDecimal, safeParseFloat } from "../../../utils/validators.js";
import { normalizePayments, uploadPaymentReceipts, validatePayments } from "../../payments/payments.logic.js";
import { sanitizeURLParam } from "../../../utils/sanitizer.js";

export const validateSale = (state, idVehicle, idCustomer, idSale) => {
    if (!idVehicle) return "Ningún vehículo seleccionado";
    if (!idCustomer && !idSale) return "Sin cliente seleccionado";
    if (!state.payments || state.payments.length === 0) return "Debes agregar al menos un abono";
    if (!isValidDecimal(state.salePrice)) {
        highlightAndFocus("txtSalePrice");
        return "El precio final del vehículo no es válido";
    }
    if (!isValidDecimal(state.commission)) {
        highlightAndFocus("txtCommission");
        return "La comisión no es válida";
    }

    const validatePaymentsError = validatePayments(state.payments);
    if (validatePaymentsError) return validatePaymentsError;

    const totalAmounts = state.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalAmounts > state.salePrice) return 'La suma de los abonos no puede superar el precio final del vehículo';

    return null;
};

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);
    const idCustomer = asUUID(params.get('idCustomer'));
    if (!idCustomer) {
        await showMessage(
            "Cliente no seleccionado",
            "Acceso inválido. Falta el cliente.",
            "warning"
        );
        history.back();
        return false;
    }

    state.context.idCustomer = idCustomer;
    state.context.idSale = asUUID(params.get('idSale'));
    state.context.customerName = sanitizeURLParam(params.get('customerName'), '');
    state.context.isView = params.get('isView') === 'true';
    const idVehicle = asUUID(getNullableParam(params.get('idVehicle')));
    state.context.idVehicle = idVehicle;
    state.idVehicle = idVehicle; // si lo usás fuera del context

    return true;
};

export const buildPostSalePayload = async (state) => {
    const { data, context } = state;
    await uploadPaymentReceipts(data.payments);

    /* ===== SALE DATA ===== */
    const saleData = {
        salePrice: safeParseFloat(data.salePrice),
        commission: safeParseFloat(data.commission),
        notes: data.notes || '',
        idCustomer: context.idCustomer,
        vehiclePayments: normalizePayments(data.payments)
    };

    return saleData;
};

export const buildPutSalePayload = async (state) => {
    const { data } = state;
    await uploadPaymentReceipts(data.payments);
    const saleData = {
        salePrice: safeParseFloat(data.salePrice),
        commission: safeParseFloat(data.commission),
        notes: data.notes || '',
        paymentsSaveToUpdate: normalizePayments(data.payments),
        paymentsToDelete: data.paymentsToDelete
    };

    return saleData;
};
