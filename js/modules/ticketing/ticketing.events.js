import { DOMRefs } from './ticketing.dom.js';
import { addModalCloseEvents } from '../../utils/dom.js';

export const initTicketingEvents = ({ onSubmitEvent, onSubmitTicketType, onEventImageChange, onRemoveEventImage, onSelectEvent, onOpenEventActions, onOpenTicketTypeActions, onOpenEventModal, onOpenTicketTypeModal, onCloseModal }) => {
    DOMRefs.refs.eventForm.addEventListener('submit', onSubmitEvent);
    DOMRefs.refs.ticketTypeForm.addEventListener('submit', onSubmitTicketType);
    DOMRefs.refs.eventImage.addEventListener('change', onEventImageChange);
    DOMRefs.refs.btnRemoveEventImage.addEventListener('click', onRemoveEventImage);

    document.getElementById('btnOpenEventModal').addEventListener('click', onOpenEventModal);
    document.getElementById('btnOpenTicketTypeModal').addEventListener('click', onOpenTicketTypeModal);
    const modals = [
        ['eventModal', 'btnOpenEventModal'],
        ['ticketTypeModal', 'btnOpenTicketTypeModal']
    ];

    const closeModal = (modalId, triggerId) => {
        onCloseModal(modalId);
        document.getElementById(triggerId)?.focus();
    };

    document.getElementById('btnCloseEventModal').addEventListener('click', () => closeModal('eventModal', 'btnOpenEventModal'));
    document.getElementById('btnCloseTicketTypeModal').addEventListener('click', () => closeModal('ticketTypeModal', 'btnOpenTicketTypeModal'));

    modals.forEach(([modalId, triggerId]) => {
        const modal = document.getElementById(modalId);
        addModalCloseEvents(modal, () => closeModal(modalId, triggerId));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const openModal = modals
            .map(([modalId]) => document.getElementById(modalId))
            .find(modal => modal && !modal.classList.contains('hide'));
        if (openModal) {
            const triggerId = modals.find(([modalId]) => modalId === openModal.id)?.[1];
            closeModal(openModal.id, triggerId);
        }
    });

    DOMRefs.refs.eventsTableBody.addEventListener('click', (event) => {
        const action = event.target.closest('[data-action]');
        if (!action) return;
        if (action.dataset.action === 'select-event') onSelectEvent(action.dataset.id);
        if (action.dataset.action === 'event-actions') onOpenEventActions(action, action.dataset.id);
    });

    DOMRefs.refs.ticketTypesList.addEventListener('click', (event) => {
        const action = event.target.closest('[data-action]');
        if (action?.dataset.action === 'ticket-type-actions') onOpenTicketTypeActions(action, action.dataset.id);
    });
};
