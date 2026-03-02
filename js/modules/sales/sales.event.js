import { qs } from "../../utils/dom.js"


export let initSalesEvents = ({ Refs, onSearchSale, onClickBtnFilter, onOpenModal, onCloseModal }) => {
    let searchTimeout = null;
    const emitFilters = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const selected = qs('.lineSelected.selected')?.closest('.filterType');
            onSearchSale({
                search: Refs.txtSearchData?.value.trim() || '',
                idState: Refs.cmbSearchByStatus?.value || '',
                productType: selected?.dataset.value ?? ''
            })
        }, 1000);
    };
    Refs.containerFilterType.addEventListener('click', (e) => {
        const btn = e.target.closest('.filterType');
        if (!btn) return;
        onClickBtnFilter(btn);
        emitFilters();
    });

    Refs.txtSearchData.addEventListener('input', emitFilters);
    Refs.cmbSearchByStatus.addEventListener('change', emitFilters);
    Refs.btnAskSale.addEventListener("click", () => {
        onOpenModal()
    });
    Refs.btnCloseModalAsk.addEventListener("click", () => {
        onCloseModal();
    });
    Refs.modalAskSale.addEventListener("click", (e) => {
        if (e.target == Refs.modalAskSale) onCloseModal();
    })
}