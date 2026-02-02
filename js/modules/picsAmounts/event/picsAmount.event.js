import { $, qs } from "../../../utils/dom.js";


/*Esta funcion inicializa los listeners del modal de comprobantes */
export function initModalListeners({ clearCurrentFile, closeModalAndClean, onClickBtnSelect }) {
    const modalContainer = qs('.containerModal');
    const btnClose = $('closeVoucherModal');
    const btnSelectFile = $('btnSelectFile');
    const btnClearFile = $('btnClearFile');

    // --- 1. Cerrar Modal ---
    btnClose.addEventListener("click", closeModalAndClean);
    modalContainer.addEventListener("click", (e) => {
        if (e.target == modalContainer) closeModalAndClean();
    });

    // --- 2. Acción: SELECCIONAR/CAMBIAR ---
    btnSelectFile.addEventListener("click", onClickBtnSelect)

    // --- 3. Acción: ELIMINAR ---
    btnClearFile.addEventListener("click", clearCurrentFile);
}