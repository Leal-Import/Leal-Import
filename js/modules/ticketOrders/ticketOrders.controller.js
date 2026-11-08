import { createPagination } from '../../pagination/pagination.controller.js';
import { addModalCloseEvents, createModuleInitializer, toggleModal } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { DOMRefs, renderOrderDetail, renderOrders, renderOrdersError, setLoading } from './ticketOrders.dom.js';
import { getTicketOrder, getTicketOrders } from './ticketOrders.service.js';
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
        renderOrderDetail(await getTicketOrder(orderId));
        toggleModal(DOMRefs.refs.detailModal, true);
        DOMRefs.refs.closeDetail.focus();
    } catch (error) {
        await handleApiError(error);
    }
};

const closeDetail = () => {
    toggleModal(DOMRefs.refs.detailModal, false);
    const trigger = ticketOrdersState.detailTrigger;
    ticketOrdersState.detailTrigger = null;
    if (trigger?.isConnected) trigger.focus();
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
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !DOMRefs.refs.detailModal.classList.contains('hide')) closeDetail();
    });
};

const init = createModuleInitializer({
    resetState: resetTicketOrdersState,
    initialize,
    load: loadOrders,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
