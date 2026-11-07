export const DOMRefs = {
    refs: {},
    init() {
        this.refs = {
            loader: document.getElementById('ticketOrdersLoader'),
            tableBody: document.getElementById('ticketOrdersTableBody'),
            empty: document.getElementById('ticketOrdersEmpty'),
            pagination: document.getElementById('ticketOrdersPaginationButtons'),
            detailModal: document.getElementById('ticketOrderDetailModal'),
            closeDetail: document.getElementById('btnCloseTicketOrderDetail'),
            detailTitle: document.getElementById('ticketOrderDetailTitle'),
            detailCustomer: document.getElementById('ticketOrderDetailCustomer'),
            detailStatus: document.getElementById('ticketOrderDetailStatus'),
            facts: document.getElementById('ticketOrderFacts'),
            detailTotal: document.getElementById('ticketOrderDetailTotal'),
            lines: document.getElementById('ticketOrderLines'),
            payments: document.getElementById('ticketOrderPayments'),
            tickets: document.getElementById('ticketOrderTickets'),
            ticketCount: document.getElementById('ticketOrderTicketCount'),
            sizeSelect: document.getElementById('ticketOrdersSizeSelect'),
            paginationInfo: document.querySelector('.ticketOrdersPagination .paginationInfo')
        };
        return this.refs;
    }
};

const text = (value, fallback = 'No disponible') => {
    const element = document.createElement('span');
    element.textContent = value === null || value === undefined || value === '' ? fallback : value;
    return element;
};

const formatMoney = (cents, currency = 'USD') => new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2
}).format((cents || 0) / 100);

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'No disponible';

const statusLabel = (status) => ({
    RESERVED: 'Reservada',
    PENDING_PAYMENT: 'Pago pendiente',
    PAID: 'Pagada',
    EXPIRED: 'Vencida'
}[status] || status || 'Sin estado');

const paymentStatusLabel = (status) => ({
    PENDING: 'Pendiente', APPROVED: 'Aprobado', DECLINED: 'Rechazado', VOIDED: 'Anulado', ERROR: 'Error'
}[status] || status || 'Sin estado');

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
        const customerCell = document.createElement('td');
        customerCell.appendChild(text(order.customerEmail));
        const eventCell = document.createElement('td');
        eventCell.appendChild(text(order.eventName));
        const eventVenue = document.createElement('small');
        eventVenue.textContent = order.eventVenue || 'Sin lugar';
        eventCell.appendChild(eventVenue);
        const ticketsCell = document.createElement('td');
        ticketsCell.textContent = order.totalTickets;
        const amountCell = document.createElement('td');
        amountCell.textContent = formatMoney(order.amountInCents, order.currency);
        const statusCell = document.createElement('td');
        statusCell.appendChild(createStatus(statusLabel(order.status), order.status));
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(order.createdAt);
        const actionsCell = document.createElement('td');
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

export const renderPagination = ({ page, totalPages, totalElements, size, onChange }) => {
    const { pagination, paginationInfo, sizeSelect } = DOMRefs.refs;
    const start = totalElements ? ((page - 1) * size) + 1 : 0;
    const end = Math.min(page * size, totalElements);
    paginationInfo.textContent = `Mostrando ${start}–${end} de ${totalElements} resultados`;
    sizeSelect.value = size;
    pagination.textContent = '';
    const addButton = (label, disabled, nextPage, active = false) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `pageBtn${active ? ' active' : ''}`;
        button.textContent = label;
        button.disabled = disabled;
        button.addEventListener('click', () => onChange(nextPage));
        pagination.appendChild(button);
    };
    addButton('‹', page <= 1, page - 1);
    for (let index = 1; index <= totalPages; index += 1) {
        if (totalPages > 6 && index > 3 && index < totalPages - 1) {
            if (index === 4) {
                const dots = document.createElement('span');
                dots.className = 'pageDots';
                dots.textContent = '…';
                pagination.appendChild(dots);
            }
            continue;
        }
        addButton(String(index), index === page, index, index === page);
    }
    addButton('›', page >= totalPages, page + 1);
};

export const renderOrderDetail = (order) => {
    const refs = DOMRefs.refs;
    refs.detailTitle.textContent = 'Detalle de compra';
    refs.detailCustomer.textContent = order.customerName
        ? `${order.customerName} · ${order.customerEmail}`
        : order.customerEmail;
    refs.detailStatus.textContent = statusLabel(order.status);
    refs.detailStatus.className = `ticketOrderStatus ticketOrderBadge-${String(order.status || '').toLowerCase()}`;
    refs.facts.replaceChildren(
        createInfoItem('Evento', order.lines[0]?.eventName),
        createInfoItem('Lugar', order.lines[0]?.eventVenue),
        createInfoItem('Fecha de compra', formatDate(order.createdAt)),
        createInfoItem('Creada', formatDate(order.createdAt)),
        createInfoItem('Reserva hasta', formatDate(order.reservedUntil)),
        createInfoItem('Cantidad de boletos', order.lines.reduce((total, line) => total + line.quantity, 0))
    );
    refs.detailTotal.textContent = formatMoney(order.amountInCents, order.currency);
    refs.lines.replaceChildren();
    order.lines.forEach((line) => {
        const item = document.createElement('div');
        item.className = 'ticketOrderLine';
        const title = document.createElement('strong');
        title.textContent = `${line.quantity} × ${line.ticketTypeName}`;
        const meta = document.createElement('span');
        meta.textContent = `${line.eventName} · ${line.eventVenue}`;
        const price = document.createElement('b');
        price.textContent = formatMoney(line.quantity * line.unitPriceInCents, order.currency);
        item.append(document.createElement('div'), price);
        item.firstChild.append(title, meta);
        refs.lines.appendChild(item);
    });
    refs.payments.replaceChildren();
    if (!order.payments.length) {
        refs.payments.appendChild(text('No hay intentos de pago registrados.'));
    } else {
        order.payments.forEach((payment) => {
            const item = document.createElement('div');
            item.className = 'ticketOrderRecord';
            const title = document.createElement('strong');
            title.textContent = paymentStatusLabel(payment.status);
            const meta = document.createElement('span');
            meta.textContent = `${payment.paymentMethodType || 'Método no informado'} · ${payment.environment === 'PRODUCTION' ? 'Producción' : 'Pruebas'} · ${formatMoney(payment.amountInCents, payment.currency)} · ${formatDate(payment.createdAt)}`;
            item.append(title, meta);
            refs.payments.appendChild(item);
        });
    }
    refs.tickets.replaceChildren();
    refs.ticketCount.textContent = `${order.tickets.length} emitidos`;
    if (!order.tickets.length) {
        refs.tickets.appendChild(text('Todavía no se han emitido boletos.'));
    } else {
        order.tickets.forEach((ticket) => {
            const item = document.createElement('div');
            item.className = 'ticketOrderRecord';
            const title = document.createElement('strong');
            title.textContent = `Boleto #${ticket.ticketNumber} · ${ticket.ticketTypeName}`;
            const meta = document.createElement('span');
            meta.textContent = `${ticket.status === 'USED' ? 'Utilizado' : ticket.status === 'ISSUED' ? 'Emitido' : ticket.status} · ${formatDate(ticket.issuedAt)}`;
            item.append(title, meta);
            refs.tickets.appendChild(item);
        });
    }
};

export const renderOrdersError = () => {
    DOMRefs.refs.tableBody.textContent = '';
    DOMRefs.refs.empty.classList.remove('hide');
    DOMRefs.refs.empty.textContent = 'No se pudieron cargar las órdenes. Revisa tus permisos o la conexión.';
};
