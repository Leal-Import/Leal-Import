import { addModalCloseEvents } from "../../utils/dom.js";

export const initCancelSaleEvents = ({ Refs, onOpenCancelSale, onCancelSale, onVerifyCancelReason, onCloseCancelSale }) => {
    const { btnOpenCancelSale, modalCancelSale, btnCloseCancelSale, txtCancelReason, frmCancelSale } = Refs;

    addModalCloseEvents(modalCancelSale, onCloseCancelSale);
    frmCancelSale.addEventListener("submit", onCancelSale);
    btnOpenCancelSale.addEventListener("click", onOpenCancelSale);
    btnCloseCancelSale.addEventListener("click", onCloseCancelSale);
    txtCancelReason.addEventListener("input", onVerifyCancelReason);

};
