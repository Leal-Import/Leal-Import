// spareSale.controller.js
import {
    getSpareParts,
    getSparePartById,
    postSparePart,
    putSparePart
} from '../../../service/spareParts.sale.service.js';

import { createPagination } from '../../../pagination/pagination.controller.js'

import {
    showMessage,
    $,
    showElement,
    hideElement
} from '../../../utils/dom.js';
import { spareSaleState } from '../../../core/state/spareParts.sales.state.js';
import { initSpareSaleEvents } from '../event/spareParts.sales.event.js';
import { cleanPaymentCamps, createNoDataSelectedMessage, createRowTable, DOMRefs, insertSpareParts, loadBtnOrder, loadCustomerName, loadDomData, loadNotes, renderTotals } from '../../../core/dom/spareParts.sales.dom.js';
import { buildPostSalePayload, buildPutSalePayload, hydrateContextFromURL, validateSale, verifyIds } from '../../../core/logic/spareParts.sales.logic.js';
import { calculateTotals } from '../../../core/logic/calculate.totals.logic.js';
import { getCurrentEmployeeId, initSession, safeParseFloat } from '../../../utils.js';
import { addNewPayment, initPaymentsController } from '../../payments/payments.controller.js';
import { validatePayment } from '../../../utils/validators.js';

const pagination = createPagination({
    initialSize: spareSaleState.pagination.size,
    onChange: ({ page, size }) => {
        spareSaleState.pagination.page = page;
        spareSaleState.pagination.size = size;
        loadInventory();
    }
})

export async function loadInventory() {
    try {
        showElement(DOMRefs.refs.loaderSpareParts);
        const { page, size } = spareSaleState.pagination;
        const { search } = spareSaleState.filters;

        const data = await getSpareParts(
            page - 1,
            size,
            search || ''
        );

        spareSaleState.list = data.content;
        spareSaleState.pagination.total = data.page.totalElements;
        spareSaleState.pagination.totalPages = data.page.totalPages;

        insertSpareParts(spareSaleState.list, DOMRefs.refs.tableBody, verifyIds, onAddSparePart)

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });

    } catch (error) {
        showMessage('Error', 'Error al cargar la lista de repuestos', 'error');
        console.error('Error cargando repuestos:', error);
    } finally {
        hideElement(DOMRefs.refs.loaderSpareParts);
    }
}

let recalculateTotals = () => {
    const { total, due } = calculateTotals({
        items: spareSaleState.data.selectedItems,
        paid: spareSaleState.totals.totalPaid
    });

    spareSaleState.totals.total = total;
    spareSaleState.totals.due = due;

    renderTotals({ total, due, totalPaid: spareSaleState.totals.totalPaid });
}

let pushSparePart = (sparePart) => {
    if (verifyIds(sparePart.idSparePart)) return null;
    const normalizedPart = {
        idSparePart: sparePart.idSpareParts || sparePart.idSparePart,
        name: sparePart.nameSpareParts || sparePart.sparePartName,
        priceApplied: sparePart.suggestedPrice || sparePart.priceApplied,
        idSaleItem: sparePart.idSaleItem || null,
    }
    spareSaleState.data.selectedItems.push(normalizedPart);
    return normalizedPart;
}

let onAddSparePart = (sparePart, tr) => {
    tr.remove();
    const partToAppend = pushSparePart(sparePart);
    if (partToAppend) {
        createRowTable(DOMRefs.refs.tBodySelected, partToAppend, onDeleteSparePart, onWritePrice);
        recalculateTotals();
        saveSaleState();
    }
}

let onDeleteSparePart = (container, tr, id, idSaleItem) => {
    const index = spareSaleState.data.selectedItems.findIndex(item => String(item.idSparePart) === String(id));
    if (index !== -1) spareSaleState.data.selectedItems.splice(index, 1);
    tr.remove();
    recalculateTotals();
    saveSaleState();
    if (idSaleItem) spareSaleState.data.itemsToDelete.push(idSaleItem);
    if (container.children.length === 0) {
        createNoDataSelectedMessage(container);
    }
    pagination.update({});
}

async function onSubmitSpareSale(e) {
    e.preventDefault();
    const error = validateSale();
    if (error) {
        await showMessage("Error de validación", error, 'warning');
        return;
    }

    let payload;
    if (spareSaleState.context.idSale) {
        payload = buildPutSalePayload(spareSaleState);
    } else {
        payload = buildPostSalePayload(spareSaleState);
    }

    try {
        let response;
        if (spareSaleState.context.idSale) {
            response = await putSparePart(payload, spareSaleState.context.idSale);
            await showMessage('Venta actualizada con éxito', 'Éxito', 'success');
        } else {
            response = await postSparePart(payload);
            await showMessage('Venta registrada con éxito', 'Éxito', 'success');
        }
        if (response) {
            cleanWindow();
            const cleanUrl = window.location.pathname;
            history.replaceState({}, "", cleanUrl);
        }
        window.location.href = 'sales.html';
    } catch (error) {
        console.error(error);
        showMessage(
            error.message || 'Error al procesar la venta',
            error,
            'error'
        );
    }
}
const onAddPayment = () => {
    const amount = $('txtAmount').value.trim();
    const method = $('paymentMethod').value;
    const errorMsg = validatePayment(safeParseFloat(amount), method);
    if (errorMsg) {
        showMessage('Error de validación', errorMsg, 'warning');
        return;
    }
    const payment = {
        amount: safeParseFloat(amount) || 0,
        idPaymentMethod: method || null
    }
    addNewPayment({
        state: spareSaleState.data,
        totals: spareSaleState.totals,
        payment
    });
    cleanPaymentCamps();
};

let onWritePrice = (price, id) => {
    const cleanValue = safeParseFloat(price.textContent) || 0;
    const item = spareSaleState.data.selectedItems.find(i => String(i.idSparePart) === String(id));
    if (item) item.priceApplied = cleanValue;
    recalculateTotals();
    saveSaleState();
}

let onOrderClick = (e) => {
    e.preventDefault();
    saveSaleState();
    loadBtnOrder(spareSaleState.context.idCustomer, spareSaleState.context.customerName, spareSaleState.context.idSale || "")
}

let onSearchSparePart = (filters) => {
    spareSaleState.filters = {
        ...spareSaleState.filters,
        ...filters
    };
    spareSaleState.pagination.page = 1;
    loadInventory();
}


let saveSaleState = () => {
    const toSave = {
        data: spareSaleState.data,
        totals: spareSaleState.totals
    };
    localStorage.setItem(spareSaleState.saleKey, JSON.stringify(toSave));
}

let cleanWindow = () => {
    localStorage.removeItem(spareSaleState.saleKey);
    $("frmSparePartSale").reset();
}

let onSaveNotes = (e) => {
    spareSaleState.data.notes = e.target.value || '';
    saveSaleState();
}

let loadOrderSparePart = () => {
    const newSparePart = {
        idSparePart: spareSaleState.context.newPartId,
        sparePartName: spareSaleState.context.newPartName,
        suggestedPrice: spareSaleState.context.suggestedPrice,
    }
    const partToAppend = pushSparePart(newSparePart);
    if (partToAppend) {
        createRowTable(DOMRefs.refs.tBodySelected, partToAppend, onDeleteSparePart, onWritePrice);
        recalculateTotals();
        saveSaleState();
    }
}

let existSavedData = () => {
    return localStorage.getItem(spareSaleState.saleKey) !== null;
}

async function loadExistingSale() {
    const sale = await getSparePartById(spareSaleState.context.idSale);

    spareSaleState.data.notes = sale.notes || '';
    loadDomData(spareSaleState.data.notes);
    const partsToAppend = [];
    sale.sparePartItems.forEach(part => {
        partsToAppend.push(pushSparePart(part));
    });
    partsToAppend.forEach(part => {
        createRowTable(DOMRefs.refs.tBodySelected, part, onDeleteSparePart, onWritePrice);
    });
    sale.payments.forEach(payment => {
        const paymentToAppend = {
            amount: payment.amount,
            idPaymentMethod: payment.idPaymentMethod,
            paymentURL: payment.paymentURL,
            idPayment: payment.idPayment
        }
        addNewPayment({ state: spareSaleState.data, totals: spareSaleState.totals, payment: paymentToAppend });
    })
    saveSaleState();
    recalculateTotals();
}

let loadDraft = () => {
    const item = localStorage.getItem(spareSaleState.saleKey);
    const storageItem = JSON.parse(item);
    spareSaleState.data = storageItem.data;
    spareSaleState.totals = storageItem.totals;
    loadNotes(spareSaleState.data.notes);
    spareSaleState.data.selectedItems.forEach(part => {
        createRowTable(DOMRefs.refs.tBodySelected, part, onDeleteSparePart, onWritePrice);
    });
    spareSaleState.data.payments.forEach(payment => {
        addNewPayment({ state: spareSaleState.data, totals: spareSaleState.totals, payment });
    })
    recalculateTotals();
    saveSaleState();
}

let cleanOneShotParams = () => {
    const url = new URL(window.location.href);

    // parámetros de acción (one-shot)
    const oneShotParams = [
        "isNewPart",
        "sparePartId",
        "sparePartName",
        "suggestedPrice"
    ];

    oneShotParams.forEach(p => url.searchParams.delete(p));

    window.history.replaceState({}, document.title, url.toString());
};


const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;
    
    spareSaleState.idEmployee = getCurrentEmployeeId();
    const hydrated = await hydrateContextFromURL(spareSaleState);
    if (!hydrated) return false;
    return true;
};

const initializeUI = async () => {
    loadCustomerName(spareSaleState.context.customerName);
    initSpareSaleEvents({ onSubmitSpareSale, onAddPayment, onSearchSparePart, onOrderClick, onSaveNotes });
    await initPaymentsController({ totalCalculator: recalculateTotals, onStateChange: saveSaleState })
};

const loadDataFlow = async () => {
    if (spareSaleState.context.idSale) {
        await loadExistingSale();
    } else if (existSavedData()) {
        loadDraft();
    }
    
    // 2. Agregar nuevo repuesto SOLO después
    if (spareSaleState.context.isNewPart) {
        loadOrderSparePart();
        cleanOneShotParams();
    }
    await loadInventory();
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        DOMRefs.init();

        await initializeUI();

        await loadDataFlow();
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});