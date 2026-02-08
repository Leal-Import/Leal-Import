import { $ } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initWorkOrdersEvents = ({
    onSearchSpareParts,
    onSearchService,
    onAddPayment,
    onSubmitOrder,
    onSaveNotes,
    onSaveDate,
    onAddNewService
}) => {
    const txtSearchSparePart = $("txtSearchSparePart");
    const txtAddService = $("txtAddService");
    const btnAddPayment = $("btnAddPayment");
    const frmWorkOrder = $("frmWorkOrder");
    const txtNotes = $("txtNotes");
    const dtEstimated = $("dtEstimated");
    const txtAmount = $("txtAmount");

    let searchTimeOut = null;

    const search = (e, onSearch) => {
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(() => {
            onSearch(e);
        }, 1000);
    };

    if (txtAmount) {
        txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(txtAmount);
    }

    if (txtSearchSparePart) {
        txtSearchSparePart.addEventListener("input", (e) =>
            search(e, onSearchSpareParts)
        );
    }

    if (txtAddService) {
        txtAddService.addEventListener("input", (e) =>
            search(e, onSearchService)
        );
        txtAddService.addEventListener("keydown", onAddNewService);
    }

    if (btnAddPayment) {
        btnAddPayment.addEventListener("click", onAddPayment);
    }

    if (txtNotes) {
        txtNotes.addEventListener("input", onSaveNotes);
    }

    if (frmWorkOrder) {
        frmWorkOrder.addEventListener("submit", onSubmitOrder);
    }

    if (dtEstimated) {
        dtEstimated.addEventListener("change", onSaveDate);
    }
};
