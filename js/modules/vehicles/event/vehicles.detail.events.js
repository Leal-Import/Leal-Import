import { qsa } from "../../../utils.js";
import { $, qs } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus, formatYearInput } from "../../../utils/formatters.js";

export function initVehicleDetailEvents({ onSubmit, onSearchCustomer, onAddImage, onExternalChange, onCalculateTotal, openLinkLoteModal, closeLinkLoteModal, cleanCustomer }) {
    const isExternalOpt = $('isExternalOpt');
    const btnLink = qs('.btnLinkLote');
    const modalLinkLote = $('modalLinkLote');
    const btnCloseLink = modalLinkLote.querySelector('.btnClose');
    const btnSaveLinkLote = $('btnSaveLinkLote');
    const txtFormat = qsa('.txtFormat');
    const txtCosts = qsa('.txtCosts');
    const txtMileage = $("txtMileage");

    let searchTimeout = null;

    const frmVehicles = $('frmVehicles');
    const txtCustomer = $('txtCustomer');
    const imageInput = $('imageInput');

    frmVehicles.addEventListener("submit", onSubmit);

    txtCustomer.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        cleanCustomer();
        searchTimeout = setTimeout(() => onSearchCustomer(e), 1500);
    });

    if (isExternalOpt) {
        isExternalOpt.addEventListener('change', e => {
            onExternalChange(e.target.checked);
            cleanCustomer();
        });
    }
    imageInput.addEventListener("change", onAddImage);
    btnLink.addEventListener("click", openLinkLoteModal);
    btnCloseLink.addEventListener("click", closeLinkLoteModal);
    btnSaveLinkLote.addEventListener("click", closeLinkLoteModal);

    txtFormat.forEach(txt => {
        txt.addEventListener("focus", (e) => { formatOnFocus(e, true); });
        txt.addEventListener("blur", (e) => { formatOnBlur(e, true); });
        formatDecimalInput(txt);
    });
    
    txtCosts.forEach(txt => {
        txt.addEventListener("input", onCalculateTotal);
    });
    formatYearInput($("txtYear"));
    formatDecimalInput(txtMileage);
}
