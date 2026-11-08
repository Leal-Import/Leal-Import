import { createPagination } from '../../pagination/pagination.controller.js';
import { $, createModuleInitializer, disableElement, hideElement, removeDisable, showElement, showMessage, toggleModal } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { showFloatingMenu } from '../../utils/floatingMenu.js';
import { canAccess } from '../../utils/privilegesValidator.js';
import { cleanupUploadedImage, uploadImage, validateImageFile } from '../../core/integrations/cloudinary/cloudinary-image.service.js';
import { ticketingState, resetTicketingState } from './ticketing.state.js';
import { DOMRefs, renderEvents, renderEventsError, renderEventDetail, renderTicketTypesSummary, renderTicketTypesError, setLoading } from './ticketing.dom.js';
import { initTicketingEvents } from './ticketing.events.js';
import { isoToLocalDateTime, mapEventForm, mapTicketTypeForm, validateEvent, validateTicketType } from './ticketing.logic.js';
import { getTicketEvents, createTicketEvent, updateTicketEvent, changeTicketEventStatus, getTicketTypes, createTicketType, updateTicketType, changeTicketTypeStatus } from './ticketing.service.js';

const getPageData = (response) => response?.data ?? response;

const pagination = createPagination({
    initialSize: ticketingState.pagination.size,
    onChange: ({ page, size }) => {
        ticketingState.pagination.page = page;
        ticketingState.pagination.size = size;
        loadEvents();
    }
});

const ticketTypesPagination = createPagination({
    initialSize: ticketingState.ticketTypesPagination.size,
    container: '[data-ticket-types-pagination]',
    onChange: ({ page, size }) => {
        ticketingState.ticketTypesPagination.page = page;
        ticketingState.ticketTypesPagination.size = size;
        loadTicketTypes();
    }
});

const selectedEvent = () => ticketingState.selectedEvent;

const selectedEventImageUrl = () => ticketingState.eventImage.previewObjectUrl
    || ticketingState.eventImage.existingImageUrl;

const updateEventImagePreview = () => {
    const imageUrl = selectedEventImageUrl();
    const imageName = ticketingState.eventImage.file?.name
        || (ticketingState.eventImage.existingImageUrl ? 'Imagen actual' : '');

    DOMRefs.refs.eventImagePreviewName.textContent = imageName;
    DOMRefs.refs.eventImageActions.classList.toggle('hide', !imageUrl);
    DOMRefs.refs.eventImagePlaceholder.classList.toggle('hide', Boolean(imageUrl));
    DOMRefs.refs.eventImagePreviewImage.classList.toggle('hide', !imageUrl);

    if (imageUrl) {
        DOMRefs.refs.eventImagePreviewImage.src = imageUrl;
    } else {
        DOMRefs.refs.eventImagePreviewImage.removeAttribute('src');
    }
};

const resetEventImage = () => {
    const imageState = ticketingState.eventImage;
    if (imageState.previewObjectUrl) {
        URL.revokeObjectURL(imageState.previewObjectUrl);
    }
    ticketingState.eventImage = {
        file: null,
        previewObjectUrl: null,
        existingImageUrl: null,
        removeImage: false
    };
    DOMRefs.refs.eventImage.value = '';
    updateEventImagePreview();
};

const setEventImageFile = (file) => {
    const imageState = ticketingState.eventImage;
    if (imageState.previewObjectUrl) {
        URL.revokeObjectURL(imageState.previewObjectUrl);
    }
    const previewObjectUrl = URL.createObjectURL(file);
    ticketingState.eventImage = {
        file,
        previewObjectUrl,
        existingImageUrl: imageState.existingImageUrl,
        removeImage: false
    };
    updateEventImagePreview();
};

const setModalMode = (type, editing) => {
    const labels = {
        event: [editing ? 'Editar evento' : 'Registrar evento', editing ? 'Actualizar evento' : 'Guardar evento'],
        ticketType: [editing ? 'Editar tipo de boleto' : 'Registrar tipo de boleto', editing ? 'Actualizar boleto' : 'Guardar boleto']
    };
    const [title, submitLabel] = labels[type];
    DOMRefs.refs[`${type === 'ticketType' ? 'ticketType' : type}ModalTitle`].textContent = title;
    DOMRefs.refs[`${type === 'ticketType' ? 'ticketType' : type}SubmitLabel`].textContent = submitLabel;
};

const resetModal = (modalId) => {
    const modalConfig = {
        eventModal: ['event', DOMRefs.refs.eventForm, 'editingEventId'],
        ticketTypeModal: ['ticketType', DOMRefs.refs.ticketTypeForm, 'editingTicketTypeId']
    }[modalId];
    if (!modalConfig) return;
    const [type, form, editingKey] = modalConfig;
    form.reset();
    if (type === 'event') resetEventImage();
    ticketingState[editingKey] = null;
    setModalMode(type, false);
};

const closeModal = (modalId) => {
    toggleModal($(modalId), false);
    resetModal(modalId);
};

const openCreateModal = (modalId, type) => {
    resetModal(modalId);
    setModalMode(type, false);
    toggleModal($(modalId), true);
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

const loadTicketTypes = async () => {
    const event = selectedEvent();
    if (!event) return;
    try {
        const pageData = getPageData(await getTicketTypes(
            event.id,
            ticketingState.ticketTypesPagination.page - 1,
            ticketingState.ticketTypesPagination.size
        ));
        ticketingState.ticketTypes = pageData.content || [];
        renderEventDetail(event, ticketingState.ticketTypes);
        renderTicketTypesSummary(ticketingState.ticketTypes);
        ticketTypesPagination.setTotal({
            totalElements: pageData.page.totalElements,
            totalPages: pageData.page.totalPages,
            page: pageData.page.number + 1,
            size: pageData.page.size
        });
    } catch (error) {
        renderTicketTypesError();
        await handleApiError(error, 'No se pudieron cargar los tipos de boleto.');
    }
};

const selectEvent = async (eventId) => {
    const event = ticketingState.events.find(item => item.id === eventId);
    if (!event) return;
    ticketingState.selectedEvent = event;
    ticketingState.ticketTypes = [];
    ticketingState.ticketTypesPagination.page = 1;
    renderEvents(ticketingState.events, event.id, selectEvent);
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
        const image = ticketingState.eventImage.file
            ? await uploadImage(ticketingState.eventImage.file)
            : null;
        try {
            const request = {
                ...payload,
                ...(image ? { image } : {}),
                ...(editing ? { removeImage: ticketingState.eventImage.removeImage } : {})
            };
            const savedEvent = editing
                ? await updateTicketEvent(ticketingState.editingEventId, request)
                : await createTicketEvent(request);
            ticketingState.selectedEvent = savedEvent;
            if (!editing) ticketingState.pagination.page = 1;
            await loadEvents();
        } catch (error) {
            if (image) {
                try {
                    await cleanupUploadedImage(image);
                } catch (cleanupError) {
                    console.error('No se pudo limpiar la imagen temporal de Cloudinary.', cleanupError);
                }
            }
            throw error;
        }
    }, editing ? 'Evento actualizado correctamente.' : 'Evento registrado correctamente.', 'eventModal');
    if (saved && ticketingState.selectedEvent) await loadTicketTypes();
};

const onSubmitTicketType = async (event) => {
    event.preventDefault();
    const payload = mapTicketTypeForm(Object.fromEntries(new FormData(DOMRefs.refs.ticketTypeForm)));
    const validationError = validateTicketType(payload);
    if (validationError) return showMessage('Validación', validationError, 'warning');
    const editing = Boolean(ticketingState.editingTicketTypeId);
    await submit(DOMRefs.refs.ticketTypeForm, DOMRefs.refs.ticketTypeSubmitLoader, async () => {
        if (editing) {
            await updateTicketType(selectedEvent().id, ticketingState.editingTicketTypeId, payload);
        } else {
            await createTicketType(selectedEvent().id, payload);
        }
        await loadTicketTypes();
    }, editing ? 'Tipo de boleto actualizado correctamente.' : 'Tipo de boleto registrado correctamente.', 'ticketTypeModal');
};

const onEventImageChange = () => {
    const file = DOMRefs.refs.eventImage.files?.[0];
    if (!file) return;
    try {
        validateImageFile(file);
        setEventImageFile(file);
    } catch (error) {
        DOMRefs.refs.eventImage.value = '';
        showMessage('Imagen no válida', error.message, 'warning');
    }
};

const onRemoveEventImage = () => {
    const removeExistingImage = Boolean(ticketingState.eventImage.existingImageUrl);
    resetEventImage();
    ticketingState.eventImage.removeImage = removeExistingImage;
};

const onToggleEvent = async (eventId) => {
    const event = ticketingState.events.find(item => item.id === eventId);
    if (!event || !canAccess(['WRITE_TICKETING'])) return;
    try {
        await changeTicketEventStatus(eventId, !event.active);
        await loadEvents();
        if (ticketingState.selectedEvent?.id === eventId) {
            ticketingState.selectedEvent = { ...ticketingState.selectedEvent, active: !event.active };
            await loadTicketTypes();
        }
        showMessage('Estado actualizado', 'El estado del evento fue actualizado.', 'success');
    } catch (error) {
        await handleApiError(error, 'No se pudo actualizar el estado del evento.');
    }
};

const onToggleTicketType = async (ticketTypeId) => {
    const ticketType = ticketingState.ticketTypes.find(item => item.id === ticketTypeId);
    if (!ticketType || !selectedEvent() || !canAccess(['WRITE_TICKETING'])) return;
    try {
        await changeTicketTypeStatus(selectedEvent().id, ticketTypeId, !ticketType.active);
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
    ticketingState.eventImage.existingImageUrl = event.imageUrl || null;
    updateEventImagePreview();
    setModalMode('event', true);
    toggleModal(DOMRefs.refs.eventModal, true);
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
const onOpenTicketTypeModal = () => selectedEvent() && openCreateModal('ticketTypeModal', 'ticketType');

const initializeUI = () => {
    initTicketingEvents({
        onSubmitEvent,
        onSubmitTicketType,
        onEventImageChange,
        onRemoveEventImage,
        onSelectEvent: selectEvent,
        onOpenEventActions,
        onOpenTicketTypeActions,
        onOpenEventModal,
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
