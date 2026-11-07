import config from '../../config.js';
import { apiRequest } from '../../utils/api.utils.js';

const TICKETING_API = `${config.API_BASE_URL}/admin/ticketing`;
const TICKETING_READ = ['READ_TICKETING'];
const TICKETING_WRITE = ['WRITE_TICKETING'];

const getData = (response) => response?.data ?? response;

const request = (url, method, privilege, body, friendlyMessage) => apiRequest(
    url,
    {
        method,
        ...(body === undefined ? {} : {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
    },
    friendlyMessage,
    privilege
);

export const getTicketEvents = (page, size) =>
    request(`${TICKETING_API}/events?page=${page}&size=${size}`, 'GET', TICKETING_READ, undefined, 'No se pudieron cargar los eventos');

export const createTicketEvent = (payload) =>
    request(`${TICKETING_API}/events`, 'POST', TICKETING_WRITE, payload, 'No se pudo registrar el evento').then(getData);

export const updateTicketEvent = (eventId, payload) =>
    request(`${TICKETING_API}/events/${eventId}`, 'PUT', TICKETING_WRITE, payload, 'No se pudo actualizar el evento').then(getData);

export const changeTicketEventStatus = (eventId, active) =>
    request(`${TICKETING_API}/events/${eventId}/active`, 'PATCH', TICKETING_WRITE, { active }, 'No se pudo actualizar el evento').then(getData);

export const getTicketTypes = (eventId, page = 0, size = 30) =>
    request(`${TICKETING_API}/events/${eventId}/ticket-types?page=${page}&size=${size}`, 'GET', TICKETING_READ, undefined, 'No se pudieron cargar los tipos de boleto');

export const createTicketType = (eventId, payload) =>
    request(`${TICKETING_API}/events/${eventId}/ticket-types`, 'POST', TICKETING_WRITE, payload, 'No se pudo registrar el tipo de boleto').then(getData);

export const updateTicketType = (eventId, ticketTypeId, payload) =>
    request(`${TICKETING_API}/events/${eventId}/ticket-types/${ticketTypeId}`, 'PUT', TICKETING_WRITE, payload, 'No se pudo actualizar el tipo de boleto').then(getData);

export const changeTicketTypeStatus = (eventId, ticketTypeId, active) =>
    request(`${TICKETING_API}/events/${eventId}/ticket-types/${ticketTypeId}/active`, 'PATCH', TICKETING_WRITE, { active }, 'No se pudo actualizar el tipo de boleto').then(getData);
