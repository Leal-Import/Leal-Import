// spareSale.controller.js
import { getSpareParts, getSparePartById, postSparePart, putSparePart, patchSparePart } from './spareParts.sale.service.js';
import { createPagination } from '../../../pagination/pagination.controller.js';
import { showMessage, showElement, hideElement, disableElement, removeDisable, qsa, cleanOneShotParams, buildParams, existsById, createModuleInitializer, applyPrivilegesToUI } from '../../../utils/dom.js';
import { DraftManager } from '../../../utils/draft.manager.js';
import { resetSpareSalesFormState, spareSalesFormState } from "./spareParts.sales.state.js";
import { initSpareSaleEvents } from './spareParts.sales.event.js';
import { createNoDataSelectedMessage, createRowTable, DOMRefs, insertSpareParts, insertViewParts, loadCustomerName, loadDomData, loadNotes, renderTotals, resetSparePartsFilters } from './spareParts.sales.dom.js';
import { buildPostSalePayload, buildPutSalePayload, hydrateContextFromURL, validateSale } from './spareParts.sales.logic.js';
import { calculateTotals } from '../../../core/logic/calculate.totals.logic.js';
import { addNewPayment, initPaymentsController, onResetDomPayments } from '../../payments/payments.controller.js';
import { safeParseFloat } from '../../../utils/validators.js';
import { handleApiError } from '../../../utils/api.utils.js';
import { navigateTo, replaceTo, ROUTES } from '../../../utils/router.js';
import { createBtnUrl } from '../../picsAmounts/picAmounts.dom.js';
import { initializeModalListeners } from '../../picsAmounts/picsAmount.controller.js';
import { initCancelSale, saleCancelledUIUpdate } from '../../cancelSale/cancelSale.controller.js';
import { generateSparePartsSaleReport } from './spareParts.sale.report.js';

// Centralizar manejo de borradores con DraftManager
const saleStateDraft = new DraftManager(spareSalesFormState.saleKey, {
    data: {},
    totals: {}
});

const pagination = createPagination({
    initialSize: spareSalesFormState.pagination.size,
    onChange: ({ page, size }) => {
        spareSalesFormState.pagination.page = page;
        spareSalesFormState.pagination.size = size;
        loadInventory();
    }
});

export const loadInventory = async () => {
    try {
        showElement(DOMRefs.refs.loaderSpareParts);
        const { page, size } = spareSalesFormState.pagination;
        const { search } = spareSalesFormState.filters;

        const data = await getSpareParts(
            page - 1,
            size,
            search || ''
        );

        spareSalesFormState.list = data.content;
        spareSalesFormState.pagination.total = data.page.totalElements;
        spareSalesFormState.pagination.totalPages = data.page.totalPages;

        insertSpareParts(spareSalesFormState.list, DOMRefs.refs.tableBody, DOMRefs.refs.tableInventory, existsById, onAddSparePart, spareSalesFormState);

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });

    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los repuestos');
    } finally {
        hideElement(DOMRefs.refs.loaderSpareParts);
    }
};

const recalculateTotals = () => {
    const { total, due } = calculateTotals({
        items: spareSalesFormState.data.selectedItems,
        paid: spareSalesFormState.totals.totalPaid
    });

    spareSalesFormState.totals.total = total;
    spareSalesFormState.totals.due = due;

    renderTotals({ total, due, totalPaid: spareSalesFormState.totals.totalPaid }, DOMRefs.refs);
};

const pushSparePart = (sparePart) => {
    if (existsById(spareSalesFormState.data.selectedItems, sparePart.idSparePart, "idSparePart")) return null;
    const normalizedPart = {
        idSparePart: sparePart.idSpareParts || sparePart.idSparePart,
        name: sparePart.nameSpareParts || sparePart.nameSparePart || sparePart.sparePartName || sparePart.name,
        priceApplied: sparePart.suggestedPrice || sparePart.priceApplied,
        idSparePartsSaleItems: sparePart.idSparePartsSaleItems || null
    };
    spareSalesFormState.data.selectedItems.push(normalizedPart);
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
    const index = spareSalesFormState.data.selectedItems.findIndex(item => String(item.idSparePart) === String(id));
    if (index !== -1) spareSalesFormState.data.selectedItems.splice(index, 1);
    tr.remove();
    recalculateTotals();
    if (idSaleItem) spareSalesFormState.data.itemsToDelete.push(idSaleItem);
    if (container.children.length === 0) {
        createNoDataSelectedMessage(container);
        onResetDomPayments();
    }
    pagination.update({});
};

const onSubmitSpareSale = async (e) => {
    e.preventDefault();
    const camps = qsa(".txtInputs, .btnPrimary, .btnTrash, .finalPrice, .btnAddItem, .btnEdit");
    const invalidate = validateSale(spareSalesFormState);
    if (invalidate) {
        await showMessage("Error de validación", invalidate, 'warning');
        return;
    }

    let payload;
    if (spareSalesFormState.context.idSale) {
        payload = buildPutSalePayload(spareSalesFormState);
    } else {
        payload = buildPostSalePayload(spareSalesFormState);
    }

    showElement(DOMRefs.refs.loaderAddSale);
    camps.forEach(disableElement);
    try {
        let response;
        if (spareSalesFormState.context.idSale) {
            response = await putSparePart(payload, spareSalesFormState.context.idSale);
            await showMessage('Venta actualizada con éxito', 'Éxito', 'success');
        } else {
            response = await postSparePart(payload);
            await showMessage('Venta registrada con éxito', 'Éxito', 'success');
        }
        if (response) {
            saleStateDraft.clear();
        }
        replaceTo(ROUTES.SALES);
    } catch (error) {
        await handleApiError(error, 'No se pudo guardar la venta. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.loaderAddSale);
        camps.forEach(removeDisable);
    }
};

const onWritePrice = (price, id) => {
    const cleanValue = safeParseFloat(price.textContent) || 0;
    const item = spareSalesFormState.data.selectedItems.find(i => String(i.idSparePart) === String(id));
    if (item) item.priceApplied = cleanValue;
    recalculateTotals();
};

const onOrderPart = (e) => {
    e.preventDefault();
    saleStateDraft.save({
        data: spareSalesFormState.data,
        totals: spareSalesFormState.totals
    });
    const params = buildParams({
        idCustomer: spareSalesFormState.context.idCustomer,
        customerName: spareSalesFormState.context.customerName,
        idSale: spareSalesFormState.context.idSale,
        sale: true
    });
    navigateTo(ROUTES.SPARE_PART_FORM, Object.fromEntries(params.entries()));
};

const onSearchSparePart = (filters) => {
    spareSalesFormState.filters = {
        ...spareSalesFormState.filters,
        ...filters
    };
    spareSalesFormState.pagination.page = 1;
    loadInventory();
};

const onSaveNotes = (e) => {
    spareSalesFormState.data.notes = e.target.value || '';
};

const loadOrderSparePart = () => {
    const newSparePart = {
        idSparePart: spareSalesFormState.context.newPartId,
        sparePartName: spareSalesFormState.context.newPartName,
        suggestedPrice: spareSalesFormState.context.suggestedPrice
    };
    const partToAppend = pushSparePart(newSparePart);
    if (partToAppend) {
        createRowTable(DOMRefs.refs.tBodySelected, partToAppend, onDeleteSparePart, onWritePrice);
        recalculateTotals();
    }
};

const loadExistingSale = async (txtNotes, btnSaveSale) => {
    const sale = await getSparePartById(spareSalesFormState.context.idSale);
    if (sale.statusSaleName === "Cancelada") {
        saleCancelledUIUpdate();
    }
    spareSalesFormState.data.notes = sale.notes || '';
    loadDomData(txtNotes, btnSaveSale, spareSalesFormState.data.notes);
    const partsToAppend = [];
    sale.sparePartsSaleItems.forEach(part => {
        partsToAppend.push(pushSparePart(part));
    });
    if (spareSalesFormState.context.isView) {
        showElement(DOMRefs.refs.tableViewContainer);
        hideElement(DOMRefs.refs.tableNewSpareParts);
        partsToAppend.forEach(part => {
            insertViewParts(DOMRefs.refs.tBodyPartView, part);
        });
        hideElement(DOMRefs.refs.loaderSpareParts);
    } else {
        partsToAppend.forEach(part => {
            createRowTable(DOMRefs.refs.tBodySelected, part, onDeleteSparePart, onWritePrice);
        });
    }
    sale.sparePartsPayments.forEach(payment => {
        addNewPayment({ state: spareSalesFormState.data, totals: spareSalesFormState.totals, payment });
    });
    recalculateTotals();

    DOMRefs.refs.btnGeneratePdf.addEventListener('click', () => { generateSparePartsSaleReport(sale); });
};

/**
 * Carga datos de borrador guardados en localStorage
 * Restaura items, pagos, notas y totales
 */
const loadDraftData = (txtNotes, btnSaveSale) => {
    const draft = saleStateDraft.load();
    if (!draft.data || Object.keys(draft.data).length === 0) return;

    spareSalesFormState.data.notes = draft.data.notes || '';
    (draft.data.itemsToDelete || []).forEach(id => spareSalesFormState.data.itemsToDelete.push(id));
    (draft.data.paymentsToDelete || []).forEach(id => spareSalesFormState.data.paymentsToDelete.push(id));
    if (!spareSalesFormState.context.idSale) loadNotes(txtNotes, spareSalesFormState.data.notes);
    else loadDomData(txtNotes, btnSaveSale, spareSalesFormState.data.notes);

    const partsToAppend = [];
    (draft.data.selectedItems || []).forEach(part => {
        partsToAppend.push(pushSparePart(part));
    });
    partsToAppend.forEach(part => {
        createRowTable(DOMRefs.refs.tBodySelected, part, onDeleteSparePart, onWritePrice);
    });

    (draft.data.payments || []).forEach(payment => {
        addNewPayment({ state: spareSalesFormState.data, totals: spareSalesFormState.totals, payment });
    });

    spareSalesFormState.data.payments.forEach(payment => {
        addNewPayment({ state: spareSalesFormState.data, totals: spareSalesFormState.totals, payment });
    });

    if (draft.totals) {
        spareSalesFormState.totals = { ...spareSalesFormState.totals, ...draft.totals };
    }

    recalculateTotals();
};

const initializeUI = async (Refs) => {
    resetSparePartsFilters(Refs.txtSearchData);
    loadCustomerName(Refs.customerName, spareSalesFormState.context.customerName);
    initSpareSaleEvents({ Refs, onSubmitSpareSale, onSearchSparePart, onOrderPart, onSaveNotes });
    if (spareSalesFormState.context.idSale) {
        initCancelSale(spareSalesFormState.context.idSale, patchSparePart, ROUTES.SALES, "venta de repuestos");
        applyPrivilegesToUI();
        hideElement(DOMRefs.refs.divSpace);
    }
    if (spareSalesFormState.context.isView) {
        hideElement(DOMRefs.refs.paginationContainer);
        hideElement(DOMRefs.refs.filterSection);
        hideElement(DOMRefs.refs.paymentForm);
        hideElement(DOMRefs.refs.headerPanel);
        hideElement(DOMRefs.refs.tableContainerSelected);
        hideElement(DOMRefs.refs.btnSaveSale);
        showElement(DOMRefs.refs.btnGeneratePdf);
        disableElement(DOMRefs.refs.txtNotes);
    }
    initializeModalListeners(spareSalesFormState, spareSalesFormState.context.isView);
    await initPaymentsController({ totalCalculator: recalculateTotals, state: spareSalesFormState, createReceiptBtn: createBtnUrl, isView: spareSalesFormState.context.isView });
};

const loadDataFlow = async (Refs) => {
    if (spareSalesFormState.context.isNewPart) {
        if (saleStateDraft.exists()) {
            loadDraftData(Refs.txtNotes, Refs.btnSaveSale);
        }
        loadOrderSparePart();
        const paramsToClean = ["isNewPart", "sparePartId", "sparePartName", "suggestedPrice"];
        cleanOneShotParams(paramsToClean);
        saleStateDraft.clear();
    } else {
        if (spareSalesFormState.context.idSale) {
            await loadExistingSale(Refs.txtNotes, Refs.btnSaveSale);
        }
        if (saleStateDraft.exists()) saleStateDraft.clear();
    }
    if (!spareSalesFormState.context.isView) {
        await loadInventory();
    }
};

const init = createModuleInitializer({
    resetState: async () => {
        resetSpareSalesFormState();
        const hydrated = await hydrateContextFromURL(spareSalesFormState);
        if (!hydrated) throw new Error('Failed to hydrate context');
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener("DOMContentLoaded", init);
