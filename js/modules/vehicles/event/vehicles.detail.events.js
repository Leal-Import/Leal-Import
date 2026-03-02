import { formatDecimalInput, formatOnBlur, formatOnFocus, formatYearInput } from "../../../utils/formatters.js";

export function initVehicleDetailEvents({ Refs, onSubmit, onSearchCustomer, onAddImage, onExternalChange, onCalculateTotal, openLinkLoteModal, closeLinkLoteModal, cleanCustomer, onValidateUrl }) {

    let searchTimeout = null;

    Refs.frmVehicles.addEventListener("submit", onSubmit);

    Refs.txtCustomer.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        cleanCustomer();
        searchTimeout = setTimeout(() => onSearchCustomer(Refs.txtCustomer.value), 1500);
    });

    Refs.txtLink.addEventListener("input", () => {
        onValidateUrl(Refs.txtLink.value.trim());
    })

    if (Refs.isExternalOpt) {
        Refs.isExternalOpt.addEventListener('change', () => {
            onExternalChange(Refs.isExternalOpt.checked);
            cleanCustomer();
        });
    }
    Refs.imageInput.addEventListener("change", onAddImage);
    Refs.btnLinkLote.addEventListener("click", openLinkLoteModal);
    Refs.modalLinkLote.addEventListener("click", (e) => {
        if (e.target === Refs.modalLinkLote) closeLinkLoteModal();
    });
    Refs.btnCloseLink.addEventListener("click", closeLinkLoteModal);
    Refs.btnSaveLinkLote.addEventListener("click", closeLinkLoteModal);

    Refs.txtFormat.forEach(txt => {
        txt.addEventListener("focus", (e) => { formatOnFocus(e, true); });
        txt.addEventListener("blur", (e) => { formatOnBlur(e, true); });
        formatDecimalInput(txt);
    });
    
    Refs.txtCosts.forEach(txt => {
        txt.addEventListener("input", onCalculateTotal);
    });
    formatYearInput(Refs.txtYear);
    formatDecimalInput(Refs.txtMileage);
}
