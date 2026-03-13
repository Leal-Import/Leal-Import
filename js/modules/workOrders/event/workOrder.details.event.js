import { $ } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initWorkOrdersEvents = ({
    Refs,
    onSearchSpareParts,
    onSearchService,
    onAddPayment,
    onSubmitOrder,
    onSaveNotes,
    onSaveDate,
    onAddNewService,
    onCompleteOrder,
    onGeneratePdf
}) => {

    let searchTimeOut = null;

    const search = (e, onSearch) => {
        const value = e.target.value;
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(() => {
            onSearch({ target: { value } });
        }, 1000);
    };

    if (Refs.txtAmount) {
        Refs.txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        Refs.txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(Refs.txtAmount);
    }

    if (Refs.txtSearchSparePart) {
        Refs.txtSearchSparePart.addEventListener("input", (e) =>
            search(e, onSearchSpareParts)
        );
    }

    if (Refs.txtAddService) {
        Refs.txtAddService.addEventListener("input", (e) =>
            search(e, onSearchService)
        );
        Refs.txtAddService.addEventListener("keydown", onAddNewService);
    }

    if (Refs.btnAddPayment) {
        Refs.btnAddPayment.addEventListener("click", onAddPayment);
    }

    if (Refs.txtNotes) {
        Refs.txtNotes.addEventListener("input", onSaveNotes);
    }

    if (Refs.frmWorkOrder) {
        Refs.frmWorkOrder.addEventListener("submit", onSubmitOrder);
    }

    if (Refs.dtEstimated) {
        Refs.dtEstimated.addEventListener("change", onSaveDate);
    }

    if(Refs.btnCompleteOrder) {
        Refs.btnCompleteOrder.addEventListener("click", onCompleteOrder);
    }

    Refs.btnGeneratePdf?.addEventListener("click", onGeneratePdf);
};
