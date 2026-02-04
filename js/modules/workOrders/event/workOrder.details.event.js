import { $ } from "../../../utils/dom.js"
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initWorkOrdersEvents = ({ onSearchSpareParts, onSearchService, onAddPayment, onSubmitOrder, onSaveNotes, onSaveDate, onAddNewService }) => {
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
            onSearch(e)
        }, 1000)
    }

    if (txtAmount) {
        txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(txtAmount);
    }
    txtSearchSparePart.addEventListener("input", (e) => search(e, onSearchSpareParts));
    txtAddService.addEventListener("input", (e) => search(e, onSearchService));
    txtAddService.addEventListener("keydown", onAddNewService)
    btnAddPayment.addEventListener("click", onAddPayment);
    txtNotes.addEventListener("input", onSaveNotes);
    frmWorkOrder.addEventListener("submit", onSubmitOrder);
    dtEstimated.addEventListener("change", onSaveDate)
}   