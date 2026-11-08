import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DOMRefs, renderOrders } from './ticketOrders.dom.js';

describe('ticket orders rendering', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="ticketOrdersLoader"></div>
            <table><tbody id="ticketOrdersTableBody"></tbody></table>
            <div id="ticketOrdersEmpty"></div>`;
        DOMRefs.init();
    });

    test('renders order information and actions with DOM nodes', () => {
        const onOpenActions = vi.fn();

        renderOrders([{
            id: 'order-1',
            customerEmail: 'buyer@example.com',
            eventName: 'Copa Leal',
            eventVenue: 'Autódromo',
            totalTickets: 2,
            amountInCents: 900,
            currency: 'USD',
            status: 'PAID',
            createdAt: '2026-11-07T18:00:00Z'
        }], onOpenActions);

        expect(document.querySelector('#ticketOrdersTableBody tr')).not.toBeNull();
        expect(document.querySelector('.ticketOrderActions')).not.toBeNull();
        expect(document.querySelector('#ticketOrdersTableBody').textContent).toContain('Copa Leal');
        expect(document.querySelector('#ticketOrdersTableBody').textContent).toContain('$9.00');
    });

    test('shows the empty state when there are no orders', () => {
        renderOrders([], vi.fn());

        expect(DOMRefs.refs.empty.classList.contains('hide')).toBe(false);
        expect(DOMRefs.refs.empty.textContent).toContain('No hay órdenes');
        expect(DOMRefs.refs.tableBody.children).toHaveLength(0);
    });
});
