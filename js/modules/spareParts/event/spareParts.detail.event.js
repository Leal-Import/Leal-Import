import { qsa } from "../../../utils.js";
import { $ } from "../../../utils/dom.js";
import {
    formatDecimalInput,
    formatOnBlur,
    formatOnFocus,
} from "../../../utils/formatters.js";

export function initSparePartDetailEvents({
    onSubmit,
    onCalculateTotal,
    onOpenModal,
    onSaveDataModal,
}) {
    const btnCloseLink = $('btnCloseLink');

    const txtFormat = qsa('.txtFormat');
    const txtCosts = qsa('.txtCosts');
    const modal = $('modalLink');
    const btnSaveLink = $('btnSaveLink');


    const frmSpareParts = $('frmSpareParts');

    frmSpareParts.addEventListener("submit", onSubmit);
    $('btnOpenLinkBill').addEventListener("click", () => onOpenModal("bill"));
    $("btnOpenLinkTracking").addEventListener("click", () => onOpenModal("tracking"))

    btnCloseLink.addEventListener("click", () => {
        onSaveDataModal()
    });
    modal.addEventListener("click", (e) => {
        if (e.target === modal) onSaveDataModal();
    });

    btnSaveLink .addEventListener("click", () => {
        onSaveDataModal()
    });

    txtFormat.forEach(txt => {
        txt.addEventListener("focus", e => formatOnFocus(e, true));
        txt.addEventListener("blur", e => formatOnBlur(e, true));
        formatDecimalInput(txt);
    });

    txtCosts.forEach(txt => {
        txt.addEventListener("input", onCalculateTotal);
    });
}
