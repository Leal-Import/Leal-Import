import { validateReason } from './cancelSale.logic.js';
import { DOMRefs } from './cancelSale.dom.js';
import { initCancelSaleEvents } from './cancelSale.event.js';
import { cancelSaleState } from './cancelSale.state.js';
import { navigateTo, ROUTES } from '../../utils/router.js';
import { handleApiError } from '../../utils/api.utils.js';
import { toggleModal, showMessage, showElement, hideElement, disableElement, removeDisable } from '../../utils/dom.js';

const onOpenCancelSale = () => {
    DOMRefs.refs.txtCancelReason.value = '';
    DOMRefs.refs.cancelReasonCount.textContent = '0';
    disableElement(DOMRefs.refs.btnConfirmCancelSale);
    toggleModal(DOMRefs.refs.modalCancelSale, true);
    if (cancelSaleState.cancellationReason) {
        DOMRefs.refs.txtCancelReason.value = cancelSaleState.cancellationReason;
        DOMRefs.refs.cancelReasonCount.textContent = cancelSaleState.cancellationReason.length;
    }
};

const onCancelSale = async (e) => {
    e.preventDefault();
    const reason = DOMRefs.refs.txtCancelReason.value.trim();
    const isNotReasonValid = validateReason(reason);

    if (isNotReasonValid) {
        await showMessage('Motivo no válido', isNotReasonValid, 'warning');
        return;
    }
    showElement(DOMRefs.refs.btnConfirmCancelSaleLoader);
    disableElement(DOMRefs.refs.btnConfirmCancelSale);
    try {
        await cancelSaleState.onPatchSale(cancelSaleState.idSale, reason);
        await showMessage('Venta cancelada', 'Éxito', 'success');
        navigateTo(ROUTES.SALES);
    } catch (error) {
        await handleApiError(error, 'No se pudo cancelar la venta. Por favor, inténtalo de nuevo.');
    } finally {
        hideElement(DOMRefs.refs.btnConfirmCancelSaleLoader);
        removeDisable(DOMRefs.refs.btnConfirmCancelSale);
    }
};

export const saleCancelledUIUpdate = (reason) => {
    showElement(DOMRefs.refs.cancelledBreadcrumb);
    hideElement(DOMRefs.refs.btnConfirmCancelSale);
    cancelSaleState.cancellationReason = reason || 'No especificado';
    DOMRefs.refs.btnOpenCancelSale.textContent = 'Ver razón';
};

const onVerifyCancelReason = (e) => {
    const reason = e.target.value.trim();
    const isNotReasonValid = validateReason(reason);
    if (isNotReasonValid) {
        disableElement(DOMRefs.refs.btnConfirmCancelSale);
    } else {
        DOMRefs.refs.cancelReasonCount.textContent = reason.length;
        removeDisable(DOMRefs.refs.btnConfirmCancelSale);
    }
};

export const initCancelSale = (idSale, onPatchSale) => {
    const refs = DOMRefs.init();
    cancelSaleState.onPatchSale = onPatchSale;
    cancelSaleState.idSale = idSale;
    showElement(refs.btnOpenCancelSale);
    initCancelSaleEvents({ Refs: refs, onOpenCancelSale, onCancelSale, onVerifyCancelReason, onCloseCancelSale: () => toggleModal(refs.modalCancelSale, false) });
};
