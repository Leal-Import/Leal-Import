import { asBoolean, asNumber, asUUID, highlightAndFocus, showMessage } from "../../../utils/dom.js";
import { isValidDecimal } from "../../../utils/validators.js";
import { spareSaleState } from "./spareParts.sales.state.js";
import { normalizePayments, validatePayments } from "../../../core/logic/payments.logic.js";

export const verifyIds = (idSparePart) => {
    return spareSaleState.data.selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
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

    // UX (texto plano)
    state.context.customerName = params.get('customerName')?.trim() || '';

    // 🔵 One-shot params
    const isNewPart = asBoolean(params.get('isNewPart'));
    const sparePartId = asUUID(params.get('sparePartId'));

    if (isNewPart && sparePartId) {
        state.context.isNewPart = true;
        state.context.newPartId = sparePartId;
        state.context.newPartName = params.get('sparePartName')?.trim() || '';
        state.context.suggestedPrice = asNumber(params.get('suggestedPrice'));
    } else {
        // limpieza defensiva
        state.context.isNewPart = false;
        state.context.newPartId = null;
        state.context.newPartName = null;
        state.context.suggestedPrice = null;
    }

    // 🔑 key para drafts (UUID-safe)
    state.saleKey = "pendingSpareSale";

    return true;
};

export const validateSale = () => {
    const { data: { selectedItems, payments, notes }, context } = spareSaleState;

    // Validar cliente
    if (!context.idCustomer) return 'No se ha seleccionado ningún cliente.';
    if (!selectedItems || selectedItems.length === 0) return 'Por favor, seleccione al menos un repuesto.';
    if (!payments || payments.length === 0) return 'Por favor, ingrese al menos un abono.';
    if (notes.trim() !== "" && notes.length > 500) {
        highlightAndFocus("txtNotes");
        return 'Las notas no pueden exceder los 500 caracteres.';
    };

    const validatePayment = validatePayments(payments);
    if (validatePayment) return validatePayment;

    for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        const price = parseFloat(item.priceApplied) || 0;
        if (!isValidDecimal(price) || price < 0) {
            return `Precio final no válido para el repuesto ${i + 1}.`;
        }
    }

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalItemsPrice = selectedItems.reduce((sum, item) => sum + (Number(item.priceApplied) || 0), 0);
    if (totalAmount > totalItemsPrice) return 'El total de los abonos no puede ser mayor al total de los repuestos.';

    // Si pasa todas las validaciones
    return null;
};

export const buildPutSalePayload = (state) => {
    const { data, context } = state;
    return {
        idCustomer: context.idCustomer,
        notes: data.notes || "",
        saveOrUpdatePayments: normalizePayments(data.payments),
        saveOrUpdateItems: normalizedItems(data.selectedItems),
        paymentsToDelete: data.paymentsToDelete,
        itemsToDelete: data.itemsToDelete
    };
};

export const buildPostSalePayload = (state) => {
    const { data, context } = state;

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || "",
        payments: normalizePayments(data.payments),
        sparePartItems: normalizedItems(data.selectedItems)
    };
};

const normalizedItems = (items) => {
    return items.map(i => ({
        idSparePart: i.idSparePart,
        priceApplied: Number(i.priceApplied) || 0,
        idSaleItem: i.idSaleItem || null
    }));
};
