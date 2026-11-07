export const ticketingState = {
    events: [],
    selectedEvent: null,
    ticketTypes: [],
    editingEventId: null,
    editingTicketTypeId: null,
    eventImage: {
        file: null,
        previewObjectUrl: null,
        existingImageUrl: null,
        removeImage: false
    },
    pagination: {
        page: 1,
        size: 15
    }
};

export const resetTicketingState = () => {
    ticketingState.events = [];
    ticketingState.selectedEvent = null;
    ticketingState.ticketTypes = [];
    ticketingState.editingEventId = null;
    ticketingState.editingTicketTypeId = null;
    ticketingState.eventImage = {
        file: null,
        previewObjectUrl: null,
        existingImageUrl: null,
        removeImage: false
    };
    ticketingState.pagination = { page: 1, size: 15 };
};
