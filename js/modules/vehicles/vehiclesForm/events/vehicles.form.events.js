import { addModalCloseEvents, debounce } from "../../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus, formatYearInput } from "../../../../utils/formatters.js";

export const initVehicleDetailEvents = ({ Refs, onSubmit, onSearchCustomer, onExternalChange, onCalculateTotal, onOpenLinkLoteModal, onCloseLinkLoteModal, onCleanCustomer, onValidateUrl }) => {
    const { frmVehicles, txtCustomer, txtLink, isExternalOpt, btnLinkLote, modalLinkLote, btnCloseLink, btnSaveLinkLote, txtFormat, txtCosts, txtYear, txtMileage } = Refs;

    const handleCustomerSearch = debounce(() => {
        onSearchCustomer(txtCustomer.value);
    }, 1500);

    frmVehicles.addEventListener("submit", onSubmit);

    txtCustomer.addEventListener("input", () => {
        onCleanCustomer();
        handleCustomerSearch();
    });

    txtLink.addEventListener("input", () => {
        onValidateUrl(Refs.txtLink.value.trim());
    });

    if (isExternalOpt) {
        isExternalOpt.addEventListener('change', () => {
            onExternalChange(isExternalOpt.checked);
            onCleanCustomer();
        });
    }
    btnLinkLote.addEventListener("click", onOpenLinkLoteModal);
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
