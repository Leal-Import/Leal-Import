import { $ } from '../../utils/dom.js';
import { formatCurrencyFromCents, formatDateTime } from '../../utils/formatters.js';

export const DOMRefs = {
    refs: {},
    init() {
        this.refs = {
            loader: $('ticketOrdersLoader'),
            tableBody: $('ticketOrdersTableBody'),
            empty: $('ticketOrdersEmpty'),
            detailModal: $('ticketOrderDetailModal'),
            closeDetail: $('btnCloseTicketOrderDetail'),
            detailTitle: $('ticketOrderDetailTitle'),
            detailCustomer: $('ticketOrderDetailCustomer'),
            detailStatus: $('ticketOrderDetailStatus'),
            facts: $('ticketOrderFacts'),
            detailTotal: $('ticketOrderDetailTotal'),
            lines: $('ticketOrderLines'),
            payments: $('ticketOrderPayments'),
            openCashSaleVoid: $('btnOpenCashSaleVoid'),
            voidModal: $('cashSaleVoidModal'),
            closeCashSaleVoid: $('btnCloseCashSaleVoid'),
            cancelCashSaleVoid: $('btnCancelCashSaleVoid'),
            voidForm: $('cashSaleVoidForm'),
            voidReason: $('cashSaleVoidReason'),
            tickets: $('ticketOrderTickets'),
            ticketCount: $('ticketOrderTicketCount')
        };
        return this.refs;
    }
};

const text = (value, fallback = 'No disponible') => {
    const element = document.createElement('span');
    element.textContent = value === null || value === undefined || value === '' ? fallback : value;
    return element;
};

const statusLabel = (status) => ({
    RESERVED: 'Reservada',
    PENDING_PAYMENT: 'Pago pendiente',
    PAID: 'Pagada',
    EXPIRED: 'Vencida',
    CANCELLED: 'Anulada'
}[status] || status || 'Sin estado');

const paymentStatusLabel = (status) => ({
    PENDING: 'Pendiente', CONFIRMED: 'Confirmado', APPROVED: 'Aprobado', DECLINED: 'Rechazado', VOIDED: 'Anulado', ERROR: 'Error'
}[status] || status || 'Sin estado');

const paymentMethodLabel = (method) => ({
    CASH: 'Efectivo',
    WOMPI: 'Wompi'
}[method] || method || 'Método no informado');

const createInfoItem = (label, value) => {
    const item = document.createElement('div');
    item.className = 'ticketOrderFact';
    const caption = document.createElement('span');
    caption.textContent = label;
    item.append(caption, text(value));
    return item;
};

const createStatus = (label, value) => {
    const badge = document.createElement('span');
    badge.className = `ticketOrderBadge ticketOrderBadge-${String(value || '').toLowerCase()}`;
    badge.textContent = label;
    return badge;
};

const createTableCell = (label) => {
    const cell = document.createElement('td');
    cell.dataset.label = label;
    return cell;
};

export const setLoading = (loading) => DOMRefs.refs.loader.classList.toggle('hide', !loading);

export const renderOrders = (orders, onOpenActions) => {
    const { tableBody, empty } = DOMRefs.refs;
    tableBody.textContent = '';
    empty.classList.toggle('hide', orders.length > 0);
    if (!orders.length) {
        empty.textContent = 'No hay órdenes de boletos registradas.';
        return;
    }

    orders.forEach((order) => {
        const row = document.createElement('tr');
        const customerCell = createTableCell('Cliente');
        customerCell.appendChild(text(order.customerEmail));
        const eventCell = createTableCell('Evento');
        eventCell.appendChild(text(order.eventName));
        const eventVenue = document.createElement('small');
        eventVenue.textContent = order.eventVenue || 'Sin lugar';
        eventCell.appendChild(eventVenue);
        const ticketsCell = createTableCell('Boletos');
        ticketsCell.textContent = order.totalTickets;
        const amountCell = createTableCell('Total');
        amountCell.textContent = formatCurrencyFromCents(order.amountInCents, order.currency);
        const statusCell = createTableCell('Estado');
        statusCell.appendChild(createStatus(statusLabel(order.status), order.status));
        const dateCell = createTableCell('Fecha');
        dateCell.textContent = formatDateTime(order.createdAt);
        const actionsCell = createTableCell('Acción');
        actionsCell.className = 'tableResponsiveAction';
        const actionsButton = document.createElement('button');
        actionsButton.type = 'button';
        actionsButton.className = 'ticketOrderActions';
        actionsButton.dataset.action = 'order-actions';
        actionsButton.dataset.id = order.id;
        actionsButton.setAttribute('aria-label', 'Acciones de la orden');
        actionsButton.textContent = '⋯';
        actionsButton.addEventListener('click', (event) => {
            event.stopPropagation();
            onOpenActions(actionsButton, order.id);
        });
        actionsCell.appendChild(actionsButton);
        row.append(customerCell, eventCell, ticketsCell, amountCell, statusCell, dateCell, actionsCell);
        tableBody.appendChild(row);
    });
};

export const renderOrderDetail = (order) => {
    const refs = DOMRefs.refs;
    const primaryLine = order.lines[0];
    refs.detailTitle.textContent = 'Detalle de compra';
    refs.detailCustomer.textContent = order.customerName
        ? `${order.customerName} · ${order.customerEmail}`
        : order.customerEmail;
    refs.detailStatus.textContent = statusLabel(order.status);
    refs.detailStatus.className = `ticketOrderStatus ticketOrderBadge-${String(order.status || '').toLowerCase()}`;
    refs.facts.replaceChildren(
        createInfoItem('Evento', [primaryLine?.eventName, primaryLine?.eventVenue].filter(Boolean).join(' · ')),
        createInfoItem('Fecha del evento', formatDateTime(primaryLine?.eventStartsAt)),
        createInfoItem('Compra registrada', formatDateTime(order.createdAt)),
        createInfoItem('Cantidad de boletos', order.lines.reduce((total, line) => total + line.quantity, 0))
    );
    refs.detailTotal.textContent = formatCurrencyFromCents(order.amountInCents, order.currency);
    refs.lines.replaceChildren();
    const hasMultipleLines = order.lines.length > 1;
    order.lines.forEach((line) => {
        const item = document.createElement('div');
        item.className = 'ticketOrderLine';
        const title = document.createElement('strong');
        title.textContent = `${line.quantity} × ${line.ticketTypeName}`;
        const meta = document.createElement('span');
        meta.textContent = `${formatCurrencyFromCents(line.unitPriceInCents, order.currency)} por boleto`;
        const price = document.createElement('b');
        price.textContent = formatCurrencyFromCents(line.quantity * line.unitPriceInCents, order.currency);
        item.append(document.createElement('div'));
        item.firstChild.append(title, meta);
        if (hasMultipleLines) item.appendChild(price);
        refs.lines.appendChild(item);
    });
    refs.payments.replaceChildren();
    if (!order.payments.length) {
        const emptyPayment = text('No hay pagos registrados para esta orden.');
        emptyPayment.className = 'ticketOrderEmptyRecord';
        refs.payments.appendChild(emptyPayment);
    } else {
        order.payments.forEach((payment) => {
            const item = document.createElement('div');
            item.className = 'ticketOrderRecord';
            const header = document.createElement('div');
            header.className = 'ticketOrderRecordHeader';
            const title = document.createElement('strong');
            title.textContent = paymentMethodLabel(payment.paymentMethod);
            header.append(title, createStatus(paymentStatusLabel(payment.status), payment.status));
            const meta = document.createElement('span');
            const details = [
                formatCurrencyFromCents(payment.amountInCents, payment.currency),
                formatDateTime(payment.paidAt || payment.createdAt)
            ];
            if (payment.paymentMethod === 'CASH' && payment.cashReceivedInCents !== null) {
                details.push(`Recibido: ${formatCurrencyFromCents(payment.cashReceivedInCents, payment.currency)}`);
                details.push(`Cambio: ${formatCurrencyFromCents(payment.changeInCents || 0, payment.currency)}`);
            }
            meta.textContent = details.join(' · ');
            item.append(header, meta);
            refs.payments.appendChild(item);
        });
    }
    refs.tickets.replaceChildren();
    refs.ticketCount.textContent = `${order.tickets.length} emitidos`;
    if (!order.tickets.length) {
        const emptyTickets = text('Todavía no se han emitido boletos.');
        emptyTickets.className = 'ticketOrderEmptyRecord';
        refs.tickets.appendChild(emptyTickets);
    } else {
        order.tickets.forEach((ticket) => {
            const item = document.createElement('div');
            item.className = 'ticketOrderRecord';
            const title = document.createElement('strong');
            title.textContent = `Boleto #${ticket.ticketNumber} · ${ticket.ticketTypeName}`;
            const meta = document.createElement('span');
            meta.textContent = `${ticket.status === 'USED' ? 'Utilizado' : ticket.status === 'ISSUED' ? 'Emitido' : ticket.status} · ${formatDateTime(ticket.issuedAt)}`;
            item.append(title, meta);
            refs.tickets.appendChild(item);
        });
    }
};

export const setCashSaleVoidAvailable = (available) => {
    DOMRefs.refs.openCashSaleVoid.classList.toggle('hide', !available);
};

export const renderOrdersError = () => {
    DOMRefs.refs.tableBody.textContent = '';
    DOMRefs.refs.empty.classList.remove('hide');
    DOMRefs.refs.empty.textContent = 'No se pudieron cargar las órdenes. Revisa tus permisos o la conexión.';
};
