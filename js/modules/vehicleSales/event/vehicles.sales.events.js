import { $ } from "../../../utils/dom.js"
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export let initVehicleSaleEvents = ({ onSubmitVehicleSale, onSearchVehicle, onAddPayment, onSaveNotes, onSaveFinalPrice, onSaveComission, onCancelVehicle, onImportVehicle }) => {
    const txtSearchData = $("txtSearchData");
    const txtNotes = $("txtNotes");
    const txtCommission = $("txtCommission");
    const txtTotal = $("txtTotal");
    const frmVehicleSale = $("frmVehicleSale");
    const btnAddPayment = $("btnAddPayment");
    const txtAmount = $("txtAmount");
    const btnCancelVehicle = $("btnCancelVehicle");
    const btnAddPart = $("btnAddPart");
    let searchTimeout = null;

    if (frmVehicleSale) {
        frmVehicleSale.addEventListener("submit", onSubmitVehicleSale);
    }

    if (btnAddPart) {
        btnAddPart.addEventListener("click", onImportVehicle);
    }

    if (btnAddPayment) {
        btnAddPayment.addEventListener("click", onAddPayment);
        txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(txtAmount);
    }

    if (btnCancelVehicle) {
        btnCancelVehicle.addEventListener("click", onCancelVehicle);
    }

    if (txtNotes) {
        txtNotes.addEventListener("input", onSaveNotes);
    }

    if (txtCommission) {
        txtCommission.addEventListener("input", onSaveComission);
        txtCommission.addEventListener("blur", (e) => formatOnBlur(e, true));
        txtCommission.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(txtCommission);
    }

    if (txtTotal) {
        txtTotal.addEventListener("input", onSaveFinalPrice);
        txtTotal.addEventListener("blur", (e) => formatOnBlur(e, true));
        txtTotal.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(txtTotal);
    }

    if (txtSearchData) {
        txtSearchData.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                onSearchVehicle({
                    search: txtSearchData?.value.trim() || '',
                });
            }, 1000);
        });
    }

}