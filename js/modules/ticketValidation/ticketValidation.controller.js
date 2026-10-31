import { createModuleInitializer } from '../../utils/dom.js';
import { handleApiError } from '../../utils/api.utils.js';
import { canAccess } from '../../utils/privilegesValidator.js';
import { validateTicketQr } from './ticketValidation.service.js';
import { DOMRefs, clearValidationForm, clearValidationResult, renderPermissionDenied, renderValidationError, renderValidationSuccess, setCameraMessage, setCameraState, setValidationBusy } from './ticketValidation.dom.js';
import { resetTicketValidationState, ticketValidationState } from './ticketValidation.state.js';

const hasCameraScanner = () => Boolean(
    navigator.mediaDevices?.getUserMedia &&
    'BarcodeDetector' in window
);

const stopCamera = () => {
    ticketValidationState.scanning = false;
    ticketValidationState.scanRequestId += 1;
    ticketValidationState.stream?.getTracks().forEach(track => track.stop());
    ticketValidationState.stream = null;
    ticketValidationState.detector = null;
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
        clearValidationForm();
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

const scanFrame = async (requestId) => {
    if (!ticketValidationState.scanning || requestId !== ticketValidationState.scanRequestId) return;

    try {
        const detectedCodes = await ticketValidationState.detector.detect(DOMRefs.refs.qrVideo);
        const qrCode = detectedCodes.find(code => code.rawValue?.trim());
        if (qrCode) {
            DOMRefs.refs.qrContent.value = qrCode.rawValue.trim();
            await submitValidation(qrCode.rawValue);
            return;
        }
    } catch {
        if (ticketValidationState.scanning) {
            setCameraMessage('No se pudo leer el QR. Alinea el código dentro del área de la cámara.', 'warning');
        }
    }

    if (ticketValidationState.scanning && requestId === ticketValidationState.scanRequestId) {
        window.requestAnimationFrame(() => scanFrame(requestId));
    }
};

const startCamera = async () => {
    if (ticketValidationState.scanning || ticketValidationState.submitting) return;

    if (!hasCameraScanner()) {
        setCameraMessage('Este navegador no permite escanear QR con la cámara. Utiliza la validación manual.', 'warning');
        return;
    }

    try {
        setCameraMessage('Solicitando acceso a la cámara…');
        ticketValidationState.detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        ticketValidationState.stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        DOMRefs.refs.qrVideo.srcObject = ticketValidationState.stream;
        await DOMRefs.refs.qrVideo.play();
        ticketValidationState.scanning = true;
        ticketValidationState.scanRequestId += 1;
        setCameraState(true);
        setCameraMessage('Apunta la cámara al código QR del boleto.');
        window.requestAnimationFrame(() => scanFrame(ticketValidationState.scanRequestId));
    } catch (error) {
        stopCamera();
        const message = error?.name === 'NotAllowedError'
            ? 'No se concedió permiso para usar la cámara. Puedes validar el código manualmente.'
            : 'No fue posible iniciar la cámara. Puedes validar el código manualmente.';
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
    DOMRefs.refs.manualValidationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        submitValidation(DOMRefs.refs.qrContent.value);
    });
    DOMRefs.refs.btnClearValidation.addEventListener('click', () => {
        stopCamera();
        clearValidationForm();
        clearValidationResult();
        setCameraMessage('');
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
