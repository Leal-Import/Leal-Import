// spareSale.events.js

import { $ } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

let searchTimeout = null;

export function initSpareSaleEvents({
    onSubmitSpareSale,
    onAddPayment,
    onSearchSparePart,
    onOrderClick,
    onSaveNotes
}) {

    const form = $("frmSparePartSale");
    const btnAddPayment = $("btnAddPayment");
    const txtSearchData = $("txtSearchData");
    const btnOrderPart = $("btnOrderPart");
    const txtNotes = $("txtNotes");
    const txtAmount = $("txtAmount");

    if (form) {
        form.addEventListener("submit", onSubmitSpareSale);
    }

    if (btnAddPayment) {
        btnAddPayment.addEventListener("click", onAddPayment);
    }

    if (txtNotes) {
        txtNotes.addEventListener("input", onSaveNotes);
    }

    if (txtAmount) {
        txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
        txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
        formatDecimalInput(txtAmount);
    }

    if (txtSearchData) {
        txtSearchData.addEventListener("input", () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                onSearchSparePart({
                    search: txtSearchData?.value.trim() || '',
                });
            }, 1000);
        });
    }

    txtAmount

    if (btnOrderPart) {
        btnOrderPart.addEventListener("click", onOrderClick);
    }

}
