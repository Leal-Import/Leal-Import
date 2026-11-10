import { describe, expect, test } from 'vitest';
import { selectedLines, toMinorUnits, validateSaleInput } from './ticketCashSales.logic.js';

describe('ticket cash sale contract', () => {
    test('converts cash input to cents without floating point arithmetic', () => {
        expect(toMinorUnits('12.50')).toBe(1250);
        expect(toMinorUnits('1.5')).toBe(150);
        expect(toMinorUnits('12.555')).toBe(Number.NaN);
    });

    test('sends only ticket types with a positive integer quantity', () => {
        expect(selectedLines([
            { id: 'general', quantity: 2 },
            { id: 'vip', quantity: 0 },
            { id: 'invalid', quantity: 1.5 }
        ])).toEqual([{ ticketTypeId: 'general', quantity: 2 }]);
    });

    test('requires buyer information and at least one selected ticket', () => {
        expect(validateSaleInput({
            customerName: '',
            customerEmail: 'buyer@example.com',
            lines: [{ ticketTypeId: 'general', quantity: 1 }]
        })).toContain('nombre');
        expect(validateSaleInput({
            customerName: 'Ana',
            customerEmail: 'buyer@example.com',
            lines: []
        })).toContain('boleto');
    });
});
