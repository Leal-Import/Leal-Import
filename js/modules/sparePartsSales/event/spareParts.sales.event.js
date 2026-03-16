import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initSpareSaleEvents = ({
    Refs,
    onSubmitSpareSale,
    onAddPayment,
    onSearchSparePart,
    onOrderClick,
    onSaveNotes
}) => {
    let searchTimeout = null;

    if (Refs.frmSparePartSale) {
        Refs.frmSparePartSale.addEventListener("submit", onSubmitSpareSale);
    }

    if (Refs.btnAddPayment) {
        Refs.btnAddPayment.addEventListener("click", onAddPayment);
    }

    if (Refs.txtNotes) {
        Refs.txtNotes.addEventListener("input", onSaveNotes);
    }

    if (Refs.txtAmount) {
        Refs.txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        Refs.txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(Refs.txtAmount);
    }

    if (Refs.txtSearchData) {
        Refs.txtSearchData.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                onSearchSparePart({
                    search: Refs.txtSearchData?.value.trim() || ''
                });
            }, 1000);
        });
    }

    if (Refs.btnOrderPart) {
        Refs.btnOrderPart.addEventListener("click", onOrderClick);
    }

};
