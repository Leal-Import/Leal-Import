import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initSpareSaleEvents = ({
    Refs,
    onSubmitSpareSale,
    onAddPayment,
    onSearchSparePart,
    onOrderClick,
    onSaveNotes
}) => {
    const { txtSearchData, txtAmount, txtNotes, frmSparePartSale, btnAddPayment, btnOrderPart } = Refs;

    let searchTimeout = null;

    frmSparePartSale.addEventListener("submit", onSubmitSpareSale);

    btnAddPayment.addEventListener("click", onAddPayment);

    txtNotes.addEventListener("input", onSaveNotes);

    txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(txtAmount);

    txtSearchData.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            onSearchSparePart({
                search: txtSearchData?.value.trim() || ''
            });
        }, 1000);
    });

    btnOrderPart.addEventListener("click", onOrderClick);

};
