import { DOMRefs } from './ticketing.dom.js';
import { addModalCloseEvents } from '../../utils/dom.js';

export const initTicketingEvents = ({ onSubmitEvent, onSubmitZone, onSubmitTicketType, onSelectEvent, onOpenEventActions, onOpenZoneActions, onOpenTicketTypeActions, onOpenEventModal, onOpenZoneModal, onOpenTicketTypeModal, onCloseModal }) => {
    DOMRefs.refs.eventForm.addEventListener('submit', onSubmitEvent);
    DOMRefs.refs.zoneForm.addEventListener('submit', onSubmitZone);
    DOMRefs.refs.ticketTypeForm.addEventListener('submit', onSubmitTicketType);

    document.getElementById('btnOpenEventModal').addEventListener('click', onOpenEventModal);
    document.getElementById('btnOpenZoneModal').addEventListener('click', onOpenZoneModal);
    document.getElementById('btnOpenTicketTypeModal').addEventListener('click', onOpenTicketTypeModal);
    const modals = [
        ['eventModal', 'btnOpenEventModal'],
        ['zoneModal', 'btnOpenZoneModal'],
        ['ticketTypeModal', 'btnOpenTicketTypeModal']
    ];

    const closeModal = (modalId, triggerId) => {
        onCloseModal(modalId);
        document.getElementById(triggerId)?.focus();
    };

    document.getElementById('btnCloseEventModal').addEventListener('click', () => closeModal('eventModal', 'btnOpenEventModal'));
    document.getElementById('btnCloseZoneModal').addEventListener('click', () => closeModal('zoneModal', 'btnOpenZoneModal'));
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

    DOMRefs.refs.zonesList.addEventListener('click', (event) => {
        const action = event.target.closest('[data-action]');
        if (!action) return;
        if (action.dataset.action === 'zone-actions') onOpenZoneActions(action, action.dataset.id);
    });

    DOMRefs.refs.ticketTypesList.addEventListener('click', (event) => {
        const action = event.target.closest('[data-action]');
        if (action?.dataset.action === 'ticket-type-actions') onOpenTicketTypeActions(action, action.dataset.id);
    });
};
