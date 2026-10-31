export const ticketingState = {
    events: [],
    selectedEvent: null,
    zones: [],
    selectedZone: null,
    ticketTypes: [],
    editingEventId: null,
    editingZoneId: null,
    editingTicketTypeId: null,
    pagination: {
        page: 1,
        size: 15
    }
};

export const resetTicketingState = () => {
    ticketingState.events = [];
    ticketingState.selectedEvent = null;
    ticketingState.zones = [];
    ticketingState.selectedZone = null;
    ticketingState.ticketTypes = [];
    ticketingState.editingEventId = null;
    ticketingState.editingZoneId = null;
    ticketingState.editingTicketTypeId = null;
    ticketingState.pagination = { page: 1, size: 15 };
};
