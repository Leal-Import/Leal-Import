import { spareSaleState } from "../state/spareParts.sales.state.js";

export let verifyIds = (idSparePart) => {
    return spareSaleState.data.selectedItems.some(item => String(item.idSparePart) === String(idSparePart));
}

export let calculateTotals = ({ items = [], paid = 0 }) => {
    let total = 0;
    items.forEach(item => {
        const value = Number(item.priceApplied) || 0;
        total += value;
    });

    const due = total - paid;

    return {
        total,
        due
    };
}


export function validateSale() {
    const { data: { selectedItems, payments, notes }, context, idEmployee } = spareSaleState;

    // Validar cliente
    if (!context.idCustomer) {
        return 'No se ha seleccionado ningún cliente.';
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


export function buildSalePayload(state) {
    const { data: { selectedItems, payments, itemsToDelete, paymentsToDelete, notes }, context, idEmployee } = state;

    // Preparar abonos
    const amountData = payments.map(item => ({
        amount: parseFloat(item.amount) || 0,
        idPaymentMethod: item.idPaymentMethod,
        idPayment: item.idPayment || null,
        idEmployee: idEmployee
    }));

    // Preparar repuestos
    const sparePartItems = selectedItems.map(item => ({
        idSparePart: item.idSparePart,
        priceApplied: parseFloat(item.priceApplied) || 0,
        idSaleItem: item.idSaleItem || null
    }));

    const payload = {
        idCustomer: context.idCustomer,
        notes: notes || "",
        payments: amountData,
        idEmployee,
        sparePartItems
    };

    // Si es actualización de venta existente
    if (context.idSale) {
        payload.itemsToDelete = itemsToDelete;
        payload.paymentsToDelete = paymentsToDelete;
        payload.saveOrUpdateItems = sparePartItems;
        payload.saveOrUpdatePayments = amountData;
        delete payload.sparePartItems;
        delete payload.payments;
    }

    return payload;
}
