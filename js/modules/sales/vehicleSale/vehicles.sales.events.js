import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initVehicleSaleEvents = ({ Refs, onSubmitVehicleSale, onSearchVehicle, onSaveNotes, onSaveFinalPrice, onSaveComission, onCancelVehicle, onImportVehicle }) => {
    const { txtSearchData, btnCreateOrder, btnSaveSale, frmVehicleSale, btnImportVehicle, txtAmount, btnCancelVehicle, txtNotes, txtCommission, txtTotal } = Refs;
    let searchTimeout = null;
    let pendingWorkOrder = false;

    btnCreateOrder.addEventListener("click", () => {
        pendingWorkOrder = true;
    });

    btnSaveSale.addEventListener("click", () => {
        pendingWorkOrder = false;
    });

    frmVehicleSale.addEventListener("submit", (e) => {
        onSubmitVehicleSale(e, pendingWorkOrder);
    });
    btnImportVehicle.addEventListener("click", onImportVehicle);

    txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(Refs.txtAmount);

    btnCancelVehicle.addEventListener("click", onCancelVehicle);

    txtNotes.addEventListener("input", onSaveNotes);
    txtCommission.addEventListener("input", onSaveComission);
    txtCommission.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtCommission.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(txtCommission);

    txtTotal.addEventListener("input", onSaveFinalPrice);
    txtTotal.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtTotal.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(txtTotal);

    txtSearchData.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchVehicle({
                search: txtSearchData?.value.trim() || ''
            });
        }, 1000);
    });
};
