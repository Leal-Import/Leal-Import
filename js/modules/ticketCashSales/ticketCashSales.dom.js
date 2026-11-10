import { $ } from '../../utils/dom.js';
import { formatCurrencyFromCents, formatDateTime } from '../../utils/formatters.js';

export const DOMRefs = {
    refs: {},
    init() {
        this.refs = {
            workspace: $('cashSaleWorkspace'),
            form: $('cashSaleForm'),
            customerName: $('cashSaleCustomerName'),
            customerEmail: $('cashSaleCustomerEmail'),
            event: $('cashSaleEvent'),
            ticketTypes: $('cashSaleTicketTypes'),
            message: $('cashSaleMessage'),
            quoteEmpty: $('cashSaleQuoteEmpty'),
            quote: $('cashSaleQuote'),
            quoteEventName: $('cashSaleQuoteEventName'),
            quoteEventMeta: $('cashSaleQuoteEventMeta'),
            quoteLines: $('cashSaleQuoteLines'),
            quoteTotal: $('cashSaleQuoteTotal'),
            cashReceived: $('cashSaleCashReceived'),
            changeHint: $('cashSaleChangeHint'),
            confirm: $('btnConfirmCashSale'),
            receipt: $('cashSaleReceipt'),
            receiptDescription: $('cashSaleReceiptDescription'),
            receiptFacts: $('cashSaleReceiptFacts'),
            issuedTickets: $('cashSaleIssuedTickets'),
            newSale: $('btnNewCashSale')
        };
        return this.refs;
    }
};

const element = (tagName, className, value) => {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
};

const setVisibility = (node, visible) => node.classList.toggle('hide', !visible);

export const renderEvents = (events, selectedEventId) => {
    const select = DOMRefs.refs.event;
    select.replaceChildren();
    const defaultOption = element('option', '', events.length ? 'Selecciona un evento' : 'No hay eventos activos');
    defaultOption.value = '';
    select.append(defaultOption);
    events.forEach((event) => {
        const option = element('option', '', event.name);
        option.value = event.id;
        option.selected = event.id === selectedEventId;
        select.append(option);
    });
    select.disabled = !events.length;
};

export const renderTicketTypesLoading = () => {
    DOMRefs.refs.ticketTypes.replaceChildren(
        element('div', 'cashSaleInlineState', 'Cargando boletos disponibles...')
    );
};

export const renderTicketTypesInitial = () => {
    DOMRefs.refs.ticketTypes.replaceChildren(
        element('div', 'cashSaleInlineState', 'Selecciona un evento para ver los boletos disponibles.')
    );
};

export const renderTicketTypes = (ticketTypes) => {
    const container = DOMRefs.refs.ticketTypes;
    container.replaceChildren();
    if (!ticketTypes.length) {
        container.append(element('div', 'cashSaleInlineState', 'Este evento no tiene boletos disponibles para venta.'));
        return;
    }

    ticketTypes.forEach((ticketType) => {
        const row = element('div', 'cashSaleTicketType');
        const details = element('div', 'cashSaleTicketTypeDetails');
        details.append(
            element('strong', '', ticketType.name),
            element(
                'span',
                '',
                `${formatCurrencyFromCents(ticketType.priceInCents)} · ${ticketType.availableQuantity.toLocaleString('es-SV')} disponibles`
            )
        );

        const quantityGroup = element('div', 'cashSaleQuantity');
        const input = document.createElement('input');
        input.id = `ticketTypeQuantity-${ticketType.id}`;
        input.className = 'txtInputs';
        input.type = 'number';
        input.min = '0';
        input.max = String(ticketType.availableQuantity);
        input.step = '1';
        input.inputMode = 'numeric';
        input.value = String(ticketType.quantity || 0);
        input.dataset.ticketTypeId = ticketType.id;
        input.setAttribute('aria-label', `Cantidad para ${ticketType.name}`);
        quantityGroup.append(input);
        row.append(details, quantityGroup);
        container.append(row);
    });
};

export const renderQuote = (quote) => {
    const refs = DOMRefs.refs;
    setVisibility(refs.quoteEmpty, false);
    setVisibility(refs.quote, true);
    refs.quoteEventName.textContent = quote.eventName;
    refs.quoteEventMeta.textContent = `${quote.eventVenue} · ${formatDateTime(quote.eventStartsAt)}`;
    refs.quoteLines.replaceChildren();
    quote.lines.forEach((line) => {
        const row = element('div', 'cashSaleQuoteLine');
        row.append(
            element('span', '', `${line.quantity} × ${line.ticketTypeName}`),
            element('strong', '', formatCurrencyFromCents(line.subtotalInCents, quote.currency))
        );
        refs.quoteLines.append(row);
    });
    refs.quoteTotal.textContent = formatCurrencyFromCents(quote.totalAmountInCents, quote.currency);
    refs.cashReceived.value = '';
    refs.cashReceived.disabled = false;
    refs.confirm.disabled = true;
    refs.changeHint.textContent = 'Ingresa el monto recibido para calcular el cambio.';
};

export const clearQuote = () => {
    const refs = DOMRefs.refs;
    setVisibility(refs.quoteEmpty, true);
    setVisibility(refs.quote, false);
    refs.cashReceived.value = '';
    refs.cashReceived.disabled = true;
    refs.confirm.disabled = true;
};

export const renderCashReceived = (cashReceivedInCents, totalInCents, currency) => {
    const refs = DOMRefs.refs;
    if (!Number.isSafeInteger(cashReceivedInCents) || cashReceivedInCents <= 0) {
        refs.changeHint.textContent = 'Ingresa el monto recibido para calcular el cambio.';
        refs.confirm.disabled = true;
        return;
    }
    if (cashReceivedInCents < totalInCents) {
        refs.changeHint.textContent = `Faltan ${formatCurrencyFromCents(totalInCents - cashReceivedInCents, currency)} para completar el pago.`;
        refs.confirm.disabled = true;
        return;
    }
    refs.changeHint.textContent = `Cambio a entregar: ${formatCurrencyFromCents(cashReceivedInCents - totalInCents, currency)}.`;
    refs.confirm.disabled = false;
};

export const showMessage = (message, type = 'info') => {
    const node = DOMRefs.refs.message;
    node.textContent = message;
    const typeClass = {
        error: 'cashSaleMessageError',
        success: 'cashSaleMessageSuccess',
        info: 'cashSaleMessageInfo'
    }[type] || 'cashSaleMessageInfo';
    node.className = `cashSaleMessage ${typeClass}`;
};

export const clearMessage = () => {
    const node = DOMRefs.refs.message;
    node.textContent = '';
    node.className = 'cashSaleMessage hide';
};

const fact = (label, value) => {
    const node = element('div', 'cashSaleReceiptFact');
    node.append(element('span', '', label), element('strong', '', value));
    return node;
};

export const renderSuccess = (response, buyerName, buyerEmail) => {
    const refs = DOMRefs.refs;
    setVisibility(refs.workspace, false);
    setVisibility(refs.receipt, true);
    refs.receiptDescription.textContent = `La compra de ${buyerName} quedó confirmada. El acceso a los boletos se enviará a ${buyerEmail}.`;
    refs.receiptFacts.replaceChildren(
        fact('Total cobrado', formatCurrencyFromCents(response.payment.amountInCents, response.payment.currency)),
        fact('Cambio entregado', formatCurrencyFromCents(response.payment.changeInCents || 0, response.payment.currency)),
        fact('Boletos emitidos', String(response.tickets.length))
    );
    refs.issuedTickets.replaceChildren();
    response.tickets.forEach((ticket) => {
        const node = element('div', 'cashSaleIssuedTicket');
        node.append(
            element('strong', '', `Boleto #${ticket.ticketNumber}`),
            element('span', '', `${ticket.ticketTypeName} · ${ticket.eventName}`)
        );
        refs.issuedTickets.append(node);
    });
};

export const resetView = () => {
    const refs = DOMRefs.refs;
    setVisibility(refs.workspace, true);
    setVisibility(refs.receipt, false);
    refs.form.reset();
    clearQuote();
    clearMessage();
};
