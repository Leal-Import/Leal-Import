import { appendToDom, cleanRow, initStaticRows, loadExtraInputs, loadViewSaleInfo, loadViewUpdateOrder, reindexTable, renderImportButton, renderOrderTotal, renderServiceSuggestions, renderSparePartSuggestions, renderTotalRepairCost, renderTotals, renderTotalServices, renderTotalsPanel, renderTotalSpareParts } from "../../../core/dom/workOrder.details.dom.js";
import { workOrderDetailsState } from "../../../core/state/workOrder.details.state.js";
import { getDataVehicleById, getServices, getSpareParts, getWorkOrderById, postWorkOrder, putWorkOrder } from "../../../service/workOrder.detail.service.js";
import { safeParseFloat, validateDate } from "../../../utils/validators.js";
import { $, hideElement, showMessage } from "../../../utils/dom.js";
import { initializeModalListeners } from "../../picsAmounts/controller/picsAmount.controller.js";
import { initWorkOrdersEvents } from "../event/workOrder.details.event.js";
import { pushService, pushSparePart, hydrateContextFromURL, calculateWorkOrderTotals, validatePutOrder, validatePostOrder, buildPostWorkOrderFormData, buildPutWorkOrderFormData, cleanWindow } from "../../../core/logic/workOrder.details.logic.js";
import { addNewPayment, initPaymentsController } from "../../payments/payments.controller.js";
import { createBtnUrl } from "../../../core/dom/picAmounts.dom.js";
import { calculateTotals } from "../../../core/logic/calculate.totals.logic.js";
import { renderVehicleData } from "../../../core/dom/payments.dom.js";
import { getCurrentEmployeeId, initSession } from "../../../utils.js";

const dtEstimated = $("dtEstimated");
const boxServ = $("suggestionsService");
const boxSparePart = $("suggestionsSpareParts");
const tBodySpareParts = $("tBodySpareParts");
const tBodyServices = $("tBodyServices");
const txtAddSparePart = $("txtSearchSparePart");
const txtAddService = $("txtAddService");

const existSavedData = () => localStorage.getItem(workOrderDetailsState.saleKey) !== null;

const addNewPartToTable = () => {
    if (!workOrderDetailsState.context.idNewPart || !workOrderDetailsState.context.newPartName) return;
    const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, {
        idSparePart: workOrderDetailsState.context.idNewPart,
        sparePartName: workOrderDetailsState.context.newPartName,
        priceApplied: workOrderDetailsState.context.newPartSuggestedPrice
    });
    const isAppend = appendToDom({
        tBody: tBodySpareParts,
        data: normalizedPart,
        arraySelected: workOrderDetailsState.data.selectedSpareParts,
        arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
        onWritePrice,
        onDelete,
        renderButton: renderImportButton
    });
}

const onWritePrice = (e, data) => {
    const value = safeParseFloat(e.target.textContent);
    // actualizar el objeto (referencia directa)
    data.priceApplied = value;
    calculateAllTotals();
};

const onAddService = (service) => {
    const normalizedService = pushService(workOrderDetailsState.data.selectedServices, service);
    const isAppend = appendToDom({
        tBody: tBodyServices,
        data: normalizedService,
        arraySelected: workOrderDetailsState.data.selectedServices,
        arrayDelete: workOrderDetailsState.data.servicesToDelete,
        onWritePrice,
        onDelete
    });

    txtAddService.value = '';
    reindexTable(tBodyServices);
    hideElement(boxServ);
    const { servicesTotal, total, due, totalPaid, orderTotal } = calculateWorkOrderTotals({ services: workOrderDetailsState.data.selectedServices, spareParts: workOrderDetailsState.data.selectedSpareParts, payments: workOrderDetailsState.data.payments });
    renderTotalServices(servicesTotal);
    renderTotalRepairCost(total);
    renderTotalsPanel({ due, totalPaid, total });
    renderOrderTotal(orderTotal)
}

const onAddSparePart = (sparePart) => {
    const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, sparePart);
    const isAppend = appendToDom({
        tBody: tBodySpareParts,
        data: normalizedPart,
        arraySelected: workOrderDetailsState.data.selectedSpareParts,
        arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
        onWritePrice,
        onDelete,
        renderButton: renderImportButton
    })

    txtAddSparePart.value = '';
    reindexTable(tBodySpareParts);
    hideElement(boxSparePart);
    renderImportButton(tBodySpareParts, onImportSparePart);
    const { sparePartsTotal, total, due, totalPaid, orderTotal } = calculateWorkOrderTotals({ spareParts: workOrderDetailsState.data.selectedSpareParts, services: workOrderDetailsState.data.selectedServices, payments: workOrderDetailsState.data.payments });
    renderTotalSpareParts(sparePartsTotal);
    renderTotalRepairCost(total);
    renderTotalsPanel({ due, totalPaid, total });
    renderOrderTotal(orderTotal)
}

const onDelete = (item, arraySelected, arrayDelete, row, tBody, renderButton) => {
    const index = arraySelected.indexOf(item);
    if (index !== -1) {
        arraySelected.splice(index, 1);
    }


    if (item.idWorkOrderService || item.idWorkOrderSpareParts) {
        arrayDelete.push(item.idWorkOrderService || item.idWorkOrderSpareParts);
    }
    cleanRow(row);
    calculateAllTotals();
    reindexTable(tBody)
    renderButton?.(tBodySpareParts, onImportSparePart);
}


const onSearchService = (e) => {
    onSearch(e, getServices, renderServiceSuggestions, boxServ, onAddService, workOrderDetailsState.data.selectedServices);
}

const onSearchSpareParts = (e) => {
    onSearch(e, getSpareParts, renderSparePartSuggestions, boxSparePart, onAddSparePart, workOrderDetailsState.data.selectedSpareParts);
}

const onAddPayment = (payment = null) => {
    addNewPayment({ state: workOrderDetailsState.data, totals: workOrderDetailsState.totals, payment });
}

const onSubmitOrder = async (e) => {
    e.preventDefault();
    let fd;
    if (workOrderDetailsState.context.idWorkOrder) {
        const errorPut = validatePutOrder(workOrderDetailsState.data, workOrderDetailsState.context.idVehicle);
        if (errorPut) {
            showMessage('Error de validación', errorPut, 'warning');
            return;
        }
        fd = buildPutWorkOrderFormData(workOrderDetailsState);
    } else {
        const errorPost = validatePostOrder(workOrderDetailsState.data, workOrderDetailsState.context.idVehicle, workOrderDetailsState.context.idCustomer);
        if (errorPost) {
            showMessage('Error de validación', errorPost, 'warning');
            return;
        }
        fd = buildPostWorkOrderFormData(workOrderDetailsState);
    }

    try {
        let response;
        if (workOrderDetailsState.context.idWorkOrder) {
            response = await putWorkOrder(fd, workOrderDetailsState.context.idWorkOrder);
            await showMessage('Orden actualizada', 'Éxito', 'success');
        } else {
            response = await postWorkOrder(fd, workOrderDetailsState.context.idVehicle, workOrderDetailsState.context.idSale);
            await showMessage('Orden registrada', 'Éxito', 'success');
        }

        if (response) {
            cleanWindow();
            const cleanUrl = window.location.pathname;
            history.replaceState({}, "", cleanUrl);
        }
        if (workOrderDetailsState.context.idSale) {
            window.location.href = 'sales.html';
        } else {
            window.location.href = 'workOrders.html';
        }
    } catch (error) {
        console.error(error);
        showMessage('Error al procesar venta', error, 'error');
    }
}

const onSaveNotes = (e) => {
    const value = e.target.value.trim() || '';
    workOrderDetailsState.data.notes = value;
}

const onSaveDate = (e) => {
    const value = e.target.value || null;
    workOrderDetailsState.data.estimatedDate = value;
};

const loadDataVehicle = async () => {
    try {
        const vehicle = await getDataVehicleById(workOrderDetailsState.context.idVehicle);
        if (workOrderDetailsState.context.idSale) {
            loadViewSaleInfo(vehicle.vin);
        } else if (workOrderDetailsState.context.idWorkOrder) {
            loadViewUpdateOrder(vehicle.vin);
        }
        renderVehicleData(vehicle);
    } catch (error) {
        showMessage("Error", "No se pudieron cargar los datos del vehiculo", "error");
        console.log(error)
    }
}

const onImportSparePart = () => {
    saveWorkOrderState();
    const params = new URLSearchParams({
        workOrder: true,
        idWorkOrder: workOrderDetailsState.context.idWorkOrder,
        idSale: workOrderDetailsState.context.idSale,
        customerName: workOrderDetailsState.context.customerName,
        idVehicle: workOrderDetailsState.context.idVehicle,
        idCustomer: workOrderDetailsState.context.idCustomer,
        totalPrice: workOrderDetailsState.context.vehiclePrice
    })
    window.location.href = `../../pages/sparePartsDetails.html?${params.toString()}`;
}

const saveWorkOrderState = () => {
    localStorage.setItem(workOrderDetailsState.saleKey, JSON.stringify({
        data: workOrderDetailsState.data,
        totals: workOrderDetailsState.totals
    }));
}

const recalculateTotalsPanel = () => {
    const items = [
        ...workOrderDetailsState.data.selectedServices,
        ...workOrderDetailsState.data.selectedSpareParts
    ];
    const { total, due } = calculateTotals({
        items,
        paid: workOrderDetailsState.totals.totalPaid
    });
    workOrderDetailsState.totals.total = total;
    workOrderDetailsState.totals.due = due;
    renderTotalsPanel({ total, due, totalPaid: workOrderDetailsState.totals.totalPaid });
};

const calculateAllTotals = () => {
    const totals = calculateWorkOrderTotals({
        services: workOrderDetailsState.data.selectedServices,
        spareParts: workOrderDetailsState.data.selectedSpareParts,
        payments: workOrderDetailsState.data.payments
    });
    renderTotals(totals);
};

let loadDraft = () => {
    const item = localStorage.getItem(workOrderDetailsState.saleKey);
    const storageItem = JSON.parse(item);
    workOrderDetailsState.data.estimatedDate = storageItem.data.estimatedDate || "";
    workOrderDetailsState.data.notes = storageItem.data.notes || "";
    workOrderDetailsState.data.paymentsToDelete = storageItem.data.paymentsToDelete || [];
    workOrderDetailsState.data.sparePartsToDelete = storageItem.data.sparePartsToDelete || [];
    workOrderDetailsState.data.servicesToDelete = storageItem.data.servicesToDelete || [];
    workOrderDetailsState.totals = storageItem.totals;
    loadExtraInputs(workOrderDetailsState.data.notes, workOrderDetailsState.data.estimatedDate);
    storageItem.data.selectedSpareParts.forEach(part => {
        const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, part);
        if (normalizedPart == null) return;
        appendToDom({
            tBody: tBodySpareParts,
            data: normalizedPart,
            arraySelected: workOrderDetailsState.data.selectedSpareParts,
            arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
            onWritePrice,
            onDelete,
            renderButton: renderImportButton
        });
    });
    storageItem.data.selectedServices.forEach(service => {
        const normalizedService = pushService(workOrderDetailsState.data.selectedServices, service);
        if (normalizedService == null) return;
        appendToDom({
            tBody: tBodyServices,
            data: normalizedService,
            arraySelected: workOrderDetailsState.data.selectedServices,
            arrayDelete: workOrderDetailsState.data.servicesToDelete,
            onWritePrice,
            onDelete
        });
    });
    storageItem.data.payments.forEach(payment => {
        onAddPayment(payment);
    });
}

const loadWorkOrder = async () => {
    const workOrder = await getWorkOrderById(workOrderDetailsState.context.idWorkOrder);
    workOrderDetailsState.context.idVehicle = workOrder.idVehicle
    workOrderDetailsState.data.estimatedDate = workOrder.estimatedDate || "";
    workOrderDetailsState.data.notes = workOrder.notes || "";
    loadViewUpdateOrder(workOrder.vehicleInfo.vin);
    renderVehicleData(workOrder.vehicleInfo);
    loadExtraInputs(workOrderDetailsState.data.notes, workOrderDetailsState.data.estimatedDate);
    workOrder.spareParts.forEach(part => {
        const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, part);
        appendToDom({
            tBody: tBodySpareParts,
            data: normalizedPart,
            arraySelected: workOrderDetailsState.data.selectedSpareParts,
            arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
            onWritePrice,
            onDelete,
            renderButton: renderImportButton
        });
    });
    workOrder.services.forEach(service => {
        const normalizedService = pushService(workOrderDetailsState.data.selectedServices, service);
        appendToDom({
            tBody: tBodyServices,
            data: normalizedService,
            arraySelected: workOrderDetailsState.data.selectedServices,
            arrayDelete: workOrderDetailsState.data.servicesToDelete,
            onWritePrice,
            onDelete
        });
    });
    workOrder.payments.forEach(payment => {
        onAddPayment(payment);
    });
};


const onSearch = async (e, getData, renderData, box, onAdd, selected) => {
    const query = e.target.value.trim();
    if (!query) {
        hideElement(box);
        return;
    }
    try {
        const res = await getData(query);
        renderData(selected, box, res.content || [], onAdd);
    } catch (err) { console.error(err); }
}

const onAddNewService = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (!val) return;
        onAddService({ idService: null, nameService: val, priceApplied: 0 });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = await initSession();
    if (!user) return;

    workOrderDetailsState.idEmployee = getCurrentEmployeeId();

    const hidrated = await hydrateContextFromURL(workOrderDetailsState);
    if (!hidrated) return;
    initStaticRows();
    await initPaymentsController({ totalCalculator: recalculateTotalsPanel, onStateChange: null, createReceiptBtn: createBtnUrl });
    initWorkOrdersEvents({
        onSearchSpareParts,
        onSearchService,
        onAddPayment,
        onSubmitOrder,
        onSaveNotes,
        onAddNewService,
        onSaveDate
    });
    initializeModalListeners(workOrderDetailsState.data);

    if (workOrderDetailsState.context.isNewPart) {
        addNewPartToTable();
        loadDraft();
        validateDate(dtEstimated, dtEstimated.value || new Date());
        await loadDataVehicle();
    } else if (workOrderDetailsState.context.idWorkOrder != null) {
        await loadWorkOrder();
        validateDate(dtEstimated, dtEstimated.value || new Date());
    } else {
        await loadDataVehicle();
        onAddPayment();
        validateDate(dtEstimated, new Date());
    }
    renderImportButton(tBodySpareParts, onImportSparePart);
    calculateAllTotals();
    recalculateTotalsPanel();
    console.log(workOrderDetailsState)
});
