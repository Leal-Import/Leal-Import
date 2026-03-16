/*Esta funcion inicializa los listeners del modal de comprobantes */
export function initModalListeners({ Refs, clearCurrentFile, closeModalAndClean, onClickBtnSelect, onCloseLightbox }) {
    const { modalContainer, btnCloseVoucherModal, btnSelectFile, btnClearFile, btnCloseLightbox, voucherLightbox } = Refs;

    btnCloseVoucherModal.addEventListener("click", closeModalAndClean);
    modalContainer.addEventListener("click", (e) => {
        if (e.target == modalContainer) closeModalAndClean();
    });

    btnCloseLightbox.addEventListener("click", onCloseLightbox);
    voucherLightbox.addEventListener("click", (e) => {
        if (e.target == voucherLightbox) onCloseLightbox();
    });

    btnSelectFile.addEventListener("click", onClickBtnSelect)

    btnClearFile.addEventListener("click", clearCurrentFile);
}