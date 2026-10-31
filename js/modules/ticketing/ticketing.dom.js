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
            eventMetrics: document.getElementById('eventMetrics'),
            zonesList: document.getElementById('zonesList'),
            selectedZoneTitle: document.getElementById('selectedZoneTitle'),
            selectedZoneHint: document.getElementById('selectedZoneHint'),
            ticketTypesList: document.getElementById('ticketTypesList'),
            eventModal: document.getElementById('eventModal'),
            zoneModal: document.getElementById('zoneModal'),
            ticketTypeModal: document.getElementById('ticketTypeModal'),
            eventModalTitle: document.getElementById('eventModalTitle'),
            zoneModalTitle: document.getElementById('zoneModalTitle'),
            ticketTypeModalTitle: document.getElementById('ticketTypeModalTitle'),
            eventForm: document.getElementById('eventForm'),
            zoneForm: document.getElementById('zoneForm'),
            ticketTypeForm: document.getElementById('ticketTypeForm'),
            eventSubmitLabel: document.getElementById('eventSubmitLabel'),
            zoneSubmitLabel: document.getElementById('zoneSubmitLabel'),
            ticketTypeSubmitLabel: document.getElementById('ticketTypeSubmitLabel'),
            eventSubmitLoader: document.getElementById('eventSubmitLoader'),
            zoneSubmitLoader: document.getElementById('zoneSubmitLoader'),
            ticketTypeSubmitLoader: document.getElementById('ticketTypeSubmitLoader')
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

const money = (cents) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format((cents || 0) / 100);

const dateTime = (value) => value
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Sin fecha';

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
            <td><button class="tableLink" type="button" data-action="select-event" data-id="${escapeHtml(event.id)}">${escapeHtml(event.name)}</button><span class="tableSecondaryText">${escapeHtml(event.venue)}</span></td>
            <td>${escapeHtml(dateTime(event.startsAt))}</td>
            <td>${status(event.active)}</td>
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

export const renderEventDetail = (event, zones) => {
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

    const totalCapacity = zones.reduce((total, zone) => total + zone.capacity, 0);
    DOMRefs.refs.eventMetrics.innerHTML = `
        <div class="metricCard"><span>Zonas</span><strong>${zones.length}</strong></div>
        <div class="metricCard"><span>Capacidad configurada</span><strong>${totalCapacity.toLocaleString('es-CO')}</strong></div>
    `;
};

export const renderZones = (zones, selectedZoneId, onSelect) => {
    const container = DOMRefs.refs.zonesList;
    container.textContent = '';
    if (!zones.length) {
        container.innerHTML = '<div class="inlineEmptyState">Este evento todavía no tiene zonas configuradas.</div>';
        return;
    }

    zones.forEach((zone) => {
        const item = document.createElement('div');
        item.className = `ticketingListItem ${zone.id === selectedZoneId ? 'selectedListItem' : ''}`;
        item.innerHTML = `
            <button class="listItemMain" type="button" data-zone-id="${escapeHtml(zone.id)}">
                <span><strong>${escapeHtml(zone.name)}</strong><small>Cupos disponibles</small></span>
                <span><strong>${escapeHtml(zone.capacity.toLocaleString('es-CO'))}</strong><small>cupos</small></span>
                ${status(zone.active)}
            </button>
            <div class="listItemActions">${actionMenuButton('zone-actions', zone.id, `Acciones de ${zone.name}`)}</div>
        `;
        item.querySelector('[data-zone-id]').addEventListener('click', () => onSelect(zone.id));
        container.appendChild(item);
    });
};

export const renderZonesError = () => {
    DOMRefs.refs.zonesList.innerHTML = '<div class="inlineEmptyState">No se pudieron cargar las zonas del evento.</div>';
};

export const renderTicketTypes = (ticketTypes) => {
    const container = DOMRefs.refs.ticketTypesList;
    container.textContent = '';
    if (!ticketTypes.length) {
        container.innerHTML = '<div class="inlineEmptyState">Esta zona todavía no tiene tipos de boleto.</div>';
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
            <td>${escapeHtml(money(ticketType.priceInCents))}</td>
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

export const renderSelectedZone = (zone, ticketTypes) => {
    if (!zone) {
        DOMRefs.refs.selectedZoneTitle.textContent = 'Tipos de boleto';
        DOMRefs.refs.selectedZoneHint.textContent = 'Selecciona una zona para administrar sus boletos.';
        DOMRefs.refs.ticketTypesList.textContent = '';
        return;
    }
    DOMRefs.refs.selectedZoneTitle.textContent = `Tipos de boleto · ${zone.name}`;
    DOMRefs.refs.selectedZoneHint.textContent = `${zone.capacity.toLocaleString('es-CO')} cupos configurados en esta zona.`;
    renderTicketTypes(ticketTypes);
};

export const setLoading = (loading) => DOMRefs.refs.eventLoader.classList.toggle('hide', !loading);
