// payments.controller.js

import {
    addPayment
} from '../../core/logic/payments.logic.js';
import { cleanPaymentCamps, DOMRefs, renderPayments, resetDomPayments } from '../../core/dom/payments.dom.js';
import { getPaymentMethods } from '../../service/configuration.service.js';
import { paymentsState } from '../../core/state/payments.state.js';
import { $, fillSelect, hideElement, showElement, showMessage } from '../../utils/dom.js';
import { initPaymentsEvents } from './payments.event.js';
import { safeParseFloat, validatePayment } from '../../utils/validators.js';
import { formatWithCommas } from '../../utils/formatters.js';

/* Aca se cargan todos los metodos de pago */
export const loadPayMethods = async (Refs) => {
    try {
        const roles = await getPaymentMethods();
        // Tu API puede devolver array o { content: [...] }
        paymentsState.paymentMethods = Array.isArray(roles) ? roles : (roles?.content || []);
        const cmbPaymentMethod = Refs.paymentMethod;
        if (cmbPaymentMethod) {
            fillSelect(cmbPaymentMethod, paymentsState.paymentMethods, "idPaymentMethod", "methodName", null, "Metodo de pago");
        }
    } catch (error) {
        console.error('Error al cargar métodos de pago:', error);
        paymentsState.paymentMethods = [];
    }
};

export const initPaymentsController = async ({ totalCalculator, createReceiptBtn, isView, state }) => {
    try {
        const refs = DOMRefs.init();

        initPaymentsEvents({ btnCancelEdit: refs.btnCancelEdit, onCancelEdit: () => onCancelEdit(), btnAddPayment: refs.btnAddPayment, onAddPayment: () => onAddPayment(state) });

        await loadPayMethods(refs);
        paymentsState.onCalculateTotal = totalCalculator;
        paymentsState.onCreateButton = createReceiptBtn;
        paymentsState.context.isView = isView;
    } catch (error) {
        throw new Error("Error al inicializar el controlador de pagos: " + error.message, { cause: error });;
    }
};

const onAddPayment = (state) => {
    const amount = DOMRefs.refs.txtAmount;
    const method = DOMRefs.refs.paymentMethod;
    const errorMsg = validatePayment(safeParseFloat(amount.value.trim()), method.value);
    if (errorMsg) {
        showMessage('Error de validación', errorMsg, 'warning');
        return;
    }
    const payment = {
        amount: safeParseFloat(amount.value.trim()) || 0,
        idPaymentMethod: method.value || null
    };
    addNewPayment({
        state: state.data,
        totals: state.totals,
        payment
    });
    cleanPaymentCamps(amount, method);
};

/* ======================================================
   Acciones públicas
====================================================== */

export const addNewPayment = ({ state, totals, payment }) => {
    const editingIndex = paymentsState.context.editingIndex ?? -1;
    if (editingIndex !== -1) {
        // Modo edición: reemplazar el pago existente
        const existing = state.payments[editingIndex];
        state.payments[editingIndex] = {
            ...existing,          // conserva idPayment, paymentURL, etc.
            amount: safeParseFloat(payment.amount) || 0,
            idPaymentMethod: payment.idPaymentMethod ?? existing.idPaymentMethod,
            paymentMethod: getPaymentMethods(payment.idPaymentMethod)
        };
        paymentsState.context.editingIndex = -1;

        // Resetear botón
        const btnAdd = DOMRefs.refs.btnAddPayment;
        if (btnAdd) {
            btnAdd.textContent = 'Añadir abono';
            delete btnAdd.dataset.editing;
        }
        hideElement(DOMRefs.refs.btnCancelEdit);
        showElement(DOMRefs.refs.separatorDiv);
    } else {
        // Modo creación normal
        addPayment(state, payment || {});
    }

    totals.totalPaid = state.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    renderPaymentsController(state.payments, totals, state.paymentsToDelete);
    paymentsState.onCalculateTotal();
};

const onDeletePayment = (payments, index, totals, paymentsToDelete) => {
    if (index === -1) return;
    // 👇 Protección contra edición activa
    const editingIndex = paymentsState.context.editingIndex;
    if (editingIndex !== -1) {
        if (editingIndex === index) {
            onCancelEdit();
        } else if (index < editingIndex) {
            paymentsState.context.editingIndex = editingIndex - 1;
        }
    }
    if (paymentsState.editingPaymentId) paymentsState.editingPaymentId = null;

    const payment = payments[index];
    if (payment.idPayment) {
        paymentsToDelete.push(payment.idPayment);
    }
    payments.splice(index, 1);
    totals.totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    renderPaymentsController(payments, totals, paymentsToDelete);
    paymentsState.onCalculateTotal();
};

const onEditPayment = (payments, index, item) => {
    if (index === -1) return;
    const payment = payments[index];

    if (paymentsState.editingPaymentId !== null) {
        const prevItem = $(paymentsState.editingPaymentId);
        if (prevItem) prevItem.classList.remove('isEditing');
    }
    paymentsState.editingPaymentId = item.id || null;
    item.classList.add('isEditing');
    // Llenar los campos del formulario con los datos del pago
    const refs = DOMRefs.refs;
    refs.txtAmount.value = formatWithCommas(payment.amount);
    refs.paymentMethod.value = payment.idPaymentMethod;

    // Guardar el índice editando en el estado para saber cuál reemplazar
    paymentsState.context.editingIndex = index;

    // Cambiar visualmente el botón de añadir a "Guardar cambios"
    const btnAdd = DOMRefs.refs.btnAddPayment;
    if (btnAdd) {
        btnAdd.textContent = 'Guardar cambios';
        btnAdd.dataset.editing = 'true';
    }
    hideElement(DOMRefs.refs.separatorDiv);
    showElement(refs.btnCancelEdit);
};

const onCancelEdit = () => {
    paymentsState.context.editingIndex = -1;

    const editingId = paymentsState.editingPaymentId;
    if (editingId) {
        const item = $(editingId);
        if (item) item.classList.remove('isEditing');
        paymentsState.editingPaymentId = null;
    }
    // Limpiar campos
    const refs = DOMRefs.refs;
    refs.txtAmount.value = '';
    refs.paymentMethod.value = '';

    // Resetear botón añadir
    const btnAdd = DOMRefs.refs.btnAddPayment;
    if (btnAdd) {
        btnAdd.textContent = 'Añadir abono';
        delete btnAdd.dataset.editing;
    }

    // Ocultar el botón cancelar
    const btnCancel = DOMRefs.refs.btnCancelEdit;
    hideElement(btnCancel);
    // Mostrar el separador
    showElement(DOMRefs.refs.separatorDiv);
};

export const onResetPayments = (state, totals) => {
    // 1. Limpiar payments (manteniendo referencia)
    state.payments.length = 0;

    // 2. Resetear totales
    totals.totalPaid = 0;
    totals.due = 0;
    totals.total = 0;
};

export const onResetDomPayments = () => {
    resetDomPayments(DOMRefs.refs);
};

export const renderPaymentsController = (payments, totals, paymentsToDelete) => {
    renderPayments({
        payments: payments,
        totals,
        onDeletePayment,
        paymentsToDelete,
        showReceiptBtn: true,
        createReceiptButton: paymentsState.onCreateButton,
        isView: paymentsState.context.isView,
        container: DOMRefs.refs.paymentsList,
        onEditPayment
    });
};
