import { asUUID, getNullableParam, highlightAndFocus, showMessage } from "../../../utils/dom.js";
import { isValidDecimal } from "../../../utils/validators.js";
import { normalizePayments, validatePayments } from "../../../core/logic/payments.logic.js";

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
    if (totalAmounts > state.salePrice) return 'La suma de los abonos no puede superar el precio final del vehículo' ;

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
    state.context.customerName = params.get('customerName')?.trim() || '';
    state.context.isView = params.get('isView') === 'true';
    const idVehicle = asUUID(getNullableParam(params.get('idVehicle')));
    state.context.idVehicle = idVehicle;
    state.idVehicle = idVehicle; // si lo usás fuera del context

    return true;
};

export const buildPostSalePayload = (state) => {
    const { data, context } = state;
    const fd = new FormData();

    /* ===== SALE DATA ===== */
    const saleData = {
        salePrice: data.salePrice,
        commission: data.commission || 0,
        notes: data.notes || '',
        idCustomer: context.idCustomer,
        payments: normalizePayments(data.payments)
    };

    fd.append('vehicleData', JSON.stringify(saleData));

    data.payments.forEach(p => {
        fd.append('paymentImages', p.file);
    });

    return fd;
};

export const buildPutSalePayload = (state) => {
    const { data } = state;

    const fd = new FormData();

    const paymentsToUpdate = [];
    const newPayments = [];
    for (const p of data.payments) {
        const paymentData = {
            amount: p.amount,
            idPaymentMethod: p.idPaymentMethod,
            idPayment: p.idPayment || null
        };

        if (p.idPayment) {
            paymentsToUpdate.push(paymentData);
        } else {
            newPayments.push(paymentData);
        }
    }

    if (paymentsToUpdate.length === 0 && newPayments.length === 0) return { error: 'Debe registrar al menos un abono' };

    const saleData = {
        salePrice: data.salePrice,
        commission: data.commission || 0,
        notes: data.notes || '',
        paymentsToUpdate,
        newPayments,
        paymentsToDelete: data.paymentsToDelete
    };

    fd.append('vehicleData', JSON.stringify(saleData));

    /* ===== FILES ===== */
    for (const p of data.payments) {
        if (!p.file) continue;

        if (p.idPayment) {
            // reemplazo de comprobante existente
            fd.append(p.idPayment, p.file);
        } else {
            // nuevo comprobante
            fd.append('paymentImages', p.file);
        }
    }
    return fd;
};
