import {
    formatDecimalInput,
    formatOnBlur,
    formatOnFocus,
} from "../../../utils/formatters.js";

export function initSparePartDetailEvents({
    Refs,
    onSubmit,
    onCalculateTotal,
    onOpenModal,
    onSaveDataModal,
    onValidateUrl
}) {
    Refs.frmSpareParts.addEventListener("submit", onSubmit);
    Refs.btnOpenLinkBill.addEventListener("click", () => onOpenModal("bill"));
    Refs.btnOpenLinkTracking.addEventListener("click", () => onOpenModal("tracking"));

    Refs.btnCloseLink.addEventListener("click", () => {
        onSaveDataModal()
    });

    Refs.txtLink.addEventListener("input", () => {
        onValidateUrl(Refs.txtLink.value.trim());
    });

    Refs.modalLink.addEventListener("click", (e) => {
        if (e.target === Refs.modalLink) onSaveDataModal();
    });

    Refs.btnSaveLink.addEventListener("click", () => {
        onSaveDataModal()
    });

    Refs.txtFormat.forEach(txt => {
        txt.addEventListener("focus", e => formatOnFocus(e, true));
        txt.addEventListener("blur", e => formatOnBlur(e, true));
        formatDecimalInput(txt);
    });

    Refs.txtCosts.forEach(txt => {
        txt.addEventListener("input", onCalculateTotal);
    });
}
