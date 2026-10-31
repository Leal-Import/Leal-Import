import { beforeEach, describe, expect, test, vi } from 'vitest';
import config from '../../config.js';
import { setUserPrivileges, clearUserPrivileges } from '../../utils/privilegesValidator.js';
import { updateTicketEvent, updateTicketZone, updateTicketType } from './ticketing.service.js';

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
            endsAt: '2026-11-01T22:00:00.000Z',
            refundPolicy: 'No reembolsable'
        };

        await updateTicketEvent('event-id', payload);

        expect(fetch).toHaveBeenCalledWith(
            `${config.API_BASE_URL}/admin/ticketing/events/event-id`,
            expect.objectContaining({ method: 'PUT', body: JSON.stringify(payload) })
        );
    });

    test('sends zone and ticket type updates to their scoped endpoints', async () => {
        setUserPrivileges(['WRITE_TICKETING']);

        await updateTicketZone('event-id', 'zone-id', { name: 'General', capacity: 300 });
        await updateTicketType('zone-id', 'ticket-id', { name: 'VIP', priceInCents: 450, capacity: 100 });

        expect(fetch).toHaveBeenNthCalledWith(
            1,
            `${config.API_BASE_URL}/admin/ticketing/events/event-id/zones/zone-id`,
            expect.objectContaining({ method: 'PUT' })
        );
        expect(fetch).toHaveBeenNthCalledWith(
            2,
            `${config.API_BASE_URL}/admin/ticketing/zones/zone-id/ticket-types/ticket-id`,
            expect.objectContaining({ method: 'PUT' })
        );
    });

    test('does not call the backend without write privilege', async () => {
        setUserPrivileges(['READ_TICKETING']);

        await expect(updateTicketEvent('event-id', {})).rejects.toMatchObject({ status: 403 });

        expect(fetch).not.toHaveBeenCalled();
    });
});
