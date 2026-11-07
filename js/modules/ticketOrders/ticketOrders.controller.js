import { addModalCloseEvents, createModuleInitializer, toggleModal } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { DOMRefs, renderOrderDetail, renderOrders, renderOrdersError, renderPagination, setLoading } from './ticketOrders.dom.js';
import { getTicketOrder, getTicketOrders } from './ticketOrders.service.js';
import { resetTicketOrdersState, ticketOrdersState } from './ticketOrders.state.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';

const getPageData = (response) => response?.data ?? response;

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
        renderPagination({
            page: ticketOrdersState.pagination.page,
            totalPages: ticketOrdersState.pagination.totalPages,
            totalElements: ticketOrdersState.pagination.total,
            size: ticketOrdersState.pagination.size,
            onChange: changePage
        });
    } catch (error) {
        renderOrdersError();
        await handleApiError(error);
    } finally {
        setLoading(false);
    }
};

const selectOrder = async (orderId) => {
    const order = ticketOrdersState.orders.find((item) => item.id === orderId);
    if (!order) return;
    try {
        renderOrderDetail(await getTicketOrder(orderId));
        toggleModal(DOMRefs.refs.detailModal, true);
    } catch (error) {
        await handleApiError(error);
    }
};

const onOpenOrderActions = (button, orderId) => {
    showFloatingMenu({ currentTarget: button }, [
        {
            label: 'Ver detalles de la compra',
            privilege: 'READ_SALES',
            onClick: () => selectOrder(orderId)
        }
    ]);
};

const changePage = (page) => {
    if (page < 1 || page > ticketOrdersState.pagination.totalPages) return;
    ticketOrdersState.pagination.page = page;
    loadOrders();
};

const changePageSize = (size) => {
    ticketOrdersState.pagination.page = 1;
    ticketOrdersState.pagination.size = size;
    loadOrders();
};

const initialize = () => {
    DOMRefs.refs.sizeSelect.addEventListener('change', () => changePageSize(Number(DOMRefs.refs.sizeSelect.value)));
    DOMRefs.refs.closeDetail.addEventListener('click', () => toggleModal(DOMRefs.refs.detailModal, false));
    addModalCloseEvents(DOMRefs.refs.detailModal, () => toggleModal(DOMRefs.refs.detailModal, false));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') toggleModal(DOMRefs.refs.detailModal, false);
    });
};

const init = createModuleInitializer({
    resetState: resetTicketOrdersState,
    initialize,
    load: loadOrders,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
