// spareSale.events.js

import { $ } from "../../../utils/dom.js";

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

    if (form) {
        form.addEventListener("submit", onSubmitSpareSale);
    }

    if (btnAddPayment) {
        btnAddPayment.addEventListener("click", onAddPayment);
    }

    if (txtNotes) {
        txtNotes.addEventListener("input", onSaveNotes);
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

    if (btnOrderPart) {
        btnOrderPart.addEventListener("click", onOrderClick);
    }

}
