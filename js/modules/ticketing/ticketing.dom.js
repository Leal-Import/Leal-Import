import { canAccess } from '../../utils/privilegesValidator.js';

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            eventLoader: document.getElementById('eventLoader'),
            eventsTableBody: document.getElementById('eventsTableBody'),
            eventsEmptyState: document.getElementById('eventsEmptyState'),
            eventDetailEmpty: document.getElementById('eventDetailEmpty'),
            eventDetailContent: document.getElementById('eventDetailContent'),
            selectedEventName: document.getElementById('selectedEventName'),
            selectedEventMeta: document.getElementById('selectedEventMeta'),
            selectedEventStatus: document.getElementById('selectedEventStatus'),
            ticketingPosterDay: document.getElementById('ticketingPosterDay'),
            ticketingPosterMonth: document.getElementById('ticketingPosterMonth'),
            ticketingPosterName: document.getElementById('ticketingPosterName'),
            ticketingPosterVenue: document.getElementById('ticketingPosterVenue'),
            ticketingPosterImage: document.getElementById('ticketingPosterImage'),
            eventMetrics: document.getElementById('eventMetrics'),
            ticketTypesTitle: document.getElementById('ticketTypesTitle'),
            ticketTypesHint: document.getElementById('ticketTypesHint'),
            ticketTypesList: document.getElementById('ticketTypesList'),
            eventModal: document.getElementById('eventModal'),
            ticketTypeModal: document.getElementById('ticketTypeModal'),
            eventModalTitle: document.getElementById('eventModalTitle'),
            ticketTypeModalTitle: document.getElementById('ticketTypeModalTitle'),
            eventForm: document.getElementById('eventForm'),
            ticketTypeForm: document.getElementById('ticketTypeForm'),
            eventSubmitLabel: document.getElementById('eventSubmitLabel'),
            ticketTypeSubmitLabel: document.getElementById('ticketTypeSubmitLabel'),
            eventSubmitLoader: document.getElementById('eventSubmitLoader'),
            ticketTypeSubmitLoader: document.getElementById('ticketTypeSubmitLoader'),
            eventImage: document.getElementById('eventImage'),
            eventImagePreviewImage: document.getElementById('eventImagePreviewImage'),
            eventImagePreviewName: document.getElementById('eventImagePreviewName'),
            eventImagePlaceholder: document.getElementById('eventImagePlaceholder'),
            eventImageActions: document.getElementById('eventImageActions'),
            btnRemoveEventImage: document.getElementById('btnRemoveEventImage')
        };

        return this.refs;
    }
};

const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const formatTicketMoney = (cents) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format((cents || 0) / 100);

const dateTime = (value) => value
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Sin fecha';

const eventPosterDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { day: '--', month: '---' };

    const parts = new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: 'short' }).formatToParts(date);
    return {
        day: parts.find(part => part.type === 'day')?.value || '--',
        month: (parts.find(part => part.type === 'month')?.value || '---').replace('.', '').toUpperCase()
    };
};

const status = (active) => `<span class="statusBadge ${active ? 'statusActive' : 'statusInactive'}">${active ? 'Activo' : 'Inactivo'}</span>`;

const actionMenuButton = (action, id, label) => {
    if (!canAccess(['WRITE_TICKETING'])) return '';
    return `<button class="actionButton" type="button" data-action="${escapeHtml(action)}" data-id="${escapeHtml(id)}" aria-label="${escapeHtml(label)}">⋯</button>`;
};

export const renderEvents = (events, selectedEventId, onSelect) => {
    const { eventsTableBody, eventsEmptyState } = DOMRefs.refs;
    eventsTableBody.textContent = '';
    eventsEmptyState.classList.toggle('hide', events.length > 0);

    events.forEach((event) => {
        const row = document.createElement('tr');
        row.className = event.id === selectedEventId ? 'selectedRow' : '';
        row.innerHTML = `
            <td><span class="ticketingEventName"><button class="tableLink" type="button" data-action="select-event" data-id="${escapeHtml(event.id)}">${escapeHtml(event.name)}</button>${status(event.active)}</span><span class="tableSecondaryText">${escapeHtml(event.venue)}</span></td>
            <td>${escapeHtml(dateTime(event.startsAt))}</td>
            <td>${actionMenuButton('event-actions', event.id, `Acciones de ${event.name}`)}</td>
        `;
        row.addEventListener('click', (clickEvent) => {
            const action = clickEvent.target.closest('[data-action]')?.dataset.action;
            if (action) return;
            onSelect(event.id);
        });
        eventsTableBody.appendChild(row);
    });
};

export const renderEventsError = () => {
    DOMRefs.refs.eventsTableBody.textContent = '';
    DOMRefs.refs.eventsEmptyState.classList.remove('hide');
    DOMRefs.refs.eventsEmptyState.innerHTML = '<strong>No se pudieron cargar los eventos</strong><span>Revisa la conexión o tus permisos e inténtalo de nuevo.</span>';
};

export const renderEventDetail = (event, ticketTypes) => {
    DOMRefs.refs.eventDetailEmpty.classList.add('hide');
    DOMRefs.refs.eventDetailContent.classList.remove('hide');
    DOMRefs.refs.selectedEventName.textContent = event.name;
    DOMRefs.refs.selectedEventMeta.innerHTML = `
        <span class="ticketingEventVenue">${escapeHtml(event.venue)}</span>
        <span class="ticketingEventSeparator" aria-hidden="true">·</span>
        <span class="ticketingEventDates">
            <time datetime="${escapeHtml(event.startsAt)}">${escapeHtml(dateTime(event.startsAt))}</time>
            <span aria-hidden="true">a</span>
            <time datetime="${escapeHtml(event.endsAt)}">${escapeHtml(dateTime(event.endsAt))}</time>
        </span>
    `;
    DOMRefs.refs.selectedEventStatus.className = `statusBadge ${event.active ? 'statusActive' : 'statusInactive'}`;
    DOMRefs.refs.selectedEventStatus.textContent = event.active ? 'Activo' : 'Inactivo';

    const posterDate = eventPosterDate(event.startsAt);
    DOMRefs.refs.ticketingPosterDay.textContent = posterDate.day;
    DOMRefs.refs.ticketingPosterMonth.textContent = posterDate.month;
    DOMRefs.refs.ticketingPosterName.textContent = event.name;
    DOMRefs.refs.ticketingPosterVenue.textContent = event.venue;
    DOMRefs.refs.ticketingPosterImage.classList.toggle('hide', !event.imageUrl);
    if (event.imageUrl) {
        DOMRefs.refs.ticketingPosterImage.src = event.imageUrl;
    } else {
        DOMRefs.refs.ticketingPosterImage.removeAttribute('src');
    }

    const totalCapacity = ticketTypes.reduce((total, ticketType) => total + ticketType.capacity, 0);
    DOMRefs.refs.eventMetrics.innerHTML = `
        <div class="metricCard"><span>Tipos de boleto</span><strong>${ticketTypes.length}</strong></div>
        <div class="metricCard"><span>Capacidad total</span><strong>${totalCapacity.toLocaleString('es-CO')}</strong></div>
    `;
};

export const renderTicketTypes = (ticketTypes) => {
    const container = DOMRefs.refs.ticketTypesList;
    container.textContent = '';
    if (!ticketTypes.length) {
        container.innerHTML = '<div class="inlineEmptyState">Este evento todavía no tiene tipos de boleto.</div>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table ticketingTable compactTable';
    table.innerHTML = '<thead><tr><th>Boleto</th><th>Precio</th><th>Cupos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody>';
    const body = table.querySelector('tbody');
    ticketTypes.forEach((ticketType) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(ticketType.name)}</strong></td>
            <td>${escapeHtml(formatTicketMoney(ticketType.priceInCents))}</td>
            <td>${escapeHtml(ticketType.capacity.toLocaleString('es-CO'))}</td>
            <td>${status(ticketType.active)}</td>
            <td>${actionMenuButton('ticket-type-actions', ticketType.id, `Acciones de ${ticketType.name}`)}</td>
        `;
        body.appendChild(row);
    });
    container.appendChild(table);
};

export const renderTicketTypesError = () => {
    DOMRefs.refs.ticketTypesList.innerHTML = '<div class="inlineEmptyState">No se pudieron cargar los tipos de boleto.</div>';
};

export const renderTicketTypesSummary = (ticketTypes) => {
    DOMRefs.refs.ticketTypesTitle.textContent = 'Tipos de boleto';
    DOMRefs.refs.ticketTypesHint.textContent = `${ticketTypes.reduce((total, item) => total + item.capacity, 0).toLocaleString('es-CO')} cupos configurados en este evento.`;
    renderTicketTypes(ticketTypes);
};

export const setLoading = (loading) => DOMRefs.refs.eventLoader.classList.toggle('hide', !loading);
