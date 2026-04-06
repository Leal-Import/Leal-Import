// vehicleSale.controller.js
import { getVehiclesAviable, getSaleById, postVehicle as postVehicleSale, putVehicle as putVehicleSale, patchVehicleSale } from './vehicles.sales.service.js';
import { getVehicles as getVehicleById } from '../../vehicles/vehiclesForm/vehicles.form.service.js';
import { createPagination } from '../../../pagination/pagination.controller.js';
import { showMessage, hideElement, showElement, disableElement, removeDisable, qsa, buildParams, createModuleInitializer } from '../../../utils/dom.js';
import { navigateTo, replaceTo, ROUTES } from '../../../utils/router.js';
import { resetVehicleSalesFormState, vehicleSalesFormState } from "./vehicles.sales.state.js";
import { initVehicleSaleEvents } from './vehicles.sales.events.js';
import { createBtnUrl } from '../../../core/dom/picAmounts.dom.js';
import { DOMRefs, insertVehicles, loadCustomerName, loadDomData, loadVehicle, renderTotals, resetVehicleSaleFilters } from './vehicles.sales.dom.js';
import { buildPostSalePayload, buildPutSalePayload, hydrateContextFromURL, validateSale } from './vehicles.sales.logic.js';
import { calculateTotals } from '../../../core/logic/calculate.totals.logic.js';
import { addNewPayment, initPaymentsController, onResetDomPayments, onResetPayments } from '../../payments/payments.controller.js';
import { initializeModalListeners } from '../../picsAmounts/controller/picsAmount.controller.js';
import { safeParseFloat } from '../../../utils/validators.js';
import { generateVehicleSaleReport } from '../../../core/reports/vehicleSale/vehicles.sales.report.js';
import { handleApiError } from '../../../utils/api.utils.js';
import { initCancelSale, saleCancelledUIUpdate } from '../../cancelSale/cancelSale.controller.js';

/* ================= PAGINATION ================= */
const pagination = createPagination({
    initialSize: vehicleSalesFormState.pagination.size,
    onChange: ({ page, size }) => {
        vehicleSalesFormState.pagination.page = page;
        vehicleSalesFormState.pagination.size = size;
        loadInventory();
    }
});

/* ================= INVENTORY ================= */
export const loadInventory = async () => {
    try {
        showElement(DOMRefs.refs.tableVehiclesLoader);
        const { page, size } = vehicleSalesFormState.pagination;
        const { search } = vehicleSalesFormState.filters;

        const data = await getVehiclesAviable(page - 1, size, search || '');

        vehicleSalesFormState.list = data.content;
        vehicleSalesFormState.pagination.total = data.page.totalElements;
        vehicleSalesFormState.pagination.totalPages = data.page.totalPages;

        insertVehicles(
            DOMRefs.refs.tBodyInventory,
            vehicleSalesFormState.list,
            onAddVehicle,
            DOMRefs.refs.tableVehicles
        );

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });

    } catch (error) {
        await handleApiError(error, 'No se pudieron cargar los vehículos disponibles para la venta. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.tableVehiclesLoader);
    }
};

/* ================= TOTALS ================= */
const recalculateTotals = () => {
    const { total, due } = calculateTotals({
        items: vehicleSalesFormState.data.salePrice,
        paid: vehicleSalesFormState.totals.totalPaid
    });

    vehicleSalesFormState.totals.total = total;
    vehicleSalesFormState.totals.due = due;
    renderTotals({ total, due, totalPaid: vehicleSalesFormState.totals.totalPaid }, DOMRefs.refs);
};

const onAddVehicle = async (vehicle) => {
    vehicleSalesFormState.idVehicle = vehicle.idVehicle;
    showElement(DOMRefs.refs.addVehicleLoader);
    const vehicleToAppend = await getVehicleById(vehicle.idVehicle);
    hideElement(DOMRefs.refs.addVehicleLoader);
    vehicleSalesFormState.data.salePrice = vehicleToAppend.vehicleCosts ? vehicleToAppend.vehicleCosts.suggestedPrice : 0;
    vehicleSalesFormState.totals.total = vehicleToAppend.vehicleCosts ? vehicleToAppend.vehicleCosts.suggestedPrice : 0;
    loadVehicle(vehicleToAppend, vehicleSalesFormState.context.idSale, DOMRefs.refs);
    recalculateTotals();
};

const onCancelVehicle = () => {
    hideElement(DOMRefs.refs.viewVechicleContainer);
    showElement(DOMRefs.refs.dataLeft);

    vehicleSalesFormState.idVehicle = null;
    vehicleSalesFormState.data.salePrice = 0;
    vehicleSalesFormState.totals.total = 0;

    DOMRefs.refs.frmVehicleSale.reset();

    onResetPayments(vehicleSalesFormState.data, vehicleSalesFormState.totals);
    onResetDomPayments();
    recalculateTotals();
};

/* ================= SUBMIT ================= */
export const onSubmitVehicleSale = async (e, isWorkOrder) => {
    e.preventDefault();
    const response = await createNewSale(isWorkOrder);
    if (response && typeof response === 'object' && response.idSale) {
        const params = buildParams({
            idVehicle: response.idVehicle,
            totalPrice: response.price,
            customerName: vehicleSalesFormState.context.customerName,
            idCustomer: vehicleSalesFormState.context.idCustomer,
            idSale: response.idSale
        });
        replaceTo(ROUTES.WORK_ORDER_FORM, Object.fromEntries(params.entries()));
    } else if (response === "sale") {
        replaceTo(ROUTES.SALES);
    }
};

const createNewSale = async (isWorkOrder) => {
    const invalidate = validateSale(vehicleSalesFormState.data, vehicleSalesFormState.idVehicle, vehicleSalesFormState.context.idCustomer, vehicleSalesFormState.context.idSale);
    const camps = qsa(".txtInputs, .btnPrimary, .btnSecondary, .btnTrash, .btnEdit");
    if (invalidate) {
        await showMessage('Error de validación', invalidate, 'warning');
        return;
    }

    let payload;
    if (vehicleSalesFormState.context.idSale) {
        payload = buildPutSalePayload(vehicleSalesFormState);
    } else {
        payload = buildPostSalePayload(vehicleSalesFormState);
    }

    if (isWorkOrder) {
        showElement(DOMRefs.refs.btnCreateOrderLoader);
    } else {
        showElement(DOMRefs.refs.btnSaveSaleLoader);
    }
    camps.forEach(disableElement);
    try {
        let response;
        if (vehicleSalesFormState.context.idSale) {
            response = await putVehicleSale(payload, vehicleSalesFormState.context.idSale);
            await showMessage('Venta actualizada', 'Éxito', 'success');
        } else {
            response = await postVehicleSale(payload, vehicleSalesFormState.idVehicle);
            await showMessage('Venta registrada', 'Éxito', 'success');
        }

        if (response) {
            if (isWorkOrder) {
                return {
                    idVehicle: response.data.idVehicle,
                    price: response.data.salePrice,
                    idSale: response.data.idVehicleSale
                };
            } else {
                return "sale";
            }
        };

    } catch (error) {
        await handleApiError(error, 'No se pudo guardar la venta. Por favor, inténtalo de nuevo.');
    } finally {
        if (isWorkOrder) {
            hideElement(DOMRefs.refs.btnCreateOrderLoader);
        } else {
            hideElement(DOMRefs.refs.btnSaveSaleLoader);
        }
        camps.forEach(removeDisable);
    }
};

const onSearchVehicle = async (filters) => {
    vehicleSalesFormState.filters = {
        ...vehicleSalesFormState.filters,
        ...filters
    };
    vehicleSalesFormState.pagination.page = 1;
    showElement(DOMRefs.refs.tableVehiclesLoader);
    await loadInventory();
    hideElement(DOMRefs.refs.tableVehiclesLoader);
};

/* ================= LOAD EXISTING ================= */
const loadExistingSale = (sale, vehicle) => {
    if (sale.statusSaleName === "Cancelada") {
        saleCancelledUIUpdate(sale.cancellationReason);
    }
    showElement(DOMRefs.refs.addVehicleLoader);
    hideElement(DOMRefs.refs.btnCancelVehicle);
    loadVehicle(vehicle, vehicleSalesFormState.context.idSale, DOMRefs.refs);
    hideElement(DOMRefs.refs.addVehicleLoader);
    vehicleSalesFormState.data.notes = sale.notes || '';
    vehicleSalesFormState.data.salePrice = sale.fullTotalCost || 0;
    vehicleSalesFormState.data.commission = sale.commission || 0;
    vehicleSalesFormState.data.salePrice = sale.salePrice || 0;
    loadDomData(vehicleSalesFormState.data, DOMRefs.refs);

    sale.vehiclePayments.forEach(p => {
        addNewPayment({
            state: vehicleSalesFormState.data,
            totals: vehicleSalesFormState.totals,
            payment: p
        });
    });
    recalculateTotals();
};

const onSaveFinalPrice = (e) => {
    const total = safeParseFloat(e.target.value) || 0;
    vehicleSalesFormState.data.salePrice = total;
    vehicleSalesFormState.totals.total = total;
    recalculateTotals();
};

const onSaveNotes = (e) => {
    vehicleSalesFormState.data.notes = e.target.value.trim() || '';
};

const onSaveComission = (e) => {
    vehicleSalesFormState.data.commission = e.target.value.trim() || '';
};

const onImportVehicle = () => {
    const params = buildParams({
        sale: true,
        idCustomer: vehicleSalesFormState.context.idCustomer,
        customerName: vehicleSalesFormState.context.customerName
    });
    navigateTo(ROUTES.VEHICLES_FORM, Object.fromEntries(params.entries()));
};

const initializeUI = async (Refs) => {
    resetVehicleSaleFilters(Refs.txtSearchData);
    await initPaymentsController({
        totalCalculator: recalculateTotals,
        createReceiptBtn: createBtnUrl,
        isView: vehicleSalesFormState.context.isView,
        state: vehicleSalesFormState
    });
    loadCustomerName(DOMRefs.refs.customerName, vehicleSalesFormState.context.customerName);
    initVehicleSaleEvents({ Refs, onSubmitVehicleSale, onSearchVehicle, onSaveNotes, onSaveFinalPrice, onSaveComission, onImportVehicle, onCancelVehicle });
    if (vehicleSalesFormState.context.isView) {
        initCancelSale(vehicleSalesFormState.context.idSale, patchVehicleSale);
    };
    initializeModalListeners(vehicleSalesFormState.data, vehicleSalesFormState.context.isView);
};

const loadDataFlow = async () => {
    if (vehicleSalesFormState.context.idSale) {
        const sale = await getSaleById(vehicleSalesFormState.context.idSale);
        const vehicle = await getVehicleById(sale.idVehicle);
        loadExistingSale(sale, vehicle);
        if (vehicleSalesFormState.context.isView) {
            hideElement(DOMRefs.refs.btnSaveSale);
            disableElement(DOMRefs.refs.btnImportVehicle);
            disableElement(DOMRefs.refs.txtNotes);
            disableElement(DOMRefs.refs.txtTotal);
            disableElement(DOMRefs.refs.txtCommission);
            hideElement(DOMRefs.refs.paymentForm);
            showElement(DOMRefs.refs.btnGeneratePdf);
            sale.totalPaid = vehicleSalesFormState.totals.totalPaid;
            DOMRefs.refs.btnGeneratePdf.addEventListener('click', () => generateVehicleSaleReport(sale, vehicle, vehicleSalesFormState.context.customerName));
        }
        return;
    } else if (vehicleSalesFormState.context.idVehicle) {
        showElement(DOMRefs.refs.addVehicleLoader);
        const vehicle = await getVehicleById(vehicleSalesFormState.context.idVehicle);
        loadVehicle(vehicle, vehicleSalesFormState.context.idSale, DOMRefs.refs);
        if (vehicle.vehicleCosts && vehicle.vehicleCosts.suggestedPrice) {
            vehicleSalesFormState.data.salePrice = vehicle.vehicleCosts.suggestedPrice;
        }
        hideElement(DOMRefs.refs.addVehicleLoader);
        recalculateTotals();
    }
    await loadInventory();
};

const init = createModuleInitializer({
    resetState: async () => {
        resetVehicleSalesFormState();
        const hydrated = await hydrateContextFromURL(vehicleSalesFormState);
        if (!hydrated) throw new Error('Failed to hydrate context');
    },
    initialize: initializeUI,
    load: loadDataFlow,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
