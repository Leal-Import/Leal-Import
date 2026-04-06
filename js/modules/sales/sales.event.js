import { addModalCloseEvents, debounce, qs } from "../../utils/dom.js";

export const initSalesEvents = ({ Refs, onSearchSale, onClickBtnFilter, onOpenModal, onCloseModal }) => {
    const { containerFilterType, txtSearchData, cmbSearchByStatus, btnAskSale, btnCloseModalAsk, modalAskSale, fromDt, toDt } = Refs;

    const emitFilters = debounce(() => {
        const selected = qs('.lineSelected.selected')?.closest('.filterType');
        onSearchSale({
            search: txtSearchData?.value.trim() || '',
            idState: cmbSearchByStatus?.value || '',
            productType: selected?.dataset.value ?? '',
            startDate: fromDt?.value || '', // You can set these values based on your date input elements
            endDate: toDt?.value || ''
        });
    }, 1000);
    containerFilterType.addEventListener('click', (e) => {
        const btn = e.target.closest('.filterType');
        if (!btn) return;
        onClickBtnFilter(btn);
        emitFilters();
    });

    txtSearchData.addEventListener('input', emitFilters);
    cmbSearchByStatus.addEventListener('change', emitFilters);
    fromDt.addEventListener('change', emitFilters);
    toDt.addEventListener('change', emitFilters);
    btnAskSale.addEventListener("click", onOpenModal);
    btnCloseModalAsk.addEventListener("click", onCloseModal);

    addModalCloseEvents(modalAskSale, onCloseModal);
};
