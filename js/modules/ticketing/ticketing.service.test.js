import { beforeEach, describe, expect, test, vi } from 'vitest';
import config from '../../config.js';
import { setUserPrivileges, clearUserPrivileges } from '../../utils/privilegesValidator.js';
import { getTicketTypes, updateTicketEvent, updateTicketType } from './ticketing.service.js';

const response = (data) => new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
});

describe('ticketing service update contract', () => {
    beforeEach(() => {
        clearUserPrivileges();
        vi.restoreAllMocks();
        vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(response({ id: 'updated-id' }))));
    });

    test('sends event updates to the backend endpoint with write privilege', async () => {
        setUserPrivileges(['WRITE_TICKETING']);
        const payload = {
            name: 'Evento actualizado',
            venue: 'Auditorio',
            startsAt: '2026-11-01T18:00:00.000Z',
            endsAt: '2026-11-01T22:00:00.000Z'
        };

        await updateTicketEvent('event-id', payload);

        expect(fetch).toHaveBeenCalledWith(
            `${config.API_BASE_URL}/admin/ticketing/events/event-id`,
            expect.objectContaining({ method: 'PUT', body: JSON.stringify(payload) })
        );
    });

    test('sends ticket type updates scoped directly to the event', async () => {
        setUserPrivileges(['WRITE_TICKETING']);

        await updateTicketType('event-id', 'ticket-id', { name: 'General', priceInCents: 450, capacity: 100 });

        expect(fetch).toHaveBeenNthCalledWith(
            1,
            `${config.API_BASE_URL}/admin/ticketing/events/event-id/ticket-types/ticket-id`,
            expect.objectContaining({ method: 'PUT' })
        );
    });

    test('does not call the backend without write privilege', async () => {
        setUserPrivileges(['READ_TICKETING']);

        await expect(updateTicketEvent('event-id', {})).rejects.toMatchObject({ status: 403 });

        expect(fetch).not.toHaveBeenCalled();
    });

    test('loads a ticket type page using the shared pagination contract', async () => {
        setUserPrivileges(['READ_TICKETING']);
        await getTicketTypes('event-id', 1, 15);

        expect(fetch).toHaveBeenNthCalledWith(
            1,
            `${config.API_BASE_URL}/admin/ticketing/events/event-id/ticket-types?page=1&size=15`,
            expect.objectContaining({ method: 'GET' })
        );
    });
});
