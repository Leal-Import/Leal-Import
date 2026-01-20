import { $ } from "../../../utils/dom.js"

export const initWorkOrdersEvents = ({ onSearchSpareParts, onSearchService, onAddPayment, onSubmitOrder, onSaveNotes, onSaveDate, onAddNewService }) => {
    const txtSearchSparePart = $("txtSearchSparePart");
    const txtAddService = $("txtAddService");
    const btnAddPayment = $("btnAddPayment");
    const frmWorkOrder = $("frmWorkOrder");
    const txtNotes = $("txtNotes");
    const dtEstimated = $("dtEstimated");
    let searchTimeOut = null;

    const search = (e, onSearch) => {
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(() => {
            onSearch(e)
        }, 1000)
    }

    txtSearchSparePart.addEventListener("input", (e) => search(e, onSearchSpareParts));
    txtAddService.addEventListener("input", (e) => search(e, onSearchService));
    txtAddService.addEventListener("keydown", onAddNewService)
    btnAddPayment.addEventListener("click", onAddPayment);
    txtNotes.addEventListener("input", onSaveNotes);
    frmWorkOrder.addEventListener("submit", onSubmitOrder);
    dtEstimated.addEventListener("change", onSaveDate)
}   