import { asNumber, asUUID, existsById, getNullableParam, highlightAndFocus, showMessage } from "../../../utils/dom.js";
import { isValidDecimal, safeParseFloat } from "../../../utils/validators.js";
import { normalizePayments, validatePayments } from "../../payments/payments.logic.js";

export const verifyIds = (state, idSparePart) => {
    return state.data.selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
};

export const hydrateContextFromURL = async (state) => {
    const params = new URLSearchParams(window.location.search);

    const idCustomer = asUUID(getNullableParam(params.get('idCustomer')));
    const idVehicle = asUUID(params.get("idVehicle"));
    const idWorkOrder = asUUID(getNullableParam(params.get('idWorkOrder')));
    const fromInventory = params.get('fromInventory') === 'true';

    if (!fromInventory) {
        if (!idVehicle) {
            await showMessage("Vehiculo no seleccionado", "Acceso inválido. Falta el vehiculo.", "warning");
            history.back();
            return false;
        }
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
        idWorkOrdersSpareParts: sparePart.idWorkOrdersSpareParts || null,
        idEmployee: sparePart.idEmployee || null,
        assignedEmployee: sparePart.assignedEmployee || null
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
        name: service.serviceName || service.name || '',
        priceApplied: service.priceApplied || 0.00,
        idWorkOrdersServices: service.idWorkOrdersServices || null,
        idEmployee: service.idEmployee || null,
        assignedEmployee: service.assignedEmployee || null,
        photos: service.photos || []
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
    appendServicePhotos(fd, state.data.selectedServices);

    return fd;
};

const buildPutWorkOrderPayload = (state) => {
    const { data, context } = state;

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || '',
        estimatedDate: data.estimatedDate,
        servicesSaveToUpdate: normalizeServices(data.selectedServices),
        sparePartsSaveToUpdate: normalizeSpareParts(data.selectedSpareParts),
        paymentsSaveToUpdate: normalizePayments(data.payments),
        serviceToDelete: data.servicesToDelete,
        sparePartsToDelete: data.sparePartsToDelete,
        paymentsToDelete: data.paymentsToDelete
    };
};

const buildPostWorkOrderPayload = (state) => {
    const { data, context } = state;
    return {
        idCustomer: context.idCustomer,
        notes: data.notes || '',
        estimatedDate: data.estimatedDate,
        workOrdersServices: normalizeServices(data.selectedServices),
        workOrdersSpareParts: normalizeSpareParts(data.selectedSpareParts),
        workOrdersPayments: normalizePayments(data.payments)
    };
};

const appendPaymentFiles = (fd, payments) => {
    payments.forEach(p => {
        fd.append(p.id, p.file);
    });
};

const appendServicePhotos = (fd, services) => {
    services.forEach((service) => {
        (service.photos || []).forEach((photo) => {
            if (photo.photo instanceof File) {
                fd.append(
                    `servicePhoto_${service.idService || service.id}_${photo.stage}`,
                    photo.photo
                );
            }
        });
    });
};

const normalizeServices = (services) => {
    return services.map(s => {
        const obj = {
            idService: s.idService || s.id,
            serviceName: s.name,
            priceApplied: Number(s.priceApplied),
            idEmployee: s.idEmployee
        };

        if (s.idWorkOrdersServices) {
            obj.idWorkOrdersServices = s.idWorkOrdersServices;
        }

        return obj;
    });
};

const normalizeSpareParts = (spareParts) => {
    return spareParts.map(p => {
        const obj = {
            idSparePart: p.idSparePart,
            priceApplied: Number(p.priceApplied),
            idEmployee: p.idEmployee
        };

        if (p.idWorkOrdersSpareParts) {
            obj.idWorkOrdersSpareParts = p.idWorkOrdersSpareParts;
        }

        return obj;
    });
};
