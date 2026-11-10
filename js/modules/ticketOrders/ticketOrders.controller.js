import { createPagination } from '../../pagination/pagination.controller.js';
import { addModalCloseEvents, createModuleInitializer, toggleModal } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { canAccess } from '../../utils/privilegesValidator.js';
import { DOMRefs, renderOrderDetail, renderOrders, renderOrdersError, setCashSaleVoidAvailable, setLoading } from './ticketOrders.dom.js';
import { getTicketOrder, getTicketOrders, voidCashSale } from './ticketOrders.service.js';
import { resetTicketOrdersState, ticketOrdersState } from './ticketOrders.state.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';

const getPageData = (response) => response?.data ?? response;

const pagination = createPagination({
    initialSize: ticketOrdersState.pagination.size,
    onChange: ({ page, size }) => {
        ticketOrdersState.pagination.page = page;
        ticketOrdersState.pagination.size = size;
        loadOrders();
    }
});

const loadOrders = async () => {
    setLoading(true);
    try {
        const pageData = getPageData(await getTicketOrders(
            ticketOrdersState.pagination.page - 1,
            ticketOrdersState.pagination.size
        ));
        ticketOrdersState.orders = pageData.content || [];
        ticketOrdersState.pagination.total = pageData.page.totalElements;
        ticketOrdersState.pagination.totalPages = pageData.page.totalPages || 1;
        renderOrders(ticketOrdersState.orders, onOpenOrderActions);
        pagination.setTotal({
            totalElements: pageData.page.totalElements,
            totalPages: pageData.page.totalPages,
            page: pageData.page.number + 1,
            size: pageData.page.size
        });
    } catch (error) {
        renderOrdersError();
        await handleApiError(error);
    } finally {
        setLoading(false);
    }
};

const selectOrder = async (orderId, trigger) => {
    const order = ticketOrdersState.orders.find((item) => item.id === orderId);
    if (!order) return;
    ticketOrdersState.detailTrigger = trigger;
    try {
        const detail = await getTicketOrder(orderId);
        ticketOrdersState.selectedOrder = detail;
        renderOrderDetail(detail);
        setCashSaleVoidAvailable(
            canAccess(['CANCEL_TICKET_SALES'])
            && detail.status === 'PAID'
            && detail.payments.some((payment) => payment.paymentMethod === 'CASH' && payment.status === 'CONFIRMED')
        );
        toggleModal(DOMRefs.refs.detailModal, true);
        DOMRefs.refs.closeDetail.focus();
    } catch (error) {
        await handleApiError(error);
    }
};

const closeDetail = () => {
    toggleModal(DOMRefs.refs.detailModal, false);
    ticketOrdersState.selectedOrder = null;
    const trigger = ticketOrdersState.detailTrigger;
    ticketOrdersState.detailTrigger = null;
    if (trigger?.isConnected) trigger.focus();
};

const closeCashSaleVoid = () => {
    toggleModal(DOMRefs.refs.voidModal, false);
    DOMRefs.refs.voidForm.reset();
    DOMRefs.refs.openCashSaleVoid.focus();
};

const openCashSaleVoid = () => {
    if (!ticketOrdersState.selectedOrder) return;
    toggleModal(DOMRefs.refs.voidModal, true);
    DOMRefs.refs.voidReason.focus();
};

const submitCashSaleVoid = async (event) => {
    event.preventDefault();
    const order = ticketOrdersState.selectedOrder;
    const reason = DOMRefs.refs.voidReason.value.trim();
    if (!order || !reason) return;
    const button = event.submitter;
    button.disabled = true;
    button.textContent = 'Anulando...';
    try {
        await voidCashSale(order.id, reason);
        closeCashSaleVoid();
        closeDetail();
        await loadOrders();
    } catch (error) {
        await handleApiError(error);
    } finally {
        button.disabled = false;
        button.textContent = 'Confirmar anulación';
    }
};

const onOpenOrderActions = (button, orderId) => {
    showFloatingMenu({ currentTarget: button }, [
        {
            label: 'Ver detalles de la compra',
            privilege: 'READ_TICKET_ORDERS',
            onClick: () => selectOrder(orderId, button)
        }
    ]);
};

const initialize = () => {
    DOMRefs.refs.closeDetail.addEventListener('click', closeDetail);
    addModalCloseEvents(DOMRefs.refs.detailModal, closeDetail);
    DOMRefs.refs.openCashSaleVoid.addEventListener('click', openCashSaleVoid);
    DOMRefs.refs.closeCashSaleVoid.addEventListener('click', closeCashSaleVoid);
    DOMRefs.refs.cancelCashSaleVoid.addEventListener('click', closeCashSaleVoid);
    DOMRefs.refs.voidForm.addEventListener('submit', submitCashSaleVoid);
    addModalCloseEvents(DOMRefs.refs.voidModal, closeCashSaleVoid);
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (!DOMRefs.refs.voidModal.classList.contains('hide')) closeCashSaleVoid();
        else if (!DOMRefs.refs.detailModal.classList.contains('hide')) closeDetail();
    });
};

const init = createModuleInitializer({
    resetState: resetTicketOrdersState,
    initialize,
    load: loadOrders,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
