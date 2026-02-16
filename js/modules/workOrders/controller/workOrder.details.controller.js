import { appendToDom, cleanPaymentCamps, cleanRow, DOMRefs, initStaticRows, loadExtraInputs, loadViewDom, loadViewSaleInfo, loadViewUpdateOrder, reindexTable, renderImportButton, renderOrderTotal, renderServiceSuggestions, renderSparePartSuggestions, renderTotalRepairCost, renderTotals, renderTotalServices, renderTotalsPanel, renderTotalSpareParts, renderVehicleData } from "../../../core/dom/workOrder.details.dom.js";
import { workOrderDetailsState } from "../../../core/state/workOrder.details.state.js";
import { getDataVehicleById, getServices, getSpareParts, getWorkOrderById, patchWorkOrder, postWorkOrder, putWorkOrder } from "../../../service/workOrder.detail.service.js";
import { safeParseFloat, validateDate, validatePayment } from "../../../utils/validators.js";
import { disableElement, hideElement, removeDisable, showElement, showMessage } from "../../../utils/dom.js";
import { initializeModalListeners } from "../../picsAmounts/controller/picsAmount.controller.js";
import { initWorkOrdersEvents } from "../event/workOrder.details.event.js";
import { pushService, pushSparePart, hydrateContextFromURL, calculateWorkOrderTotals, validatePutOrder, validatePostOrder, buildPostWorkOrderFormData, buildPutWorkOrderFormData, cleanWindow } from "../../../core/logic/workOrder.details.logic.js";
import { addNewPayment, initPaymentsController } from "../../payments/payments.controller.js";
import { createBtnUrl } from "../../../core/dom/picAmounts.dom.js";
import { calculateTotals } from "../../../core/logic/calculate.totals.logic.js";
import { getCurrentEmployeeId, initSession } from "../../../utils/api.utils.js";

const addNewPartToTable = () => {
    if (!workOrderDetailsState.context.idNewPart || !workOrderDetailsState.context.newPartName) return;
    const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, {
        idSparePart: workOrderDetailsState.context.idNewPart,
        sparePartName: workOrderDetailsState.context.newPartName,
        priceApplied: workOrderDetailsState.context.newPartSuggestedPrice
    });
    appendToDom({
        tBody: DOMRefs.refs.tBodySpareParts,
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
    data.priceApplied = value;
    calculateAllTotals();
};

const updateTotalsAfterAdd = () => {
    const totals = calculateWorkOrderTotals({
        services: workOrderDetailsState.data.selectedServices,
        spareParts: workOrderDetailsState.data.selectedSpareParts,
        payments: workOrderDetailsState.data.payments
    });

    renderTotalServices(totals.servicesTotal);
    renderTotalSpareParts(totals.sparePartsTotal);
    renderTotalRepairCost(totals.total);
    renderTotalsPanel({ due: totals.due, totalPaid: totals.totalPaid, total: totals.total });
    renderOrderTotal(totals.orderTotal);
};

const onAddService = (service) => {
    const normalizedService = pushService(workOrderDetailsState.data.selectedServices, service);
    appendToDom({
        tBody: DOMRefs.refs.tBodyServices,
        data: normalizedService,
        arraySelected: workOrderDetailsState.data.selectedServices,
        arrayDelete: workOrderDetailsState.data.servicesToDelete,
        onWritePrice,
        onDelete
    });

    DOMRefs.refs.txtAddService.value = '';
    reindexTable(DOMRefs.refs.tBodyServices);
    hideElement(DOMRefs.refs.boxServ);
    updateTotalsAfterAdd();
}

const onAddSparePart = (sparePart) => {
    const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, sparePart);
    appendToDom({
        tBody: DOMRefs.refs.tBodySpareParts,
        data: normalizedPart,
        arraySelected: workOrderDetailsState.data.selectedSpareParts,
        arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
        onWritePrice,
        onDelete,
        renderButton: renderImportButton
    });

    DOMRefs.refs.txtAddSparePart.value = '';
    reindexTable(DOMRefs.refs.tBodySpareParts);
    hideElement(DOMRefs.refs.boxSparePart);
    renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart);
    updateTotalsAfterAdd();
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
    reindexTable(tBody);
    renderButton?.(DOMRefs.refs.tBodySpareParts, onImportSparePart);
}


const onSearchService = (e) => {
    onSearch(e, getServices, renderServiceSuggestions, DOMRefs.refs.boxServ, onAddService, workOrderDetailsState.data.selectedServices);
}

const onSearchSpareParts = (e) => {
    onSearch(e, getSpareParts, renderSparePartSuggestions, DOMRefs.refs.boxSparePart, onAddSparePart, workOrderDetailsState.data.selectedSpareParts);
}

const onAddPayment = () => {
    const amount = DOMRefs.refs.txtAmount.value.trim();
    const method = DOMRefs.refs.cmbPaymentMethod.value;
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
        state: workOrderDetailsState.data,
        totals: workOrderDetailsState.totals,
        payment
    });
    cleanPaymentCamps();
};

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
        const errorPost = validatePostOrder(workOrderDetailsState.data, workOrderDetailsState.context.idVehicle);
        if (errorPost) {
            showMessage('Error de validación', errorPost, 'warning');
            return;
        }
        fd = buildPostWorkOrderFormData(workOrderDetailsState);
    }
    showElement(DOMRefs.refs.loaderAddOrder);
    disableElement(DOMRefs.refs.btnSaveOrder);

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
    } finally {
        hideElement(DOMRefs.refs.loaderAddOrder);
        removeDisable(DOMRefs.refs.btnSaveOrder);
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

const loadDraft = () => {
    const item = localStorage.getItem(workOrderDetailsState.saleKey);
    if (!item) {
        console.warn('No draft found in localStorage');
        return;
    }
    try {
        const storageItem = JSON.parse(item);
        workOrderDetailsState.data.estimatedDate = storageItem.data?.estimatedDate || "";
        workOrderDetailsState.data.notes = storageItem.data?.notes || "";
        workOrderDetailsState.data.paymentsToDelete = storageItem.data?.paymentsToDelete || [];
        workOrderDetailsState.data.sparePartsToDelete = storageItem.data?.sparePartsToDelete || [];
        workOrderDetailsState.data.servicesToDelete = storageItem.data?.servicesToDelete || [];
        workOrderDetailsState.totals = storageItem.totals || {};

        loadExtraInputs(workOrderDetailsState.data.notes, workOrderDetailsState.data.estimatedDate);

        // Cargar spare parts
        storageItem.data?.selectedSpareParts?.forEach(part => {
            const normalizedPart = pushSparePart(workOrderDetailsState.data.selectedSpareParts, part);
            if (normalizedPart == null) return;
            appendToDom({
                tBody: DOMRefs.refs.tBodySpareParts,
                data: normalizedPart,
                arraySelected: workOrderDetailsState.data.selectedSpareParts,
                arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
                onWritePrice,
                onDelete,
                renderButton: renderImportButton
            });
        });
        // Cargar servicios
        storageItem.data?.selectedServices?.forEach(service => {
            const normalizedService = pushService(workOrderDetailsState.data.selectedServices, service);
            if (normalizedService == null) return;
            appendToDom({
                tBody: DOMRefs.refs.tBodyServices,
                data: normalizedService,
                arraySelected: workOrderDetailsState.data.selectedServices,
                arrayDelete: workOrderDetailsState.data.servicesToDelete,
                onWritePrice,
                onDelete
            });
        });
        // Cargar pagos
        storageItem.data?.payments?.forEach(payment => {
            addNewPayment({
                state: workOrderDetailsState.data,
                totals: workOrderDetailsState.totals,
                payment
            });
        });
    } catch (error) {
        console.error('Error loading draft:', error);
        showMessage('Advertencia', 'No se pudo cargar el borrador guardado', 'warning');
    }
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
            tBody: DOMRefs.refs.tBodySpareParts,
            data: normalizedPart,
            arraySelected: workOrderDetailsState.data.selectedSpareParts,
            arrayDelete: workOrderDetailsState.data.sparePartsToDelete,
            onWritePrice,
            onDelete,
            renderButton: renderImportButton,
            isView: workOrderDetailsState.context.isView
        });
    });
    workOrder.services.forEach(service => {
        const normalizedService = pushService(workOrderDetailsState.data.selectedServices, service);
        appendToDom({
            tBody: DOMRefs.refs.tBodyServices,
            data: normalizedService,
            arraySelected: workOrderDetailsState.data.selectedServices,
            arrayDelete: workOrderDetailsState.data.servicesToDelete,
            onWritePrice,
            onDelete,
            isView: workOrderDetailsState.context.isView
        });
    });
    workOrder.payments.forEach(payment => {
        addNewPayment({
            state: workOrderDetailsState.data,
            totals: workOrderDetailsState.totals,
            payment
        });
    });
};

const onCompleteOrder = async () => {
    try {
        showElement(DOMRefs.refs.loaderCompleteOrder);
        disableElement(DOMRefs.refs.btnCompleteOrder);
        const answer = await patchWorkOrder(workOrderDetailsState.context.idWorkOrder);
        await showMessage("Exito", "Orden completada", "success", true);
        if (answer) {
            window.location.href = `workOrderDetails.html?idVehicle=${workOrderDetailsState.context.idVehicle}&idCustomer=${workOrderDetailsState.context.idCustomer}`
        }
    } catch (error) {
        console.error(error);
        showMessage("Error", "No se pudo completar la orden", "error");
    } finally {
        hideElement(DOMRefs.refs.loaderCompleteOrder);
        removeDisable(DOMRefs.refs.btnCompleteOrder);
    }
}

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

// Funciones auxiliares para cada flujo
const initNewPartFlow = async () => {
    addNewPartToTable();
    loadDraft();
    validateDate(DOMRefs.refs.dtEstimated, DOMRefs.dtEstimated.value || new Date());
    await loadDataVehicle();
};

const initEditOrderFlow = async () => {
    await loadWorkOrder();

    if (workOrderDetailsState.context.isView) {
        loadViewDom(onCompleteOrder);
    } else {
        validateDate(DOMRefs.refs.dtEstimated, DOMRefs.refs.dtEstimated.value || new Date());
    }
};

const initNewOrderFlow = async () => {
    await loadDataVehicle();
    validateDate(DOMRefs.refs.dtEstimated, new Date());
};

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    // 2. Configurar estado global
    workOrderDetailsState.idEmployee = getCurrentEmployeeId();

    // 3. Hidratar contexto desde URL
    const hydrated = await hydrateContextFromURL(workOrderDetailsState);
    if (!hydrated) return false;

    return true;
};

const initializeUI = async () => {
    // Inicialización de componentes UI
    initStaticRows();

    await initPaymentsController({
        totalCalculator: recalculateTotalsPanel,
        onStateChange: null,
        createReceiptBtn: createBtnUrl,
        isView: workOrderDetailsState.context.isView
    });

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
};

const loadDataFlow = async () => {
    const { context } = workOrderDetailsState;

    // Determinar qué flujo ejecutar
    if (context.isNewPart) {
        await initNewPartFlow();
    } else if (context.idWorkOrder != null) {
        await initEditOrderFlow();
    } else {
        await initNewOrderFlow();
    }

    // Renderizado condicional
    if (!context.isView) {
        renderImportButton(DOMRefs.refs.tBodySpareParts, onImportSparePart);
    }
};

const finalizeTotals = () => {
    calculateAllTotals();
    recalculateTotalsPanel();
};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Configurar aplicación
        const isReady = await setupApplication();
        if (!isReady) return;

        // 2. Inicializar referencias del DOMRefs
        DOMRefs.init();
        
        // 3. Inicializar componentes UI
        await initializeUI();
        
        // 4. Cargar datos según el flujo
        await loadDataFlow();
        
        // 5. Calcular totales finales
        finalizeTotals();

        DOMRefs.init();
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
