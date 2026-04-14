import { debounce } from "../../../utils/dom.js";
import { formatDecimalInput, formatOnBlur, formatOnFocus } from "../../../utils/formatters.js";

export const initSpareSaleEvents = ({ Refs, onSubmitSpareSale, onSearchSparePart, onOrderPart, onSaveNotes, onGeneratePdf }) => {
    const { txtSearchData, txtAmount, txtNotes, frmSparePartSale, btnOrderPart, btnGeneratePdf } = Refs;

    const handleSearch = debounce(() => {
        onSearchSparePart({
            search: txtSearchData?.value.trim() || ''
        });
    }, 1000);
    frmSparePartSale.addEventListener("submit", onSubmitSpareSale);

    txtNotes.addEventListener("input", onSaveNotes);

    txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(txtAmount);

    txtSearchData.addEventListener("input", handleSearch);

    btnOrderPart.addEventListener("click", onOrderPart);
    btnGeneratePdf.addEventListener("click", onGeneratePdf);

};
