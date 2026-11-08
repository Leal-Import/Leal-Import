import { BrowserQRCodeReader } from 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/+esm';
import { createModuleInitializer } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { canAccess } from '../../utils/privilegesValidator.js';
import { validateTicketQr } from './ticketValidation.service.js';
import { DOMRefs, clearValidationResult, renderPermissionDenied, renderValidationError, renderValidationSuccess, setCameraMessage, setCameraState, setValidationBusy } from './ticketValidation.dom.js';
import { resetTicketValidationState, ticketValidationState } from './ticketValidation.state.js';

const hasCamera = () => Boolean(navigator.mediaDevices?.getUserMedia);

const stopCamera = () => {
    ticketValidationState.scanning = false;
    ticketValidationState.controls?.stop();
    ticketValidationState.stream?.getTracks().forEach(track => track.stop());
    ticketValidationState.stream = null;
    ticketValidationState.reader = null;
    ticketValidationState.controls = null;
    DOMRefs.refs.qrVideo.srcObject = null;
    setCameraState(false);
};

const submitValidation = async (content) => {
    const qrContent = String(content || '').trim();
    if (!qrContent || ticketValidationState.submitting) return;

    stopCamera();
    ticketValidationState.submitting = true;
    setValidationBusy(true);
    clearValidationResult();

    try {
        const ticket = await validateTicketQr(qrContent);
        renderValidationSuccess(ticket);
    } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
            await handleApiError(error);
        } else {
            renderValidationError(error?.message || 'No se pudo validar el boleto.');
        }
    } finally {
        ticketValidationState.submitting = false;
        setValidationBusy(false);
    }
};

const startCamera = async () => {
    if (ticketValidationState.scanning || ticketValidationState.submitting) return;

    if (!hasCamera()) {
        setCameraMessage('Este navegador no permite acceder a la cámara.', 'warning');
        return;
    }

    try {
        setCameraMessage('Solicitando acceso a la cámara…');
        ticketValidationState.reader = new BrowserQRCodeReader();
        ticketValidationState.scanning = true;
        ticketValidationState.controls = await ticketValidationState.reader.decodeFromVideoDevice(
            undefined,
            DOMRefs.refs.qrVideo,
            async (result, error) => {
                if (result && ticketValidationState.scanning && !ticketValidationState.submitting) {
                    const qrContent = result.getText().trim();
                    await submitValidation(qrContent);
                    return;
                }

                if (error && error.name !== 'NotFoundException' && ticketValidationState.scanning) {
                    setCameraMessage('No se pudo leer el QR. Alinea el código dentro del área de la cámara.', 'warning');
                }
            }
        );

        ticketValidationState.scanning = true;
        setCameraState(true);
        setCameraMessage('Apunta la cámara al código QR del boleto.');
    } catch (error) {
        stopCamera();
        const message = error?.name === 'NotAllowedError'
            ? 'No se concedió permiso para usar la cámara.'
            : 'No fue posible iniciar la cámara.';
        setCameraMessage(message, 'error');
    }
};

const initializeUI = () => {
    if (!canAccess(['WRITE_TICKETING'])) {
        renderPermissionDenied();
        return;
    }

    DOMRefs.refs.btnStartCamera.addEventListener('click', startCamera);
    DOMRefs.refs.btnStopCamera.addEventListener('click', () => {
        stopCamera();
        setCameraMessage('Cámara detenida.');
    });
    window.addEventListener('pagehide', stopCamera, { once: true });
};

const init = createModuleInitializer({
    resetState: resetTicketValidationState,
    initialize: initializeUI,
    load: () => {},
    DOMRefs
});

document.addEventListener('DOMContentLoaded', init);
