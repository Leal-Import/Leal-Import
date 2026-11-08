import { beforeEach, describe, expect, test } from 'vitest';
import { DOMRefs, renderValidationError, renderValidationSuccess } from './ticketValidation.dom.js';

describe('ticket validation rendering', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <video id="qrVideo"></video>
            <div data-camera-placeholder></div>
            <button id="btnStartCamera"></button>
            <button id="btnStopCamera"></button>
            <p id="cameraMessage"></p>
            <form id="manualValidationForm"></form>
            <textarea id="qrContent"></textarea>
            <button id="btnValidateManual"></button>
            <button id="btnClearValidation"></button>
            <section id="validationResult"></section>`;
        DOMRefs.init();
    });

    test('renders a successful validation with ticket details', () => {
        renderValidationSuccess({
            eventName: 'Copa Leal',
            venue: 'Autódromo',
            zoneName: 'General',
            ticketTypeName: 'Entrada',
            ticketNumber: '104',
            usedAt: '2026-11-07T18:00:00Z'
        });

        expect(DOMRefs.refs.validationResult.textContent).toContain('Boleto válido');
        expect(DOMRefs.refs.validationResult.textContent).toContain('Copa Leal');
        expect(DOMRefs.refs.validationResult.querySelector('.validationMeta')).not.toBeNull();
    });

    test('renders a readable validation error', () => {
        renderValidationError('El boleto ya fue utilizado.');

        expect(DOMRefs.refs.validationResult.textContent).toContain('Boleto no válido');
        expect(DOMRefs.refs.validationResult.textContent).toContain('El boleto ya fue utilizado.');
    });
});
