export const ticketOrdersState = {
    orders: [],
    pagination: { page: 1, size: 15, total: 0, totalPages: 1 }
};

export const resetTicketOrdersState = () => {
    ticketOrdersState.orders = [];
    ticketOrdersState.pagination = { page: 1, size: 15, total: 0, totalPages: 1 };
};
