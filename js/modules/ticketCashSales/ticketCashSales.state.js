export const ticketCashSalesState = {
    events: [],
    ticketTypes: [],
    selectedEventId: '',
    quote: null,
    idempotencyKey: null,
    success: null
};

export const resetTicketCashSalesState = () => {
    ticketCashSalesState.events = [];
    ticketCashSalesState.ticketTypes = [];
    ticketCashSalesState.selectedEventId = '';
    ticketCashSalesState.quote = null;
    ticketCashSalesState.idempotencyKey = null;
    ticketCashSalesState.success = null;
};
