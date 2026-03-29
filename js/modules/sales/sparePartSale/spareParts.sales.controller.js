// spareSale.controller.js
import { getSpareParts, getSparePartById, postSparePart, putSparePart } from './spareParts.sale.service.js';
import { createPagination } from '../../../pagination/pagination.controller.js';
import { showMessage, showElement, hideElement, disableElement, removeDisable, qsa, cleanOneShotParams, buildParams } from '../../../utils/dom.js';
import { resetSpareSaleState, spareSaleState } from './spareParts.sales.state.js';
import { initSpareSaleEvents } from './spareParts.sales.event.js';
import { createNoDataSelectedMessage, createRowTable, DOMRefs, insertSpareParts, loadCustomerName, loadDomData, loadNotes, renderTotals, resetSparePartsFilters } from './spareParts.sales.dom.js';
import { buildPostSalePayload, buildPutSalePayload, hydrateContextFromURL, validateSale, verifyIds } from './spareParts.sales.logic.js';
import { calculateTotals } from '../../../core/logic/calculate.totals.logic.js';
import { initSession } from '../../../utils/api.utils.js';
import { addNewPayment, initPaymentsController, onResetDomPayments } from '../../payments/payments.controller.js';
import { safeParseFloat } from '../../../utils/validators.js';

const pagination = createPagination({
    initialSize: spareSaleState.pagination.size,
    onChange: ({ page, size }) => {
        spareSaleState.pagination.page = page;
        spareSaleState.pagination.size = size;
        loadInventory();
    }
});

export const loadInventory = async () => {
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

        insertSpareParts(spareSaleState.list, DOMRefs.refs.tableBody, DOMRefs.refs.tableInventory, verifyIds, onAddSparePart);

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
};

const recalculateTotals = () => {
    const { total, due } = calculateTotals({
        items: spareSaleState.data.selectedItems,
        paid: spareSaleState.totals.totalPaid
    });

    spareSaleState.totals.total = total;
    spareSaleState.totals.due = due;

    renderTotals({ total, due, totalPaid: spareSaleState.totals.totalPaid }, DOMRefs.refs);
};

const pushSparePart = (sparePart) => {
    if (verifyIds(sparePart.idSparePart)) return null;
    const normalizedPart = {
        idSparePart: sparePart.idSpareParts || sparePart.idSparePart,
        name: sparePart.nameSpareParts || sparePart.sparePartName || sparePart.name,
        priceApplied: sparePart.suggestedPrice || sparePart.priceApplied,
        idSaleItem: sparePart.idSaleItem || null
    };
    spareSaleState.data.selectedItems.push(normalizedPart);
    return normalizedPart;
};

const onAddSparePart = (sparePart, tr) => {
    tr.remove();
    const partToAppend = pushSparePart(sparePart);
    if (partToAppend) {
        createRowTable(DOMRefs.refs.tBodySelected, partToAppend, onDeleteSparePart, onWritePrice);
        recalculateTotals();
    }
};

const onDeleteSparePart = (container, tr, id, idSaleItem) => {
    const index = spareSaleState.data.selectedItems.findIndex(item => String(item.idSparePart) === String(id));
    if (index !== -1) spareSaleState.data.selectedItems.splice(index, 1);
    tr.remove();
    recalculateTotals();
    if (idSaleItem) spareSaleState.data.itemsToDelete.push(idSaleItem);
    if (container.children.length === 0) {
        createNoDataSelectedMessage(container);
        onResetDomPayments();
    }
    pagination.update({});
};

const onSubmitSpareSale = async (e) => {
    e.preventDefault();
    const camps = qsa(".txtInputs, .btnPrimary, .btnTrash, .finalPrice, .btnAddItem, .btnEdit");
    const invalidate = validateSale();
    if (invalidate) {
        await showMessage("Error de validación", invalidate, 'warning');
        return;
    }

    let payload;
    if (spareSaleState.context.idSale) {
        payload = buildPutSalePayload(spareSaleState);
    } else {
        payload = buildPostSalePayload(spareSaleState);
    }

    showElement(DOMRefs.refs.loaderAddSale);
    camps.forEach(disableElement);
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
        }
        window.location.replace('sales.html');
    } catch (error) {
        console.error(error);
        showMessage(
            error.message || 'Error al procesar la venta',
            error,
            'error'
        );
    } finally {
        hideElement(DOMRefs.refs.loaderAddSale);
        camps.forEach(removeDisable);
    }
};

const onWritePrice = (price, id) => {
    const cleanValue = safeParseFloat(price.textContent) || 0;
    const item = spareSaleState.data.selectedItems.find(i => String(i.idSparePart) === String(id));
    if (item) item.priceApplied = cleanValue;
    recalculateTotals();
};

const onOrderPart = (e) => {
    e.preventDefault();
    saveSaleState();
    const params = buildParams({
        idCustomer: spareSaleState.context.idCustomer,
        customerName: spareSaleState.context.customerName,
        idSale: spareSaleState.context.idSale,
        sale: true
    });
    window.location.href = `sparePartsForm.html?${params.toString()}`;
};

const onSearchSparePart = (filters) => {
    spareSaleState.filters = {
        ...spareSaleState.filters,
        ...filters
    };
    spareSaleState.pagination.page = 1;
    loadInventory();
};

const saveSaleState = () => {
    const toSave = {
        data: spareSaleState.data,
        totals: spareSaleState.totals
    };
    localStorage.setItem(spareSaleState.saleKey, JSON.stringify(toSave));
};

const cleanWindow = () => {
    localStorage.removeItem(spareSaleState.saleKey);
    DOMRefs.refs.frmSparePartSale.reset();
};

const onSaveNotes = (e) => {
    spareSaleState.data.notes = e.target.value || '';
};

const loadOrderSparePart = () => {
    const newSparePart = {
        idSparePart: spareSaleState.context.newPartId,
        sparePartName: spareSaleState.context.newPartName,
        suggestedPrice: spareSaleState.context.suggestedPrice
    };
    const partToAppend = pushSparePart(newSparePart);
    if (partToAppend) {
        createRowTable(DOMRefs.refs.tBodySelected, partToAppend, onDeleteSparePart, onWritePrice);
        recalculateTotals();
    }
};

const existSavedData = () => {
    return localStorage.getItem(spareSaleState.saleKey) !== null;
};

const loadExistingSale = async (txtNotes, btnSaveSale) => {
    const sale = await getSparePartById(spareSaleState.context.idSale);

    spareSaleState.data.notes = sale.notes || '';
    loadDomData(txtNotes, btnSaveSale, spareSaleState.data.notes);
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
        };
        addNewPayment({ state: spareSaleState.data, totals: spareSaleState.totals, payment: paymentToAppend });
    });
    recalculateTotals();
};

const loadDraft = (txtNotes, btnSaveSale) => {
    const storageItem = localStorage.getItem(spareSaleState.saleKey);
    const draft = JSON.parse(storageItem);
    spareSaleState.data.notes = draft.data.notes || '';
    draft.data.itemsToDelete.forEach(id => spareSaleState.data.itemsToDelete.push(id));
    draft.data.paymentsToDelete.forEach(id => spareSaleState.data.paymentsToDelete.push(id));
    if (!spareSaleState.context.idSale) loadNotes(txtNotes, spareSaleState.data.notes);
    else loadDomData(txtNotes, btnSaveSale, spareSaleState.data.notes);
    const partsToAppend = [];
    draft.data.selectedItems.forEach(part => {
        partsToAppend.push(pushSparePart(part));
    });
    partsToAppend.forEach(part => {
        createRowTable(DOMRefs.refs.tBodySelected, part, onDeleteSparePart, onWritePrice);
    });
    draft.data.payments.forEach(payment => {
        addNewPayment({ state: spareSaleState.data, totals: spareSaleState.totals, payment });
    });
    spareSaleState.data.payments.forEach(payment => {
        addNewPayment({ state: spareSaleState.data, totals: spareSaleState.totals, payment });
    });
    recalculateTotals();
};

const setupApplication = async () => {
    resetSpareSaleState();
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    const hydrated = await hydrateContextFromURL(spareSaleState);
    if (!hydrated) return false;
    return true;
};

const initializeUI = async (Refs) => {
    resetSparePartsFilters(Refs.txtSearchData);
    loadCustomerName(Refs.customerName, spareSaleState.context.customerName);
    initSpareSaleEvents({ Refs, onSubmitSpareSale, onSearchSparePart, onOrderPart, onSaveNotes });
    await initPaymentsController({ totalCalculator: recalculateTotals, state: spareSaleState });
};

const loadDataFlow = async (Refs) => {
    if (spareSaleState.context.isNewPart) {
        if (existSavedData()) {
            loadDraft(Refs.txtNotes, Refs.btnSaveSale);
        }
        loadOrderSparePart();
        const paramsToClean = ["isNewPart", "sparePartId", "sparePartName", "suggestedPrice"];
        cleanOneShotParams(paramsToClean);
        localStorage.removeItem(spareSaleState.saleKey);
    } else {
        if (spareSaleState.context.idSale) {
            await loadExistingSale(Refs.txtNotes, Refs.btnSaveSale);
        }
        if (existSavedData()) localStorage.removeItem(spareSaleState.saleKey);
    }
    await loadInventory();
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const isReady = await setupApplication();
        if (!isReady) return;

        const refs = DOMRefs.init();

        await initializeUI(refs);

        await loadDataFlow(refs);
        console.log(spareSaleState);
    } catch (error) {
        console.error('Error inicializando la aplicación: ', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
