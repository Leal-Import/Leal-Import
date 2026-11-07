import { describe, expect, test } from 'vitest';
import { isoToLocalDateTime, mapEventForm, mapTicketTypeForm } from './ticketing.logic.js';

describe('ticketing form contract', () => {
    test('keeps ticket prices in cents for the backend contract', () => {
        expect(mapTicketTypeForm({ name: 'VIP', price: '4.50', capacity: '100' })).toEqual({
            name: 'VIP',
            priceInCents: 450,
            capacity: 100
        });
    });

    test('converts backend ISO dates to datetime-local values', () => {
        expect(isoToLocalDateTime('2026-11-01T18:05:00.000Z')).toMatch(/^2026-11-01T\d{2}:05$/);
    });

    test('maps an event without a refund policy', () => {
        expect(mapEventForm({
            name: 'Concierto',
            venue: 'Auditorio',
            startsAt: '2026-11-01T18:00',
            endsAt: '2026-11-01T22:00'
        })).toEqual({
            name: 'Concierto',
            venue: 'Auditorio',
            startsAt: new Date('2026-11-01T18:00').toISOString(),
            endsAt: new Date('2026-11-01T22:00').toISOString()
        });
    });

    test('keeps the preview safe while an empty ticket form is reset', () => {
        expect(mapTicketTypeForm({})).toEqual({
            name: '',
            priceInCents: Number.NaN,
            capacity: Number.NaN
        });
    });
});
