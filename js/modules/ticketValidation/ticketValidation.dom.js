export const DOMRefs = {
    refs: {},

    init() {
        this.refs = {
            qrVideo: document.getElementById('qrVideo'),
            cameraPlaceholder: document.querySelector('[data-camera-placeholder]'),
            btnStartCamera: document.getElementById('btnStartCamera'),
            btnStopCamera: document.getElementById('btnStopCamera'),
            cameraMessage: document.getElementById('cameraMessage'),
            manualValidationForm: document.getElementById('manualValidationForm'),
            qrContent: document.getElementById('qrContent'),
            btnValidateManual: document.getElementById('btnValidateManual'),
            btnClearValidation: document.getElementById('btnClearValidation'),
            validationResult: document.getElementById('validationResult')
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

const formatDate = (value) => new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short'
}).format(new Date(value));

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
    cameraMessage.className = `ticketValidationMessage ${type ? `ticketValidationMessage-${type}` : ''}`.trim();
};

export const setValidationBusy = (busy) => {
    const { btnValidateManual, btnClearValidation, btnStartCamera, btnStopCamera } = DOMRefs.refs;
    [btnValidateManual, btnClearValidation, btnStartCamera, btnStopCamera].forEach(button => {
        button.disabled = busy;
    });
};

export const clearValidationForm = () => {
    DOMRefs.refs.qrContent.value = '';
    DOMRefs.refs.qrContent.focus();
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
        createElement('span', 'validationResultIcon', '✓'),
        createElement('div', '', 'Boleto válido')
    );

    const metadata = createElement('dl', 'validationMeta');
    metadata.append(
        createMetadata('Evento', ticket.eventName),
        createMetadata('Lugar', ticket.venue),
        createMetadata('Zona', ticket.zoneName),
        createMetadata('Tipo de boleto', ticket.ticketTypeName),
        createMetadata('Boleto', `#${ticket.ticketNumber}`),
        createMetadata('Validado a las', formatDate(ticket.usedAt))
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
        createElement('span', 'validationResultIcon', '!'),
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
        DOMRefs.refs.btnStopCamera,
        DOMRefs.refs.btnValidateManual,
        DOMRefs.refs.btnClearValidation,
        DOMRefs.refs.qrContent
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
