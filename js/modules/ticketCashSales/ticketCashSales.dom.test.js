import { beforeEach, describe, expect, test } from 'vitest';
import {
    DOMRefs,
    renderSuccess,
    renderTicketTypesInitial,
    showMessage
} from './ticketCashSales.dom.js';

const renderFixture = () => {
    document.body.innerHTML = `
        <section id="cashSaleWorkspace" class=""></section>
        <form id="cashSaleForm"></form>
        <input id="cashSaleCustomerName">
        <input id="cashSaleCustomerEmail">
        <select id="cashSaleEvent"></select>
        <div id="cashSaleTicketTypes"></div>
        <div id="cashSaleMessage"></div>
        <div id="cashSaleQuoteEmpty"></div>
        <div id="cashSaleQuote" class="hide"></div>
        <span id="cashSaleQuoteEventName"></span>
        <span id="cashSaleQuoteEventMeta"></span>
        <div id="cashSaleQuoteLines"></div>
        <strong id="cashSaleQuoteTotal"></strong>
        <input id="cashSaleCashReceived">
        <small id="cashSaleChangeHint"></small>
        <button id="btnConfirmCashSale"></button>
        <section id="cashSaleReceipt" class="hide"></section>
        <p id="cashSaleReceiptDescription"></p>
        <div id="cashSaleReceiptFacts"></div>
        <div id="cashSaleIssuedTickets"></div>
        <button id="btnNewCashSale"></button>
    `;
    DOMRefs.init();
};

describe('ticket cash sale rendering', () => {
    beforeEach(() => {
        renderFixture();
    });

    test('replaces the loading state after the event catalog is available', () => {
        renderTicketTypesInitial();

        expect(DOMRefs.refs.ticketTypes.textContent).toContain('Selecciona un evento');
        expect(DOMRefs.refs.ticketTypes.textContent).not.toContain('Cargando eventos');
    });

    test('renders the confirmation receipt and keeps technical identifiers hidden', () => {
        const response = {
            orderId: 'order-internal-uuid',
            payment: { amountInCents: 1000, changeInCents: 500, currency: 'USD' },
            tickets: [
                {
                    ticketNumber: 1,
                    ticketId: 'ticket-internal-uuid',
                    ticketTypeName: 'General',
                    eventName: 'Copa Leal'
                }
            ]
        };

        renderSuccess(response, 'Ana Pérez', 'ana@example.com');

        expect(DOMRefs.refs.workspace.classList.contains('hide')).toBe(true);
        expect(DOMRefs.refs.receipt.classList.contains('hide')).toBe(false);
        expect(DOMRefs.refs.receiptDescription.textContent).toContain('ana@example.com');
        expect(DOMRefs.refs.receiptFacts.textContent).toContain('$10.00');
        expect(DOMRefs.refs.receiptFacts.textContent).toContain('$5.00');
        expect(DOMRefs.refs.issuedTickets.textContent).toContain('Boleto #1');
        expect(DOMRefs.refs.receipt.textContent).not.toContain('order-internal-uuid');
        expect(DOMRefs.refs.receipt.textContent).not.toContain('ticket-internal-uuid');
    });

    test('shows a visible error state when the sale cannot be completed', () => {
        showMessage('No se pudo confirmar la venta en efectivo', 'error');

        expect(DOMRefs.refs.message.textContent).toBe('No se pudo confirmar la venta en efectivo');
        expect(DOMRefs.refs.message.className).toContain('cashSaleMessageError');
    });
});
