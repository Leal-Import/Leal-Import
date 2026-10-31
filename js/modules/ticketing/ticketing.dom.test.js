import { beforeEach, describe, expect, test } from 'vitest';
import { clearUserPrivileges, setUserPrivileges } from '../../utils/privilegesValidator.js';
import { DOMRefs, renderEvents } from './ticketing.dom.js';

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
    });

    test('does not render write actions to read-only users', () => {
        setUserPrivileges(['READ_TICKETING']);

        renderEvents([{ id: 'event-id', name: 'Evento', venue: 'Lugar', startsAt: '2026-11-01T18:00:00Z', active: true }], null, () => {});

        expect(document.querySelector('[data-action="event-actions"]')).toBeNull();
    });
});
