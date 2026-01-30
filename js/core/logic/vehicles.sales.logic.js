import { asUUID, showMessage } from "../../utils/dom.js";

export const validateSale = (state, idVehicle, idCustomer, idSale) => {
    if (!idVehicle) {
        return "Ningún vehículo seleccionado";
    }

    if (!idCustomer && !idSale) {
        return "Sin cliente seleccionado";
    }

    if (!state.payments || state.payments.length === 0) {
        return "Debes agregar al menos un abono";
    }

    if (isNaN(state.salePrice) || Number(state.salePrice) <= 0) {
        return "El precio final del vehículo no es válido";
    }

    return null;
};


export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);

    // 🔴 Obligatorio
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

    // 🟡 Opcional
    state.context.idSale = asUUID(params.get('idSale'));

    // UX
    state.context.customerName = params.get('customerName')?.trim() || '';

    // 🔵 Opcional (vehículo)
    const idVehicle = asUUID(params.get('idVehicle'));
    state.context.idVehicle = idVehicle;
    state.idVehicle = idVehicle; // si lo usás fuera del context

    // 🔑 key para drafts (UUID-safe)
    state.saleKey = `vehicleSaleState_customer_${idCustomer}_${state.context.idSale ?? "NewSale"}`;

    return true;
};


export function buildPostSalePayload(state) {
    const { data, context } = state;
    const fd = new FormData();

    /* ===== PAYMENTS ===== */
    const payments = [];
    const paymentImages = [];
    let index = 1;
    for (const p of data.payments) {
        if (!p.amount || p.amount <= 0) {
            return { error: `Monto de abono inválido del abono ${index}` };
        }
        if (!p.idPaymentMethod) {
            return { error: `Método de pago faltante del abono ${index}` };
        }
        if (!p.file) {
            return { error: `Comprobante requerido del abono ${index}` };
        }

        payments.push({
            amount: p.amount,
            idPaymentMethod: p.idPaymentMethod,
        });
        paymentImages.push(p.file);
        index++;
    }

    if (!payments.length) {
        return { error: 'Debe registrar al menos un abono' };
    }

    /* ===== SALE DATA ===== */
    const saleData = {
        salePrice: data.salePrice,
        commission: data.commission || 0,
        notes: data.notes || '',
        idCustomer: context.idCustomer,
        payments
    };

    fd.append('vehicleData', JSON.stringify(saleData));

    paymentImages.forEach(file => {
        fd.append('paymentImages', file);
    });

    return fd;
}

export function buildPutSalePayload(state) {
    const { data, idEmployee } = state;

    const fd = new FormData();

    const paymentsToUpdate = [];
    const newPayments = [];
    let index = 1;
    for (const p of data.payments) {
        if (!p.amount || p.amount <= 0) {
            return { error: `Monto de abono inválido ${index}` };
        }
        if (!p.idPaymentMethod) {
            return { error: `Método de pago faltante ${index}` };
        }

        const paymentData = {
            amount: p.amount,
            idPaymentMethod: p.idPaymentMethod,
            idEmployee,
            idPayment: p.idPayment || null
        };

        if (p.idPayment) {
            paymentsToUpdate.push(paymentData);
        } else {
            newPayments.push(paymentData);
        }
        index++;
    }

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
            fd.append('newPaymentImages', p.file);
        }
    }

    return fd;
}
