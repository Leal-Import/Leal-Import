export const ticketValidationState = {
    stream: null,
    reader: null,
    controls: null,
    scanning: false,
    submitting: false
};

export const resetTicketValidationState = () => {
    ticketValidationState.stream?.getTracks().forEach(track => track.stop());
    ticketValidationState.stream = null;
    ticketValidationState.reader = null;
    ticketValidationState.controls = null;
    ticketValidationState.scanning = false;
    ticketValidationState.submitting = false;
};
