import { $ } from '../../utils/dom.js';
import { formatCurrencyFromCents, formatDateTime } from '../../utils/formatters.js';
import { canAccess } from '../../utils/privilegesValidator.js';

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            eventLoader: $('eventLoader'),
            eventsTableBody: $('eventsTableBody'),
            eventsEmptyState: $('eventsEmptyState'),
            eventDetailEmpty: $('eventDetailEmpty'),
            eventDetailContent: $('eventDetailContent'),
            selectedEventName: $('selectedEventName'),
            selectedEventMeta: $('selectedEventMeta'),
            selectedEventStatus: $('selectedEventStatus'),
            ticketingPosterDay: $('ticketingPosterDay'),
            ticketingPosterMonth: $('ticketingPosterMonth'),
            ticketingPosterName: $('ticketingPosterName'),
            ticketingPosterVenue: $('ticketingPosterVenue'),
            ticketingPosterImage: $('ticketingPosterImage'),
            eventMetrics: $('eventMetrics'),
            ticketTypesTitle: $('ticketTypesTitle'),
            ticketTypesHint: $('ticketTypesHint'),
            ticketTypesList: $('ticketTypesList'),
            eventModal: $('eventModal'),
            ticketTypeModal: $('ticketTypeModal'),
            eventModalTitle: $('eventModalTitle'),
            ticketTypeModalTitle: $('ticketTypeModalTitle'),
            eventForm: $('eventForm'),
            ticketTypeForm: $('ticketTypeForm'),
            eventSubmitLabel: $('eventSubmitLabel'),
            ticketTypeSubmitLabel: $('ticketTypeSubmitLabel'),
            eventSubmitLoader: $('eventSubmitLoader'),
            ticketTypeSubmitLoader: $('ticketTypeSubmitLoader'),
            eventImage: $('eventImage'),
            eventImagePreviewImage: $('eventImagePreviewImage'),
            eventImagePreviewName: $('eventImagePreviewName'),
            eventImagePlaceholder: $('eventImagePlaceholder'),
            eventImageActions: $('eventImageActions'),
            btnRemoveEventImage: $('btnRemoveEventImage')
        };

        return this.refs;
    }
};

const createElement = (tagName, className, value) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
};

const createTableCell = (label, className = '') => {
    const cell = createElement('td', className);
    cell.dataset.label = label;
    return cell;
};

const eventPosterDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { day: '--', month: '---' };

    const parts = new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: 'short' }).formatToParts(date);
    return {
        day: parts.find(part => part.type === 'day')?.value || '--',
        month: (parts.find(part => part.type === 'month')?.value || '---').replace('.', '').toUpperCase()
    };
};

const createStatus = (active) => createElement(
    'span',
    `statusBadge ${active ? 'statusActive' : 'statusInactive'}`,
    active ? 'Activo' : 'Inactivo'
);

const createActionMenuButton = (action, id, label) => {
    if (!canAccess(['WRITE_TICKETING'])) return null;
    const button = createElement('button', 'actionButton', '⋯');
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.id = id;
    button.setAttribute('aria-label', label);
    return button;
};

export const renderEvents = (events, selectedEventId, onSelect) => {
    const { eventsTableBody, eventsEmptyState } = DOMRefs.refs;
    eventsTableBody.replaceChildren();
    eventsEmptyState.classList.toggle('hide', events.length > 0);

    events.forEach((event) => {
        const row = document.createElement('tr');
        row.className = event.id === selectedEventId ? 'selectedRow' : '';

        const eventCell = createTableCell('Evento');
        const eventName = createElement('span', 'ticketingEventName');
        const eventButton = createElement('button', 'tableLink', event.name);
        eventButton.type = 'button';
        eventButton.dataset.action = 'select-event';
        eventButton.dataset.id = event.id;
        eventName.append(eventButton, createStatus(event.active));
        eventCell.append(eventName, createElement('span', 'tableSecondaryText', event.venue));

        const dateCell = createTableCell('Fecha');
        dateCell.textContent = formatDateTime(event.startsAt, 'es-SV', 'Sin fecha');
        const actionsCell = createTableCell('Acción', 'tableResponsiveAction');
        const actionsButton = createActionMenuButton('event-actions', event.id, `Acciones de ${event.name}`);
        const cells = [eventCell, dateCell];
        if (actionsButton) {
            actionsCell.appendChild(actionsButton);
            cells.push(actionsCell);
        }

        row.append(...cells);
        row.addEventListener('click', (clickEvent) => {
            if (clickEvent.target.closest('[data-action]')) return;
            onSelect(event.id);
        });
        eventsTableBody.appendChild(row);
    });
};

export const renderEventsError = () => {
    const { eventsTableBody, eventsEmptyState } = DOMRefs.refs;
    eventsTableBody.replaceChildren();
    eventsEmptyState.classList.remove('hide');
    eventsEmptyState.replaceChildren(
        createElement('strong', '', 'No se pudieron cargar los eventos'),
        createElement('span', '', 'Revisa la conexión o tus permisos e inténtalo de nuevo.')
    );
};

export const renderEventDetail = (event, ticketTypes) => {
    const refs = DOMRefs.refs;
    refs.eventDetailEmpty.classList.add('hide');
    refs.eventDetailContent.classList.remove('hide');
    refs.selectedEventName.textContent = event.name;

    const dates = createElement('span', 'ticketingEventDates');
    const start = createElement('time', '', formatDateTime(event.startsAt, 'es-SV', 'Sin fecha'));
    const end = createElement('time', '', formatDateTime(event.endsAt, 'es-SV', 'Sin fecha'));
    start.dateTime = event.startsAt || '';
    end.dateTime = event.endsAt || '';
    dates.append(start, createElement('span', '', 'a'), end);
    refs.selectedEventMeta.replaceChildren(
        createElement('span', 'ticketingEventVenue', event.venue),
        createElement('span', 'ticketingEventSeparator', '·'),
        dates
    );
    refs.selectedEventStatus.className = `statusBadge ${event.active ? 'statusActive' : 'statusInactive'}`;
    refs.selectedEventStatus.textContent = event.active ? 'Activo' : 'Inactivo';

    const posterDate = eventPosterDate(event.startsAt);
    refs.ticketingPosterDay.textContent = posterDate.day;
    refs.ticketingPosterMonth.textContent = posterDate.month;
    refs.ticketingPosterName.textContent = event.name;
    refs.ticketingPosterVenue.textContent = event.venue;
    refs.ticketingPosterImage.classList.toggle('hide', !event.imageUrl);
    if (event.imageUrl) {
        refs.ticketingPosterImage.src = event.imageUrl;
    } else {
        refs.ticketingPosterImage.removeAttribute('src');
    }

    const totalCapacity = ticketTypes.reduce((total, ticketType) => total + ticketType.capacity, 0);
    const totalAvailable = ticketTypes.reduce((total, ticketType) => total + ticketType.availableQuantity, 0);
    const typesMetric = document.createElement('div');
    typesMetric.className = 'metricCard';
    typesMetric.append(createElement('span', '', 'Tipos visibles'), createElement('strong', '', ticketTypes.length));
    const availableMetric = document.createElement('div');
    availableMetric.className = 'metricCard';
    availableMetric.append(
        createElement('span', '', 'Cupos disponibles'),
        createElement('strong', '', totalAvailable.toLocaleString('es-SV'))
    );
    const capacityMetric = document.createElement('div');
    capacityMetric.className = 'metricCard';
    capacityMetric.append(
        createElement('span', '', 'Cupos configurados'),
        createElement('strong', '', totalCapacity.toLocaleString('es-SV'))
    );
    refs.eventMetrics.replaceChildren(typesMetric, availableMetric, capacityMetric);
};

export const renderTicketTypes = (ticketTypes) => {
    const container = DOMRefs.refs.ticketTypesList;
    container.replaceChildren();
    if (!ticketTypes.length) {
        container.appendChild(createElement('div', 'inlineEmptyState', 'Este evento todavía no tiene tipos de boleto.'));
        return;
    }

    const table = createElement('table', 'table tableResponsive ticketingTable compactTable');
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Boleto', 'Precio', 'Disponibles', 'Estado', 'Acciones'].forEach((label) => {
        headRow.appendChild(createElement('th', '', label));
    });
    head.appendChild(headRow);

    const body = document.createElement('tbody');
    ticketTypes.forEach((ticketType) => {
        const row = document.createElement('tr');
        const nameCell = createTableCell('Boleto');
        nameCell.appendChild(createElement('strong', '', ticketType.name));
        const priceCell = createTableCell('Precio');
        priceCell.textContent = formatCurrencyFromCents(ticketType.priceInCents);
        const capacityCell = createTableCell('Cupos', 'ticketCapacityCell');
        const capacityValue = createElement('div', 'ticketCapacityValue');
        capacityValue.append(
            createElement('strong', '', ticketType.availableQuantity.toLocaleString('es-SV')),
            createElement('small', '', `de ${ticketType.capacity.toLocaleString('es-SV')} configurados`)
        );
        capacityCell.appendChild(capacityValue);
        const statusCell = createTableCell('Estado');
        statusCell.appendChild(createStatus(ticketType.active));
        const actionsCell = createTableCell('Acción', 'tableResponsiveAction');
        const actionsButton = createActionMenuButton('ticket-type-actions', ticketType.id, `Acciones de ${ticketType.name}`);
        const cells = [nameCell, priceCell, capacityCell, statusCell];
        if (actionsButton) {
            actionsCell.appendChild(actionsButton);
            cells.push(actionsCell);
        } else {
            statusCell.classList.add('ticketTypeStatusCell');
        }
        row.append(...cells);
        body.appendChild(row);
    });
    table.append(head, body);
    container.appendChild(table);
};

export const renderTicketTypesError = () => {
    DOMRefs.refs.ticketTypesList.replaceChildren(
        createElement('div', 'inlineEmptyState', 'No se pudieron cargar los tipos de boleto.')
    );
};

export const renderTicketTypesSummary = (ticketTypes) => {
    DOMRefs.refs.ticketTypesTitle.textContent = 'Tipos de boleto';
    const available = ticketTypes.reduce((total, item) => total + item.availableQuantity, 0);
    const capacity = ticketTypes.reduce((total, item) => total + item.capacity, 0);
    DOMRefs.refs.ticketTypesHint.textContent = `${available.toLocaleString('es-SV')} disponibles de ${capacity.toLocaleString('es-SV')} configurados.`;
    renderTicketTypes(ticketTypes);
};

export const setLoading = (loading) => DOMRefs.refs.eventLoader.classList.toggle('hide', !loading);
