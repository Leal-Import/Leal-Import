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
    const { txtAmount, txtSearchSparePart, txtAddService, btnAddPayment, txtNotes, frmWorkOrder, dtEstimated, btnCompleteOrder, btnGeneratePdf } = Refs;

    let searchTimeOut = null;

    const search = (e, onSearch) => {
        const value = e.target.value;
        clearTimeout(searchTimeOut);
        searchTimeOut = setTimeout(() => {
            onSearch({ target: { value } });
        }, 1000);
    };

    txtAmount.addEventListener("blur", (e) => formatOnBlur(e, true));
    txtAmount.addEventListener("focus", (e) => formatOnFocus(e, true));
    formatDecimalInput(txtAmount);

    txtSearchSparePart.addEventListener("input", (e) =>
        search(e, onSearchSpareParts)
    );

    txtAddService.addEventListener("input", (e) =>
        search(e, onSearchService)
    );
    txtAddService.addEventListener("keydown", onAddNewService);

    btnAddPayment.addEventListener("click", onAddPayment);

    txtNotes.addEventListener("input", onSaveNotes);

    frmWorkOrder.addEventListener("submit", onSubmitOrder);

    dtEstimated.addEventListener("change", onSaveDate);

    btnCompleteOrder.addEventListener("click", onCompleteOrder);

    btnGeneratePdf?.addEventListener("click", onGeneratePdf);
};
