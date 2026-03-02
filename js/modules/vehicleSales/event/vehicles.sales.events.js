import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initVehicleSaleEvents = ({ Refs, onSubmitVehicleSale, onSearchVehicle, onAddPayment, onSaveNotes, onSaveFinalPrice, onSaveComission, onCancelVehicle, onImportVehicle }) => {
    let searchTimeout = null;

    let pendingWorkOrder = false;

    Refs.btnCreateOrder.addEventListener("click", () => {
        pendingWorkOrder = true;
    });

    Refs.btnSaveSale.addEventListener("click", () => {
        pendingWorkOrder = false;
    });

    if (Refs.frmVehicleSale) {
        Refs.frmVehicleSale.addEventListener("submit", (e) => {
            onSubmitVehicleSale(e, pendingWorkOrder);
        });
    }

    if (Refs.btnAddPart) {
        Refs.btnAddPart.addEventListener("click", onImportVehicle);
    }

    if (Refs.btnAddPayment) {
        Refs.btnAddPayment.addEventListener("click", onAddPayment);
    }

    if (Refs.txtAmount) {
        Refs.txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        Refs.txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(Refs.txtAmount);
    }

    if (Refs.btnCancelVehicle) {
        Refs.btnCancelVehicle.addEventListener("click", onCancelVehicle);
    }

    if (Refs.txtNotes) {
        Refs.txtNotes.addEventListener("input", onSaveNotes);
    }

    if (Refs.txtCommission) {
        Refs.txtCommission.addEventListener("input", onSaveComission);
        Refs.txtCommission.addEventListener("blur", (e) => formatOnBlur(e, true));
        Refs.txtCommission.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(Refs.txtCommission);
    }

    if (Refs.txtTotal) {
        Refs.txtTotal.addEventListener("input", onSaveFinalPrice);
        Refs.txtTotal.addEventListener("blur", (e) => formatOnBlur(e, true));
        Refs.txtTotal.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(Refs.txtTotal);
    }

    if (Refs.txtSearchData) {
        Refs.txtSearchData.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                onSearchVehicle({
                    search: Refs.txtSearchData?.value.trim() || '',
                });
            }, 1000);
        });
    }

}