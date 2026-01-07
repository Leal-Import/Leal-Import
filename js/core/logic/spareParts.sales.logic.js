import { asBoolean, asNumber, asUUID, showMessage } from "../../utils/dom.js";
import { spareSaleState } from "../state/spareParts.sales.state.js";

export let verifyIds = (idSparePart) => {
    return spareSaleState.data.selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
}

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
    state.saleKey = `spareSaleState_customer_${idCustomer}_${state.context.idSale ?? "NewSale"}`;

    return true;
};




export function validateSale() {
    const { data: { selectedItems, payments, notes }, context, idEmployee } = spareSaleState;

    // Validar cliente
    if (!context.idCustomer) {
        return 'No se ha seleccionado ningún cliente.';
    }

    if (!idEmployee) {
        return 'Empleado no identificado. Inicie sesión nuevamente.';
    }

    // Validar abonos
    if (!payments || payments.length === 0) {
        return 'Por favor, ingrese al menos un abono.';
    }

    for (let i = 0; i < payments.length; i++) {
        const item = payments[i];
        const amount = parseFloat(item.amount) || 0;
        if (amount <= 0) {
            return `Monto no válido para el abono ${i + 1}.`;
        }
        if (!item.idPaymentMethod) {
            return `Falta seleccionar un método de pago para el abono ${i + 1}.`;
        }
    }

    // Validar repuestos
    if (!selectedItems || selectedItems.length === 0) {
        return 'Por favor, seleccione al menos un repuesto.';
    }

    for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        const price = parseFloat(item.priceApplied) || 0;
        if (price <= 0) {
            return `Total inválido para el repuesto ${i + 1}.`;
        }
    }

    // Si pasa todas las validaciones
    return null;
}


export function buildPutSalePayload(state) {
    const { data, context, idEmployee } = state;

    const payments = data.payments.map(p => ({
        amount: Number(p.amount) || 0,
        idPaymentMethod: p.idPaymentMethod,
        idPayment: p.idPayment ?? null,
        idEmployee
    }));

    const items = data.selectedItems.map(i => ({
        idSparePart: i.idSparePart,
        priceApplied: Number(i.priceApplied) || 0,
        idSaleItem: i.idSaleItem ?? null
    }));

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || "",
        idEmployee,
        saveOrUpdatePayments: payments,
        saveOrUpdateItems: items,
        paymentsToDelete: data.paymentsToDelete,
        itemsToDelete: data.itemsToDelete
    };
}

export function buildPostSalePayload(state) {
    const { data, context, idEmployee } = state;

    return {
        idCustomer: context.idCustomer,
        notes: data.notes || "",
        idEmployee,
        payments: data.payments.map(p => ({
            amount: Number(p.amount) || 0,
            idPaymentMethod: p.idPaymentMethod,
            idPayment: null,
            idEmployee
        })),
        sparePartItems: data.selectedItems.map(i => ({
            idSparePart: i.idSparePart,
            priceApplied: Number(i.priceApplied) || 0,
            idSaleItem: null
        }))
    };
}
