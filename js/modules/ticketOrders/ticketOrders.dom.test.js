import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DOMRefs, renderOrderDetail, renderOrders } from './ticketOrders.dom.js';

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
        expect(document.querySelector('#ticketOrdersTableBody td')?.dataset.label).toBe('Cliente');
    });

    test('shows the empty state when there are no orders', () => {
        renderOrders([], vi.fn());

        expect(DOMRefs.refs.empty.classList.contains('hide')).toBe(false);
        expect(DOMRefs.refs.empty.textContent).toContain('No hay órdenes');
        expect(DOMRefs.refs.tableBody.children).toHaveLength(0);
    });

    test('shows the order summary without repeating event data for every line', () => {
        document.body.innerHTML = `
            <div id="ticketOrdersLoader"></div>
            <table><tbody id="ticketOrdersTableBody"></tbody></table>
            <div id="ticketOrdersEmpty"></div>
            <div id="ticketOrderDetailModal"></div>
            <button id="btnCloseTicketOrderDetail"></button>
            <h2 id="ticketOrderDetailTitle"></h2>
            <p id="ticketOrderDetailCustomer"></p>
            <span id="ticketOrderDetailStatus"></span>
            <div id="ticketOrderFacts"></div>
            <strong id="ticketOrderDetailTotal"></strong>
            <div id="ticketOrderLines"></div>
            <div id="ticketOrderPayments"></div>
            <button id="btnOpenCashSaleVoid"></button>
            <div id="cashSaleVoidModal"></div>
            <button id="btnCloseCashSaleVoid"></button>
            <button id="btnCancelCashSaleVoid"></button>
            <form id="cashSaleVoidForm"></form>
            <textarea id="cashSaleVoidReason"></textarea>
            <div id="ticketOrderTickets"></div>
            <span id="ticketOrderTicketCount"></span>`;
        DOMRefs.init();

        renderOrderDetail({
            customerName: 'Leonardo Mejía',
            customerEmail: 'leonardo@example.com',
            status: 'PAID',
            createdAt: '2026-11-09T18:50:00Z',
            amountInCents: 400,
            currency: 'USD',
            lines: [{
                quantity: 1,
                ticketTypeName: 'General',
                unitPriceInCents: 400,
                eventName: 'Copa Leal Import Car',
                eventVenue: 'Autódromo Internacional El Jabalí',
                eventStartsAt: '2026-11-10T18:00:00Z'
            }],
            payments: [{
                status: 'APPROVED',
                paymentMethod: 'WOMPI',
                amountInCents: 400,
                currency: 'USD',
                paidAt: '2026-11-09T18:51:00Z'
            }],
            tickets: []
        });

        const line = document.querySelector('.ticketOrderLine');
        expect(line?.textContent).toContain('$4.00 por boleto');
        expect(line?.textContent).not.toContain('Autódromo');
        expect(line?.querySelector('b')).toBeNull();
        expect(document.querySelector('.ticketOrderRecordHeader strong')?.textContent).toBe('Wompi');
        expect(document.querySelector('.ticketOrderRecordHeader .ticketOrderBadge')?.textContent).toBe('Aprobado');
    });
});
