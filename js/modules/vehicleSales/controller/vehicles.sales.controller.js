// vehicleSale.controller.js
import {
    getVehiclesAviable,
    getSaleById,
    postVehicle as postVehicleSale,
    putVehicle as putVehicleSale
} from '../../../service/vehicles.sales.service.js';

import { getVehicles as getVehicleById } from '../../../service/vehicles.detail.service.js';

import { createPagination } from '../../../pagination/pagination.controller.js';

import { showMessage, qs, hideElement, showElement, disableElement, removeDisable } from '../../../utils/dom.js';

import { vehicleSaleState } from '../../../core/state/vehicles.sales.state.js';
import { initVehicleSaleEvents } from '../event/vehicles.sales.events.js';
import { createBtnUrl } from '../../../core/dom/picAmounts.dom.js';

import { cleanPaymentCamps, DOMRefs, insertVehicles, loadCustomerName, loadDomData, loadVehicle, renderTotals } from '../../../core/dom/vehicles.sales.dom.js';

import { buildPostSalePayload, buildPutSalePayload, hydrateContextFromURL, validateSale } from '../../../core/logic/vehicles.sales.logic.js';

import { calculateTotals } from '../../../core/logic/calculate.totals.logic.js';

import { getCurrentEmployeeId, initSession } from '../../../utils/api.utils.js';

import { addNewPayment, initPaymentsController, onResetPayments } from '../../payments/payments.controller.js';
import { initializeModalListeners } from '../../picsAmounts/controller/picsAmount.controller.js';
import { safeParseFloat, validatePayment } from '../../../utils/validators.js';
import { workOrderDetailsState } from '../../../core/state/workOrder.details.state.js';


/* ================= PAGINATION ================= */
const pagination = createPagination({
    initialSize: vehicleSaleState.pagination.size,
    onChange: ({ page, size }) => {
        vehicleSaleState.pagination.page = page;
        vehicleSaleState.pagination.size = size;
        loadInventory();
    }
});

/* ================= INVENTORY ================= */
export async function loadInventory() {
    try {
        showElement(DOMRefs.refs.tableVehiclesLoader);
        const { page, size } = vehicleSaleState.pagination;
        const { search } = vehicleSaleState.filters;

        const data = await getVehiclesAviable(page - 1, size, search || '');

        vehicleSaleState.list = data.content;
        vehicleSaleState.pagination.total = data.page.totalElements;
        vehicleSaleState.pagination.totalPages = data.page.totalPages;

        insertVehicles(
            DOMRefs.refs.tBodyInventory,
            vehicleSaleState.list,
            onAddVehicle
        );

        pagination.setTotal({
            totalElements: data.page.totalElements,
            totalPages: data.page.totalPages,
            page: data.page.number + 1,
            size: data.page.size
        });

    } catch (error) {
        showMessage('Error', error, 'error');
        console.error('Error cargando vehículos:', error);
    } finally {
        hideElement(DOMRefs.refs.tableVehiclesLoader);
    }
}

/* ================= TOTALS ================= */
const recalculateTotals = () => {
    const { total, due } = calculateTotals({
        items: vehicleSaleState.data.salePrice,
        paid: vehicleSaleState.totals.totalPaid
    });

    vehicleSaleState.totals.total = total;
    vehicleSaleState.totals.due = due;
    renderTotals({ total, due, totalPaid: vehicleSaleState.totals.totalPaid });
};

const onAddVehicle = async (vehicle) => {
    vehicleSaleState.idVehicle = vehicle.idVehicle;
    showElement(DOMRefs.refs.addVehicleLoader);
    const vehicleToAppend = await getVehicleById(vehicle.idVehicle);
    hideElement(DOMRefs.refs.addVehicleLoader);
    vehicleSaleState.data.salePrice = vehicleToAppend.costs ? vehicleToAppend.costs.suggestedPrice : 0;
    vehicleSaleState.totals.total = vehicleToAppend.costs ? vehicleToAppend.costs.suggestedPrice : 0;
    loadVehicle(vehicleToAppend, vehicleSaleState.context.idSale);
    recalculateTotals();
    saveSaleState();
};

const onCancelVehicle = () => {
    hideElement(qs(".viewVechicleContainer"));
    showElement(qs(".dataLeft"));

    vehicleSaleState.idVehicle = null;
    vehicleSaleState.data.salePrice = 0;
    vehicleSaleState.totals.total = 0;
    localStorage.removeItem(vehicleSaleState.saleKey);

    DOMRefs.refs.frmVehicleSale.reset();

    onResetPayments(vehicleSaleState.data, vehicleSaleState.totals);
    recalculateTotals();
};

/* ================= PAYMENTS ================= */
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
        state: vehicleSaleState.data,
        totals: vehicleSaleState.totals,
        payment
    });
    cleanPaymentCamps();
};

/* ================= SUBMIT ================= */
async function onSubmitVehicleSale(e) {
    e.preventDefault();

    const error = validateSale(vehicleSaleState.data, vehicleSaleState.idVehicle, vehicleSaleState.context.idCustomer, vehicleSaleState.context.idSale);
    if (error) {
        showMessage('Error de validación', error, 'warning');
        return;
    }
    showElement(DOMRefs.refs.btnSaveSaleLoader);
    disableElement(DOMRefs.refs.btnSaveSale);
    let payload;
    if (vehicleSaleState.context.idSale) {
        payload = buildPutSalePayload(vehicleSaleState);
    } else {
        payload = buildPostSalePayload(vehicleSaleState);
    }

    if (payload.error) {
        showMessage('Error', payload.error, 'warning');
        return;
    }
    try {
        let response;

        if (vehicleSaleState.context.idSale) {
            response = await putVehicleSale(payload, vehicleSaleState.context.idSale);
            await showMessage('Venta actualizada', 'Éxito', 'success');
        } else {
            response = await postVehicleSale(payload, vehicleSaleState.idVehicle);
            await showMessage('Venta registrada', 'Éxito', 'success');
        }

        if (response) {
            cleanWindow();
            const cleanUrl = window.location.pathname;
            history.replaceState({}, "", cleanUrl);
        };
        window.location.href = 'sales.html';

    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Error al procesar venta', error, 'error');
    } finally {
        hideElement(DOMRefs.refs.btnSaveSaleLoader);
        removeDisable(DOMRefs.refs.btnSaveSale);
    }
}

const onSearchVehicle = async (filters) => {
    vehicleSaleState.filters = {
        ...vehicleSaleState.filters,
        ...filters
    };
    vehicleSaleState.pagination.page = 1;
    showElement(DOMRefs.refs.tableVehiclesLoader);
    await loadInventory();
    hideElement(DOMRefs.refs.tableVehiclesLoader);
};

const saveSaleState = () => {
    localStorage.setItem(vehicleSaleState.saleKey, JSON.stringify({
        idVehicle: vehicleSaleState.idVehicle,
        data: vehicleSaleState.data,
        totals: vehicleSaleState.totals
    }));
};

const existSavedData = () => localStorage.getItem(vehicleSaleState.saleKey) !== null;

const cleanWindow = () => {
    localStorage.removeItem(vehicleSaleState.saleKey);
    DOMRefs.refs.frmVehicleSale.reset();
};

/* ================= LOAD EXISTING ================= */
async function loadExistingSale() {
    showElement(DOMRefs.refs.addVehicleLoader);
    const sale = await getSaleById(vehicleSaleState.context.idSale);
    const vehicle = await getVehicleById(sale.idVehicle);
    loadVehicle(vehicle);
    hideElement(DOMRefs.refs.addVehicleLoader);
    vehicleSaleState.data.notes = sale.notes || '';
    vehicleSaleState.data.salePrice = sale.fullTotalCost || 0;
    vehicleSaleState.data.commission = sale.commission || 0;
    loadDomData(vehicleSaleState.data);

    sale.payments.forEach(p => {
        addNewPayment({
            state: vehicleSaleState.data,
            totals: vehicleSaleState.totals,
            payment: p
        });
    });
    recalculateTotals();
    saveSaleState();
}

/* ================= LOAD DRAFT ================= */
const loadDraft = async () => {
    const storage = JSON.parse(
        localStorage.getItem(vehicleSaleState.saleKey)
    );
    vehicleSaleState.idVehicle = storage.idVehicle
    vehicleSaleState.data = storage.data;
    vehicleSaleState.totals = storage.totals;
    if (vehicleSaleState.idVehicle) {
        const vehicle = await getVehicleById(vehicleSaleState.idVehicle);
        loadVehicle(vehicle);
    }
    vehicleSaleState.data.payments.forEach(p => {
        addNewPayment({
            state: vehicleSaleState.data,
            totals: vehicleSaleState.totals,
            payment: p
        });
    });
    recalculateTotals();
};

const onSaveFinalPrice = (e) => {
    const total = safeParseFloat(e.target.value) || 0;
    vehicleSaleState.data.salePrice = total;
    vehicleSaleState.totals.total = total;
    saveSaleState();
    recalculateTotals();
};

const onSaveNotes = (e) => {
    vehicleSaleState.data.notes = e.target.value.trim() || '';
    saveSaleState();
};

const onSaveComission = (e) => {
    vehicleSaleState.data.commission = e.target.value.trim() || '';
    saveSaleState();
};

const onImportVehicle = () => {
    window.location.href = `vehicleDetails.html?sale=true&idCustomer=${vehicleSaleState.context.idCustomer}&customerName=${vehicleSaleState.context.customerName}`;
};

const initializeUI = async () => {
    await initPaymentsController({
        totalCalculator: recalculateTotals,
        onStateChange: saveSaleState,
        createReceiptBtn: createBtnUrl
    });
    loadCustomerName(vehicleSaleState.context.customerName);
    initVehicleSaleEvents({ onSubmitVehicleSale, onAddPayment, onSearchVehicle, onSaveNotes, onSaveFinalPrice, onSaveComission, onCancelVehicle, onImportVehicle });
    initializeModalListeners(vehicleSaleState.data);
}

const setupApplication = async () => {
    // 1. Validar sesión
    const user = await initSession();
    if (!user) return false;

    // 2. Configurar estado global
    workOrderDetailsState.idEmployee = getCurrentEmployeeId();

    // 3. Hidratar contexto desde URL
    const hydrated = await hydrateContextFromURL(vehicleSaleState);
    if (!hydrated) return false;

    return true;
};

const loadDataFlow = async () => {
    if (vehicleSaleState.context.idSale) {
        await loadExistingSale();
    } else if (vehicleSaleState.context.idVehicle) {
        showElement(DOMRefs.refs.addVehicleLoader);
        const vehicle = await getVehicleById(vehicleSaleState.context.idVehicle);
        loadVehicle(vehicle);
        hideElement(DOMRefs.refs.addVehicleLoader);
        recalculateTotals();
    } else if (existSavedData()) {
        loadDraft();
    }
    await loadInventory();
};

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
    } catch (error) {
        console.error('Error initializing application:', error);
        showMessage('Error', 'No se pudo inicializar la aplicación', 'error');
    }
});
