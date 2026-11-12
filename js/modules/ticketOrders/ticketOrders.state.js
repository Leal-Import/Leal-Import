export const ticketOrdersState = {
    orders: [],
    selectedOrder: null,
    detailTrigger: null,
    filters: { search: '', status: '' },
    pagination: { page: 1, size: 15, total: 0, totalPages: 1 }
};

export const resetTicketOrdersState = () => {
    ticketOrdersState.orders = [];
    ticketOrdersState.selectedOrder = null;
    ticketOrdersState.detailTrigger = null;
    ticketOrdersState.filters = { search: '', status: '' };
    ticketOrdersState.pagination = { page: 1, size: 15, total: 0, totalPages: 1 };
};
