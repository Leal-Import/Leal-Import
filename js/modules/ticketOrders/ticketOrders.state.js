export const ticketOrdersState = {
    orders: [],
    detailTrigger: null,
    pagination: { page: 1, size: 15, total: 0, totalPages: 1 }
};

export const resetTicketOrdersState = () => {
    ticketOrdersState.orders = [];
    ticketOrdersState.detailTrigger = null;
    ticketOrdersState.pagination = { page: 1, size: 15, total: 0, totalPages: 1 };
};
