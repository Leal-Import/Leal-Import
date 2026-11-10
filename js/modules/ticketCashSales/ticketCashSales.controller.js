import { createModuleInitializer } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { getTicketEvents, getTicketTypes } from '../ticketing/ticketing.service.js';
import { confirmCashSale, quoteCashSale } from './ticketCashSales.service.js';
import { createIdempotencyKey, selectedLines, toMinorUnits, validateSaleInput } from './ticketCashSales.logic.js';
import { DOMRefs, clearMessage, clearQuote, renderCashReceived, renderEvents, renderQuote, renderSuccess, renderTicketTypes, renderTicketTypesInitial, renderTicketTypesLoading, resetView, showMessage } from './ticketCashSales.dom.js';
import { resetTicketCashSalesState, ticketCashSalesState } from './ticketCashSales.state.js';

const PAGE_SIZE = 30;

const pageData = (response) => response?.data ?? response;

const loadAllPages = async (requestPage, page = 0) => {
    const response = pageData(await requestPage(page));
    const items = response.content || [];
    const totalPages = response.page?.totalPages || 1;
    if (page + 1 >= totalPages) return items;
    return [...items, ...(await loadAllPages(requestPage, page + 1))];
};

const activeEvents = (events) => events.filter((event) => event.active);

const saleInput = () => ({
    customerName: DOMRefs.refs.customerName.value.trim(),
    customerEmail: DOMRefs.refs.customerEmail.value.trim(),
    lines: selectedLines(ticketCashSalesState.ticketTypes)
});

const invalidateQuote = () => {
    ticketCashSalesState.quote = null;
    ticketCashSalesState.idempotencyKey = null;
    clearQuote();
};

const loadTicketTypes = async (eventId) => {
    ticketCashSalesState.ticketTypes = [];
    invalidateQuote();
    if (!eventId) {
        renderTicketTypes([]);
        return;
    }
    renderTicketTypesLoading();
    const ticketTypes = await loadAllPages((page) => getTicketTypes(eventId, page, PAGE_SIZE));
    ticketCashSalesState.ticketTypes = ticketTypes
        .filter((ticketType) => ticketType.active && ticketType.availableQuantity > 0)
        .map((ticketType) => ({ ...ticketType, quantity: 0 }));
    renderTicketTypes(ticketCashSalesState.ticketTypes);
};

const loadEvents = async () => {
    try {
        const events = await loadAllPages((page) => getTicketEvents(page, PAGE_SIZE));
        ticketCashSalesState.events = activeEvents(events);
        renderEvents(ticketCashSalesState.events, ticketCashSalesState.selectedEventId);
        if (!ticketCashSalesState.events.length) {
            renderTicketTypes([]);
            showMessage('No hay eventos activos disponibles para venta.', 'info');
            return;
        }
        renderTicketTypesInitial();
    } catch (error) {
        renderEvents([], '');
        renderTicketTypes([]);
        await handleApiError(error);
    }
};

const calculateQuote = async (event) => {
    event.preventDefault();
    clearMessage();
    const input = saleInput();
    const validation = validateSaleInput(input);
    if (validation) {
        showMessage(validation, 'error');
        return;
    }
    const submitter = event.submitter;
    submitter.disabled = true;
    submitter.textContent = 'Calculando...';
    try {
        const quote = await quoteCashSale(input);
        ticketCashSalesState.quote = quote;
        renderQuote(quote);
        showMessage('Disponibilidad y total verificados. Ya puedes registrar el efectivo recibido.', 'success');
    } catch (error) {
        invalidateQuote();
        await handleApiError(error);
    } finally {
        submitter.disabled = false;
        submitter.textContent = 'Calcular total';
    }
};

const updateCashReceived = () => {
    const quote = ticketCashSalesState.quote;
    if (!quote) return;
    renderCashReceived(
        toMinorUnits(DOMRefs.refs.cashReceived.value),
        quote.totalAmountInCents,
        quote.currency
    );
};

const confirmSale = async () => {
    const quote = ticketCashSalesState.quote;
    if (!quote) return;
    const input = saleInput();
    const validation = validateSaleInput(input);
    const cashReceivedInCents = toMinorUnits(DOMRefs.refs.cashReceived.value);
    if (validation || !Number.isSafeInteger(cashReceivedInCents) || cashReceivedInCents < quote.totalAmountInCents) {
        showMessage(validation || 'El efectivo recibido no cubre el total de la venta.', 'error');
        return;
    }

    ticketCashSalesState.idempotencyKey ||= createIdempotencyKey();
    const button = DOMRefs.refs.confirm;
    button.disabled = true;
    button.textContent = 'Confirmando venta...';
    try {
        const response = await confirmCashSale({
            ...input,
            cashReceivedInCents,
            idempotencyKey: ticketCashSalesState.idempotencyKey
        });
        ticketCashSalesState.success = response;
        renderSuccess(response, input.customerName, input.customerEmail);
    } catch (error) {
        await handleApiError(error);
        updateCashReceived();
    } finally {
        button.textContent = 'Confirmar venta y emitir boletos';
    }
};

const onTicketQuantityChange = (event) => {
    const input = event.target.closest('[data-ticket-type-id]');
    if (!input) return;
    const ticketType = ticketCashSalesState.ticketTypes.find((item) => item.id === input.dataset.ticketTypeId);
    if (!ticketType) return;
    const quantity = Number(input.value);
    ticketType.quantity = Number.isInteger(quantity)
        ? Math.min(Math.max(quantity, 0), ticketType.availableQuantity)
        : 0;
    input.value = String(ticketType.quantity);
    invalidateQuote();
};

const initialize = () => {
    DOMRefs.refs.form.addEventListener('submit', calculateQuote);
    DOMRefs.refs.event.addEventListener('change', async (event) => {
        ticketCashSalesState.selectedEventId = event.target.value;
        clearMessage();
        try {
            await loadTicketTypes(ticketCashSalesState.selectedEventId);
        } catch (error) {
            renderTicketTypes([]);
            await handleApiError(error);
        }
    });
    DOMRefs.refs.ticketTypes.addEventListener('change', onTicketQuantityChange);
    DOMRefs.refs.customerName.addEventListener('input', invalidateQuote);
    DOMRefs.refs.customerEmail.addEventListener('input', invalidateQuote);
    DOMRefs.refs.cashReceived.addEventListener('input', updateCashReceived);
    DOMRefs.refs.confirm.addEventListener('click', confirmSale);
    DOMRefs.refs.newSale.addEventListener('click', async () => {
        resetTicketCashSalesState();
        resetView();
        renderEvents(ticketCashSalesState.events, '');
        renderTicketTypes([]);
        await loadEvents();
        DOMRefs.refs.customerName.focus();
    });
};

const init = createModuleInitializer({
    resetState: resetTicketCashSalesState,
    initialize,
    load: loadEvents,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
