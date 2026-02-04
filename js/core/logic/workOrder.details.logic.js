import { $, asNumber, asUUID, existsById, getNullableParam, showMessage } from "../../utils/dom.js";
import { safeParseFloat } from "../../utils/validators.js";
import { workOrderDetailsState } from "../state/workOrder.details.state.js";

export const verifyIds = (state, idSparePart) => {
    return state.data.selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
}

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);

    const idCustomer = asUUID(getNullableParam(params.get('idCustomer')));
    const idVehicle = asUUID(params.get("idVehicle"));
    const idWorkOrder = asUUID(getNullableParam(params.get('idWorkOrder')));
    if (!idCustomer && !idWorkOrder) {
        await showMessage("Cliente no seleccionado", "Acceso inválido. Falta el cliente.", "warning");
        history.back();
        return false;
    }

    if (!idVehicle) {
        await showMessage("Vehiculo no seleccionado", "Acceso inválido. Falta el vehiculo.", "warning");
        history.back();
        return false;
    }

    state.context.idVehicle = idVehicle;
    state.context.idCustomer = getNullableParam(idCustomer);
    state.context.idSale = asUUID(getNullableParam(params.get('idSale')));
    state.context.idWorkOrder = idWorkOrder;
    state.context.customerName = params.get('customerName')?.trim() || '';
    state.context.vehiclePrice = asNumber(params.get("totalPrice"));
    state.context.isView = params.get('isView') === 'true';
    state.context.isNewPart = params.get("isNewPart") === "true";
    state.context.idNewPart = asUUID(params.get("newSparePartId"));
    state.context.newPartName = params.get("newSparePartName");
    state.context.newPartSuggestedPrice = asNumber(params.get("newSuggestedPrice"));

    // 🔑 key para drafts (UUID-safe)
    state.saleKey = "pendingOrder";

    return true;
};

export const pushSparePart = (state, sparePart) => {
    if (existsById(state, sparePart.id, 'id')) return null;
    const normalizedPart = {
        id: sparePart.idSparePart || sparePart.idSpareParts || crypto.randomUUID(),
        idSparePart: sparePart.idSparePart || sparePart.idSpareParts,
        name: sparePart.sparePartName || sparePart.nameSpareParts || sparePart.name || '',
        priceApplied: sparePart.priceApplied || sparePart.suggestedPrice || 0,
        idWorkOrderSpareParts: sparePart.idWorkOrderSpareParts || null,
    }
    state.push(normalizedPart);
    return normalizedPart;
}

export const pushService = (state, service) => {
    if (existsById(state, service.id, 'id')) return null;

    const normalizedPart = {
        id: service.idService || crypto.randomUUID(),
        idService: service.idService || null,
        name: service.nameService || service.name || '',
        priceApplied: service.priceApplied || 0.00,
        idWorkOrderService: service.idWorkOrderService || null,
    }
    state.push(normalizedPart);
    return normalizedPart;
}

export function calculateWorkOrderTotals({
    services = [],
    spareParts = [],
    payments = [],
    vehiclePrice = 0
}) {
    const servicesTotal = services.reduce((acc, s) => acc + safeParseFloat(s.priceApplied), 0);
    const sparePartsTotal = spareParts.reduce((acc, p) => acc + safeParseFloat(p.priceApplied), 0);
    const total = servicesTotal + sparePartsTotal;

    const totalPaid = payments.reduce((acc, p) => acc + safeParseFloat(p.amount), 0);
    const due = Math.max(total - totalPaid, 0);

    const orderTotal = total + safeParseFloat(vehiclePrice);

    return {
        servicesTotal,
        sparePartsTotal,
        total,
        totalPaid,
        due,
        orderTotal,
        vehiclePrice
    };
}

export const cleanWindow = () => {
    localStorage.removeItem(workOrderDetailsState.saleKey);
    $("frmWorkOrder").reset();
};

export function validatePostOrder(data, idVehicle, idCustomer) {
    const {
        selectedServices,
        selectedSpareParts,
        payments,
        estimatedDate
    } = data;

    if (!idVehicle) {
        return 'Debe seleccionar un vehículo.';
    }

    if (!idCustomer) {
        return 'Cliente invalido.';
    }

    if (!estimatedDate) {
        return 'Debe ingresar la fecha estimada.';
    }

    if (!selectedServices.length && !selectedSpareParts.length) {
        return 'Debe agregar al menos un servicio o un repuesto.';
    }

    if (!payments.length) {
        return 'Debe registrar al menos un abono.';
    }

    for (let i = 0; i < payments.length; i++) {
        const p = payments[i];

        if (!p.amount || p.amount <= 0) {
            return `Monto inválido en el abono ${i + 1}.`;
        }

        if (!p.idPaymentMethod) {
            return `Seleccione método de pago en el abono ${i + 1}.`;
        }

        if (!p.file) {
            return `Debe adjuntar comprobante en el abono ${i + 1}.`;
        }
    }

    return null;
}

export function validatePutOrder(data, idVehicle) {
    const {
        selectedServices,
        selectedSpareParts,
        payments,
        estimatedDate
    } = data;

    if (!idVehicle) {
        return 'Datos de cliente o vehículo inválidos.';
    }

    if (!estimatedDate) {
        return 'Debe ingresar la fecha estimada.';
    }

    if (!selectedServices.length && !selectedSpareParts.length) {
        return 'Debe mantener al menos un servicio o repuesto.';
    }

    for (let i = 0; i < payments.length; i++) {
        const p = payments[i];

        if (!p.amount || p.amount <= 0) {
            return `Monto inválido en el abono ${i + 1}.`;
        }

        if (!p.idPaymentMethod) {
            return `Seleccione método de pago en el abono ${i + 1}.`;
        }

        // Pago nuevo sin comprobante
        if (!p.idPayment && !p.file) {
            return `Debe adjuntar comprobante en el abono ${i + 1}.`;
        }
    }

    return null;
}

export const buildPostWorkOrderFormData = (state) => {
    const fd = new FormData();

    const payload = buildPostWorkOrderPayload(state);
    fd.append('workOrderData', JSON.stringify(payload));

    appendPaymentFiles(fd, state.data.payments, false);

    return fd;
};

export const buildPutWorkOrderFormData = (state) => {
    const fd = new FormData();

    const payload = buildPutWorkOrderPayload(state);
    fd.append('workOrderData', JSON.stringify(payload));

    appendPaymentFiles(fd, state.data.payments, true);

    return fd;
};

const buildPutWorkOrderPayload = (state) => {
    const { data, context, idEmployee } = state;

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || '',
        estimatedDate: data.estimatedDate,

        saveOrUpdateService: normalizeServices(data.selectedServices),
        saveOrUpdateItems: normalizeSpareParts(data.selectedSpareParts),
        saveOrUpdatePayments: normalizePayments(data.payments, idEmployee),

        serviceToDelete: data.servicesToDelete,
        itemsToDelete: data.sparePartsToDelete,
        paymentsToDelete: data.paymentsToDelete,

        idEmployee
    };
};


const buildPostWorkOrderPayload = (state) => {
    const { data, context, idEmployee } = state;

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || '',
        estimatedDate: data.estimatedDate,
        services: normalizeServices(data.selectedServices),
        spareParts: normalizeSpareParts(data.selectedSpareParts),
        payments: normalizePayments(data.payments, idEmployee),
        idEmployee //el idEmployee esta de momento pero despues se quitara
    };
};


const appendPaymentFiles = (fd, payments, isEdit) => {
    payments.forEach(p => {
        if (!p.file) return;

        if (isEdit) {
            // PUT
            if (p.paymentURL) {
                // Reemplazo de comprobante existente
                fd.append(p.idPayment, p.file);
            } else {
                // Nuevo pago
                fd.append('newPaymentImages', p.file);
            }
        } else {
            // POST
            fd.append('paymentImages', p.file);
        }
    });
};

const normalizePayments = (payments, idEmployee) => {
    return payments.map(p => ({
        amount: Number(p.amount),
        idPaymentMethod: p.idPaymentMethod,
        idPayment: p.idPayment ?? null,
        idEmployee
    }));
};

const normalizeServices = (services) => {
    return services.map(s => {
        const obj = {
            idService: s.idService ?? null,
            nameService: s.name,
            priceApplied: Number(s.priceApplied)
        };

        if (s.idWorkOrderService) {
            obj.idWorkOrderService = s.idWorkOrderService;
        }

        return obj;
    });
};

const normalizeSpareParts = (spareParts) => {
    return spareParts.map(p => {
        const obj = {
            idSparePart: p.idSparePart,
            priceApplied: Number(p.priceApplied)
        };

        if (p.idWorkOrderSpareParts) {
            obj.idWorkOrderSpareParts = p.idWorkOrderSpareParts;
        }

        return obj;
    });
};
