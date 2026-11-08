import { $, qs } from '../../utils/dom.js';
import { formatDateTime } from '../../utils/formatters.js';

export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            qrVideo: $('qrVideo'),
            cameraPlaceholder: qs('[data-camera-placeholder]'),
            btnStartCamera: $('btnStartCamera'),
            btnStopCamera: $('btnStopCamera'),
            cameraMessage: $('cameraMessage'),
            validationResult: $('validationResult')
        };

        return this.refs;
    }
};

const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
};

const createStatusIcon = (type) => {
    const icon = createElement('span', 'validationResultIcon', type === 'success' ? '✓' : '!');
    icon.setAttribute('aria-hidden', 'true');
    return icon;
};

export const setCameraState = (active) => {
    const { qrVideo, cameraPlaceholder, btnStartCamera, btnStopCamera } = DOMRefs.refs;
    qrVideo.classList.toggle('show', active);
    qrVideo.classList.toggle('hide', !active);
    cameraPlaceholder.classList.toggle('show', !active);
    cameraPlaceholder.classList.toggle('hide', active);
    btnStartCamera.classList.toggle('hide', active);
    btnStopCamera.classList.toggle('hide', !active);
};

export const setCameraMessage = (message, type = '') => {
    const { cameraMessage } = DOMRefs.refs;
    cameraMessage.textContent = message || '';
    const messageClass = type ? `ticketValidationMessage${type[0].toUpperCase()}${type.slice(1)}` : '';
    cameraMessage.className = `ticketValidationMessage ${messageClass}`.trim();
};

export const setValidationBusy = (busy) => {
    const { btnStartCamera, btnStopCamera } = DOMRefs.refs;
    [btnStartCamera, btnStopCamera].forEach(button => {
        button.disabled = busy;
    });
};

const createMetadata = (label, value) => {
    const item = createElement('div', 'validationMetaItem');
    item.append(createElement('dt', '', label), createElement('dd', '', value));
    return item;
};

export const renderValidationSuccess = (ticket) => {
    const { validationResult } = DOMRefs.refs;
    const panel = createElement('article', 'validationResultCard validationResultSuccess');
    const heading = createElement('div', 'validationResultHeading');
    heading.append(
        createStatusIcon('success'),
        createElement('div', '', 'Boleto válido')
    );

    const metadata = createElement('dl', 'validationMeta');
    metadata.append(
        createMetadata('Evento', ticket.eventName),
        createMetadata('Lugar', ticket.venue),
        createMetadata('Zona', ticket.zoneName),
        createMetadata('Tipo de boleto', ticket.ticketTypeName),
        createMetadata('Boleto', `#${ticket.ticketNumber}`),
        createMetadata('Validado a las', formatDateTime(ticket.usedAt))
    );
    panel.append(heading, metadata, createElement('p', 'validationResultNote', 'El boleto fue marcado como utilizado y no podrá volver a ingresar.'));
    validationResult.replaceChildren(panel);
    validationResult.classList.remove('hide');
};

export const renderValidationError = (message) => {
    const { validationResult } = DOMRefs.refs;
    const panel = createElement('article', 'validationResultCard validationResultError');
    const heading = createElement('div', 'validationResultHeading');
    heading.append(
        createStatusIcon('error'),
        createElement('div', '', 'Boleto no válido')
    );
    panel.append(heading, createElement('p', 'validationResultNote', message));
    validationResult.replaceChildren(panel);
    validationResult.classList.remove('hide');
};

export const clearValidationResult = () => {
    DOMRefs.refs.validationResult.replaceChildren();
    DOMRefs.refs.validationResult.classList.add('hide');
};

export const renderPermissionDenied = () => {
    const { validationResult } = DOMRefs.refs;
    [
        DOMRefs.refs.btnStartCamera,
        DOMRefs.refs.btnStopCamera
    ].forEach(control => {
        control.disabled = true;
    });

    const panel = createElement('article', 'validationResultCard validationResultError');
    panel.append(
        createElement('h2', '', 'Acceso restringido'),
        createElement('p', 'validationResultNote', 'Tu perfil no tiene permiso para validar boletos.')
    );
    validationResult.replaceChildren(panel);
    validationResult.classList.remove('hide');
};
