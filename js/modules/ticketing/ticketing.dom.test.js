import { beforeEach, describe, expect, test } from 'vitest';
import { clearUserPrivileges, setUserPrivileges } from '../../utils/privilegesValidator.js';
import { DOMRefs, renderEventDetail, renderEvents, renderTicketTypes } from './ticketing.dom.js';

describe('ticketing administration actions', () => {
    beforeEach(() => {
        document.body.innerHTML = '<table><tbody id="eventsTableBody"></tbody></table><div id="eventsEmptyState"></div>';
        DOMRefs.init();
        clearUserPrivileges();
    });

    test('shows edit and status actions to users with write privilege', () => {
        setUserPrivileges(['WRITE_TICKETING']);

        renderEvents([{ id: 'event-id', name: 'Evento', venue: 'Lugar', startsAt: '2026-11-01T18:00:00Z', active: true }], null, () => {});

        expect(document.querySelector('[data-action="event-actions"]')).not.toBeNull();
        expect(document.querySelector('#eventsTableBody td')?.dataset.label).toBe('Evento');
    });

    test('does not render write actions to read-only users', () => {
        setUserPrivileges(['READ_TICKETING']);

        renderEvents([{ id: 'event-id', name: 'Evento', venue: 'Lugar', startsAt: '2026-11-01T18:00:00Z', active: true }], null, () => {});

        expect(document.querySelector('[data-action="event-actions"]')).toBeNull();
    });

    test('groups the available capacity and its context in one ticket-type value', () => {
        document.body.innerHTML = '<div id="ticketTypesList"></div>';
        DOMRefs.init();

        renderTicketTypes([{
            id: 'type-id',
            name: 'General',
            priceInCents: 400,
            availableQuantity: 2986,
            capacity: 3000,
            active: true
        }]);

        const capacity = document.querySelector('.ticketCapacityCell');
        expect(capacity?.dataset.label).toBe('Cupos');
        expect(capacity?.querySelector('.ticketCapacityValue')?.textContent).toContain('2,986');
        expect(capacity?.querySelector('.ticketCapacityValue')?.textContent).toContain('de 3,000 configurados');
    });

    test('renders the public-event preview from the selected event data', () => {
        document.body.innerHTML = `
            <div id="eventDetailEmpty"></div>
            <div id="eventDetailContent" class="hide"></div>
            <h2 id="selectedEventName"></h2>
            <p id="selectedEventMeta"></p>
            <span id="selectedEventStatus"></span>
            <strong id="ticketingPosterDay"></strong>
            <span id="ticketingPosterMonth"></span>
            <strong id="ticketingPosterName"></strong>
            <span id="ticketingPosterVenue"></span>
            <img id="ticketingPosterImage" class="hide">
            <div id="eventMetrics"></div>`;
        DOMRefs.init();

        renderEventDetail({
            name: 'Copa Leal',
            venue: 'Autódromo Internacional El Jabalí',
            startsAt: '2026-11-22T08:00:00-06:00',
            endsAt: '2026-11-22T16:00:00-06:00',
            active: true,
            imageUrl: 'https://res.cloudinary.com/example/image/upload/copa-leal.jpg'
        }, []);

        expect(document.getElementById('ticketingPosterDay').textContent).toBe('22');
        expect(document.getElementById('ticketingPosterName').textContent).toBe('Copa Leal');
        expect(document.getElementById('ticketingPosterVenue').textContent).toBe('Autódromo Internacional El Jabalí');
        expect(document.getElementById('ticketingPosterImage').getAttribute('src')).toBe('https://res.cloudinary.com/example/image/upload/copa-leal.jpg');
    });
});
