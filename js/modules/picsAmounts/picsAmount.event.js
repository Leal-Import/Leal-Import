import { addModalCloseEvents } from "../../utils/dom.js";

/*Esta funcion inicializa los listeners del modal de comprobantes */
export const initModalListeners = ({ Refs, clearCurrentFile, onCloseModalAndClean, onClickBtnSelect, onCloseLightbox }) => {
    const { modalContainer, btnCloseVoucherModal, btnSelectFile, btnClearFile, btnCloseLightbox, voucherLightbox } = Refs;
    btnCloseVoucherModal.addEventListener("click", onCloseModalAndClean);

    addModalCloseEvents(modalContainer, onCloseModalAndClean);
    addModalCloseEvents(voucherLightbox, onCloseLightbox);

    btnCloseLightbox.addEventListener("click", onCloseLightbox);

    btnSelectFile.addEventListener("click", onClickBtnSelect);

    btnClearFile.addEventListener("click", clearCurrentFile);
};
