export const ticketValidationState = {
    stream: null,
    detector: null,
    scanning: false,
    submitting: false,
    scanRequestId: 0
};

export const resetTicketValidationState = () => {
    ticketValidationState.stream?.getTracks().forEach(track => track.stop());
    ticketValidationState.stream = null;
    ticketValidationState.detector = null;
    ticketValidationState.scanning = false;
    ticketValidationState.submitting = false;
    ticketValidationState.scanRequestId += 1;
};
