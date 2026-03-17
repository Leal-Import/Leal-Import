import { addModalCloseEvents } from "../../../utils/dom.js";
import {
    formatDecimalInput,
    formatOnBlur,
    formatOnFocus
} from "../../../utils/formatters.js";

export const initSparePartDetailEvents = ({
    Refs,
    onSubmit,
    onCalculateTotal,
    onOpenModal,
    onSaveDataModal,
    onValidateUrl
}) => {
    const { txtLink, btnSaveLink, modalLink, txtFormat, txtCosts, frmSpareParts, btnOpenLinkBill, btnOpenLinkTracking, btnCloseLink } = Refs;

    frmSpareParts.addEventListener("submit", onSubmit);
    btnOpenLinkBill.addEventListener("click", () => onOpenModal("bill"));
    btnOpenLinkTracking.addEventListener("click", () => onOpenModal("tracking"));

    btnCloseLink.addEventListener("click", () => {
        onSaveDataModal();
    });

    txtLink.addEventListener("input", () => {
        onValidateUrl(Refs.txtLink.value.trim());
    });

    addModalCloseEvents(modalLink, onSaveDataModal);

    btnSaveLink.addEventListener("click", () => {
        onSaveDataModal();
    });

    txtFormat.forEach(txt => {
        txt.addEventListener("focus", e => formatOnFocus(e, true));
        txt.addEventListener("blur", e => formatOnBlur(e, true));
        formatDecimalInput(txt);
    });

    txtCosts.forEach(txt => {
        txt.addEventListener("input", onCalculateTotal);
    });
};
