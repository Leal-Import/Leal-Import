import { describe, expect, test } from 'vitest';
import { isoToLocalDateTime, mapTicketTypeForm } from './ticketing.logic.js';

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
});
