import { createPagination } from '../../pagination/pagination.controller.js';
import { createModuleInitializer, disableElement, hideElement, removeDisable, showElement, showMessage, toggleModal } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';
import { canAccess } from '../../utils/privilegesValidator.js';
import { ticketingState, resetTicketingState } from './ticketing.state.js';
import { DOMRefs, renderEvents, renderEventsError, renderEventDetail, renderZones, renderZonesError, renderSelectedZone, renderTicketTypesError, setLoading } from './ticketing.dom.js';
import { initTicketingEvents } from './ticketing.events.js';
import { isoToLocalDateTime, mapEventForm, mapZoneForm, mapTicketTypeForm, validateEvent, validateZone, validateTicketType } from './ticketing.logic.js';
import { getTicketEvents, createTicketEvent, updateTicketEvent, changeTicketEventStatus, getTicketZones, createTicketZone, updateTicketZone, changeTicketZoneStatus, getTicketTypes, createTicketType, updateTicketType, changeTicketTypeStatus } from './ticketing.service.js';

const getPageData = (response) => response?.data ?? response;

const pagination = createPagination({
    initialSize: ticketingState.pagination.size,
    onChange: ({ page, size }) => {
        ticketingState.pagination.page = page;
        ticketingState.pagination.size = size;
        loadEvents();
    }
});

const selectedEvent = () => ticketingState.selectedEvent;

const setModalMode = (type, editing) => {
    const labels = {
        event: [editing ? 'Editar evento' : 'Registrar evento', editing ? 'Actualizar evento' : 'Guardar evento'],
        zone: [editing ? 'Editar zona' : 'Registrar zona', editing ? 'Actualizar zona' : 'Guardar zona'],
        ticketType: [editing ? 'Editar tipo de boleto' : 'Registrar tipo de boleto', editing ? 'Actualizar boleto' : 'Guardar boleto']
    };
    const [title, submitLabel] = labels[type];
    DOMRefs.refs[`${type === 'ticketType' ? 'ticketType' : type}ModalTitle`].textContent = title;
    DOMRefs.refs[`${type === 'ticketType' ? 'ticketType' : type}SubmitLabel`].textContent = submitLabel;
};

const resetModal = (modalId) => {
    const modalConfig = {
        eventModal: ['event', DOMRefs.refs.eventForm, 'editingEventId'],
        zoneModal: ['zone', DOMRefs.refs.zoneForm, 'editingZoneId'],
        ticketTypeModal: ['ticketType', DOMRefs.refs.ticketTypeForm, 'editingTicketTypeId']
    }[modalId];
    if (!modalConfig) return;
    const [type, form, editingKey] = modalConfig;
    form.reset();
    ticketingState[editingKey] = null;
    setModalMode(type, false);
};

const closeModal = (modalId) => {
    toggleModal(document.getElementById(modalId), false);
    resetModal(modalId);
};

const openCreateModal = (modalId, type) => {
    resetModal(modalId);
    setModalMode(type, false);
    toggleModal(document.getElementById(modalId), true);
};

const loadEvents = async () => {
    setLoading(true);
    try {
        const pageData = getPageData(await getTicketEvents(ticketingState.pagination.page - 1, ticketingState.pagination.size));
        ticketingState.events = pageData.content || [];
        if (ticketingState.selectedEvent) {
            ticketingState.selectedEvent = ticketingState.events.find(event => event.id === ticketingState.selectedEvent.id) || ticketingState.selectedEvent;
        }
        renderEvents(ticketingState.events, ticketingState.selectedEvent?.id, selectEvent);
        pagination.setTotal({
            totalElements: pageData.page.totalElements,
            totalPages: pageData.page.totalPages,
            page: pageData.page.number + 1,
            size: pageData.page.size
        });
    } catch (error) {
        renderEventsError();
        await handleApiError(error, 'No se pudieron cargar los eventos.');
    } finally {
        setLoading(false);
    }
};

const loadZones = async () => {
    const event = selectedEvent();
    if (!event) return;
    try {
        const pageData = getPageData(await getTicketZones(event.id));
        ticketingState.zones = pageData.content || [];
        ticketingState.selectedZone = ticketingState.zones.find(zone => zone.id === ticketingState.selectedZone?.id) || ticketingState.zones[0] || null;
        renderEventDetail(event, ticketingState.zones);
        renderZones(ticketingState.zones, ticketingState.selectedZone?.id, selectZone);
        await loadTicketTypes();
    } catch (error) {
        renderZonesError();
        await handleApiError(error, 'No se pudieron cargar las zonas del evento.');
    }
};

const loadTicketTypes = async () => {
    const zone = ticketingState.selectedZone;
    if (!zone) {
        renderSelectedZone(null, []);
        return;
    }
    try {
        const pageData = getPageData(await getTicketTypes(zone.id));
        ticketingState.ticketTypes = pageData.content || [];
        renderSelectedZone(zone, ticketingState.ticketTypes);
    } catch (error) {
        renderTicketTypesError();
        await handleApiError(error, 'No se pudieron cargar los tipos de boleto.');
    }
};

const selectEvent = async (eventId) => {
    const event = ticketingState.events.find(item => item.id === eventId);
    if (!event) return;
    ticketingState.selectedEvent = event;
    ticketingState.selectedZone = null;
    ticketingState.ticketTypes = [];
    renderEvents(ticketingState.events, event.id, selectEvent);
    await loadZones();
};

const selectZone = async (zoneId) => {
    ticketingState.selectedZone = ticketingState.zones.find(zone => zone.id === zoneId) || null;
    renderZones(ticketingState.zones, zoneId, selectZone);
    await loadTicketTypes();
};

const submit = async (form, loader, action, successMessage, modalId) => {
    showElement(loader);
    const controls = form.querySelectorAll('button, input, select, textarea');
    controls.forEach(disableElement);
    try {
        await action();
        closeModal(modalId);
        showMessage('Éxito', successMessage, 'success');
        return true;
    } catch (error) {
        await handleApiError(error, 'No se pudo guardar la información.');
        return false;
    } finally {
        hideElement(loader);
        controls.forEach(removeDisable);
    }
};

const onSubmitEvent = async (event) => {
    event.preventDefault();
    const payload = mapEventForm(Object.fromEntries(new FormData(DOMRefs.refs.eventForm)));
    const validationError = validateEvent(payload);
    if (validationError) return showMessage('Validación', validationError, 'warning');
    const editing = Boolean(ticketingState.editingEventId);
    const saved = await submit(DOMRefs.refs.eventForm, DOMRefs.refs.eventSubmitLoader, async () => {
        const savedEvent = editing
            ? await updateTicketEvent(ticketingState.editingEventId, payload)
            : await createTicketEvent(payload);
        ticketingState.selectedEvent = savedEvent;
        if (!editing) ticketingState.pagination.page = 1;
        await loadEvents();
    }, editing ? 'Evento actualizado correctamente.' : 'Evento registrado correctamente.', 'eventModal');
    if (saved && ticketingState.selectedEvent) await loadZones();
};

const onSubmitZone = async (event) => {
    event.preventDefault();
    const payload = mapZoneForm(Object.fromEntries(new FormData(DOMRefs.refs.zoneForm)));
    const validationError = validateZone(payload);
    if (validationError) return showMessage('Validación', validationError, 'warning');
    const editing = Boolean(ticketingState.editingZoneId);
    await submit(DOMRefs.refs.zoneForm, DOMRefs.refs.zoneSubmitLoader, async () => {
        if (editing) {
            await updateTicketZone(selectedEvent().id, ticketingState.editingZoneId, payload);
        } else {
            await createTicketZone(selectedEvent().id, payload);
        }
        await loadZones();
    }, editing ? 'Zona actualizada correctamente.' : 'Zona registrada correctamente.', 'zoneModal');
};

const onSubmitTicketType = async (event) => {
    event.preventDefault();
    const payload = mapTicketTypeForm(Object.fromEntries(new FormData(DOMRefs.refs.ticketTypeForm)));
    const validationError = validateTicketType(payload);
    if (validationError) return showMessage('Validación', validationError, 'warning');
    const editing = Boolean(ticketingState.editingTicketTypeId);
    await submit(DOMRefs.refs.ticketTypeForm, DOMRefs.refs.ticketTypeSubmitLoader, async () => {
        if (editing) {
            await updateTicketType(ticketingState.selectedZone.id, ticketingState.editingTicketTypeId, payload);
        } else {
            await createTicketType(ticketingState.selectedZone.id, payload);
        }
        await loadTicketTypes();
    }, editing ? 'Tipo de boleto actualizado correctamente.' : 'Tipo de boleto registrado correctamente.', 'ticketTypeModal');
};

const onToggleEvent = async (eventId) => {
    const event = ticketingState.events.find(item => item.id === eventId);
    if (!event || !canAccess(['WRITE_TICKETING'])) return;
    try {
        await changeTicketEventStatus(eventId, !event.active);
        await loadEvents();
        if (ticketingState.selectedEvent?.id === eventId) {
            ticketingState.selectedEvent = { ...ticketingState.selectedEvent, active: !event.active };
            await loadZones();
        }
        showMessage('Estado actualizado', 'El estado del evento fue actualizado.', 'success');
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el estado del evento.');
    }
};

const onToggleZone = async (zoneId) => {
    const zone = ticketingState.zones.find(item => item.id === zoneId);
    if (!zone || !selectedEvent() || !canAccess(['WRITE_TICKETING'])) return;
    try {
        await changeTicketZoneStatus(selectedEvent().id, zoneId, !zone.active);
        await loadZones();
        showMessage('Estado actualizado', 'El estado de la zona fue actualizado.', 'success');
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el estado de la zona.');
    }
};

const onToggleTicketType = async (ticketTypeId) => {
    const ticketType = ticketingState.ticketTypes.find(item => item.id === ticketTypeId);
    if (!ticketType || !ticketingState.selectedZone || !canAccess(['WRITE_TICKETING'])) return;
    try {
        await changeTicketTypeStatus(ticketingState.selectedZone.id, ticketTypeId, !ticketType.active);
        await loadTicketTypes();
        showMessage('Estado actualizado', 'El estado del tipo de boleto fue actualizado.', 'success');
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el estado del tipo de boleto.');
    }
};

const onEditEvent = (eventId) => {
    if (!canAccess(['WRITE_TICKETING'])) return;
    const event = ticketingState.events.find(item => item.id === eventId);
    if (!event) return;

    resetModal('eventModal');
    ticketingState.editingEventId = event.id;
    DOMRefs.refs.eventForm.elements.name.value = event.name;
    DOMRefs.refs.eventForm.elements.venue.value = event.venue;
    DOMRefs.refs.eventForm.elements.startsAt.value = isoToLocalDateTime(event.startsAt);
    DOMRefs.refs.eventForm.elements.endsAt.value = isoToLocalDateTime(event.endsAt);
    DOMRefs.refs.eventForm.elements.refundPolicy.value = event.refundPolicy || '';
    setModalMode('event', true);
    toggleModal(DOMRefs.refs.eventModal, true);
};

const onEditZone = (zoneId) => {
    if (!canAccess(['WRITE_TICKETING'])) return;
    const zone = ticketingState.zones.find(item => item.id === zoneId);
    if (!zone) return;

    resetModal('zoneModal');
    ticketingState.editingZoneId = zone.id;
    DOMRefs.refs.zoneForm.elements.name.value = zone.name;
    DOMRefs.refs.zoneForm.elements.capacity.value = zone.capacity;
    setModalMode('zone', true);
    toggleModal(DOMRefs.refs.zoneModal, true);
};

const onEditTicketType = (ticketTypeId) => {
    if (!canAccess(['WRITE_TICKETING'])) return;
    const ticketType = ticketingState.ticketTypes.find(item => item.id === ticketTypeId);
    if (!ticketType) return;

    resetModal('ticketTypeModal');
    ticketingState.editingTicketTypeId = ticketType.id;
    DOMRefs.refs.ticketTypeForm.elements.name.value = ticketType.name;
    DOMRefs.refs.ticketTypeForm.elements.price.value = (ticketType.priceInCents / 100).toFixed(2);
    DOMRefs.refs.ticketTypeForm.elements.capacity.value = ticketType.capacity;
    setModalMode('ticketType', true);
    toggleModal(DOMRefs.refs.ticketTypeModal, true);
};

const onOpenEventActions = (button, eventId) => {
    const event = ticketingState.events.find(item => item.id === eventId);
    if (!event) return;
    showFloatingMenu({ currentTarget: button }, [
        {
            label: 'Editar evento',
            privilege: 'WRITE_TICKETING',
            onClick: () => onEditEvent(eventId)
        },
        {
            label: event.active ? 'Desactivar evento' : 'Activar evento',
            privilege: 'WRITE_TICKETING',
            onClick: () => onToggleEvent(eventId)
        }
    ]);
};

const onOpenZoneActions = (button, zoneId) => {
    const zone = ticketingState.zones.find(item => item.id === zoneId);
    if (!zone) return;
    showFloatingMenu({ currentTarget: button }, [
        {
            label: 'Editar zona',
            privilege: 'WRITE_TICKETING',
            onClick: () => onEditZone(zoneId)
        },
        {
            label: zone.active ? 'Desactivar zona' : 'Activar zona',
            privilege: 'WRITE_TICKETING',
            onClick: () => onToggleZone(zoneId)
        }
    ]);
};

const onOpenTicketTypeActions = (button, ticketTypeId) => {
    const ticketType = ticketingState.ticketTypes.find(item => item.id === ticketTypeId);
    if (!ticketType) return;
    showFloatingMenu({ currentTarget: button }, [
        {
            label: 'Editar tipo de boleto',
            privilege: 'WRITE_TICKETING',
            onClick: () => onEditTicketType(ticketTypeId)
        },
        {
            label: ticketType.active ? 'Desactivar boleto' : 'Activar boleto',
            privilege: 'WRITE_TICKETING',
            onClick: () => onToggleTicketType(ticketTypeId)
        }
    ]);
};

const onOpenEventModal = () => openCreateModal('eventModal', 'event');
const onOpenZoneModal = () => selectedEvent() && openCreateModal('zoneModal', 'zone');
const onOpenTicketTypeModal = () => ticketingState.selectedZone && openCreateModal('ticketTypeModal', 'ticketType');

const initializeUI = () => {
    initTicketingEvents({
        onSubmitEvent,
        onSubmitZone,
        onSubmitTicketType,
        onSelectEvent: selectEvent,
        onOpenEventActions,
        onOpenZoneActions,
        onOpenTicketTypeActions,
        onOpenEventModal,
        onOpenZoneModal,
        onOpenTicketTypeModal,
        onCloseModal: closeModal
    });
};

const init = createModuleInitializer({
    resetState: resetTicketingState,
    initialize: initializeUI,
    load: loadEvents,
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
