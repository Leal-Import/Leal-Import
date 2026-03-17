import { addModalCloseEvents } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus, formatYearInput } from "../../../utils/formatters.js";

export const initVehicleDetailEvents = ({ Refs, onSubmit, onSearchCustomer, onAddImage, onExternalChange, onCalculateTotal, openLinkLoteModal, onCloseLinkLoteModal, cleanCustomer, onValidateUrl }) => {
    const { frmVehicles, txtCustomer, txtLink, isExternalOpt, imageInput, btnLinkLote, modalLinkLote, btnCloseLink, btnSaveLinkLote, txtFormat, txtCosts, txtYear, txtMileage } = Refs;

    let searchTimeout = null;

    frmVehicles.addEventListener("submit", onSubmit);

    txtCustomer.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        cleanCustomer();
        searchTimeout = setTimeout(() => onSearchCustomer(txtCustomer.value), 1500);
    });

    txtLink.addEventListener("input", () => {
        onValidateUrl(Refs.txtLink.value.trim());
    });

    if (isExternalOpt) {
        isExternalOpt.addEventListener('change', () => {
            onExternalChange(isExternalOpt.checked);
            cleanCustomer();
        });
    }
    imageInput.addEventListener("change", onAddImage);
    btnLinkLote.addEventListener("click", openLinkLoteModal);
    addModalCloseEvents(modalLinkLote, onCloseLinkLoteModal);
    btnCloseLink.addEventListener("click", onCloseLinkLoteModal);
    btnSaveLinkLote.addEventListener("click", onCloseLinkLoteModal);

    txtFormat.forEach(txt => {
        txt.addEventListener("focus", (e) => { formatOnFocus(e, true); });
        txt.addEventListener("blur", (e) => { formatOnBlur(e, true); });
        formatDecimalInput(txt);
    });

    txtCosts.forEach(txt => {
        txt.addEventListener("input", onCalculateTotal);
    });
    formatYearInput(txtYear);
    formatDecimalInput(txtMileage);
};
