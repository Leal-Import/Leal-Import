import { asNumber, asUUID, existsById, getNullableParam, highlightAndFocus, showMessage } from "../../utils/dom.js";
import { isValidDecimal, safeParseFloat } from "../../utils/validators.js";
import { normalizePayments, validatePayments } from "./payments.logic.js";

export const verifyIds = (state, idSparePart) => {
    return state.data.selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
};

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);

    const idCustomer = asUUID(getNullableParam(params.get('idCustomer')));
    const idVehicle = asUUID(params.get("idVehicle"));
    const idWorkOrder = asUUID(getNullableParam(params.get('idWorkOrder')));

    if (!idVehicle) {
        await showMessage("Vehiculo no seleccionado", "Acceso inválido. Falta el vehiculo.", "warning");
        history.back();
        return false;
    }

    state.context.idVehicle = idVehicle;
    state.context.idCustomer = idCustomer;
    state.context.idSale = asUUID(params.get('idSale'));
    state.context.idWorkOrder = idWorkOrder;
    state.context.customerName = params.get('customerName')?.trim() || '';
    state.context.vehiclePrice = asNumber(params.get("totalPrice"));
    state.context.isView = params.get('isView') === 'true';
    state.context.isNewPart = params.get("isNewPart") === "true";
    state.context.idNewPart = asUUID(params.get("idNewPart"));
    state.context.newPartName = params.get("newPartName");
    state.context.newPartSuggestedPrice = asNumber(params.get("newPartSuggestedPrice"));

    // 🔑 key para drafts (UUID-safe)
    state.saleKey = "pendingOrder";

    return true;
};

export const pushSparePart = (state, sparePart) => {
    const id = sparePart.id || sparePart.idSparePart || sparePart.idSpareParts || null;
    if (id && existsById(state, id, 'id')) return null;
    const normalizedPart = {
        id: id || crypto.randomUUID(),
        idSparePart: sparePart.idSparePart || sparePart.idSpareParts,
        name: sparePart.sparePartName || sparePart.nameSpareParts || sparePart.name || '',
        priceApplied: sparePart.priceApplied || sparePart.suggestedPrice || 0,
        idWorkOrderSpareParts: sparePart.idWorkOrderSpareParts || null
    };
    state.push(normalizedPart);
    return normalizedPart;
};

export const pushService = (state, service) => {
    const id = service.id || service.idService || null;
    if (id && existsById(state, id, 'id')) return null;
    const normalizedPart = {
        id: id || crypto.randomUUID(),
        idService: service.idService || null,
        name: service.nameService || service.name || '',
        priceApplied: service.priceApplied || 0.00,
        idWorkOrderService: service.idWorkOrderService || null
    };
    state.push(normalizedPart);
    return normalizedPart;
};

export const calculateWorkOrderTotals = ({
    services = [],
    spareParts = [],
    payments = [],
    vehiclePrice = 0
}) => {
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
};

const validateBaseOrder = (estimatedDate, notes, selectedServices, selectedSpareParts, payments, total, idVehicle) => {
    if (!idVehicle) return 'Debe seleccionar un vehículo.';
    if (!estimatedDate) {
        highlightAndFocus('dtEstimated');
        return 'Debe ingresar la fecha estimada.';
    };
    if (notes.trim().length === 0 && notes.trim().length > 500) {
        highlightAndFocus('txtNotes');
        return 'Las notas deben de tener un maximo de 500 caracteres.';
    }
    if (selectedServices.length === 0 && selectedSpareParts.length === 0) return 'Debe agregar al menos un servicio o un repuesto.';

    // Validar precios de servicios
    for (let i = 0; i < selectedServices.length; i++) {
        const s = selectedServices[i];
        if (!isValidDecimal(s.priceApplied) || Number(s.priceApplied) < 0) return `Precio inválido en el servicio ${i + 1}.`;
    }

    // Validar precios de repuestos
    for (let i = 0; i < selectedSpareParts.length; i++) {
        const p = selectedSpareParts[i];
        if (!isValidDecimal(p.priceApplied) || Number(p.priceApplied) < 0) return `Precio inválido en el repuesto ${i + 1}.`;
    }

    const totalAmounts = payments.reduce((acc, p) => acc + safeParseFloat(p.amount), 0);
    if (totalAmounts > total) return 'El total de los abonos no puede superar el total de la orden.';

    return null;
};

export const validateOrder = (data, idVehicle, total, requirePayment = false) => {
    const {
        selectedServices,
        selectedSpareParts,
        payments,
        estimatedDate,
        notes
    } = data;
    const baseOrderError = validateBaseOrder(estimatedDate, notes, selectedServices, selectedSpareParts, payments, total, idVehicle);
    if (baseOrderError) return baseOrderError;

    if (requirePayment && payments.length === 0) return 'Debe registrar al menos un abono.';

    const validatePaymentsError = validatePayments(payments);
    if (validatePaymentsError) return validatePaymentsError;

    return null;
};

export const buildOrderFormData = (state, isEditing) => {
    const fd = new FormData();

    let payload;
    if (isEditing) {
        payload = buildPutWorkOrderPayload(state);
    } else {
        payload = buildPostWorkOrderPayload(state);
    }

    fd.append('workOrderData', JSON.stringify(payload));

    appendPaymentFiles(fd, state.data.payments, isEditing);

    return fd;
};

const buildPutWorkOrderPayload = (state) => {
    const { data, context } = state;

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || '',
        estimatedDate: data.estimatedDate,
        saveOrUpdateService: normalizeServices(data.selectedServices),
        saveOrUpdateItems: normalizeSpareParts(data.selectedSpareParts),
        saveOrUpdatePayments: normalizePayments(data.payments),
        serviceToDelete: data.servicesToDelete,
        itemsToDelete: data.sparePartsToDelete,
        paymentsToDelete: data.paymentsToDelete
    };
};

const buildPostWorkOrderPayload = (state) => {
    const { data, context } = state;
    return {
        idCustomer: context.idCustomer,
        notes: data.notes || '',
        estimatedDate: data.estimatedDate,
        services: normalizeServices(data.selectedServices),
        spareParts: normalizeSpareParts(data.selectedSpareParts),
        payments: normalizePayments(data.payments)
    };
};

const appendPaymentFiles = (fd, payments, isEditing) => {
    payments.forEach(p => {
        if (!p.file) return;

        if (isEditing) {
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
